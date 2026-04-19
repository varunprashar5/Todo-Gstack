import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useTodosStore, type Todo } from '../store/todos'

type PendingDelete = {
  todo: Todo
  index: number // original position for restore
}

type UndoCtx = {
  deleteWithUndo: (todo: Todo) => void
}

const Ctx = createContext<UndoCtx | null>(null)

const TOAST_DURATION_MS = 3000

/**
 * Wraps the app. Owns the "pending delete" state and renders a bottom-centered
 * toast with an Undo button. After TOAST_DURATION_MS with no Undo, the delete
 * is permanent (already removed from the store — we just stop showing the toast).
 *
 * Restoring an undo re-inserts the todo at its ORIGINAL index so the list
 * doesn't visually jump.
 */
export function UndoToastProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingDelete | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const dismiss = useCallback(() => {
    clearTimer()
    setPending(null)
  }, [clearTimer])

  const deleteWithUndo = useCallback(
    (todo: Todo) => {
      const current = useTodosStore.getState().todos
      const index = current.findIndex((t) => t.id === todo.id)
      if (index === -1) return

      useTodosStore.getState().removeTodo(todo.id)
      setPending({ todo, index })

      clearTimer()
      timerRef.current = setTimeout(() => {
        setPending(null)
        timerRef.current = null
      }, TOAST_DURATION_MS)
    },
    [clearTimer],
  )

  const onUndo = useCallback(() => {
    if (!pending) return
    // Re-insert at the original index.
    useTodosStore.setState((state) => {
      const next = state.todos.slice()
      next.splice(pending.index, 0, pending.todo)
      return { todos: next }
    })
    dismiss()
  }, [pending, dismiss])

  // Esc dismisses the toast without undoing.
  useEffect(() => {
    if (!pending) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pending, dismiss])

  // Clean up on unmount.
  useEffect(() => clearTimer, [clearTimer])

  return (
    <Ctx.Provider value={{ deleteWithUndo }}>
      {children}
      {pending && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 rounded-control border border-border bg-bg px-4 py-2 text-sm shadow-md"
        >
          <span>Deleted.</span>
          <button
            type="button"
            onClick={onUndo}
            className="font-medium text-accent hover:underline"
          >
            Undo
          </button>
        </div>
      )}
    </Ctx.Provider>
  )
}

export function useUndoableDelete(): UndoCtx {
  const ctx = useContext(Ctx)
  if (!ctx) {
    throw new Error('useUndoableDelete must be used inside <UndoToastProvider>')
  }
  return ctx
}
