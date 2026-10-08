import type { Tab } from '../../types/exchange'
import styles from './Tabs.module.css'

interface Props {
  active: Tab
  onChange: (tab: Tab) => void
}

export function Tabs({ active, onChange }: Props) {
  return (
    <nav className={styles.tabs} aria-label="Calculator views">
      <button
        type="button"
        data-testid="tab-exchange"
        aria-pressed={active === 'exchange'}
        onClick={() => onChange('exchange')}
      >
        Exchange Rate
      </button>
      <span className={styles.divider} aria-hidden="true" />
      <button
        type="button"
        data-testid="tab-history"
        aria-pressed={active === 'history'}
        onClick={() => onChange('history')}
      >
        History
      </button>
    </nav>
  )
}
