import { useLayoutEffect, useRef } from 'react'
import { fitFontSize } from '../../utils/fitFontSize'
import styles from './AmountDisplay.module.css'

interface Props {
  value: string
  label: string
  testId: string
  highlighted?: boolean
  scrollToEnd?: boolean
}

export function AmountDisplay({
  value,
  label,
  testId,
  highlighted = false,
  scrollToEnd = false,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLOutputElement>(null)
  const measurementRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    const output = outputRef.current
    const measurement = measurementRef.current

    if (!wrapper || !output || !measurement) return

    function fit() {
      if (!wrapper || !output || !measurement || output.clientWidth === 0) return

      const max = parseFloat(getComputedStyle(measurement).fontSize) || 36
      const min = parseFloat(getComputedStyle(wrapper).getPropertyValue('--font-amount-min')) || 18

      // Measure a separate copy at the maximum size, so shrinking never feeds back into measurement.
      const size = fitFontSize(
        output.clientWidth - 1,
        measurement.getBoundingClientRect().width,
        min,
        max,
      )

      output.style.fontSize = `${size}px`
      const overflowing = output.scrollWidth > output.clientWidth

      output.tabIndex = overflowing ? 0 : -1
      output.scrollLeft = overflowing && scrollToEnd ? output.scrollWidth : 0
    }

    fit()

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(fit)

      observer.observe(wrapper)

      return () => observer.disconnect()
    }

    window.addEventListener('resize', fit)

    return () => window.removeEventListener('resize', fit)
  }, [value, scrollToEnd])

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} ${highlighted ? styles.highlighted : ''}`}>
      <span ref={measurementRef} className={styles.measurement} aria-hidden="true">
        {value}
      </span>
      <output
        ref={outputRef}
        className={styles.output}
        data-testid={testId}
        aria-label={label}
        title={value}
      >
        <span className={styles.text}>{value}</span>
      </output>
    </div>
  )
}
