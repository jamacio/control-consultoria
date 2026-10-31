# Tailwind CSS v4 gotchas (quick scan)

Trimmed from [Lombiq/Tailwind-Agent-Skills](https://github.com/Lombiq/Tailwind-Agent-Skills) (BSD-3, see `../LICENSE.md`) to what matters when editing pages with utility classes. Setup and v3 migration items were removed: this project already runs v4 (`npm run build:css`, input `public/theme.css`).

- Browser support is modern-only: Safari 16.4+, Chrome 111+, Firefox 128+.
- Important modifier goes at the end: `bg-red-500!`.
- Default border and ring color now use `currentColor`; ring width default is 1px.
- `space-*` and `divide-*` selectors changed; use flex/grid with `gap` if layouts break.
- `@theme` is for design tokens that should create utilities or variants; use `:root` only for plain CSS variables that should not generate Tailwind APIs.
- Stacked variants apply left-to-right (reverse order from v3).
- Arbitrary CSS variable syntax is `bg-(--brand-color)` (not `bg-[--brand-color]`).
- Transform reset uses `scale-none`, `rotate-none`, `translate-none` (not `transform-none`).
- `hover:` now only applies on devices that support hover; override if needed.
- Tailwind scans source files as plain text, so dynamically concatenated class fragments are not detected.
