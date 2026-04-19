import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTodosStore } from '../store/todos'
import { TodoInput } from './TodoInput'

beforeEach(() => {
  localStorage.clear()
  useTodosStore.setState({ todos: [], filter: 'all' })
})

describe('<TodoInput>', () => {
  it('adds a todo when Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)
    await user.type(screen.getByLabelText('New todo'), 'buy milk{Enter}')
    expect(useTodosStore.getState().todos).toHaveLength(1)
    expect(useTodosStore.getState().todos[0].text).toBe('buy milk')
  })

  it('adds a todo when the Add button is clicked', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)
    await user.type(screen.getByLabelText('New todo'), 'ship PR')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(useTodosStore.getState().todos[0].text).toBe('ship PR')
  })

  it('clears the input after a successful add', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)
    const input = screen.getByLabelText('New todo') as HTMLInputElement
    await user.type(input, 'a{Enter}')
    expect(input.value).toBe('')
  })

  it('does not add when input is empty', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(useTodosStore.getState().todos).toHaveLength(0)
  })

  it('does not add when input is whitespace only and marks aria-invalid', async () => {
    const user = userEvent.setup()
    render(<TodoInput />)
    const input = screen.getByLabelText('New todo')
    await user.type(input, '   {Enter}')
    expect(useTodosStore.getState().todos).toHaveLength(0)
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })
})
