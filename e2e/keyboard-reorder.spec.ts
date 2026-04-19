import { test, expect } from '@playwright/test'

test.describe('keyboard-accessible reorder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('Tab to drag handle, Space to pick up, Arrow to move, Space to drop', async ({
    page,
  }) => {
    await page.goto('/')
    const input = page.getByLabel('New todo')
    await input.fill('alpha')
    await input.press('Enter')
    await input.fill('beta')
    await input.press('Enter')
    await input.fill('gamma')
    await input.press('Enter')

    // Sanity: order is alpha, beta, gamma
    const textsBefore = await page.getByTestId('todo-item').allInnerTexts()
    expect(textsBefore[0]).toContain('alpha')
    expect(textsBefore[1]).toContain('beta')
    expect(textsBefore[2]).toContain('gamma')

    // Focus the drag handle on "alpha" and move it down past "beta" using
    // dnd-kit's keyboard sensor: Space to lift, Arrow to move, Space to drop.
    // dnd-kit publishes role="button" via `attributes` on the draggable,
    // which lands on the span we rendered in TodoItem.
    const firstHandle = page.getByRole('button', { name: 'Drag alpha' })
    await firstHandle.focus()
    await firstHandle.press('Space') // pick up
    await page.waitForTimeout(50)
    await firstHandle.press('ArrowDown')
    await page.waitForTimeout(50)
    await firstHandle.press('Space') // drop
    await page.waitForTimeout(200)

    const textsAfter = await page.getByTestId('todo-item').allInnerTexts()
    expect(textsAfter[0]).toContain('beta')
    expect(textsAfter[1]).toContain('alpha')
    expect(textsAfter[2]).toContain('gamma')

    // Reload persists the new order.
    await page.reload()
    const textsPersisted = await page.getByTestId('todo-item').allInnerTexts()
    expect(textsPersisted[0]).toContain('beta')
    expect(textsPersisted[1]).toContain('alpha')
    expect(textsPersisted[2]).toContain('gamma')
  })
})
