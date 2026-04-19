# Todo-Gstack

A frontend-only todo SPA built as a learning vehicle for Claude Code + gstack.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS v3 (CSS vars for light/dark mode)
- Zustand (with `persist` middleware → localStorage) — wiring up next
- dnd-kit (drag-to-reorder with keyboard fallback) — wiring up next
- Geist Sans typography
- Vitest + React Testing Library (unit tests)
- Playwright (e2e)

## Scope

Classic todo features (add / edit / complete / delete / filter) plus drag-to-reorder.
No backend, no accounts, no sync. Todos and order persist in `localStorage`.

## Design Doc

Full plan, store contract, and visual design system in
`~/.gstack/projects/Todo-Gstack/apple-main-design-20260419-160355.md`.

## Dev

```bash
bun install
bun dev              # http://127.0.0.1:5173
bun run test         # unit tests
bun run typecheck    # tsc -b --noEmit
bun run build        # static output → dist/
bun run e2e:install  # one-time: install Playwright chromium
bun run e2e          # run Playwright tests
```

## Status

Scaffold only. Renders a placeholder heading. Store, components, and
drag-to-reorder land in subsequent PRs per the design doc.
