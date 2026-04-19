import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useMemo } from 'react'
import { useTodosStore } from '../store/todos'
import { EmptyState } from './EmptyState'
import { TodoItem } from './TodoItem'

export function TodoList() {
  // Subscribe to STABLE refs only. Derive the filtered list with useMemo —
  // passing a filtering selector directly to useTodosStore returns a new
  // array every render and causes an infinite loop via React 18's
  // useSyncExternalStore reference-equality check.
  const todos = useTodosStore((s) => s.todos)
  const filter = useTodosStore((s) => s.filter)
  const reorder = useTodosStore((s) => s.reorder)

  const visible = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.done)
    if (filter === 'done') return todos.filter((t) => t.done)
    return todos
  }, [todos, filter])
  const totalTodos = todos.length

  // Sensors: pointer for mouse/touch, keyboard for a11y.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    reorder(String(active.id), String(over.id))
  }

  if (visible.length === 0) {
    return <EmptyState totalTodos={totalTodos} filter={filter} />
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <SortableContext items={visible.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul
          role="list"
          aria-label="Todos"
          className="flex flex-col divide-y divide-border"
        >
          {visible.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
