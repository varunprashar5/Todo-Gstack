import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { useTodosStore } from './store/todos'

beforeEach(() => {
  localStorage.clear()
  useTodosStore.setState({ todos: [], filter: 'all' })
})

describe('<App>', () => {
  it('renders the Todos heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /todos/i })).toBeInTheDocument()
  })

  it('renders the cold-start empty state on first load', () => {
    render(<App />)
    expect(screen.getByText('Nothing yet.')).toBeInTheDocument()
  })

  it('end-to-end: add → filter → the new todo shows in the list', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('New todo'), 'first todo{Enter}')

    expect(screen.getByText('first todo')).toBeInTheDocument()
    // Cold-start empty state should be gone now.
    expect(screen.queryByText('Nothing yet.')).not.toBeInTheDocument()
  })
})
