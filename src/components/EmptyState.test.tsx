import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState, resolveVariant } from './EmptyState'

describe('resolveVariant', () => {
  it("picks 'cold-start' when there are zero todos total", () => {
    expect(resolveVariant(0, 'all')).toBe('cold-start')
    expect(resolveVariant(0, 'active')).toBe('cold-start')
    expect(resolveVariant(0, 'done')).toBe('cold-start')
  })

  it("picks 'none-done' when filter is done and nothing is done yet", () => {
    expect(resolveVariant(3, 'done')).toBe('none-done')
  })

  it("picks 'all-done' when filter is active and everything is done", () => {
    expect(resolveVariant(3, 'active')).toBe('all-done')
  })
})

describe('<EmptyState>', () => {
  it('renders cold-start copy for an empty list', () => {
    render(<EmptyState totalTodos={0} filter="all" />)
    expect(screen.getByText('Nothing yet.')).toBeInTheDocument()
    expect(screen.getByText('What do you want to do?')).toBeInTheDocument()
  })

  it('renders all-done copy for active filter with no active todos', () => {
    render(<EmptyState totalTodos={2} filter="active" />)
    expect(screen.getByText("You're all caught up.")).toBeInTheDocument()
  })

  it('renders none-done copy for done filter with nothing done', () => {
    render(<EmptyState totalTodos={2} filter="done" />)
    expect(screen.getByText('Nothing done yet.')).toBeInTheDocument()
  })

  it('has role="status" for screen readers', () => {
    render(<EmptyState totalTodos={0} filter="all" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
