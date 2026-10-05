import type { HistoryRecord } from '../types/exchange'

export const initialHistory: HistoryRecord[] = [
  { id: 'seed-1', from: 'USD', to: 'EUR', amount: '1000', result: 922.25 },
  { id: 'seed-2', from: 'EUR', to: 'USD', amount: '500', result: 542.15 },
  { id: 'seed-3', from: 'GBP', to: 'PLN', amount: '250', result: 1271.72 },
  { id: 'seed-4', from: 'PLN', to: 'EUR', amount: '12500', result: 2921.18 },
  { id: 'seed-5', from: 'SEK', to: 'GBP', amount: '3400', result: 254.49 },
  { id: 'seed-6', from: 'EUR', to: 'JPY', amount: '75', result: 12185.25 },
  { id: 'seed-7', from: 'USD', to: 'SEK', amount: '2750', result: 28503.07 },
]
