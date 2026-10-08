import { test as base, expect } from '@playwright/test'

const rates: Record<string, string> = {
  EUR: '1.000000',
  USD: '1.085122',
  GBP: '0.842412',
  PLN: '4.278000',
  SEK: '11.220000',
  JPY: '162.470000',
}

export const test = base.extend<{ apiResponses: void }>({
  apiResponses: [
    async ({ page }, use, testInfo) => {
      if (!testInfo.config.metadata.liveApi) {
        await page.route('**/api/**', async (route) => {
          const request = route.request()
          const path = new URL(request.url()).pathname
          const now = Date.now()

          if (path === '/api/rates' && request.method() === 'GET') {
            await route.fulfill({
              json: {
                base: 'EUR',
                currencies: Object.keys(rates),
                rates,
                updatedAt: new Date(now).toISOString(),
              },
            })

            return
          }

          if (path === '/api/quote' && request.method() === 'POST') {
            const body: unknown = request.postDataJSON()

            if (
              typeof body === 'object' &&
              body !== null &&
              'from' in body &&
              typeof body.from === 'string' &&
              'to' in body &&
              typeof body.to === 'string' &&
              'amount' in body &&
              typeof body.amount === 'number' &&
              Number.isFinite(body.amount) &&
              rates[body.from] &&
              rates[body.to]
            ) {
              // Hand-picked rates make the main journey's expectations independent.
              const rate =
                body.from === 'GBP' && body.to === 'EUR'
                  ? '1.170000'
                  : body.from === 'USD' && body.to === 'EUR'
                    ? '0.922250'
                    : String(Number(rates[body.to]) / Number(rates[body.from]))

              await route.fulfill({
                json: {
                  from: body.from,
                  to: body.to,
                  amount: body.amount,
                  quoteId: `browser-${request.url()}-${now}`,
                  rate,
                  createdAt: new Date(now).toISOString(),
                  expiresAt: new Date(now + 60_000).toISOString(),
                },
              })

              return
            }
          }

          throw new Error(`Unexpected browser-test API request: ${request.method()} ${path}`)
        })
      }

      await use()
    },
    { auto: true },
  ],
})

export { expect }
