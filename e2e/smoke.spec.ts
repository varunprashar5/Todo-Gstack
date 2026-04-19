import { test, expect } from '@playwright/test'

test.describe('todo main flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage once on first navigation so each test starts cold.
    // Using page.goto first, then clearing — NOT addInitScript, because that
    // would also run on page.reload() inside the persistence test and wipe state.
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('add → complete → filter → reload persists', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible()
    await expect(page.getByText('Nothing yet.')).toBeVisible()

    const input = page.getByLabel('New todo')
    await input.fill('buy milk')
    await input.press('Enter')
    await input.fill('ship PR')
    await input.press('Enter')
    await input.fill('go for a walk')
    await input.press('Enter')

    // All three render.
    await expect(page.getByTestId('todo-item')).toHaveCount(3)
    await expect(page.getByText('Nothing yet.')).toHaveCount(0)

    // Complete the second one.
    await page
      .getByRole('checkbox', { name: /mark ship PR as done/i })
      .check()

    // Filter: Active → 2 items.
    await page.getByRole('tab', { name: 'Active' }).click()
    await expect(page.getByTestId('todo-item')).toHaveCount(2)
    await expect(page.getByText('ship PR')).toHaveCount(0)

    // Filter: Done → 1 item.
    await page.getByRole('tab', { name: 'Done' }).click()
    await expect(page.getByTestId('todo-item')).toHaveCount(1)
    await expect(page.getByText('ship PR')).toBeVisible()

    // Reload — should persist.
    await page.reload()
    await page.getByRole('tab', { name: 'All' }).click()
    await expect(page.getByTestId('todo-item')).toHaveCount(3)
    await expect(page.getByText('buy milk')).toBeVisible()
    await expect(page.getByText('ship PR')).toBeVisible()
    await expect(page.getByText('go for a walk')).toBeVisible()
  })

  test('delete with undo toast restores the todo', async ({ page }) => {
    await page.goto('/')
    const input = page.getByLabel('New todo')
    await input.fill('to delete')
    await input.press('Enter')

    await expect(page.getByTestId('todo-item')).toHaveCount(1)

    // Hover to reveal the delete button, then click.
    const row = page.getByTestId('todo-item').first()
    await row.hover()
    await row.getByRole('button', { name: /delete to delete/i }).click()

    await expect(page.getByTestId('todo-item')).toHaveCount(0)
    await expect(page.getByText('Deleted.')).toBeVisible()

    await page.getByRole('button', { name: 'Undo' }).click()
    await expect(page.getByTestId('todo-item')).toHaveCount(1)
    await expect(page.getByText('to delete')).toBeVisible()
  })

  test('edit in place with double-click + Enter', async ({ page }) => {
    await page.goto('/')
    const input = page.getByLabel('New todo')
    await input.fill('old text')
    await input.press('Enter')

    await page.getByText('old text').dblclick()
    const edit = page.getByRole('textbox', { name: /edit old text/i })
    await edit.fill('new text')
    await edit.press('Enter')

    await expect(page.getByText('new text')).toBeVisible()
    await expect(page.getByText('old text')).toHaveCount(0)
  })

  test('empty submit is rejected (no ghost todo)', async ({ page }) => {
    await page.goto('/')
    const input = page.getByLabel('New todo')
    await input.press('Enter') // empty submit
    await expect(page.getByTestId('todo-item')).toHaveCount(0)
    await expect(input).toHaveAttribute('aria-invalid', 'true')

    await input.fill('   ') // whitespace
    await input.press('Enter')
    await expect(page.getByTestId('todo-item')).toHaveCount(0)
  })
})
