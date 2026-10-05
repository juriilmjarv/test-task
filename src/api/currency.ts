import type { Quote, QuoteRequest } from '../types/exchange'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function decodeCurrencies(value: unknown): string[] {
  if (
    !isObject(value) ||
    !Array.isArray(value.currencies) ||
    value.currencies.length === 0 ||
    !value.currencies.every((code) => typeof code === 'string' && /^[A-Z]{3}$/.test(code))
  ) {
    throw new Error('The currency service returned invalid currencies. Please retry.')
  }

  return [...new Set(value.currencies)]
}

export function decodeQuote(value: unknown, request: QuoteRequest): Quote {
  if (
    !isObject(value) ||
    typeof value.quoteId !== 'string' ||
    !value.quoteId ||
    value.from !== request.from ||
    value.to !== request.to ||
    value.amount !== request.amount ||
    typeof value.rate !== 'string' ||
    !Number.isFinite(Number(value.rate)) ||
    Number(value.rate) <= 0 ||
    !Number.isFinite(request.amount * Number(value.rate)) ||
    typeof value.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(value.createdAt)) ||
    typeof value.expiresAt !== 'string' ||
    !Number.isFinite(Date.parse(value.expiresAt)) ||
    Date.parse(value.expiresAt) <= Date.parse(value.createdAt)
  ) {
    throw new Error('The currency service returned an invalid quote. Please retry.')
  }

  return {
    ...request,
    quoteId: value.quoteId,
    rate: value.rate,
    createdAt: value.createdAt,
    expiresAt: value.expiresAt,
  }
}

async function readResponse(response: Response): Promise<unknown> {
  if (!response.ok) {
    throw new Error(
      response.status === 429
        ? 'Too many requests. Wait a moment, then refresh.'
        : 'The currency service is unavailable. Please retry.',
    )
  }

  return response.json()
}

export async function fetchCurrencies(signal: AbortSignal): Promise<string[]> {
  return decodeCurrencies(await readResponse(await fetch('/api/rates', { signal })))
}

export async function fetchQuote(request: QuoteRequest, signal: AbortSignal): Promise<Quote> {
  const response = await fetch('/api/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  })

  return decodeQuote(await readResponse(response), request)
}

export function errorMessage(error: unknown): string {
  return error instanceof TypeError
    ? 'Unable to connect. Check your connection and retry.'
    : error instanceof Error
      ? error.message
      : 'Something went wrong. Please retry.'
}
