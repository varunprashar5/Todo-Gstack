# Changelog

All notable changes to this project will be documented in this file. Format
follows [Keep a Changelog](https://keepachangelog.com).

## [0.0.2.0] - 2026-04-19

### Added
- Todos store with add / toggle / edit / delete / reorder / filter — state lives
  in a Zustand store that survives page reloads via `localStorage`.
- Undoable "edit to empty → delete" behavior matching the classic TodoMVC
  convention.
- Keyboard-accessible reorder semantics exposed through the store's `reorder`
  action (uses dnd-kit's `arrayMove`).
- Zero-width and BOM whitespace stripping on input, so todos pasted from Slack
  or Notion can't sneak in as invisible "ghost" rows.

### Changed
- localStorage writes are wrapped in a quota-safe adapter. Quota-exceeded errors
  are logged to the console instead of crashing the React render tree — the
  user's in-memory state survives even if persistence fails.
- Rehydrate failures now remove the corrupt blob from `localStorage` before
  resetting to empty state, so the next reload doesn't re-fail on the same
  bytes.

### Infrastructure
- Project versioning bootstrapped at `0.0.2.0` (VERSION + `package.json` in
  sync). CHANGELOG starts here.

## [0.0.1] - 2026-04-19

Initial scaffold: Vite + React + TypeScript + Tailwind + Zustand + dnd-kit +
Vitest + Playwright. Placeholder UI renders the `Todos` heading. No feature
code yet.
