import { describe, expect, it } from 'vitest'
import { convert, formatMoney, parseAmount } from './money'

describe('money', () => {
  it.each([
    ['1,000', 1000],
    ['12,500.25', 12500.25],
    ['0.', 0],
    ['42.50', 42.5],
  ])('parses %s without losing digits', (input, expected) => {
    expect(parseAmount(input)).toBe(expected)
  })

  it.each(['', '12,34', '12abc', 'Infinity', '-1', '1.2.3'])(
    'rejects invalid amount %s',
    (input) => {
      expect(() => parseAmount(input)).toThrow()
    },
  )

  it('formats the real conversion with decimal rounding', () => {
    expect(formatMoney(convert(250, '1.084300'))).toBe('271.08')
    expect(formatMoney(convert(0.1, '3'))).toBe('0.3')
  })

  it.each([
    [0.18, '1.250000', 0.23],
    [0.7, '0.950000', 0.67],
    [1, '1.004999', 1],
    [1, '1.005000', 1.01],
    [1, ' 1.005000 ', 1.01],
    [250, '1.084300', 271.08],
  ])('rounds %s × %s half-up to %s before saving or displaying', (amount, rate, expected) => {
    expect(convert(amount, rate)).toBe(expected)
  })

  it('groups result digits and omits unnecessary decimal zeroes', () => {
    expect(formatMoney(1186.5)).toBe('1,186.5')
    expect(formatMoney(1000)).toBe('1,000')
  })
})
