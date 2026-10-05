import { describe, expect, it } from 'vitest'
import { calculatorReducer, createCalculatorState, type CalculatorState } from './calculator'
import type { HistoryRecord } from '../types/exchange'

const records: HistoryRecord[] = [
  { id: 'first', from: 'USD', to: 'EUR', amount: '1000', result: 1186.5 },
  { id: 'second', from: 'EUR', to: 'USD', amount: '12.50', result: 25 },
]

describe('calculator history', () => {
  it('loads the full raw amount and requests a fresh quote', () => {
    const initial = { ...createCalculatorState(records), tab: 'history' as const }
    const next = calculatorReducer(initial, { type: 'key', key: 'load' })
    expect(next).toMatchObject({ tab: 'exchange', amount: '1000', from: 'USD', to: 'EUR' })
    expect(next.revision).toBe(initial.revision + 1)
  })
  it('keeps a valid selection after deleting the last selected record', () => {
    const state = {
      ...createCalculatorState(records),
      tab: 'history' as const,
      selectedId: 'second',
    }
    const next = calculatorReducer(state, { type: 'key', key: 'backspace' })
    expect(next.history.map((record) => record.id)).toEqual(['first'])
    expect(next.selectedId).toBe('first')
  })
  it('handles clear, navigation and loading with an empty history', () => {
    let state = calculatorReducer(
      { ...createCalculatorState(records), tab: 'history' },
      { type: 'key', key: 'clear' },
    )
    state = calculatorReducer(state, { type: 'key', key: 'down' })
    state = calculatorReducer(state, { type: 'key', key: 'load' })
    expect(state.history).toEqual([])
    expect(state.selectedId).toBeNull()
    expect(state.tab).toBe('history')
  })
  it('ignores numeric input while showing history', () => {
    const state = { ...createCalculatorState(records), tab: 'history' as const }
    expect(calculatorReducer(state, { type: 'key', key: '9' })).toEqual(state)
  })
  it('clamps navigation to existing records', () => {
    let state: CalculatorState = { ...createCalculatorState(records), tab: 'history' }
    state = calculatorReducer(state, { type: 'key', key: 'up' })
    expect(state.selectedId).toBe('first')
    state = calculatorReducer(state, { type: 'key', key: 'down' })
    state = calculatorReducer(state, { type: 'key', key: 'down' })
    expect(state.selectedId).toBe('second')
  })
  it('stores a new record and selects it without formatting its input', () => {
    const record = { id: 'new', from: 'EUR', to: 'USD', amount: '1000.50', result: 2001 }
    const state = calculatorReducer(createCalculatorState(records), { type: 'save', record })
    expect(state.history[state.history.length - 1]).toEqual(record)
    expect(state.selectedId).toBe('new')
  })
  it('makes every changed input a distinct quote request, even when returning to an old value', () => {
    let state = createCalculatorState(records)
    state = calculatorReducer(state, { type: 'key', key: '7' })
    const firstRevision = state.revision
    state = calculatorReducer(state, { type: 'key', key: 'clear' })
    state = calculatorReducer(state, { type: 'key', key: '7' })
    expect(state.amount).toBe('7')
    expect(state.revision).toBeGreaterThan(firstRevision)
  })
})
