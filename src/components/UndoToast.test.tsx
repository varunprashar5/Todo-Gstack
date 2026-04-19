import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTodosStore } from '../store/todos'
import { UndoToastProvider, useUndoableDelete } from './UndoToast'

function Harness() {
  const { deleteWithUndo } = useUndoableDelete()
  const todos = useTodosStore((s) => s.todos)
  return (
    <div>
      <ul>
        {todos.map((t) => (
          <li key={t.id}>
            <span>{t.text}</span>
            <button onClick={() => deleteWithUndo(t)}>del {t.text}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
  useTodosStore.setState({ todos: [], filter: 'all' })
})

describe('<UndoToast>', () => {
  // Real timers here — userEvent + fake timers is notoriously flaky in
  // jsdom. We only fake timers for the auto-dismiss test below.
  it('removes the todo immediately and shows an undo toast', async () => {
    useTodosStore.getState().addTodo('keep')
    useTodosStore.getState().addTodo('delete-me')

    const user = userEvent.setup()
    render(
      <UndoToastProvider>
        <Harness />
      </UndoToastProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'del delete-me' }))

    expect(useTodosStore.getState().todos.map((t) => t.text)).toEqual(['keep'])
    expect(screen.getByText('Deleted.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
  })

  it('restores the todo at its original position when Undo is clicked', async () => {
    useTodosStore.getState().addTodo('first')
    useTodosStore.getState().addTodo('middle')
    useTodosStore.getState().addTodo('last')

    const user = userEvent.setup()
    render(
      <UndoToastProvider>
        <Harness />
      </UndoToastProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'del middle' }))
    expect(useTodosStore.getState().todos.map((t) => t.text)).toEqual(['first', 'last'])

    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(useTodosStore.getState().todos.map((t) => t.text)).toEqual([
      'first',
      'middle',
      'last',
    ])
    expect(screen.queryByText('Deleted.')).not.toBeInTheDocument()
  })

  it('auto-dismisses the toast after 3 seconds (delete stays permanent)', () => {
    // Fake timers ONLY for this test. Using fireEvent (sync) instead of
    // userEvent — userEvent's internal async nature fights fake timers in
    // ways that are not worth debugging for one assertion.
    vi.useFakeTimers()
    try {
      useTodosStore.getState().addTodo('gone')

      render(
        <UndoToastProvider>
          <Harness />
        </UndoToastProvider>,
      )

      fireEvent.click(screen.getByRole('button', { name: 'del gone' }))
      expect(screen.getByText('Deleted.')).toBeInTheDocument()

      act(() => {
        vi.advanceTimersByTime(3000)
      })

      expect(screen.queryByText('Deleted.')).not.toBeInTheDocument()
      expect(useTodosStore.getState().todos).toHaveLength(0)
    } finally {
      vi.useRealTimers()
    }
  })
})
