import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTodosStore } from '../store/todos'
import { FilterTabs } from './FilterTabs'

beforeEach(() => {
  localStorage.clear()
  useTodosStore.setState({ todos: [], filter: 'all' })
})

describe('<FilterTabs>', () => {
  it('renders All / Active / Done', () => {
    render(<FilterTabs />)
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Active' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Done' })).toBeInTheDocument()
  })

  it('marks the current filter as selected', () => {
    useTodosStore.setState({ filter: 'active' })
    render(<FilterTabs />)
    expect(screen.getByRole('tab', { name: 'Active' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'false')
  })

  it('updates the store when a tab is clicked', async () => {
    const user = userEvent.setup()
    render(<FilterTabs />)
    await user.click(screen.getByRole('tab', { name: 'Done' }))
    expect(useTodosStore.getState().filter).toBe('done')
  })
})
