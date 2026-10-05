import { useEffect, useState } from 'react'
import { errorMessage, fetchQuote } from '../api/currency'
import type { Quote } from '../types/exchange'
import { parseAmount } from '../utils/money'

type QuoteState =
  | { key: string; status: 'ready'; quote: Quote }
  | { key: string; status: 'error'; error: string }

export function useQuote(
  from: string,
  to: string,
  amount: string,
  revision: number,
  enabled: boolean,
) {
  const key = JSON.stringify([from, to, amount, revision])
  const [settled, setSettled] = useState<QuoteState | null>(null)

  useEffect(() => {
    if (!enabled) return
    const controller = new AbortController()
    fetchQuote({ from, to, amount: parseAmount(amount) }, controller.signal)
      .then((quote) => {
        if (!controller.signal.aborted) setSettled({ key, status: 'ready', quote })
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setSettled({ key, status: 'error', error: errorMessage(error) })
      })
    return () => controller.abort()
  }, [from, to, amount, key, enabled])

  if (!enabled) return { status: 'idle' } as const
  // Never display or save a settled quote belonging to an earlier input or refresh.
  if (!settled || settled.key !== key) return { status: 'loading' } as const
  return settled
}
