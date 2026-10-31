---
name: project-generator
description: |
  Regra obrigatória para alterar o site LDV Digital. O site vive em public/ (um HTML por página estilizado com classes do Tailwind + cores.css, header e footer compartilhados), é editado no lugar, sem pasta Projects/, sem recursos externos e sem mexer no admin/servidor.
triggers:
  - "alterar site"
  - "mudar site"
  - "nova página"
  - "criar página"
  - "site from instagram"
  - "site from facebook"
  - "criar projeto"
  - "novo projeto"
od:
  mode: utility
  category: project-management
  priority: P0
---

# project-generator (adaptado para LDV Digital)

## REGRAS OBRIGATÓRIAS — leia antes de alterar o site

### 1. Onde fica o site

- O site é a pasta `public/` na raiz do projeto (`../../../public/` a partir deste arquivo).
- Cada página é um `.html` em `public/`: `index.html` é a página inicial, e outras páginas ficam lado a lado (`public/contato.html` abre em `/contato`).
- O que é igual em todas as páginas fica em um arquivo só:
  - `public/cores.css`: só as cores no `:root`, em CSS puro (o chat altera este arquivo);
  - `public/theme.css`: entrada do Tailwind; liga as cores às classes (`bg-bg`, `bg-surface`, `text-fg`, `text-muted`, `border-border`, `bg-accent`, `text-accent`) e define as fontes (`font-display`, `font-body`);
  - `public/site.css`: GERADO pelo Tailwind a partir do `theme.css` e das classes dos HTML de `public/` e `blocks/`. Não edite;
  - `public/partials/header.html`: header fixo com logo e menu principal;
  - `public/partials/footer.html`: footer fixo com o menu do rodapé.
- O servidor troca `<!-- @header -->` e `<!-- @footer -->` de cada página pelos partials e marca no menu o link da página aberta (`aria-current="page"`).
- **Não** crie `Projects/`, `skills/` ou `agents/` dentro do site. Não duplique páginas para "versões novas": o histórico e o desfazer já ficam no chat do `/admin`.

### 2. Alterar uma página existente

1. Leia o HTML atual inteiro antes de mudar.
2. Mude só o que foi pedido e mantenha o resto idêntico.
3. Mantenha o documento completo e válido, de `<!doctype html>` até `</html>`, com `lang="pt-BR"`, `<meta charset>`, `<meta name="viewport">`, `<link rel="stylesheet" href="/cores.css">`, `<link rel="stylesheet" href="/site.css">`, `<!-- @header -->` e `<!-- @footer -->`.
4. Menu, header, footer ou cores do site inteiro: altere `partials/` ou `cores.css`, nunca página por página.

### 3. Criar uma página nova

1. Salve como `public/<nome-em-minusculas>.html`. Pelo chat, a operação `page` faz isso sozinha (cria o arquivo e põe o link nos menus).
2. Copie o `<head>`, o `<body>`, o `<main>` e a `<section>` do `index.html` com as mesmas classes e mantenha `<!-- @header -->` e `<!-- @footer -->`.
3. Adicione o link da página nos dois menus (`partials/header.html` e `partials/footer.html`).
4. Para a estrutura, use os blocos de `../../../blocks/` (troque cada `{{}}` pelo texto).

### 3.1 Blog

- As notícias ficam em `public/blog.json`, não no HTML. A `public/blog.html` só lê o JSON e mostra: `/blog` lista (6 por página, `?pagina=2`…), `/blog/<slug>` abre uma notícia.
- Formato: `{"mostrarData": true, "noticias": [{"id", "slug", "titulo", "texto", "imagem", "data"}]}`. `texto` separa os parágrafos com `\n`; `data` é `AAAA-MM-DD`; `slug` é o endereço (minúsculas, sem acento, palavras separadas por `-`, único).
- Notícia nova, editada ou apagada: altere só o `blog.json`. Não mude o `slug` de uma notícia existente sem o usuário pedir, porque os links antigos param de funcionar.
- Sem imagem, título ou texto, a página usa `/img/blog-capa.svg`, "Nova notícia" e "Mais detalhes em breve.". Mantenha esses padrões ao mexer no layout do blog.
- Mudou o visual do blog? As classes ficam nos templates do `<script>` da `blog.html`. Escreva cada classe inteira (nada de montar nome de classe com variável) e rode `npm run build:css`.

### 4. Arquivos que NÃO são o site

`admin/`, `server.js`, `editor.js`, `prompts/`, `blocks/` e `package.json` são a aplicação. Não altere nenhum deles para atender um pedido de design do site. Se o usuário pedir explicitamente uma mudança neles, trate como tarefa de código, separada.

### 5. Formato de cada página

- Estilo **só com classes do Tailwind v4** no `class="..."` (receitas em `../tailwind-4/SKILL.md`). Nada de `<style>`, `style="..."` ou CSS escrito à mão. JS dentro de `<script>`.
- Cores como variáveis no `:root` do `cores.css` (`--bg`, `--surface`, `--fg`, `--muted`, `--border`, `--accent`, `--accent-on`), usadas pelas classes do tema (`bg-surface`, `text-accent`…). Fontes no `@theme` do `theme.css`.
- O servidor não gera CSS. **Mudou classes em `public/` ou `blocks/`? Rode `npm run build:css`** e versione o `site.css`; sem isso as classes novas ficam sem estilo.
- Textos em português do Brasil.

### 6. Marca e identidade visual

- Se o usuário citar uma marca ou estilo, ajuste as cores no `:root` do `cores.css` e as fontes no `theme.css` para lembrar a marca, sem copiar logo nem nome.
- Se o usuário passar a identidade da empresa dele (logo, cores, Instagram/Facebook), use as cores e o tom informados. Não invente logo nem slogan.

### 7. Imagens e recursos externos

- **Não** use imagens, fontes ou scripts de outros sites (unsplash, picsum, Google Fonts, CDNs) sem o usuário pedir.
- Sem imagem real, resolva com composição (tipografia, cor, SVG inline simples) em vez de placeholders vazios.
- Imagens que o usuário fornecer vão em `public/` (ex: `public/img/logo.png`) e são referenciadas por caminho relativo, sempre com `alt`.

### 8. Antes de entregar

- [ ] A página abre sem erro e continua completa
- [ ] Contraste do texto ≥ 4.5:1 (cuidado ao trocar o fundo: troque o texto junto)
- [ ] Nenhum P0 de `../../craft/anti-ai-slop.md` (indigo do Tailwind, degradê roxo→azul, emoji como ícone, métricas inventadas, lorem ipsum)
- [ ] Funciona no celular (sem rolagem horizontal, botões ≥ 44px)

### 9. Exemplos

> **Usuário:** "deixa o site com o estilo da Apple"
> **Agente:** lê `public/cores.css` e `public/theme.css` → troca as cores do `:root` e as fontes pelas do estilo pedido → ajusta as classes do Tailwind nas páginas → mantém o conteúdo.

> **Usuário:** "cria uma página de contato"
> **Agente:** monta a página com blocos de `blocks/` → cria `public/contato.html` com o `<head>` do `index.html` e os marcadores `@header`/`@footer` → adiciona o link "Contato" em `partials/header.html` e `partials/footer.html`.
