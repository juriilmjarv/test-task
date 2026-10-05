import { describe, expect, it } from 'vitest'
import { decodeCurrencies, decodeQuote } from './currency'

const request = { from: 'USD', to: 'EUR', amount: 1000 }
const quote = {
  ...request,
  quoteId: 'test',
  rate: '1.1865',
  createdAt: '2026-10-05T10:00:00Z',
  expiresAt: '2026-10-05T10:01:00Z',
}

describe('API response validation', () => {
  it('accepts a quote for the requested conversion', () => {
    expect(decodeQuote(quote, request)).toEqual(quote)
  })
  it.each([
    { ...quote, amount: 1 },
    { ...quote, from: 'GBP' },
    { ...quote, rate: 'invalid' },
    { ...quote, rate: '-1' },
    { ...quote, createdAt: 'invalid' },
  ])('rejects a mismatched or malformed quote', (value) => {
    expect(() => decodeQuote(value, request)).toThrow()
  })
  it('reads and deduplicates currency codes', () => {
    expect(decodeCurrencies({ currencies: ['USD', 'EUR', 'USD'] })).toEqual(['USD', 'EUR'])
  })
  it.each([null, {}, { currencies: [] }, { currencies: ['invalid'] }])(
    'rejects unusable currency data',
    (value) => {
      expect(() => decodeCurrencies(value)).toThrow()
    },
  )
})
