# Todo-Gstack

A frontend-only todo SPA built as a learning vehicle for Claude Code + gstack.

## Stack

- Vite + React + TypeScript
- Tailwind CSS
- Zustand (with `persist` middleware → localStorage)
- dnd-kit (drag-to-reorder with keyboard fallback)
- Vitest (unit tests)
- Playwright (one e2e happy-path spec)

## Scope

Classic todo features — add, edit, complete, delete, filter (all / active / done) — plus drag-to-reorder. No backend, no accounts, no sync. Todos and their order persist in `localStorage`.

## Design Doc

See `~/.gstack/projects/Todo-Gstack/apple-main-design-20260419-160355.md` for the full design, premises, and rationale.

## Dev

```bash
bun install
bun dev          # start dev server
bun test         # unit tests
bun run e2e      # Playwright e2e
bun run build    # static build → dist/
bun run typecheck
```

(Scaffold not yet generated. Next step: `/plan-eng-review` → then `bun create vite .`)
