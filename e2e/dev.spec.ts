import { expect, test } from '@playwright/test'

test('components page: tiles, undo, sheets, long-press, reduced motion, themes', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('#/dev')
  await expect(page.getByRole('heading', { name: 'Components' })).toBeVisible()

  // Tap today's tile: it lights, a toast offers Undo, Undo puts it back.
  const todayTile = page.locator('button[aria-label$="not done"]:not([disabled])').last()
  const name = (await todayTile.getAttribute('aria-label'))!
  await todayTile.click()
  await expect(page.getByRole('button', { name: name.replace('not done', 'done') })).toBeVisible()
  await expect(page.getByRole('status')).toContainText('Habit checked')
  await page.getByRole('status').getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByRole('button', { name })).toBeVisible()

  // Long-press opens the action sheet and does not toggle the tile.
  const box = (await todayTile.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(600)
  await page.mouse.up()
  await expect(page.getByRole('dialog', { name: 'Morning workout' })).toBeVisible()
  await expect(page.getByRole('button', { name })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)

  // Sheet: Escape and drag-down both dismiss.
  await page.getByRole('button', { name: 'Open sheet' }).click()
  await expect(page.getByRole('dialog', { name: 'Name your habit' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: 'Open sheet' }).click()
  await page.waitForTimeout(700) // let the sheet finish rising before measuring
  const handle = (await page.getByTestId('sheet-handle').boundingBox())!
  await page.mouse.move(handle.x + handle.width / 2, handle.y + 10)
  await page.mouse.down()
  for (let i = 1; i <= 12; i++) await page.mouse.move(handle.x + handle.width / 2, handle.y + 10 + i * 40)
  await page.mouse.up()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  // Stepper and odometer.
  await page.getByRole('button', { name: 'Increase' }).click()
  await expect(page.getByRole('img', { name: '25', exact: true }).first()).toBeVisible()

  // Year grid draws about a year of tiles.
  const cells = await page.locator('svg[aria-label^="Morning workout, last"] rect').count()
  expect(cells).toBeGreaterThanOrEqual(365)
  expect(cells).toBeLessThanOrEqual(371)

  // Reduced motion swaps the year grid entrance for a fade.
  await page.getByRole('radio', { name: 'Reduce motion' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-reduced-motion', 'always')
  expect(await page.locator('.yg-cell').first().evaluate((el) => getComputedStyle(el).animationName)).toBe('yg-fade')

  // Forced themes change the board color.
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  await page.getByRole('radio', { name: 'Dark', exact: true }).click()
  expect(await bg()).toBe('rgb(0, 0, 0)')
  await page.getByRole('radio', { name: 'Light', exact: true }).click()
  expect(await bg()).toBe('rgb(243, 244, 246)')

  expect(errors).toEqual([])
})
