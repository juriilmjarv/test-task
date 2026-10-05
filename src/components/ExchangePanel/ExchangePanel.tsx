import { CurrencyRow } from '../CurrencyRow/CurrencyRow'
import { formatMoney } from '../../utils/money'
import styles from './ExchangePanel.module.css'

interface Props {
  from: string
  to: string
  amount: string
  result: number | null
  currencies: string[]
  status: 'loading' | 'ready' | 'error' | 'idle'
  message: string
  onCurrencyChange: (side: 'from' | 'to', currency: string) => void
  onRefresh: () => void
}
export function ExchangePanel({
  from,
  to,
  amount,
  result,
  currencies,
  status,
  message,
  onCurrencyChange,
  onRefresh,
}: Props) {
  return (
    <section
      className={styles.panel}
      aria-label="Currency exchange"
      aria-busy={status === 'loading'}
    >
      <div className={styles.rows}>
        <CurrencyRow
          side="from"
          currency={from}
          currencies={currencies}
          value={amount}
          onChange={(currency) => onCurrencyChange('from', currency)}
        />
        <CurrencyRow
          side="to"
          currency={to}
          currencies={currencies}
          value={result === null ? '—' : formatMoney(result)}
          onChange={(currency) => onCurrencyChange('to', currency)}
        />
      </div>
      <div className={styles.status}>
        <span
          data-testid="updated-at"
          role={status === 'error' ? 'alert' : 'status'}
          className={status === 'error' ? styles.error : undefined}
        >
          {message}
        </span>
        <button
          type="button"
          data-testid="refresh"
          aria-label="Refresh exchange rate"
          className={styles.refresh}
          onClick={onRefresh}
          disabled={status === 'loading'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M20 8a8 8 0 1 0 0 8M20 3v6h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </section>
  )
}
