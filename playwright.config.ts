import { defineConfig, devices } from '@playwright/test'
import { loadEnv } from 'vite'

const env = loadEnv('production', process.cwd(), '')

if (!env.API_URL || !env.CANDIDATE_ID) {
  throw new Error('Live E2E tests require API_URL and CANDIDATE_ID in .env.')
}

const baseURL = 'http://127.0.0.1:5199'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 5199 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
