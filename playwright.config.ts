import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:5199'

export const browserWebServer = {
  command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 5199 --strictPort',
  url: baseURL,
  reuseExistingServer: false,
  timeout: 60_000,
  // A missed interception must fail locally rather than call the live service.
  env: { API_URL: 'http://127.0.0.1:9', CANDIDATE_ID: 'browser-test' },
}

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
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
  webServer: browserWebServer,
})
