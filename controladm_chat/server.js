import express from 'express';
import session from 'express-session';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyOps, BLOG_FILE, listBlocks, outline, THEME_VARS } from './editor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, 'public');

const PORT = process.env.PORT || 4000;
const GEMINI_URL = process.env.GEMINI_URL || 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
// Idioma das respostas da IA no chat (o texto do site segue o idioma que a página já usa)
const RESPONSE_LANGUAGE = process.env.RESPONSE_LANGUAGE || 'Brazilian Portuguese';
// Limites para a conta da API não sair do controle na mão do cliente
const DAILY_LIMIT = Number(process.env.DAILY_LIMIT) || 50;
const MAX_MESSAGE_CHARS = Number(process.env.MAX_MESSAGE_CHARS) || 400;
// Pedidos do blog trazem o texto da notícia inteiro, então aceitam mais
const MAX_POST_CHARS = Number(process.env.MAX_POST_CHARS) || 2000;
const MAX_OUTPUT_TOKENS = Number(process.env.MAX_OUTPUT_TOKENS) || 800;

// ---------- Histórico de alterações ----------
// Fica na memória (sem banco de dados): dá para desfazer as alterações feitas desde que o servidor subiu.
// Cada alteração guarda o conteúdo anterior de cada arquivo que mudou (null = o arquivo foi criado nela).
const MAX_HISTORY = 50;
const history = [];
let nextChangeId = 1;

// Login com o usuário e a senha do .env. Compara os hashes para levar o mesmo tempo com qualquer senha.
const sha256 = (s) => crypto.createHash('sha256').update(String(s ?? '')).digest();
const checkLogin = (username, password) =>
  [crypto.timingSafeEqual(sha256(username), sha256(ADMIN_USER)), crypto.timingSafeEqual(sha256(password), sha256(ADMIN_PASSWORD))].every(Boolean);

// ---------- Arquivos do site (só o que está em public/) ----------
// O header e o footer ficam em partials/ e entram em toda página no lugar de <!-- @header --> e <!-- @footer -->;
// o cores.css (as cores, em CSS puro) vale para todas as páginas. Assim um pedido como "muda o menu" é uma edição só.
// O visual fica em classes do Tailwind nos HTML; o site.css já vem gerado (npm run build:css) e não vai para a IA.
const PARTIALS = ['partials/header.html', 'partials/footer.html'];
// As notícias do blog ficam no blog.json, que a página /blog lê
const SHARED_FILES = [...PARTIALS, 'cores.css', BLOG_FILE];
const PAGE_RE = /^[\w-]+\.html$/;

const listPages = () => fs.readdirSync(PUBLIC_DIR).filter((f) => PAGE_RE.test(f)).sort();

const listSiteFiles = () => [
  ...SHARED_FILES.filter((f) => fs.existsSync(path.join(PUBLIC_DIR, f))),
  ...listPages(),
];

const isSiteFile = (f) => SHARED_FILES.includes(f) || PAGE_RE.test(f ?? '');
const readSite = () => Object.fromEntries(listSiteFiles().map((f) => [f, fs.readFileSync(path.join(PUBLIC_DIR, f), 'utf8')]));

function renderPage(page, html) {
  const href = page === 'index.html' ? '/' : `/${page.replace(/\.html$/, '')}`;
  return html.replace(/<!--\s*@(header|footer)\s*-->/g, (tag, nome) => {
    const file = path.join(PUBLIC_DIR, 'partials', `${nome}.html`);
    if (!fs.existsSync(file)) return tag;
    // Marca no menu o link da página aberta
    return fs.readFileSync(file, 'utf8').trim()
      .replaceAll(`href="${href}"`, `href="${href}" aria-current="page"`);
  });
}

// ---------- IA (Gemini) ----------
// O prompt fica em prompts/editor.md, lido a cada pedido: dá para editar sem reiniciar o servidor
const PROMPTS_DIR = path.join(__dirname, 'prompts');
// Os blocos de blocks/ entram como "- nome: campo, campo"
const systemPrompt = () => fs.readFileSync(path.join(PROMPTS_DIR, 'editor.md'), 'utf8').trim()
  .replaceAll('{{RESPONSE_LANGUAGE}}', RESPONSE_LANGUAGE)
  .replaceAll('{{BLOCKS}}', Object.entries(listBlocks()).map(([id, b]) => `- ${id}: ${b.campos.join(', ')}`).join('\n'));

// Para gastar menos tokens, a IA vê só as páginas citadas no pedido (ou a inicial), além do header e do footer.
// "todas as páginas"/"site todo" manda todas. Um pedido que começa com id (index-4) vale para a página dele.
const semAcento = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
function pagesFor(pedido) {
  const pages = listPages();
  const t = semAcento(pedido);
  if (/\b(todas as paginas|site (todo|inteiro)|todo o site|cada pagina)\b/.test(t)) return pages;
  const citadas = pages.filter((f) => {
    const nome = f.replace(/\.html$/, '');
    if (nome === 'index') return /\b(index-\d+|pagina inicial|home|inicio)\b/.test(t);
    return new RegExp(`\\b${nome}(-\\d+)?\\b`).test(t);
  });
  return citadas.length ? citadas : pages.filter((f) => f === 'index.html');
}
// As notícias só vão para a IA quando o pedido fala do blog
const falaDoBlog = (pedido) => /\b(blog|noticias?|posts?|artigos?|publicac(ao|oes))\b/.test(semAcento(pedido));

// A IA devolve operações curtas sobre os elementos numerados (veja editor.js), não HTML:
// cada token de resposta custa, e reescrever o arquivo inteiro gastaria muito mais.
// Um schema por operação, cada uma só com os seus campos: o Gemini restringe a geração a eles
const op = (nome, campos, required) => ({
  type: 'object',
  properties: { op: { enum: [nome] }, ...campos },
  required: ['op', ...required],
});
const str = { type: 'string' };
const texts = { type: 'array', items: str };
const editSchema = () => ({
  type: 'object',
  properties: {
    reply: str,
    ops: {
      type: 'array',
      items: {
        anyOf: [
          op('text', { id: str, value: str }, ['id', 'value']),
          op('attr', { id: str, name: { enum: ['href', 'src', 'alt'] }, value: str }, ['id', 'name', 'value']),
          op('theme', { name: { enum: THEME_VARS }, value: { type: 'string', pattern: '^#[0-9a-fA-F]{6}$' } }, ['name', 'value']),
          op('delete', { id: str }, ['id']),
          op('add', { id: str, block: { enum: Object.keys(listBlocks()) }, texts, img: str }, ['id', 'block', 'texts']),
          op('page', { title: str, texts }, ['title']),
          op('post_add', { title: str, text: str, img: str, date: str, slug: str }, []),
          op('post_edit', { id: str, title: str, text: str, img: str, date: str, slug: str }, ['id']),
          op('post_delete', { id: str }, ['id']),
          op('post_dates', { show: { type: 'boolean' } }, ['show']),
        ],
      },
    },
  },
  required: ['reply', 'ops'],
});

// Pedidos do dia (na memória: zera à meia-noite e quando o servidor reinicia)
const uso = { dia: '', pedidos: 0 };
const hoje = () => new Date().toLocaleDateString('pt-BR');
function restantes() {
  if (uso.dia !== hoje()) Object.assign(uso, { dia: hoje(), pedidos: 0 });
  return Math.max(0, DAILY_LIMIT - uso.pedidos);
}

// Para mostrar no chat se a IA está disponível
let iaStatus = GEMINI_API_KEY ? 'pronto' : 'offline';

async function geminiGenerate(body) {
  const res = await fetch(`${GEMINI_URL}/models/${GEMINI_MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_API_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.text();
  if (!res.ok) throw new Error(`Gemini respondeu ${res.status}: ${data}`);
  return JSON.parse(data);
}

async function askGemini(history, site, pedido) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY não configurada no .env');
  const conversa = history.length
    ? 'Previous conversation:\n' + history.map((m) => `- ${m.role === 'user' ? 'user' : 'you'}: ${m.content}`).join('\n')
    : '';
  const pages = pagesFor(pedido);
  const visiveis = Object.fromEntries(Object.entries(site).filter(([f]) =>
    f === BLOG_FILE ? falaDoBlog(pedido) : !PAGE_RE.test(f) || pages.includes(f)));
  const outras = listPages().filter((f) => !pages.includes(f)).map((f) => f.replace(/\.html$/, ''));
  const prompt = [
    outline(visiveis),
    outras.length && `Other pages (not listed): ${outras.join(', ')}`,
    conversa,
    `Requested change: ${pedido}`,
  ].filter(Boolean).join('\n\n');
  const t0 = Date.now();
  const data = await geminiGenerate({
    systemInstruction: { parts: [{ text: systemPrompt() }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      // Sem raciocínio: os tokens de "thinking" também são cobrados, e as operações são simples
      thinkingConfig: { thinkingLevel: 'minimal' },
      responseMimeType: 'application/json',
      // A IA devolve o texto da notícia, então a resposta cresce com o pedido
      maxOutputTokens: MAX_OUTPUT_TOKENS + (falaDoBlog(pedido) ? Math.ceil(pedido.length / 2) : 0),
      responseJsonSchema: editSchema(),
    },
  });
  iaStatus = 'pronto';
  const u = data.usageMetadata ?? {};
  console.log(`[gemini] prompt ${u.promptTokenCount} tokens | resposta ${u.candidatesTokenCount} tokens`
    + `${u.thoughtsTokenCount ? ` + ${u.thoughtsTokenCount} de raciocínio` : ''} | ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');
  if (!text) throw new Error(`Gemini não devolveu texto: ${JSON.stringify(data.promptFeedback ?? data.candidates?.[0]?.finishReason)}`);
  return JSON.parse(text);
}

// ---------- App ----------
const app = express();
app.use(express.json());
app.use('/api/upload', express.raw({ type: 'image/*', limit: '5mb' }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 },
}));

const requireAuth = (req, res, next) =>
  req.session.user ? next() : res.status(401).json({ error: 'Não autenticado' });

app.get('/admin', (req, res) => {
  const page = req.session.user ? 'chat.html' : 'login.html';
  res.sendFile(path.join(__dirname, 'admin', page));
}); 

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body ?? {};
  if (!checkLogin(username, password)) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ error: 'Erro de sessão' });
    req.session.user = ADMIN_USER;
    req.session.history = [];
    res.json({ ok: true });
  });
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({
    username: req.session.user,
    model: GEMINI_MODEL,
    ia: iaStatus,
    pages: listPages(),
    restantes: restantes(),
    limite: DAILY_LIMIT,
    maxChars: MAX_MESSAGE_CHARS,
    maxPostChars: MAX_POST_CHARS,
  });
});

// Imagem anexada no chat: vai para public/img/uploads e a IA recebe o caminho
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'img', 'uploads');
const IMAGE_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
app.post('/api/upload', requireAuth, (req, res) => {
  const ext = IMAGE_TYPES[req.get('Content-Type')];
  if (!ext || !Buffer.isBuffer(req.body) || !req.body.length) {
    return res.status(400).json({ error: 'Envie uma imagem PNG, JPG, WEBP ou GIF de até 5 MB' });
  }
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const nome = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, nome), req.body);
  res.json({ url: `/img/uploads/${nome}` });
});

app.post('/api/chat', requireAuth, async (req, res) => {
  const texto = String(req.body?.message ?? '').trim();
  const image = String(req.body?.image ?? '');
  if (!texto) return res.status(400).json({ error: 'Mensagem vazia' });
  const maxChars = falaDoBlog(texto) ? MAX_POST_CHARS : MAX_MESSAGE_CHARS;
  if (texto.length > maxChars) return res.status(400).json({ error: `Mensagem longa demais (máximo de ${maxChars} caracteres). Peça uma coisa por vez.` });
  if (image && !/^\/img\/uploads\/[\w-]+\.(png|jpg|webp|gif)$/.test(image)) return res.status(400).json({ error: 'Imagem inválida' });
  if (!restantes()) return res.status(429).json({ error: `O limite de ${DAILY_LIMIT} pedidos por dia acabou. Amanhã ele volta.` });
  const message = image ? `${texto}\nAttached image: ${image}` : texto;

  const siteAtual = readSite();
  // Só a última troca vai no histórico; o site atual vai sempre na mensagem nova
  const conversa = req.session.history ?? [];

  let result;
  uso.pedidos++;
  try {
    result = await askGemini(conversa, siteAtual, message);
  } catch (err) {
    console.error(err);
    if (/ECONNREFUSED|ENOTFOUND|GEMINI_API_KEY|\b(401|403)\b/.test(err.message + err.code)) iaStatus = 'offline';
    return res.status(502).json({ error: 'Não foi possível falar com a IA (Gemini). Confira a GEMINI_API_KEY e a conexão.' });
  }

  const ops = (Array.isArray(result.ops) ? result.ops : []).filter((o) => o && typeof o === 'object');
  let { site: novoSite, falhas } = applyOps(siteAtual, ops, message);
  console.log('[ops]', JSON.stringify(ops));
  if (falhas.length) console.log('[operações com falha]', falhas);
  if (falhas.length && falhas.length === ops.length) {
    return res.status(422).json({ error: `A IA errou o pedido (${falhas.join('; ')}), nada foi alterado. Tente pedir de novo, com mais detalhes.` });
  }

  const alterados = Object.keys(novoSite).filter((f) => novoSite[f].trim() !== (siteAtual[f] ?? '').trim());
  let change = null;
  if (alterados.length) {
    for (const f of alterados) fs.writeFileSync(path.join(PUBLIC_DIR, f), novoSite[f]);
    change = {
      id: nextChangeId++,
      page: alterados.join(', '),
      pedido: texto,
      resposta: result.reply,
      created_at: new Date().toLocaleString('pt-BR'),
      files: alterados,
    };
    history.push({ ...change, anteriores: Object.fromEntries(alterados.map((f) => [f, siteAtual[f] ?? null])) });
    if (history.length > MAX_HISTORY) history.shift();
  }

  req.session.history = [
    ...conversa,
    { role: 'user', content: message },
    { role: 'assistant', content: result.reply },
  ].slice(-2); // Só a última troca: o suficiente para "e deixa ele maior", sem encarecer cada pedido
  const reply = falhas.length
    ? `${result.reply}\n(${falhas.length} de ${ops.length} operações não puderam ser aplicadas e ficaram de fora)`
    : result.reply;
  res.json({ reply, change, restantes: restantes() });
});

// Volta os arquivos ao conteúdo anterior (null = o arquivo não existia e é apagado)
function restoreFiles(anteriores) {
  for (const [f, conteudo] of Object.entries(anteriores)) {
    if (!isSiteFile(f)) continue;
    const file = path.join(PUBLIC_DIR, f);
    if (conteudo === null) fs.rmSync(file, { force: true });
    else fs.writeFileSync(file, conteudo);
  }
}

app.get('/api/changes', requireAuth, (req, res) => {
  res.json(history.map(({ anteriores, files, ...c }) => c).reverse());
});

// Desfaz a alteração mais recente do site (volta todos os arquivos que ela mudou)
app.post('/api/undo', requireAuth, (req, res) => {
  const last = history.pop();
  if (!last) return res.status(404).json({ error: 'Nada para desfazer desde que o servidor foi ligado' });
  restoreFiles(last.anteriores);
  res.json({ ok: true, undone: last.id, files: Object.keys(last.anteriores) });
});

// Páginas do site, com o header e o footer incluídos. /sobre e /sobre.html abrem a mesma página.
// Sem cache, para o site mostrar a alteração assim que ela for aplicada
// Cada notícia do blog abre em /blog/<slug> (o slug fica no blog.json): é a mesma blog.html, que lê o endereço
app.get('/blog/:slug', (req, res, next) => {
  if (!listPages().includes('blog.html')) return next();
  res.set('Cache-Control', 'no-store').type('html')
    .send(renderPage('blog.html', fs.readFileSync(path.join(PUBLIC_DIR, 'blog.html'), 'utf8')));
});

app.get(['/', '/:page'], (req, res, next) => {
  const nome = req.params.page ?? 'index.html';
  const page = nome.endsWith('.html') ? nome : `${nome}.html`;
  if (!listPages().includes(page)) return next();
  res.set('Cache-Control', 'no-store').type('html')
    .send(renderPage(page, fs.readFileSync(path.join(PUBLIC_DIR, page), 'utf8')));
});

app.use(express.static(PUBLIC_DIR, { etag: false, maxAge: 0 }));

if (!fs.existsSync(path.join(PUBLIC_DIR, 'site.css'))) console.log('[css] public/site.css não existe: rode npm run build:css');

app.listen(PORT, () => {
  console.log(`Site:  http://localhost:${PORT}`);
  console.log(`Admin: http://localhost:${PORT}/admin  (modelo: ${GEMINI_MODEL})`);
  if (!GEMINI_API_KEY) console.log('[gemini] GEMINI_API_KEY não configurada no .env: o chat não vai funcionar');
});
