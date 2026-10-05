import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: 'e2e',
  use: { ...devices['iPhone 15'], baseURL: 'http://localhost:4173/Tessera/' },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/Tessera/',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
