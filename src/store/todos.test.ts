import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  useTodosStore,
  selectTodos,
  selectVisibleTodos,
  selectFilter,
  type TodosState,
} from './todos'

const reset = () => {
  localStorage.clear()
  useTodosStore.setState({ todos: [], filter: 'all' }, false)
}

const state = (): TodosState => useTodosStore.getState()

beforeEach(() => {
  reset()
})

describe('addTodo', () => {
  it('appends a new todo with trimmed text', () => {
    state().addTodo('  buy milk  ')
    expect(state().todos).toHaveLength(1)
    expect(state().todos[0]).toMatchObject({ text: 'buy milk', done: false })
    expect(state().todos[0].id).toBeTruthy()
  })

  it('rejects empty string', () => {
    state().addTodo('')
    expect(state().todos).toHaveLength(0)
  })

  it('rejects whitespace-only input', () => {
    state().addTodo('   \t\n  ')
    expect(state().todos).toHaveLength(0)
  })

  it('rejects zero-width / BOM-only input (ghost todo protection)', () => {
    // U+200B ZWSP, U+200C ZWNJ, U+200D ZWJ, U+FEFF BOM
    state().addTodo('\u200B\u200C\u200D\uFEFF')
    state().addTodo('  \u200B  ')
    expect(state().todos).toHaveLength(0)
  })

  it('strips zero-width chars from valid text', () => {
    state().addTodo('hello\u200Bworld')
    expect(state().todos[0].text).toBe('helloworld')
  })

  it('preserves insertion order', () => {
    state().addTodo('first')
    state().addTodo('second')
    state().addTodo('third')
    expect(state().todos.map((t) => t.text)).toEqual(['first', 'second', 'third'])
  })

  it('generates unique ids', () => {
    state().addTodo('a')
    state().addTodo('b')
    const [a, b] = state().todos
    expect(a.id).not.toBe(b.id)
  })
})

describe('toggleTodo', () => {
  it('toggles the done flag', () => {
    state().addTodo('task')
    const id = state().todos[0].id
    state().toggleTodo(id)
    expect(state().todos[0].done).toBe(true)
    state().toggleTodo(id)
    expect(state().todos[0].done).toBe(false)
  })

  it('no-ops on unknown id', () => {
    state().addTodo('task')
    const before = state().todos
    state().toggleTodo('does-not-exist')
    expect(state().todos).toEqual(before)
  })

  it('preserves order when toggling', () => {
    state().addTodo('a')
    state().addTodo('b')
    state().addTodo('c')
    const ids = state().todos.map((t) => t.id)
    state().toggleTodo(ids[1])
    expect(state().todos.map((t) => t.id)).toEqual(ids)
  })
})

describe('editTodo', () => {
  it('updates text with trim', () => {
    state().addTodo('old')
    const id = state().todos[0].id
    state().editTodo(id, '  new text  ')
    expect(state().todos[0].text).toBe('new text')
  })

  it('deletes the todo when edited to empty string', () => {
    state().addTodo('to-delete')
    const id = state().todos[0].id
    state().editTodo(id, '')
    expect(state().todos).toHaveLength(0)
  })

  it('deletes the todo when edited to whitespace only', () => {
    state().addTodo('to-delete')
    const id = state().todos[0].id
    state().editTodo(id, '   \t')
    expect(state().todos).toHaveLength(0)
  })

  it('no-ops on unknown id', () => {
    state().addTodo('keep')
    const before = state().todos
    state().editTodo('unknown', 'new text')
    expect(state().todos).toEqual(before)
  })

  it('preserves done flag when editing text', () => {
    state().addTodo('task')
    const id = state().todos[0].id
    state().toggleTodo(id)
    state().editTodo(id, 'renamed')
    expect(state().todos[0]).toMatchObject({ text: 'renamed', done: true })
  })
})

describe('removeTodo', () => {
  it('removes the matching todo', () => {
    state().addTodo('a')
    state().addTodo('b')
    const [, b] = state().todos
    state().removeTodo(b.id)
    expect(state().todos).toHaveLength(1)
    expect(state().todos[0].text).toBe('a')
  })

  it('no-ops on unknown id', () => {
    state().addTodo('a')
    const before = state().todos
    state().removeTodo('unknown')
    expect(state().todos).toEqual(before)
  })
})

describe('reorder', () => {
  it('moves an item to a new position', () => {
    state().addTodo('a')
    state().addTodo('b')
    state().addTodo('c')
    const [a, _b, c] = state().todos
    state().reorder(a.id, c.id)
    expect(state().todos.map((t) => t.text)).toEqual(['b', 'c', 'a'])
  })

  it('no-ops when fromId equals toId', () => {
    state().addTodo('a')
    state().addTodo('b')
    const before = state().todos
    state().reorder(before[0].id, before[0].id)
    expect(state().todos).toEqual(before)
  })

  it('no-ops on unknown fromId', () => {
    state().addTodo('a')
    const before = state().todos
    state().reorder('unknown', before[0].id)
    expect(state().todos).toEqual(before)
  })

  it('no-ops on unknown toId', () => {
    state().addTodo('a')
    const before = state().todos
    state().reorder(before[0].id, 'unknown')
    expect(state().todos).toEqual(before)
  })
})

describe('selectors', () => {
  it('selectTodos returns the full todos array', () => {
    state().addTodo('a')
    state().addTodo('b')
    expect(selectTodos(state()).map((t) => t.text)).toEqual(['a', 'b'])
  })

  it('selectFilter returns the current filter', () => {
    state().setFilter('active')
    expect(selectFilter(state())).toBe('active')
  })
})

describe('setFilter / selectVisibleTodos', () => {
  const seed = () => {
    state().addTodo('active1')
    state().addTodo('done1')
    state().addTodo('active2')
    const [, d] = state().todos
    state().toggleTodo(d.id)
  }

  it('"all" returns every todo', () => {
    seed()
    state().setFilter('all')
    expect(selectVisibleTodos(state()).map((t) => t.text)).toEqual([
      'active1',
      'done1',
      'active2',
    ])
  })

  it('"active" returns only undone', () => {
    seed()
    state().setFilter('active')
    expect(selectVisibleTodos(state()).map((t) => t.text)).toEqual([
      'active1',
      'active2',
    ])
  })

  it('"done" returns only completed', () => {
    seed()
    state().setFilter('done')
    expect(selectVisibleTodos(state()).map((t) => t.text)).toEqual(['done1'])
  })

  it('setFilter updates filter state', () => {
    state().setFilter('active')
    expect(state().filter).toBe('active')
    state().setFilter('done')
    expect(state().filter).toBe('done')
    state().setFilter('all')
    expect(state().filter).toBe('all')
  })
})

describe('persist rehydrate error handling', () => {
  it('resets to empty state and warns when rehydrate fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    state().addTodo('existing')
    localStorage.setItem('todo-gstack-v1', '{not valid json')

    await useTodosStore.persist.rehydrate()

    expect(state().todos).toEqual([])
    expect(state().filter).toBe('all')
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })

  it('clears the corrupt blob so subsequent loads do not re-fail', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    localStorage.setItem('todo-gstack-v1', '{broken')

    await useTodosStore.persist.rehydrate()

    // After the reset re-persists, the key should contain a valid empty state —
    // critically, NOT the original broken string.
    const raw = localStorage.getItem('todo-gstack-v1')
    expect(raw).not.toBe('{broken')
    warnSpy.mockRestore()
  })
})

describe('persist quota handling', () => {
  it('swallows quota errors on write without crashing the caller', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const setItemSpy = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError')
      })

    // Should NOT throw — persist adapter must catch.
    expect(() => state().addTodo('one')).not.toThrow()
    expect(warnSpy).toHaveBeenCalled()

    setItemSpy.mockRestore()
    warnSpy.mockRestore()
  })
})

describe('persist to localStorage', () => {
  it('writes to localStorage under "todo-gstack-v1"', async () => {
    state().addTodo('persisted')
    // Zustand persist flushes synchronously on setState in our setup.
    const raw = localStorage.getItem('todo-gstack-v1')
    expect(raw).toBeTruthy()
    const parsed = JSON.parse(raw!)
    expect(parsed.state.todos[0].text).toBe('persisted')
    expect(parsed.version).toBe(1)
  })

  it('partializes filter alongside todos', () => {
    state().addTodo('x')
    state().setFilter('done')
    const parsed = JSON.parse(localStorage.getItem('todo-gstack-v1')!)
    expect(parsed.state.filter).toBe('done')
    expect(parsed.state.todos).toHaveLength(1)
  })
})
