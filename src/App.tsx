import { useEffect, useReducer } from 'react'
import { errorMessage, fetchCurrencies } from './api/currency'
import { ExchangePanel } from './components/ExchangePanel/ExchangePanel'
import { HistoryPanel } from './components/HistoryPanel/HistoryPanel'
import { Keypad } from './components/Keypad/Keypad'
import { Tabs } from './components/Tabs/Tabs'
import { initialHistory } from './data/initialHistory'
import { useNow } from './hooks/useNow'
import { useQuote } from './hooks/useQuote'
import { calculatorReducer, createCalculatorState } from './state/calculator'
import type { KeypadAction } from './types/exchange'
import { convert } from './utils/money'
import { formatElapsed } from './utils/time'
import styles from './App.module.css'

export default function App() {
  const [state, dispatch] = useReducer(calculatorReducer, initialHistory, createCalculatorState)

  const quote = useQuote(
    state.from,
    state.to,
    state.amount,
    state.revision,
    state.catalogStatus === 'ready',
  )

  const now = useNow()

  useEffect(() => {
    const controller = new AbortController()

    fetchCurrencies(controller.signal)
      .then((currencies) => {
        if (!controller.signal.aborted) dispatch({ type: 'currenciesLoaded', currencies })
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          dispatch({ type: 'currenciesFailed', message: errorMessage(error) })
      })

    return () => controller.abort()
  }, [state.catalogVersion])

  const result = quote.status === 'ready' ? convert(quote.quote.amount, quote.quote.rate) : null
  const expired = quote.status === 'ready' && now >= Date.parse(quote.quote.expiresAt)
  const canSave = quote.status === 'ready' && !expired
  const status = state.catalogStatus === 'ready' ? quote.status : state.catalogStatus

  const message =
    state.catalogStatus === 'error'
      ? (state.catalogError ?? 'Unable to load currencies.')
      : state.catalogStatus === 'loading'
        ? 'Loading currencies…'
        : quote.status === 'error'
          ? quote.error
          : quote.status === 'ready'
            ? expired
              ? `Last updated ${formatElapsed(Date.parse(quote.quote.createdAt), now)} · Expired. Refresh to save.`
              : `Last updated ${formatElapsed(Date.parse(quote.quote.createdAt), now)}`
            : 'Updating exchange rate…'

  function handleKey(key: KeypadAction) {
    if (key === 'save') {
      if (
        state.tab !== 'exchange' ||
        quote.status !== 'ready' ||
        result === null ||
        Date.now() >= Date.parse(quote.quote.expiresAt)
      )
        return

      dispatch({
        type: 'save',
        record: {
          id: crypto.randomUUID(),
          from: state.from,
          to: state.to,
          amount: state.amount,
          result,
        },
      })
    } else dispatch({ type: 'key', key })
  }

  return (
    <main className={styles.page}>
      <div className={styles.calculator} aria-label="Currency calculator">
        <Tabs active={state.tab} onChange={(tab) => dispatch({ type: 'tab', tab })} />
        {state.tab === 'exchange' ? (
          <ExchangePanel
            from={state.from}
            to={state.to}
            amount={state.amount}
            result={result}
            currencies={state.currencies}
            status={status}
            message={message}
            onCurrencyChange={(side, currency) => dispatch({ type: 'currency', side, currency })}
            onRefresh={() =>
              dispatch({ type: state.catalogStatus === 'error' ? 'reloadCurrencies' : 'refresh' })
            }
          />
        ) : (
          <HistoryPanel
            records={state.history}
            selectedId={state.selectedId}
            onSelect={(id) => dispatch({ type: 'select', id })}
          />
        )}
        <Keypad
          tab={state.tab}
          onAction={handleKey}
          canSave={canSave}
          hasSelection={state.selectedId !== null}
        />
      </div>
    </main>
  )
}
