import type { KeypadAction, Tab } from '../../types/exchange'
import styles from './Keypad.module.css'

interface Props {
  tab: Tab
  onAction: (action: KeypadAction) => void
  canSave: boolean
  hasSelection: boolean
}

const keys = [
  ['clear', 'C', 'Clear'],
  ['backspace', '⌫', 'Backspace'],
  ['save', 'm', 'Save conversion'],
  ['7', '7', '7'],
  ['8', '8', '8'],
  ['9', '9', '9'],
  ['4', '4', '4'],
  ['5', '5', '5'],
  ['6', '6', '6'],
  ['1', '1', '1'],
  ['2', '2', '2'],
  ['3', '3', '3'],
  ['00', '00', '00'],
  ['0', '0', '0'],
  ['decimal', '.', 'Decimal point'],
] as const

export function Keypad({ tab, onAction, canSave, hasSelection }: Props) {
  const history = tab === 'history'

  return (
    <section className={styles.keypad} aria-label={history ? 'History controls' : 'Amount keypad'}>
      <div className={styles.grid}>
        {keys.map(([key, label, name], index) => (
          <button
            key={key}
            type="button"
            data-testid={`key-${key === 'decimal' ? 'dot' : key}`}
            aria-label={
              key === 'clear' && history
                ? 'Clear history'
                : key === 'backspace' && history
                  ? 'Delete selected conversion'
                  : name
            }
            className={`${styles.key} ${key === 'clear' ? styles.clear : ''} ${key === 'backspace' ? styles.backspace : ''} ${key === 'save' && history ? styles.hidden : ''}`}
            style={{ gridRow: Math.floor(index / 3) + 1, gridColumn: (index % 3) + 1 }}
            disabled={
              key === 'clear'
                ? false
                : key === 'save'
                  ? history || !canSave
                  : history && (key !== 'backspace' || !hasSelection)
            }
            onClick={() => onAction(key)}
          >
            {key === 'backspace' ? (
              <svg viewBox="0 0 50 36" aria-hidden="true">
                <path d="M17 1h27a5 5 0 0 1 5 5v24a5 5 0 0 1-5 5H17L1 18Z" fill="currentColor" />
                <path
                  d="m24 12 12 12m0-12L24 24"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              label
            )}
          </button>
        ))}
        {history &&
          (['up', 'down', 'load'] as const).map((key, index) => (
            <button
              key={key}
              type="button"
              className={`${styles.key} ${styles.navigation}`}
              style={{ gridColumn: 4, gridRow: index + 2 }}
              data-testid={`key-${key === 'load' ? 'ok' : key}`}
              aria-label={
                key === 'load'
                  ? 'Load selected conversion'
                  : key === 'up'
                    ? 'Previous conversion'
                    : 'Next conversion'
              }
              disabled={!hasSelection}
              onClick={() => onAction(key)}
            >
              <span>
                {key === 'load' ? (
                  'OK'
                ) : (
                  <svg viewBox="0 0 32 32" aria-hidden="true">
                    <path
                      d={key === 'up' ? 'M16 5 29 27H3Z' : 'M3 5h26L16 27Z'}
                      fill="currentColor"
                      stroke="currentColor"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </span>
            </button>
          ))}
      </div>
      <div className={styles.homeIndicator} aria-hidden="true" />
    </section>
  )
}
