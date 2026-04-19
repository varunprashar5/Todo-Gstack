import { DndContext } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTodosStore, type Todo } from '../store/todos'
import { TodoItem } from './TodoItem'
import { UndoToastProvider } from './UndoToast'

const seed = (text: string, done = false): Todo => {
  useTodosStore.getState().addTodo(text)
  const todo = useTodosStore.getState().todos.at(-1)!
  if (done) useTodosStore.getState().toggleTodo(todo.id)
  return useTodosStore.getState().todos.find((t) => t.id === todo.id)!
}

function renderItem(todo: Todo) {
  return render(
    <UndoToastProvider>
      <DndContext>
        <SortableContext items={[todo.id]}>
          <ul>
            <TodoItem todo={todo} />
          </ul>
        </SortableContext>
      </DndContext>
    </UndoToastProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  useTodosStore.setState({ todos: [], filter: 'all' })
})

describe('<TodoItem>', () => {
  it('renders the todo text', () => {
    const todo = seed('buy milk')
    renderItem(todo)
    expect(screen.getByText('buy milk')).toBeInTheDocument()
  })

  it('toggles done when the checkbox is clicked', async () => {
    const todo = seed('task')
    const user = userEvent.setup()
    renderItem(todo)
    await user.click(screen.getByRole('checkbox'))
    expect(useTodosStore.getState().todos[0].done).toBe(true)
  })

  it('shows strikethrough styling when done', () => {
    const todo = seed('done one', true)
    renderItem(todo)
    const li = screen.getByTestId('todo-item')
    expect(li).toHaveAttribute('data-done', 'true')
  })

  it('enters edit mode on double-click and saves on Enter', async () => {
    const todo = seed('old text')
    const user = userEvent.setup()
    renderItem(todo)

    await user.dblClick(screen.getByText('old text'))
    const input = screen.getByRole('textbox', { name: /edit old text/i })
    await user.clear(input)
    await user.type(input, 'new text{Enter}')

    expect(useTodosStore.getState().todos[0].text).toBe('new text')
  })

  it('cancels edit on Escape (no mutation)', async () => {
    const todo = seed('unchanged')
    const user = userEvent.setup()
    renderItem(todo)

    await user.dblClick(screen.getByText('unchanged'))
    const input = screen.getByRole('textbox', { name: /edit unchanged/i })
    await user.clear(input)
    await user.type(input, 'should not save{Escape}')

    expect(useTodosStore.getState().todos[0].text).toBe('unchanged')
  })

  it('deletes (with undo toast) when the delete button is clicked', async () => {
    const todo = seed('delete-me')
    const user = userEvent.setup()
    renderItem(todo)

    await user.click(screen.getByRole('button', { name: /delete delete-me/i }))
    expect(useTodosStore.getState().todos).toHaveLength(0)
    expect(screen.getByText('Deleted.')).toBeInTheDocument()
  })

  it('deletes the todo when edit text is cleared (TodoMVC convention)', async () => {
    const todo = seed('via-edit-clear')
    const user = userEvent.setup()
    renderItem(todo)

    await user.dblClick(screen.getByText('via-edit-clear'))
    const input = screen.getByRole('textbox', { name: /edit via-edit-clear/i })
    await user.clear(input)
    await user.keyboard('{Enter}')

    expect(useTodosStore.getState().todos).toHaveLength(0)
  })
})
