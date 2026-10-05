// @vitest-environment jsdom
import './test/setup'
import { StrictMode } from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import App from './App'
import type { Quote, QuoteRequest } from './types/exchange'

interface PendingQuote {
  body: QuoteRequest
  signal: AbortSignal
  resolve: (response: Response) => void
  reject: (error: Error) => void
}

const initialRequest = { from: 'USD', to: 'EUR', amount: 0 }
const oneDollar = { from: 'USD', to: 'EUR', amount: 1 }

afterEach(() => vi.unstubAllGlobals())

function makeQuote(request: QuoteRequest, rate: string): Quote {
  const now = Date.now()

  return {
    ...request,
    quoteId: `quote-${request.from}-${request.to}-${request.amount}-${rate}`,
    rate,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 60_000).toISOString(),
  }
}

async function respond(request: PendingQuote, body: unknown, status = 200) {
  await act(async () => {
    request.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
  })
}

async function reject(request: PendingQuote, error: Error) {
  await act(async () => {
    request.reject(error)
  })
}

async function renderCalculator() {
  const requests: PendingQuote[] = []

  vi.stubGlobal('fetch', (input: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
    if (input === '/api/rates') {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            base: 'EUR',
            currencies: ['EUR', 'USD', 'GBP'],
            rates: { EUR: '1.000000', USD: '1.085122', GBP: '0.842412' },
            updatedAt: new Date().toISOString(),
          }),
          { headers: { 'Content-Type': 'application/json' } },
        ),
      )
    }

    if (input !== '/api/quote' || options?.method !== 'POST' || !options.signal) {
      throw new Error(`Unexpected request: ${String(input)}`)
    }

    const signal = options.signal

    // Allow completion after abort to test the response guard as well as cancellation.
    return new Promise((resolve, reject) => {
      requests.push({ body: JSON.parse(String(options.body)), signal, resolve, reject })
    })
  })

  const user = userEvent.setup()

  render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

  await waitFor(() => expect(requests).toHaveLength(1))
  expect(requests[0].body).toEqual(initialRequest)

  return { user, requests }
}

it.each(['success', 'failure'] as const)(
  'ignores an older quote %s after the latest currency and amount response',
  async (completion) => {
    const { user, requests } = await renderCalculator()

    await user.click(screen.getByTestId('key-1'))
    expect(requests[1].body).toEqual(oneDollar)
    await user.selectOptions(screen.getByTestId('from-currency'), 'GBP')
    const latestRequest = { from: 'GBP', to: 'EUR', amount: 1 }

    expect(requests[2].body).toEqual(latestRequest)
    expect(requests[0].signal.aborted).toBe(true)
    expect(requests[1].signal.aborted).toBe(true)

    await respond(requests[2], makeQuote(latestRequest, '3'))
    expect(screen.getByTestId('result')).toHaveTextContent(/^3$/)
    expect(screen.getByTestId('key-save')).toBeEnabled()

    if (completion === 'success') {
      await respond(requests[1], makeQuote(oneDollar, '2'))
    } else {
      await reject(requests[1], new TypeError('Connection lost'))
    }

    expect(screen.getByTestId('result')).toHaveTextContent(/^3$/)
    expect(screen.getByTestId('from-currency')).toHaveValue('GBP')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByTestId('key-save')).toBeEnabled()
  },
)

it.each([429, 500, 'network'] as const)(
  'recovers from a %s failure through refresh',
  async (failure) => {
    const { user, requests } = await renderCalculator()

    await user.click(screen.getByTestId('key-1'))
    expect(requests[1].body).toEqual(oneDollar)

    if (failure === 'network') {
      await reject(requests[1], new TypeError('Connection lost'))
    } else {
      await respond(requests[1], { error: 'Request failed' }, failure)
    }

    expect(screen.getByRole('alert')).toBeInTheDocument()
    if (failure === 429) expect(screen.getByRole('alert')).toHaveTextContent('Too many requests')

    expect(screen.getByTestId('result')).toHaveTextContent('—')
    expect(screen.getByTestId('key-save')).toBeDisabled()
    expect(screen.getByTestId('refresh')).toBeEnabled()

    await user.click(screen.getByTestId('refresh'))
    expect(requests).toHaveLength(3)
    expect(requests[2].body).toEqual(oneDollar)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await respond(requests[2], makeQuote(oneDollar, '2'))
    expect(screen.getByTestId('result')).toHaveTextContent(/^2$/)
    expect(screen.getByTestId('key-save')).toBeEnabled()
  },
)

it('prevents saving the previous result while the next amount is pending', async () => {
  const { user, requests } = await renderCalculator()

  await user.click(screen.getByTestId('key-1'))
  await respond(requests[1], makeQuote(oneDollar, '2'))
  expect(screen.getByTestId('result')).toHaveTextContent(/^2$/)
  expect(screen.getByTestId('key-save')).toBeEnabled()

  await user.click(screen.getByTestId('key-2'))
  const nextRequest = { from: 'USD', to: 'EUR', amount: 12 }

  expect(requests[2].body).toEqual(nextRequest)
  expect(screen.getByTestId('amount')).toHaveTextContent(/^12$/)
  expect(screen.getByTestId('result')).toHaveTextContent('—')
  expect(screen.getByTestId('key-save')).toBeDisabled()
  await user.click(screen.getByTestId('key-save'))
  await user.click(screen.getByTestId('tab-history'))
  expect(screen.getByTestId('history-count')).toHaveTextContent('7 records')

  await respond(requests[2], makeQuote(nextRequest, '2'))
  await user.click(screen.getByTestId('tab-exchange'))
  expect(screen.getByTestId('result')).toHaveTextContent(/^24$/)
  await user.click(screen.getByTestId('key-save'))
  await user.click(screen.getByTestId('tab-history'))
  expect(screen.getByTestId('history-count')).toHaveTextContent('8 records')
  const savedRow = screen.getAllByTestId('history-item').slice(-1)[0]

  expect(savedRow).toHaveTextContent('USD 12 → EUR 24')
  expect(savedRow).toHaveAttribute('aria-selected', 'true')
})

it('requires a new quote when returning to a previously quoted amount', async () => {
  const { user, requests } = await renderCalculator()

  await user.click(screen.getByTestId('key-1'))
  await respond(requests[1], makeQuote(oneDollar, '2'))
  expect(screen.getByTestId('result')).toHaveTextContent(/^2$/)

  await user.click(screen.getByTestId('key-2'))
  await user.click(screen.getByTestId('key-backspace'))
  expect(requests).toHaveLength(4)
  expect(requests[3].body).toEqual(oneDollar)
  expect(screen.getByTestId('amount')).toHaveTextContent(/^1$/)
  expect(screen.getByTestId('result')).toHaveTextContent('—')
  expect(screen.getByTestId('key-save')).toBeDisabled()

  await respond(requests[3], makeQuote(oneDollar, '3'))
  expect(screen.getByTestId('result')).toHaveTextContent(/^3$/)
  expect(screen.getByTestId('key-save')).toBeEnabled()
})
