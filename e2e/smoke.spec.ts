import { expect, test } from '@playwright/test'

test('install screen, tabs, collapsing title, manifest and precache', async ({ page, request }) => {
  await page.goto('')
  await expect(page.getByRole('heading', { name: 'Install Tessera' })).toBeVisible()
  await page.getByRole('button', { name: 'Continue in browser' }).click()

  const tabs = page.getByRole('navigation', { name: 'Main' })
  await expect(tabs.getByRole('link')).toHaveText(['Today', 'Habits', 'Tasks', 'Goals', 'You'])
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible()
  await tabs.getByRole('link', { name: 'Habits' }).click()
  await expect(page.getByRole('heading', { name: 'Habits' })).toBeVisible()
  expect(page.url()).toContain('#/habits')

  // The compact bar fades in once the large title scrolls away.
  const compact = page.locator('div[aria-hidden="true"].fixed')
  await expect(compact).toHaveCSS('opacity', '0')
  await page.evaluate(() => {
    document.querySelector('main')!.append(Object.assign(document.createElement('div'), { style: 'height:2000px' }))
    document.querySelector('main')!.parentElement!.scrollTo(0, 400)
  })
  await expect(compact).toHaveCSS('opacity', '1')

  const manifest = await (await request.get('manifest.webmanifest')).json()
  expect(manifest).toMatchObject({ start_url: '/Tessera/', scope: '/Tessera/', display: 'standalone', background_color: '#000000' })

  // Playwright's offline mode breaks service workers in WebKit, so check the precache itself.
  // A true offline reload is on the iPhone checklist.
  const precached = await page.evaluate(async () => {
    await navigator.serviceWorker.ready
    const cache = await caches.open((await caches.keys())[0])
    return (await cache.keys()).map((r) => new URL(r.url).pathname)
  })
  expect(precached).toEqual(expect.arrayContaining(['/Tessera/index.html', '/Tessera/mark.svg']))
  expect(precached.some((p) => p.endsWith('.woff2'))).toBe(true)
})
