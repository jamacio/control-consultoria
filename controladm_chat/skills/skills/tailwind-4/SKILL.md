---
name: tailwind-4
description: |
  Como estilizar o site LDV Digital só com classes do Tailwind CSS v4: textos, cores, banners, botões, seções e layout responsivo. Use ao alterar o visual de qualquer página de public/.
triggers:
  - "tailwind"
  - "cor"
  - "banner"
  - "botão"
  - "texto"
  - "fonte"
  - "espaçamento"
od:
  mode: utility
  category: frontend
  priority: P0
---

# tailwind-4 (adaptado para LDV Digital)

Adaptado de [Lombiq/Tailwind-Agent-Skills](https://github.com/Lombiq/Tailwind-Agent-Skills) (`tailwind-4-docs`, licença BSD-3 em `LICENSE.md`). Ficou só o que serve para editar o site: o sync da documentação oficial, a migração v3→v4 e as partes de PostCSS/Vite/`@apply` foram removidos.

## Como o Tailwind funciona aqui

- Tailwind **v4.3**, só na hora do design: `npm run build:css` lê `public/theme.css` + as classes de `public/**/*.html` e `blocks/*.html` e gera `public/site.css`. O servidor não gera CSS, então **rode o build depois de mudar classes** e versione o `site.css`.
- **Só classes no `class="..."`.** Nada de `<style>`, `style="..."`, `@apply` ou regras novas no `theme.css`.
- As cores da marca ficam no `:root` do `public/cores.css` (CSS puro, o chat altera ali). O `@theme` do `public/theme.css` liga cada uma a classes e define as fontes:

| Variável | Classes |
|---|---|
| `--bg` | `bg-bg` (fundo da página) |
| `--surface`, `--surface-hover` | `bg-surface`, `hover:bg-surface-hover` |
| `--fg`, `--muted` | `text-fg`, `text-muted` |
| `--border` | `border-border` |
| `--accent`, `--accent-on` | `bg-accent`, `text-accent`, `text-accent-on`, `border-accent` |
| `--font-display`, `--font-body` | `font-display` (títulos), `font-body` (texto) |

## Receitas

**Texto:** troque só o conteúdo entre as tags e mantenha o `class`. Tamanho `text-sm … text-7xl`, peso `font-medium`/`font-semibold`, alinhamento `text-center`, largura de leitura `max-w-prose`, entrelinha `leading-tight` (títulos) / `leading-relaxed` (texto).

**Cor:**
- De um elemento: troque a classe de cor existente, sem empilhar outra (`text-accent` → `text-green-700`, não `text-accent text-green-700`).
- Do site todo: mude a variável no `cores.css` (`--accent: #0f766e;`), e todas as classes `*-accent` acompanham.
- Cor exata pontual: `text-[#0f766e]`, `bg-[#fdf6ec]`. Usou a mesma cor 3 vezes? Vira variável no `cores.css`, ligada a uma classe no `@theme inline` do `theme.css`.
- Variável CSS na classe: `bg-(--accent)` (sintaxe v4; **não** `bg-[--accent]`).
- Mudou o fundo? Mude o texto junto (contraste ≥ 4.5:1).

**Banner / hero** (dentro do `<main>`):
```html
<section class="w-full bg-accent px-6 py-16 text-center text-accent-on sm:py-24">
  <h1 class="font-display text-4xl font-semibold tracking-tight sm:text-6xl">Título</h1>
  <p class="mx-auto mt-4 max-w-prose text-lg">Uma frase sobre a oferta.</p>
  <a class="mt-8 inline-flex min-h-11 items-center rounded-full bg-surface px-6 font-semibold text-fg hover:-translate-y-0.5 motion-safe:transition" href="/contato">Fale com a gente</a>
</section>
```
Com imagem do usuário: `bg-[url(/img/banner.jpg)] bg-cover bg-center` + uma camada escura (`bg-black/50`) para o texto continuar legível.

**Botão:** `inline-flex min-h-11 items-center rounded-full bg-accent px-6 font-semibold text-accent-on hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`.

**Grade de cards:** `grid gap-6 sm:grid-cols-2 lg:grid-cols-3`, cada card `rounded-2xl bg-surface p-6 shadow`.

**Responsivo:** mobile-first. A classe sem prefixo vale para o celular, e `sm:` (640px), `md:` (768px) e `lg:` (1024px) mudam a partir dali (`text-3xl sm:text-5xl`).

**Itens repetidos** (menu, lista): ponha as classes no pai com `*:` (`<nav class="flex gap-1 *:px-3 *:hover:bg-surface-hover">`), não em cada filho.

## Pegadinhas do v4

Veja `references/gotchas.md`. As que mais quebram:

1. Classe montada por partes (`"text-" + cor`) não é detectada. Escreva a classe inteira no HTML.
2. `!important` vai no fim: `bg-red-500!`.
3. Borda sem cor usa `currentColor`. Escreva `border border-border`.
4. `hover:` só vale em aparelhos com mouse. No celular, o estado padrão tem que funcionar sozinho.
5. Variantes empilhadas leem da esquerda para a direita: `*:hover:bg-x` = filho com hover.

## Antes de entregar

- [ ] Só classes do Tailwind; nenhum CSS escrito à mão
- [ ] Trocou a classe antiga em vez de somar uma conflitante
- [ ] Cores da marca via classes do tema (`bg-accent`…), não hex repetido
- [ ] Contraste ok e alvos de toque ≥ 44px (`min-h-11`)
- [ ] Funciona no celular, sem rolagem horizontal
