import { AmountDisplay } from '../AmountDisplay/AmountDisplay'
import styles from './CurrencyRow.module.css'

interface Props {
  side: 'from' | 'to'
  currency: string
  currencies: string[]
  value: string
  onChange: (currency: string) => void
}
export function CurrencyRow({ side, currency, currencies, value, onChange }: Props) {
  return (
    <div className={styles.row}>
      <div className={styles.selectWrapper}>
        <select
          aria-label={side === 'from' ? 'From currency' : 'To currency'}
          data-testid={`${side}-currency`}
          value={currency}
          disabled={!currencies.length}
          onChange={(event) => onChange(event.target.value)}
        >
          {(currencies.length ? currencies : [currency]).map((code) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        <svg viewBox="0 0 12 20" aria-hidden="true">
          <path d="m3 3 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      </div>
      <AmountDisplay
        value={value}
        label={side === 'from' ? 'Amount' : 'Converted amount'}
        testId={side === 'from' ? 'amount' : 'result'}
        highlighted={side === 'from'}
        scrollToEnd={side === 'from'}
      />
    </div>
  )
}
