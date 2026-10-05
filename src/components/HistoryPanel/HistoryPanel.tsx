import { useEffect, useRef } from 'react'
import type { HistoryRecord } from '../../types/exchange'
import { formatMoney } from '../../utils/money'
import styles from './HistoryPanel.module.css'

interface Props {
  records: HistoryRecord[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function HistoryPanel({ records, selectedId, onSelect }: Props) {
  const selectedRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [selectedId])

  return (
    <section className={styles.panel} aria-label="Saved conversions">
      {records.length ? (
        <ul className={styles.list} role="listbox" aria-label="Conversion history">
          {records.map((record, index) => (
            <li
              key={record.id}
              ref={record.id === selectedId ? selectedRef : undefined}
              role="option"
              aria-selected={record.id === selectedId}
              data-testid="history-item"
              className={styles.record}
              tabIndex={record.id === selectedId || (selectedId === null && index === 0) ? 0 : -1}
              onClick={() => onSelect(record.id)}
              onKeyDown={(event) => {
                if (['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
                  event.preventDefault()

                  const next =
                    event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? records.length - 1
                        : Math.max(
                            0,
                            Math.min(
                              records.length - 1,
                              index + (event.key === 'ArrowDown' ? 1 : -1),
                            ),
                          )

                  const nextRecord = records[next]

                  if (!nextRecord) return

                  onSelect(nextRecord.id)
                  const option = event.currentTarget.parentElement?.children[next]

                  if (option instanceof HTMLElement) option.focus()
                } else if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(record.id)
                }
              }}
            >
              {record.from} {record.amount} → {record.to} {formatMoney(record.result)}
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          No saved conversions<span>Save a conversion with the m key.</span>
        </p>
      )}
      <p className={styles.count} data-testid="history-count">
        {records.length} {records.length === 1 ? 'record' : 'records'}
      </p>
    </section>
  )
}
