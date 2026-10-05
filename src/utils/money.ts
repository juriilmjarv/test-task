import Decimal from 'decimal.js'

const MoneyDecimal = Decimal.clone({ precision: 40 })
const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

export function parseAmount(value: string): number {
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d*)?$/.test(value)) {
    throw new Error('Invalid amount')
  }

  const amount = Number(value.replace(/,/g, ''))

  if (!Number.isFinite(amount)) throw new Error('Invalid amount')

  return amount
}

export function convert(amount: number, rate: string): number {
  const result = new MoneyDecimal(amount)
    .times(rate.trim())
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
    .toNumber()

  if (!Number.isFinite(result)) throw new Error('Invalid conversion')

  return result
}

export function formatMoney(value: number): string {
  return formatter.format(value)
}
