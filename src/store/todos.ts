import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { arrayMove } from '@dnd-kit/sortable'

const STORAGE_KEY = 'todo-gstack-v1'

// Strip zero-width and BOM characters before trimming — `.trim()` alone leaves
// U+200B / U+200C / U+200D / U+FEFF intact, which lets pasted content from
// Slack/Notion sneak in as invisible "ghost" todos.
const cleanText = (s: string): string =>
  s.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()

export type Todo = {
  id: string
  text: string
  done: boolean
}

export type Filter = 'all' | 'active' | 'done'

export type TodosState = {
  todos: Todo[]
  filter: Filter
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
  editTodo: (id: string, text: string) => void
  removeTodo: (id: string) => void
  reorder: (fromId: string, toId: string) => void
  setFilter: (filter: Filter) => void
}

const newId = (): string => crypto.randomUUID()

export const useTodosStore = create<TodosState>()(
  persist(
    (set) => ({
      todos: [],
      filter: 'all',

      addTodo: (text) => {
        const trimmed = cleanText(text)
        if (trimmed === '') return
        set((state) => ({
          todos: [...state.todos, { id: newId(), text: trimmed, done: false }],
        }))
      },

      toggleTodo: (id) => {
        set((state) => {
          const idx = state.todos.findIndex((t) => t.id === id)
          if (idx === -1) return state
          const next = state.todos.slice()
          next[idx] = { ...next[idx], done: !next[idx].done }
          return { todos: next }
        })
      },

      // Empty / whitespace / zero-width-only edits DELETE the todo
      // (TodoMVC convention — also matches intent when users clear the field).
      editTodo: (id, text) => {
        const trimmed = cleanText(text)
        set((state) => {
          const idx = state.todos.findIndex((t) => t.id === id)
          if (idx === -1) return state
          if (trimmed === '') {
            return { todos: state.todos.filter((t) => t.id !== id) }
          }
          const next = state.todos.slice()
          next[idx] = { ...next[idx], text: trimmed }
          return { todos: next }
        })
      },

      removeTodo: (id) => {
        set((state) => {
          if (!state.todos.some((t) => t.id === id)) return state
          return { todos: state.todos.filter((t) => t.id !== id) }
        })
      },

      reorder: (fromId, toId) => {
        if (fromId === toId) return
        set((state) => {
          const from = state.todos.findIndex((t) => t.id === fromId)
          const to = state.todos.findIndex((t) => t.id === toId)
          if (from === -1 || to === -1) return state
          return { todos: arrayMove(state.todos, from, to) }
        })
      },

      setFilter: (filter) => set({ filter }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      // Wrap localStorage so quota-exceeded errors on write don't bubble into a
      // React render and crash the app. Reads fall through unchanged.
      storage: createJSONStorage(() => ({
        getItem: (name) => localStorage.getItem(name),
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, value)
          } catch (err) {
            console.warn('[todos] localStorage write failed (quota or access):', err)
          }
        },
        removeItem: (name) => localStorage.removeItem(name),
      })),
      migrate: (persistedState, _version) => {
        // v1 is the first version. When schema changes, branch on _version here.
        return persistedState as TodosState
      },
      partialize: (state) => ({ todos: state.todos, filter: state.filter }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.warn('[todos] failed to rehydrate from localStorage, resetting:', error)
          // Clear the corrupt blob so subsequent loads don't re-fail on the same bytes.
          localStorage.removeItem(STORAGE_KEY)
          useTodosStore.setState({ todos: [], filter: 'all' })
        }
      },
    },
  ),
)

export const selectTodos = (s: TodosState): Todo[] => s.todos

/**
 * Pure helper for filtering todos by the current filter. Safe to call in tests
 * or inside `useMemo`, but do NOT pass directly to `useTodosStore(...)` — it
 * returns a new `.filter()` array when filter !== 'all', which would trigger
 * an infinite re-render loop under React 18's useSyncExternalStore (reference
 * equality). Subscribe to `todos` and `filter` separately, then derive.
 */
export const selectVisibleTodos = (s: TodosState): Todo[] => {
  if (s.filter === 'active') return s.todos.filter((t) => !t.done)
  if (s.filter === 'done') return s.todos.filter((t) => t.done)
  return s.todos
}

export const selectFilter = (s: TodosState): Filter => s.filter
