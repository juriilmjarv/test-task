import type { HistoryRecord, KeypadAction, Tab } from '../types/exchange'
import { editAmount } from '../utils/keypad'

export interface CalculatorState {
  tab: Tab
  amount: string
  from: string
  to: string
  history: HistoryRecord[]
  selectedId: string | null
  revision: number
  currencies: string[]
  catalogStatus: 'loading' | 'ready' | 'error'
  catalogError: string | null
  catalogVersion: number
}

type Action =
  | { type: 'key'; key: KeypadAction }
  | { type: 'tab'; tab: Tab }
  | { type: 'save'; record: HistoryRecord }
  | { type: 'select'; id: string }
  | { type: 'currency'; side: 'from' | 'to'; currency: string }
  | { type: 'currenciesLoaded'; currencies: string[] }
  | { type: 'currenciesFailed'; message: string }
  | { type: 'reloadCurrencies' }
  | { type: 'refresh' }

export function createCalculatorState(history: HistoryRecord[]): CalculatorState {
  return {
    tab: 'exchange',
    amount: '0',
    from: 'USD',
    to: 'EUR',
    history,
    selectedId: history[0]?.id ?? null,
    revision: 0,
    currencies: [],
    catalogStatus: 'loading',
    catalogError: null,
    catalogVersion: 0,
  }
}

export function calculatorReducer(state: CalculatorState, action: Action): CalculatorState {
  switch (action.type) {
    case 'tab':
      return { ...state, tab: action.tab }
    case 'select':
      return state.history.some((record) => record.id === action.id)
        ? { ...state, selectedId: action.id }
        : state
    case 'save':
      return { ...state, history: [...state.history, action.record], selectedId: action.record.id }
    case 'currency':
      return state.currencies.includes(action.currency) && state[action.side] !== action.currency
        ? { ...state, [action.side]: action.currency, revision: state.revision + 1 }
        : state

    case 'currenciesLoaded': {
      const firstCurrency = action.currencies[0]

      if (!firstCurrency) return state

      return {
        ...state,
        currencies: action.currencies,
        catalogStatus: 'ready',
        catalogError: null,
        from: action.currencies.includes(state.from) ? state.from : firstCurrency,
        to: action.currencies.includes(state.to)
          ? state.to
          : (action.currencies[1] ?? firstCurrency),
        revision: state.revision + 1,
      }
    }

    case 'currenciesFailed':
      return { ...state, catalogStatus: 'error', catalogError: action.message }
    case 'reloadCurrencies':
      return {
        ...state,
        catalogStatus: 'loading',
        catalogError: null,
        catalogVersion: state.catalogVersion + 1,
      }
    case 'refresh':
      return { ...state, revision: state.revision + 1 }

    case 'key': {
      if (state.tab === 'exchange') {
        if (
          action.key === 'save' ||
          action.key === 'up' ||
          action.key === 'down' ||
          action.key === 'load'
        )
          return state

        const amount = editAmount(state.amount, action.key)

        return amount === state.amount ? state : { ...state, amount, revision: state.revision + 1 }
      }

      const index = state.history.findIndex((record) => record.id === state.selectedId)
      const selectedRecord = state.history[index]

      if (action.key === 'clear') return { ...state, history: [], selectedId: null }

      if (!selectedRecord) return state

      if (action.key === 'backspace') {
        const history = state.history.filter((record) => record.id !== state.selectedId)

        return {
          ...state,
          history,
          selectedId: history[Math.min(index, history.length - 1)]?.id ?? null,
        }
      }

      if (action.key === 'up' || action.key === 'down') {
        const next = Math.max(
          0,
          Math.min(state.history.length - 1, index + (action.key === 'up' ? -1 : 1)),
        )

        const nextRecord = state.history[next]

        return nextRecord ? { ...state, selectedId: nextRecord.id } : state
      }

      if (action.key === 'load') {
        return {
          ...state,
          tab: 'exchange',
          from: selectedRecord.from,
          to: selectedRecord.to,
          amount: selectedRecord.amount,
          revision: state.revision + 1,
        }
      }

      return state
    }
  }
}
