import { test } from '@playwright/test'

// Anti-slop review screenshots: npm run shots, then look in screenshots/.
test.skip(!process.env.SHOTS, 'run with npm run shots')

const sizes = { '393x852': { width: 393, height: 852 }, '440x956': { width: 440, height: 956 } }
const screens = ['today', 'habits', 'tasks', 'goals', 'you']

for (const scheme of ['dark', 'light'] as const) {
  for (const [name, viewport] of Object.entries(sizes)) {
    test(`${scheme} ${name}`, async ({ browser }) => {
      const context = await browser.newContext({ colorScheme: scheme, viewport, hasTouch: true, isMobile: true, deviceScaleFactor: 3,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', baseURL: 'http://localhost:4173/Tessera/' })
      const page = await context.newPage()
      await page.goto('')
      await page.screenshot({ path: `screenshots/${scheme}-${name}-install.png` })
      await page.getByRole('button', { name: 'Continue in browser' }).click()
      for (const s of screens) {
        await page.goto(`#/${s}`)
        await page.screenshot({ path: `screenshots/${scheme}-${name}-${s}.png` })
      }
      // The components page scrolls inside its container, so capture it in viewport-sized slices.
      await page.goto('#/dev')
      await page.waitForTimeout(600)
      const total = await page.evaluate(() => document.querySelector('main')!.parentElement!.scrollHeight)
      for (let i = 0, y = 0; y < total; i++, y += viewport.height - 100) {
        await page.evaluate((top) => document.querySelector('main')!.parentElement!.scrollTo(0, top), y)
        await page.waitForTimeout(150)
        await page.screenshot({ path: `screenshots/${scheme}-${name}-dev-${String(i).padStart(2, '0')}.png` })
      }
      await context.close()
    })
  }
}
