# TODOs

Items deferred from the initial plan. See design doc at
`~/.gstack/projects/Todo-Gstack/apple-main-design-20260419-160355.md` for v1 scope.

## P2

### Deploy as a static site (exercise /setup-deploy + /land-and-deploy)
- **What:** Pick a static host (Vercel / Netlify / GitHub Pages). Configure `/setup-deploy`.
  Ship via `/land-and-deploy`. Add `/canary` post-deploy checks.
- **Why:** Completes the gstack learning loop. The entire reason this project exists is
  to practice the full gstack workflow end-to-end. Local-only v1 skips the deploy skills.
- **Pros:** Exercises the deploy half of the gstack toolbox. Real URL you can share.
- **Cons:** Takes the project slightly out of "local-only for fun" territory.
- **Context:** Vite static build drops cleanly onto any static host. No backend to provision.
  Zero runtime cost on free tiers. No secrets to configure.
- **Depends on:** v1 shipped and stable.

## P2

### Multi-tab sync via `storage` event
- **What:** Listen for `window.storage` events and call
  `useTodosStore.persist.rehydrate()` when `todo-gstack-v1` changes.
- **Why:** Open app in two tabs → Tab A adds a todo → Tab B is stale → Tab B writes
  next and clobbers A's add. Classic last-write-wins bug.
- **Pros:** ~10 lines. Fixes a real data-loss scenario.
- **Cons:** Can surprise the user with unexpected UI updates if they're mid-edit.
  Consider deferring rehydrate if `document.hasFocus()` is false on the stale tab.
- **Context:** Surfaced in adversarial review. `zustand/middleware` supports cross-tab
  sync natively — see `createJSONStorage` + subscribe pattern.
- **Depends on:** v1 shipped.

## P3

### Runtime schema validation in `migrate`
- **What:** Validate `persistedState` shape (zod or hand-rolled) before casting.
  Reject bad shapes and fall back to empty state.
- **Why:** Current `persistedState as TodosState` cast trusts localStorage. A user
  with `{ state: { todos: "not-an-array" } }` (hand-edited or corrupted) will see
  every action throw on `.findIndex`.
- **Pros:** Hard guarantee on rehydrated state shape.
- **Cons:** Adds a dep (zod) or ~30 lines of hand-rolled validation. Premature if
  only v1 exists.
- **Context:** Do this when the v2 schema lands — the migration function becomes
  load-bearing then.
- **Depends on:** v2 schema change.

### Persisted filter UX
- **What:** Decide whether the last-selected filter should persist across sessions
  or reset to `all` on load. If persisting, surface the active filter visibly so
  a user returning to an empty "Done" view doesn't panic.
- **Why:** Close tab with filter="done" + nothing done → reopen → "my todos are gone."
  Rage-quit risk.
- **Pros:** Trust-preserving UX detail.
- **Cons:** Bike-shed risk. Could go either way.
- **Context:** Revisit during /design-review on the live app.
- **Depends on:** UI shipped.

### Drop `@dnd-kit/sortable` dep from the store
- **What:** Inline the 3-line `arrayMove` helper into `src/store/todos.ts` instead
  of importing from `@dnd-kit/sortable`.
- **Why:** The store has no other reason to depend on a UI library. Any dnd-kit
  version bump could alter reorder semantics silently. Also bundles dnd-kit into
  non-DnD consumers of the store.
- **Pros:** Cleaner separation of concerns.
- **Cons:** Trivial duplication.
- **Context:** The function is ~3 lines of code. Just copy it.
- **Depends on:** v1 shipped.

### Memoize list selectors
- **What:** Use `useShallow` from `zustand/shallow` for `selectVisibleTodos`, or
  wrap in `useMemo` in consuming components.
- **Why:** `selectVisibleTodos` returns a new array on every store update (even
  when the filter result didn't change). Causes unnecessary re-renders of the
  consuming component.
- **Pros:** Perf win at ~100+ todos.
- **Cons:** Premature under 100 todos.
- **Context:** Measure first (React DevTools profiler) before optimizing.
- **Depends on:** UI shipped + noticeable perf issue.

### Manual dark-mode toggle
- **What:** Sun/moon icon button in the top-right. Overrides `prefers-color-scheme`.
  Persists choice in localStorage.
- **Why:** Some people want dark mode on a light-mode system, or vice versa.
  `prefers-color-scheme` covers the default but not the override case.
- **Pros:** Small effort, clear user value. A classic polish detail.
- **Cons:** Another piece of persisted state. Must match system until the user overrides.
- **Context:** Add a `useTheme()` hook that reads system pref, checks localStorage override,
  and applies `data-theme` on `<html>`. CSS vars already support both modes — the toggle
  just flips the data attribute.
- **Depends on:** v1 shipped.

### Empty-state SVG illustrations
- **What:** One thin-line SVG per empty state (64x64, accent-color stroke, no fill).
  Three illustrations: cold-start ("nothing yet"), all-caught-up, nothing-done-yet.
- **Why:** Typography-only is honest for v1 but SVGs add warmth without slop, if the
  line quality is good. Revisit after /design-review on the live app — judge whether
  the typography-only states feel too sparse in practice.
- **Pros:** More memorable screens. Small perf cost (inline SVG).
- **Cons:** Easy to land on generic stock-looking line art. Needs a real visual eye.
- **Context:** Empty states live in `src/components/EmptyState.tsx`. Extend the variant
  prop to optionally render an SVG above the headline. Look at Things 3's empty states
  for the aesthetic bar.
- **Depends on:** v1 shipped + /design-review run on the live app.

### Keyboard-first shortcuts (the second delight)
- **What:** Global shortcuts per the design doc's `lib/keymap.ts` stub:
  `n` = new, `j/k` = navigate, `x` = toggle complete, `d` = delete, `/` = focus search.
- **Why:** Was the runner-up delight feature in the office-hours session. Drag-to-reorder
  got picked as primary. This is small effort post-v1 and makes the app feel real.
- **Pros:** Power-user feel. Small surface area.
- **Cons:** Needs a `useHotkeys` hook and an a11y review (don't hijack shortcuts from
  screen readers). Don't stomp on native browser shortcuts.
- **Context:** Put hooks under `src/lib/keymap.ts`. One `useHotkeys` hook wired in
  `TodoApp.tsx`. Skip `/` for search if search isn't implemented.
- **Depends on:** v1 shipped.
