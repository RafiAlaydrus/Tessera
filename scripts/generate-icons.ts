// Renders public/mark.svg into app icons and black startup images using Playwright's WebKit.
// Run once, or after changing the mark: npm run icons
import { mkdirSync, readFileSync } from 'node:fs'
import { webkit } from '@playwright/test'
import { devices, startupName } from './devices.ts'

const mark = `data:image/svg+xml;base64,${readFileSync('public/mark.svg').toString('base64')}`

const jobs: { file: string; w: number; h: number; scale: number; byWidth?: boolean }[] = [
  // Maskable icons keep the mark inside the central safe zone.
  { file: 'apple-touch-icon.png', w: 180, h: 180, scale: 0.62 },
  { file: 'pwa-192.png', w: 192, h: 192, scale: 0.62 },
  { file: 'pwa-512.png', w: 512, h: 512, scale: 0.62 },
  { file: 'maskable-512.png', w: 512, h: 512, scale: 0.5 },
  ...devices.map((d) => ({ file: startupName(d), w: d.w * d.r, h: d.h * d.r, scale: 0.2, byWidth: true })),
]

mkdirSync('public/startup', { recursive: true })
const browser = await webkit.launch()
const page = await browser.newPage()
for (const j of jobs) {
  await page.setViewportSize({ width: j.w, height: j.h })
  const size = Math.round((j.byWidth ? j.w : Math.min(j.w, j.h)) * j.scale)
  await page.setContent(
    `<body style="margin:0;height:100vh;display:grid;place-items:center;background:#000"><img src="${mark}" width="${size}" height="${size}"></body>`,
  )
  await page.screenshot({ path: `public/${j.file}` })
}
await browser.close()
console.log(`wrote ${jobs.length} images`)
