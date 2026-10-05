// @vitest-environment jsdom
import '../../test/setup'
import { render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { AmountDisplay } from './AmountDisplay'

afterEach(() => vi.restoreAllMocks())

it('preserves the full number and accessible label', () => {
  const value = '57,612,480,123,456.78'
  render(<AmountDisplay value={value} label="Converted amount" testId="result" />)
  expect(screen.getByTestId('result')).toHaveTextContent(value)
  expect(screen.getByTestId('result')).toHaveAttribute('title', value)
  expect(screen.getByTestId('result')).toHaveAccessibleName('Converted amount')
})

it('shrinks long text and grows back when a shorter value fits', () => {
  // jsdom has no layout engine; supply measurements only, keeping the component real.
  let textWidth = 200
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(150)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => new DOMRect(0, 0, textWidth, 36),
  )
  const { rerender } = render(<AmountDisplay value="123456789" label="Amount" testId="amount" />)
  expect(parseFloat(screen.getByTestId('amount').style.fontSize)).toBeLessThan(36)
  expect(parseFloat(screen.getByTestId('amount').style.fontSize)).toBeGreaterThanOrEqual(18)
  textWidth = 50
  rerender(<AmountDisplay value="1" label="Amount" testId="amount" />)
  expect(screen.getByTestId('amount')).toHaveStyle({ fontSize: '36px' })
})

it('keeps very long input readable and scrolls to its newest digit', () => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100)
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(400)
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => new DOMRect(0, 0, 800, 36),
  )
  render(<AmountDisplay value="123456789012345" label="Amount" testId="amount" scrollToEnd />)
  const output = screen.getByTestId('amount')
  expect(output).toHaveStyle({ fontSize: '18px' })
  expect(output.tabIndex).toBe(0)
  expect(output.scrollLeft).toBeGreaterThan(0)
  expect(output).toHaveTextContent('123456789012345')
})
