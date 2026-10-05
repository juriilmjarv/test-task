export type Tab = 'exchange' | 'history'

export type InputKey =
  | `${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
  | '00'
  | 'decimal'
  | 'backspace'
  | 'clear'

export type KeypadAction = InputKey | 'save' | 'up' | 'down' | 'load'

export interface HistoryRecord {
  id: string
  from: string
  to: string
  amount: string
  result: number
}

export interface QuoteRequest {
  from: string
  to: string
  amount: number
}

export interface Quote extends QuoteRequest {
  quoteId: string
  rate: string
  createdAt: string
  expiresAt: string
}
