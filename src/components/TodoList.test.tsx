import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTodosStore } from '../store/todos'
import { TodoList } from './TodoList'
import { UndoToastProvider } from './UndoToast'

function renderList() {
  return render(
    <UndoToastProvider>
      <TodoList />
    </UndoToastProvider>,
  )
}

beforeEach(() => {
  localStorage.clear()
  useTodosStore.setState({ todos: [], filter: 'all' })
})

describe('<TodoList>', () => {
  it('renders an empty state when there are zero todos', () => {
    renderList()
    expect(screen.getByText('Nothing yet.')).toBeInTheDocument()
  })

  it('renders every visible todo', () => {
    useTodosStore.getState().addTodo('a')
    useTodosStore.getState().addTodo('b')
    useTodosStore.getState().addTodo('c')
    renderList()
    expect(screen.getAllByTestId('todo-item')).toHaveLength(3)
  })

  it('filters to active todos when filter=active', () => {
    useTodosStore.getState().addTodo('active')
    useTodosStore.getState().addTodo('done')
    const [, doneTodo] = useTodosStore.getState().todos
    useTodosStore.getState().toggleTodo(doneTodo.id)
    useTodosStore.getState().setFilter('active')

    renderList()
    expect(screen.getAllByTestId('todo-item')).toHaveLength(1)
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.queryByText('done')).not.toBeInTheDocument()
  })

  it('shows the "all-done" empty state when filter=active matches nothing', () => {
    useTodosStore.getState().addTodo('all complete')
    useTodosStore.getState().toggleTodo(useTodosStore.getState().todos[0].id)
    useTodosStore.getState().setFilter('active')

    renderList()
    expect(screen.getByText("You're all caught up.")).toBeInTheDocument()
  })

  it('shows the "none-done" empty state when filter=done matches nothing', () => {
    useTodosStore.getState().addTodo('nothing done')
    useTodosStore.getState().setFilter('done')

    renderList()
    expect(screen.getByText('Nothing done yet.')).toBeInTheDocument()
  })
})
