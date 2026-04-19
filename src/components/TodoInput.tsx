import { useRef, useState, type FormEvent } from 'react'
import { useTodosStore } from '../store/todos'

export function TodoInput({ autoFocus = false }: { autoFocus?: boolean }) {
  const [text, setText] = useState('')
  const [shake, setShake] = useState(false)
  const addTodo = useTodosStore((s) => s.addTodo)
  const inputRef = useRef<HTMLInputElement>(null)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const before = useTodosStore.getState().todos.length
    addTodo(text)
    const after = useTodosStore.getState().todos.length

    if (after === before) {
      // Rejected (empty / whitespace / zero-width only). Shake to signal.
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }
    setText('')
    // Stream: refocus so the next entry is one keystroke away.
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <label htmlFor="todo-input" className="sr-only">
        New todo
      </label>
      <div
        className={[
          'flex items-center gap-2 rounded-control border border-border px-3 py-2',
          'focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20',
          shake ? 'animate-[shake_0.4s]' : '',
        ].join(' ')}
      >
        <input
          id="todo-input"
          ref={inputRef}
          type="text"
          autoFocus={autoFocus}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Something to do…"
          className="flex-1 bg-transparent text-fg placeholder:text-fg-subtle focus:outline-none"
          aria-invalid={shake}
        />
        <button
          type="submit"
          className="rounded-control px-3 py-1 text-sm font-medium text-accent hover:bg-surface-hover"
        >
          Add
        </button>
      </div>
    </form>
  )
}
