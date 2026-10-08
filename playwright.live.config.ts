import { defineConfig } from '@playwright/test'
import { loadEnv } from 'vite'
import config, { browserWebServer } from './playwright.config'

const env = loadEnv('production', process.cwd(), '')
const baseURL = 'http://127.0.0.1:5200'

if (!env.API_URL || !env.CANDIDATE_ID) {
  throw new Error(
    'Live E2E tests require API_URL and CANDIDATE_ID in .env or environment variables.',
  )
}

export default defineConfig(config, {
  metadata: { liveApi: true },
  use: { baseURL },
  webServer: {
    ...browserWebServer,
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 5200 --strictPort',
    url: baseURL,
    env: { API_URL: env.API_URL, CANDIDATE_ID: env.CANDIDATE_ID },
  },
})
