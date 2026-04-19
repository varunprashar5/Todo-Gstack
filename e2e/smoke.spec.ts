import { test, expect } from '@playwright/test'

test('app loads and renders the Todos heading', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /todos/i })).toBeVisible()
})
