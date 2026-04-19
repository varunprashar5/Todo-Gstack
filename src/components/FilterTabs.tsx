import type { Filter } from '../store/todos'
import { useTodosStore } from '../store/todos'

const TABS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
]

export function FilterTabs() {
  const filter = useTodosStore((s) => s.filter)
  const setFilter = useTodosStore((s) => s.setFilter)

  return (
    <nav role="tablist" aria-label="Filter todos" className="flex gap-1 border-b border-border">
      {TABS.map(({ value, label }) => {
        const active = filter === value
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setFilter(value)}
            className={[
              'px-3 py-2 text-sm transition-colors',
              'border-b-2 -mb-px',
              active
                ? 'border-accent text-fg'
                : 'border-transparent text-fg-muted hover:text-fg',
            ].join(' ')}
          >
            {label}
          </button>
        )
      })}
    </nav>
  )
}
