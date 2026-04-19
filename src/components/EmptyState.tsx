import type { Filter } from '../store/todos'

type Variant = 'cold-start' | 'all-done' | 'none-done'

const COPY: Record<Variant, { headline: string; sub: string }> = {
  'cold-start': {
    headline: 'Nothing yet.',
    sub: 'What do you want to do?',
  },
  'all-done': {
    headline: "You're all caught up.",
    sub: 'Nice.',
  },
  'none-done': {
    headline: 'Nothing done yet.',
    sub: "Check something off and it'll show up here.",
  },
}

/**
 * Typography-only empty state (no SVG illustrations — per design doc).
 *
 * Variant is derived from (todoCount, filter):
 *  - 0 todos at all      → 'cold-start'
 *  - 0 matches, filter=done    → 'none-done'
 *  - 0 matches, filter=active  → 'all-done'
 */
export function resolveVariant(totalTodos: number, filter: Filter): Variant {
  if (totalTodos === 0) return 'cold-start'
  if (filter === 'done') return 'none-done'
  return 'all-done'
}

export function EmptyState({
  totalTodos,
  filter,
}: {
  totalTodos: number
  filter: Filter
}) {
  const variant = resolveVariant(totalTodos, filter)
  const { headline, sub } = COPY[variant]

  return (
    <div
      role="status"
      className="py-16 text-center"
      data-variant={variant}
    >
      <p className="text-lg font-medium text-fg">{headline}</p>
      <p className="mt-1 text-sm text-fg-muted">{sub}</p>
    </div>
  )
}
