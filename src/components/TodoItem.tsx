import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { useTodosStore, type Todo } from '../store/todos'
import { useUndoableDelete } from './UndoToast'

export function TodoItem({ todo }: { todo: Todo }) {
  const toggle = useTodosStore((s) => s.toggleTodo)
  const edit = useTodosStore((s) => s.editTodo)
  const { deleteWithUndo } = useUndoableDelete()

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  }

  const startEdit = () => {
    setDraft(todo.text)
    setEditing(true)
  }
  const commitEdit = () => {
    edit(todo.id, draft) // empty → delete, trimmed → update (store handles both)
    setEditing(false)
  }
  const cancelEdit = () => {
    setDraft(todo.text)
    setEditing(false)
  }

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const onEditKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={[
        'group flex items-center gap-3 rounded-row px-3 py-2',
        'hover:bg-surface-hover',
        isDragging ? 'shadow-md scale-[1.02]' : '',
      ].join(' ')}
      data-testid="todo-item"
      data-done={todo.done}
    >
      {/* Drag handle. dnd-kit's `attributes` provides role + tabindex +
          aria-roledescription. Avoid <button> here — native button Space-click
          semantics eat dnd-kit's keyboard pickup. A <span> is correct. */}
      <span
        aria-label={`Drag ${todo.text}`}
        className="cursor-grab touch-none select-none text-fg-subtle opacity-50 group-hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </span>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => toggle(todo.id)}
        aria-label={`Mark ${todo.text} as ${todo.done ? 'not done' : 'done'}`}
        className="h-4 w-4 accent-accent"
      />

      {/* Text / edit input */}
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={onEditKey}
          className="flex-1 bg-transparent text-fg focus:outline-none"
          aria-label={`Edit ${todo.text}`}
        />
      ) : (
        <span
          onDoubleClick={startEdit}
          className={[
            'flex-1 text-[15px]',
            todo.done ? 'text-fg-muted line-through' : 'text-fg',
          ].join(' ')}
        >
          {todo.text}
        </span>
      )}

      {/* Delete */}
      <button
        type="button"
        onClick={() => deleteWithUndo(todo)}
        aria-label={`Delete ${todo.text}`}
        className="text-fg-subtle opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-danger transition-opacity"
      >
        ✕
      </button>
    </li>
  )
}
