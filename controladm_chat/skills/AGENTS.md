# Frontend Design — agente de design do site LDV Digital

Esta pasta (`skills/`) é a base de conhecimento de design do projeto LDV Digital: regras de craft, regras do projeto e o guia de Tailwind. Ela foi adaptada de https://github.com/jamacio/frontend-design para este projeto.

É usada **por agentes de código** (Claude Code, Copilot, Cursor etc.) que montam ou alteram o layout do site: siga as regras abaixo. O chat do `/admin` **não** usa esta pasta: ele só faz ajustes pequenos (textos, imagens, cores, blocos prontos de `../blocks/`) para gastar poucos tokens.

## O projeto

```
LDV_Digital/
├── public/          ← O SITE. Toda alteração de design acontece aqui
│   ├── cores.css           ← só as cores da marca (:root), em CSS puro. O chat altera este arquivo
│   ├── theme.css           ← entrada do Tailwind: liga as cores às classes (bg-surface, text-accent…) e define as fontes
│   ├── site.css            ← GERADO pelo Tailwind (npm run build:css). Não edite
│   ├── site.js             ← efeitos do site (menu do celular, partículas, data-anim, data-tilt, data-counter, parallax, FAQ, formulário → WhatsApp). Entra pelo footer
│   ├── fonts/              ← Inter e Playfair Display servidas pelo próprio site (declaradas no theme.css)
│   ├── blog.json           ← notícias do blog (o chat cria/edita/apaga aqui); blog.html só lê e exibe em /blog e /blog/<slug>
│   ├── partials/header.html ← header fixo com o menu principal (entra em toda página)
│   ├── partials/footer.html ← footer fixo com o menu do rodapé (entra em toda página)
│   └── *.html              ← uma página por arquivo (index.html = "/", sobre.html = "/sobre")
├── admin/           ← Login e chat do /admin. NÃO é alvo de alterações de design do site
├── prompts/         ← Prompt do chat: editor.md (o prompt inteiro: operações + resumo deste guia)
├── server.js        ← Servidor Express (login, chat, desfazer)
├── blocks/          ← Blocos de seção que o chat usa para "adiciona uma seção" (só textos, sem HTML da IA)
└── skills/          ← Esta pasta
    ├── AGENTS.md            ← Este arquivo, ponto de entrada do agente
    ├── craft/               ← Regras universais de qualidade (tipografia, cor, acessibilidade…)
    └── skills/              ← project-generator (regras do site), tailwind-4 (receitas) e CRAFT-RULES.md (resumo)
```

## ⚠️ Regras obrigatórias

Leia `skills/project-generator/SKILL.md` antes de alterar o site. Resumo:

1. **O site é `public/`.** Edite as páginas existentes no lugar. Não crie a pasta `Projects/` e não duplique o site.
2. **Partes compartilhadas ficam em um lugar só.** Cada página tem `<link rel="stylesheet" href="/cores.css">` e `<link rel="stylesheet" href="/site.css">`, `<!-- @header -->` e `<!-- @footer -->` (o servidor troca essas duas linhas pelos arquivos de `partials/`). Menu, header, footer e cores do site são alterados nesses arquivos, não página por página. **Estilo só com classes do Tailwind v4** no `class="..."`: nada de `<style>`, `style="..."` ou CSS novo. Cores da marca ficam em `cores.css`, fontes em `theme.css`. JS num `<script>`. O servidor não gera CSS: **depois de mudar classes em `public/` ou `blocks/`, rode `npm run build:css`** e versione o `site.css`.
3. **Não mexa em `admin/`, `server.js`, `editor.js` nem `prompts/`** para pedidos de design do site, a menos que o usuário peça explicitamente.
4. **Leia antes de alterar:** abra a página atual e entenda o que já existe. Mude só o que foi pedido.
5. **Textos em português do Brasil.**
6. **Nada de recursos externos** (CDNs, fontes do Google, imagens de outros sites) sem o usuário pedir. Use SVG inline e as fontes do sistema como fallback.
7. **Blog:** as notícias ficam em `public/blog.json` (`id`, `slug`, `titulo`, `texto`, `imagem`, `data`), não no HTML. Para criar, editar ou apagar notícias, altere só o JSON. Não troque o `slug` de uma notícia sem o usuário pedir. Detalhes em `skills/project-generator/SKILL.md` (seção 3.1).
8. **Aplique as regras de craft** (`craft/*.md`, resumo em `skills/CRAFT-RULES.md`). As P0 de `craft/anti-ai-slop.md` não são opcionais.

## Como usar esta pasta

1. Pedido com uma marca ou estilo: troque as cores no `:root` do `public/cores.css` e as fontes no `@theme` do `public/theme.css` e use as classes do tema (`bg-surface`, `text-fg`, `text-accent`, `font-display`…).
2. Antes de entregar, confira as regras de craft: `craft/typography.md`, `craft/color.md`, `craft/anti-ai-slop.md` e `craft/accessibility-baseline.md`.
3. Para uma página nova, monte-a com os blocos de `../blocks/` (as páginas atuais são feitas deles) e salve em `public/<nome>.html`.

## Animações (tema Control Consultoria)

- Entrada ao rolar: `data-anim="fade-up | slide-up | slide-right | scale-in | zoom-in"` + `data-delay="<ms>"` (regras no `theme.css`). O elemento com `data-anim` não pode ter classes `transition`/`hover:translate`: ponha esses efeitos num filho.
- `data-tilt` (efeito 3D no mouse), `data-counter` (o número final é o texto do elemento), `data-particles` (partículas), `data-parallax-speed` (esferas), `data-faq` (pergunta que abre e fecha).
- Animações contínuas são classes `animate-*` do `@theme` (`animate-glow`, `animate-ken-burns`, `animate-drift`, `animate-btn-pulse`…). Halos: `glow-accent` e `glow-surface`. Destaque verde nos títulos: `text-gradient`.
- O header é fixo: a primeira seção de cada página precisa de `pt-*` próprio (o `<main>` dá `pt-32` às que não têm).

## Seções novas e o chat

Ao criar um tipo de seção que o cliente possa querer repetir, salve também uma cópia em `../blocks/<nome>.html`: primeira linha `<!-- Nome: campo 1, campo 2 -->`, cada texto trocado por `{{}}` (na ordem dos campos) e a imagem por `{{img:/img/padrao.svg}}`. O chat passa a oferecer o bloco sozinho.

## Atalhos

- Como estilizar com Tailwind (textos, cores, banners): `skills/tailwind-4/SKILL.md`
- Resumo das regras de craft: `skills/CRAFT-RULES.md`
- Anti-AI-slop (P0): `craft/anti-ai-slop.md`
- Acessibilidade: `craft/accessibility-baseline.md`
