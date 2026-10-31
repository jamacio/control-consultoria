// Como a IA vê e altera o site. Em vez do HTML inteiro, ela recebe uma lista numerada só com o que dá para
// editar ("index-4 h1 "texto"") e devolve operações curtas ({"op":"text","id":"index-4","value":"..."}).
// O servidor aplica cada uma no elemento certo. Seções novas vêm prontas de blocks/: a IA só escreve os textos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, 'public');
const BLOCKS_DIR = path.join(ROOT, 'blocks');
// Elementos que não aparecem na lista (nem o que está dentro deles)
const SKIP = new Set(['head', 'meta', 'link', 'script', 'style', 'br', 'svg']);
// Aparecem na lista mesmo sem texto, para a IA saber onde começa cada parte
const CONTAINERS = new Set(['header', 'footer', 'nav', 'section']);
const ATTRS = new Set(['href', 'src', 'alt']);
const MAX_TEXT = 60;
export const THEME_VARS = ['--bg', '--surface', '--fg', '--muted', '--border', '--accent', '--accent-on'];
// O modelo às vezes manda o nome da cor no lugar do código
const COLOR_NAMES = {
  preto: '#0f0f0f', black: '#0f0f0f', branco: '#fafafa', white: '#fafafa', cinza: '#4b5563', gray: '#4b5563',
  verde: '#15803d', green: '#15803d', azul: '#1d4ed8', blue: '#1d4ed8', vermelho: '#b91c1c', red: '#b91c1c',
  amarelo: '#facc15', yellow: '#facc15', laranja: '#ea580c', orange: '#ea580c', rosa: '#db2777', pink: '#db2777',
  roxo: '#7e22ce', purple: '#7e22ce', marrom: '#92400e', brown: '#92400e', dourado: '#f59e0b', bege: '#f5f0e6',
};

// Notícias do blog: a página /blog lê este JSON, então o chat cria, edita e apaga notícias só nele, sem mexer no HTML.
// Sem imagem, título ou texto, a notícia fica com os padrões abaixo e o layout não quebra.
export const BLOG_FILE = 'blog.json';
const BLOG_CAPA = '/img/blog-capa.svg';
const BLOG_TITULO = 'Nova notícia';
const MAX_TITULO = 120;
const MAX_NOTICIA = 6000;
const hoje = () => new Date().toLocaleDateString('sv-SE'); // AAAA-MM-DD no fuso do servidor
// Texto → trecho de endereço: "Horário de Fim de Ano!" → "horario-de-fim-de-ano"
export const slugify = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80).replace(/-$/, '');
const dataValida = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

// Endereço livre para uma notícia: "promocao", "promocao-2"... (ignorar = a própria notícia, ao editar)
function slugLivre(noticias, base, ignorar) {
  const raiz = base || 'noticia';
  const usado = (s) => noticias.some((n) => n !== ignorar && n.slug === s);
  let slug = raiz;
  for (let i = 2; usado(slug); i++) slug = `${raiz}-${i}`;
  return slug;
}

function lerBlog(json) {
  let blog;
  try {
    blog = JSON.parse(json || '{}');
  } catch {
    blog = {};
  }
  const noticias = (Array.isArray(blog.noticias) ? blog.noticias : []).filter((n) => n && typeof n === 'object');
  // Notícia escrita à mão sem slug ganha um a partir do título (é o mesmo que a página usa)
  for (const n of noticias) if (!n.slug) n.slug = slugLivre(noticias, slugify(n.titulo), n);
  return { mostrarData: blog.mostrarData !== false, noticias };
}

// Mais novas primeiro, como na página
const ordenarNoticias = (lista) => [...lista].sort((a, b) => String(b.data ?? '').localeCompare(String(a.data ?? '')) || (b.id ?? 0) - (a.id ?? 0));

export const fileId = (f) => f.replace(/^partials\//, '').replace(/\.html$/, '');
export const pageUrl = (f) => (f === 'index.html' ? '/' : `/${fileId(f)}`);
const isHtml = (f) => f.endsWith('.html');

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ownText = (el) => el.childNodes.filter((n) => n.nodeType === 3).map((n) => n.text).join(' ').replace(/\s+/g, ' ').trim();
const tagName = (el) => el?.rawTagName?.toLowerCase();

// Imagem do próprio site (/img/x.png) precisa existir em public/; endereços com javascript: etc. não entram
const imageExists = (src) => !src.startsWith('/') || fs.existsSync(path.join(PUBLIC_DIR, path.normalize(src)));
const safeUrl = (v) => !/^\s*(javascript|data|vbscript):/i.test(v);

// ---------- Blocos (blocks/*.html) ----------
// Primeira linha: <!-- Nome: campo 1, campo 2 -->. Cada {{}} recebe um texto, na ordem dos campos;
// {{img:/caminho}} é a imagem do bloco (o caminho é a imagem padrão)
export function listBlocks() {
  if (!fs.existsSync(BLOCKS_DIR)) return {};
  return Object.fromEntries(fs.readdirSync(BLOCKS_DIR).filter(isHtml).sort().map((f) => {
    const src = fs.readFileSync(path.join(BLOCKS_DIR, f), 'utf8');
    const [, nome = '', campos = ''] = src.match(/^<!--\s*([^:]+):\s*(.*?)\s*-->/) ?? [];
    return [fileId(f), { nome, campos: campos.split(/\s*,\s*/).filter(Boolean), html: src.replace(/^<!--[\s\S]*?-->\s*/, '').trim() }];
  }));
}

function fillBlock(bloco, texts = [], img = '') {
  let i = 0;
  return bloco.html
    .replace(/\{\{img:([^}]*)\}\}/g, (_, padrao) => escapeHtml(img || padrao))
    .replace(/\{\{\}\}/g, () => escapeHtml(String(texts[i++] ?? '').trim()));
}

// Numera os elementos de um arquivo na ordem em que aparecem: [{ id, el }]
function indexFile(f, root) {
  const prefix = fileId(f);
  const items = [];
  const title = root.querySelector('title');
  if (title) items.push({ id: `${prefix}-1`, el: title });
  const start = root.querySelector('body') ?? root;
  const walk = (el) => {
    for (const child of el.childNodes) {
      if (child.nodeType !== 1 || SKIP.has(tagName(child))) continue;
      items.push({ id: `${prefix}-${items.length + 1}`, el: child });
      walk(child);
    }
  };
  if (start !== root) items.push({ id: `${prefix}-${items.length + 1}`, el: start });
  walk(start);
  return items;
}

// Uma linha por elemento editável. Sem classes nem indentação: a IA não mexe no visual, e assim a lista
// gasta bem menos tokens. Os ids pulados continuam valendo, então a numeração não muda.
function describe({ id, el }) {
  const tag = tagName(el);
  const text = ownText(el);
  const extra = [...ATTRS].map((a) => el.getAttribute(a) && ` ${a}=${el.getAttribute(a)}`).filter(Boolean).join('');
  if (!text && !extra && !CONTAINERS.has(tag) && tag !== 'title') return null;
  const shown = text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}…` : text;
  const cls = el.getAttribute('class') ?? '';
  // Link com fundo e cantos arredondados é o que o usuário chama de "botão"
  const label = tag === 'a' && /\bbg-/.test(cls) && /\brounded/.test(cls) ? 'button' : tag;
  return `${CONTAINERS.has(tag) ? '\n' : ''}${id} ${label}${shown ? ` "${shown}"` : ''}${extra}`;
}

export function themeVars(css) {
  const vars = {};
  for (const [, name, value] of css.matchAll(/(--[\w-]+):\s*([^;{}]+);/g)) vars[name] = value.trim();
  return vars;
}

// Texto que vai para a IA: as cores do tema e a lista de elementos de cada arquivo
export function outline(site) {
  const vars = themeVars(site['cores.css'] ?? '');
  const cores = THEME_VARS.filter((v) => vars[v]).map((v) => `${v} ${vars[v]}`).join(', ');
  const blocos = Object.keys(site).filter(isHtml).map((f) => {
    const onde = f.startsWith('partials/') ? 'every page' : pageUrl(f);
    const linhas = indexFile(f, parse(site[f], { comment: true })).map(describe).filter(Boolean);
    return `=== ${fileId(f)} (${onde})\n${linhas.join('\n').trim()}`;
  });
  if (site[BLOG_FILE] !== undefined) {
    const blog = lerBlog(site[BLOG_FILE]);
    const noticias = ordenarNoticias(blog.noticias).map((n) => {
      const texto = String(n.texto ?? '').replace(/\s+/g, ' ').trim();
      return `post-${n.id} /blog/${n.slug} ${n.data} "${n.titulo}" img=${n.imagem} text "${texto.length > MAX_TEXT ? `${texto.slice(0, MAX_TEXT)}…` : texto}"`;
    });
    blocos.push(`=== blog posts (blog.json, newest first; dates ${blog.mostrarData ? 'shown' : 'hidden'})\n${noticias.join('\n') || '(no posts)'}`);
  }
  return `Colors: ${cores}\n\n${blocos.join('\n\n')}`;
}

// Adiciona o link de uma página nova no fim do menu (o <nav>) do header e do footer
function addMenuLink(html, href, label) {
  const root = parse(html, { comment: true });
  const ultimo = root.querySelector('nav')?.querySelectorAll('a').at(-1);
  if (!ultimo || root.querySelector(`nav a[href="${href}"]`)) return html;
  ultimo.insertAdjacentHTML('afterend', `\n      <a href="${href}">${escapeHtml(label)}</a>`);
  return root.toString();
}

// A seção (filho direto do <main>) que contém o elemento, para "add" colocar o bloco depois dela
function sectionOf(el) {
  let atual = el;
  while (atual?.parentNode && tagName(atual.parentNode) !== 'main') atual = atual.parentNode;
  return tagName(atual?.parentNode) === 'main' ? atual : null;
}

// Aplica as operações sobre uma cópia do site ({ arquivo: conteúdo }). pedido = a mensagem do usuário,
// usada quando o modelo esquece a cor numa operação de tema. Os ids valem para o site como
// estava antes do pedido, mesmo que uma operação anterior tenha inserido elementos. Páginas novas vão
// por último, porque mexem no menu já serializado. Retorna { site, falhas }.
export function applyOps(site, ops, pedido = '') {
  ops = [...ops.filter((o) => o?.op !== 'page'), ...ops.filter((o) => o?.op === 'page')];
  site = { ...site };
  const roots = {};
  const byId = {};
  for (const f of Object.keys(site).filter(isHtml)) {
    roots[f] = parse(site[f], { comment: true });
    for (const item of indexFile(f, roots[f])) byId[item.id] = { ...item, file: f };
  }
  const blocks = listBlocks();
  const tocados = new Set();
  const falhas = [];
  const blog = lerBlog(site[BLOG_FILE]);
  let blogMudou = false;
  // Campos de uma notícia vindos da IA; só os que vieram (para editar sem apagar o resto). null = valor inválido
  const camposNoticia = (op) => {
    const campos = {};
    if (op.title !== undefined) campos.titulo = String(op.title).trim().slice(0, MAX_TITULO) || BLOG_TITULO;
    if (op.text !== undefined) campos.texto = String(op.text).trim().slice(0, MAX_NOTICIA);
    if (op.img !== undefined) {
      const img = String(op.img).trim();
      if (img && (!safeUrl(img) || !imageExists(img))) return null;
      campos.imagem = img || BLOG_CAPA;
    }
    if (op.date !== undefined) {
      const data = String(op.date).trim();
      if (data && !dataValida(data)) return null;
      campos.data = data || hoje();
    }
    return campos;
  };

  for (const op of ops) {
    // Aceita o id com sobras coladas junto ("index-5 h1", "#index-5")
    const id = String(op.id ?? '').replace(/["'#]/g, '').trim().split(/\s+/)[0];
    const alvo = byId[id];
    const falha = (motivo) => falhas.push(`${op.op} ${id || op.name || op.title || ''}${op.value ? ` = ${op.value}` : ''}: ${motivo}`);
    if (['text', 'attr', 'delete', 'add'].includes(op.op) && !alvo) { falha('id não existe'); continue; }
    const el = alvo?.el;

    switch (op.op) {
      case 'text':
        if (el.childNodes.some((n) => n.nodeType === 1)) { falha('tem outros elementos dentro, use o id deles'); continue; }
        el.set_content(escapeHtml(op.value ?? ''));
        break;
      case 'attr': {
        const valor = String(op.value ?? '').trim();
        if (!ATTRS.has(op.name)) { falha('atributo não permitido'); continue; }
        if (op.name !== 'alt' && !safeUrl(valor)) { falha('endereço não permitido'); continue; }
        if (op.name === 'src' && !imageExists(valor)) { falha(`a imagem ${valor} não existe`); continue; }
        el.setAttribute(op.name, valor);
        break;
      }
      case 'delete':
        el.remove();
        break;
      case 'add': {
        const bloco = blocks[op.block];
        if (!bloco) { falha(`o bloco ${op.block} não existe`); continue; }
        const img = String(op.img ?? '').trim();
        if (img && (!safeUrl(img) || !imageExists(img))) { falha(`a imagem ${img} não existe`); continue; }
        const html = fillBlock(bloco, Array.isArray(op.texts) ? op.texts : [], img);
        // Depois da seção do id; um id fora de uma seção (main, body) coloca o bloco no fim da página
        const secao = sectionOf(el);
        const main = roots[alvo.file].querySelector('main');
        if (secao) secao.insertAdjacentHTML('afterend', `\n\n      ${html}`);
        else if (main) main.insertAdjacentHTML('beforeend', `\n      ${html}\n    `);
        else { falha('use o id de uma seção de uma página'); continue; }
        break;
      }
      case 'theme': {
        const nome = `--${String(op.name ?? '').replace(/^-+/, '')}`;
        let valor = String(op.value ?? '').trim().replace(/;$/, '')
          || Object.keys(COLOR_NAMES).find((c) => new RegExp(`\\b${c}\\b`, 'i').test(pedido)) || '';
        valor = COLOR_NAMES[valor.toLowerCase()] ?? (/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(valor) ? `#${valor}` : valor);
        const css = site['cores.css'] ?? '';
        if (!THEME_VARS.includes(nome) || !(nome in themeVars(css)) || !/^#[0-9a-f]{3,8}$/i.test(valor)) { falha('variável ou valor inválido'); continue; }
        site['cores.css'] = css.replace(new RegExp(`(${nome}:\\s*)[^;{}]+;`, 'g'), (_, a) => `${a}${valor};`);
        break;
      }
      case 'page': {
        const titulo = String(op.title ?? '').trim();
        const nome = slugify(titulo);
        const file = `${nome}.html`;
        if (!nome || file in site || !site['index.html'] || !blocks.texto) { falha('nome inválido ou a página já existe'); continue; }
        // A página nova copia o <head> do index e começa com o bloco de texto; o resto vem com "add"
        const nova = parse(site['index.html'], { comment: true });
        nova.querySelector('title')?.set_content(`${escapeHtml(titulo)} - Control Consultoria`);
        nova.querySelector('meta[name="description"]')?.setAttribute('content', titulo);
        const texts = [titulo, ...(Array.isArray(op.texts) ? op.texts : [])];
        // O título do bloco vira o h1 da página
        const html = fillBlock(blocks.texto, texts).replace(/<h2\b/, '<h1').replace(/<\/h2>/, '</h1>');
        nova.querySelector('main')?.set_content(`\n      ${html}\n    `);
        site[file] = nova.toString();
        for (const p of ['partials/header.html', 'partials/footer.html']) {
          if (!(p in site)) continue;
          if (tocados.has(p)) { site[p] = roots[p].toString(); tocados.delete(p); }
          site[p] = addMenuLink(site[p], `/${nome}`, titulo);
        }
        continue;
      }
      case 'post_add': {
        const campos = camposNoticia(op);
        if (!campos) { falha('imagem que não existe ou data inválida (use AAAA-MM-DD)'); continue; }
        const novoId = Math.max(0, ...blog.noticias.map((n) => Number(n.id) || 0)) + 1;
        // O endereço vem do título (ou do slug pedido) e não muda sozinho depois, para os links continuarem valendo
        const slug = slugLivre(blog.noticias, slugify(op.slug) || slugify(campos.titulo ?? BLOG_TITULO));
        blog.noticias.push({ id: novoId, slug, titulo: BLOG_TITULO, texto: '', imagem: BLOG_CAPA, data: hoje(), ...campos });
        blogMudou = true;
        continue;
      }
      case 'post_edit':
      case 'post_delete': {
        const postId = Number(String(op.id ?? '').replace(/\D/g, ''));
        const i = blog.noticias.findIndex((n) => Number(n.id) === postId);
        if (i < 0) { falha('notícia não existe'); continue; }
        if (op.op === 'post_delete') blog.noticias.splice(i, 1);
        else {
          const campos = camposNoticia(op);
          if (!campos) { falha('imagem que não existe ou data inválida (use AAAA-MM-DD)'); continue; }
          // Endereço só muda quando o cliente pede
          if (op.slug !== undefined) {
            const slug = slugify(op.slug);
            if (!slug) { falha('endereço inválido'); continue; }
            if (slugLivre(blog.noticias, slug, blog.noticias[i]) !== slug) { falha(`o endereço /blog/${slug} já é de outra notícia`); continue; }
            campos.slug = slug;
          }
          Object.assign(blog.noticias[i], campos);
        }
        blogMudou = true;
        continue;
      }
      case 'post_dates':
        blog.mostrarData = op.show !== false;
        blogMudou = true;
        continue;
      default:
        falha('operação desconhecida');
        continue;
    }
    tocados.add(alvo?.file ?? 'cores.css');
  }

  for (const f of tocados) if (roots[f]) site[f] = roots[f].toString();
  if (blogMudou) site[BLOG_FILE] = `${JSON.stringify(blog, null, 2)}\n`;
  return { site, falhas };
}
