// @vitest-environment jsdom
import '../../test/setup'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { HistoryPanel } from './HistoryPanel'

const records = [
  { id: 'a', from: 'USD', to: 'EUR', amount: '1000', result: 1186.5 },
  { id: 'b', from: 'EUR', to: 'GBP', amount: '50', result: 40 },
]

it('updates row labels and selection after a deletion', () => {
  const { rerender } = render(<HistoryPanel records={records} selectedId="a" onSelect={() => {}} />)

  rerender(<HistoryPanel records={[records[1]]} selectedId="b" onSelect={() => {}} />)
  expect(screen.getByTestId('history-item')).toHaveTextContent('EUR 50 → GBP 40')
  expect(screen.getByTestId('history-item')).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByTestId('history-count')).toHaveTextContent('1 record')
})

it('supports direct selection and an empty state', async () => {
  let selected = ''

  const { rerender } = render(
    <HistoryPanel
      records={records}
      selectedId="a"
      onSelect={(id) => {
        selected = id
      }}
    />,
  )

  await userEvent.click(screen.getAllByRole('option')[1])
  expect(selected).toBe('b')
  rerender(<HistoryPanel records={[]} selectedId={null} onSelect={() => {}} />)
  expect(screen.getByText('No saved conversions')).toBeInTheDocument()
  expect(screen.getByTestId('history-count')).toHaveTextContent('0 records')
})

it('supports keyboard selection with a single tab stop', async () => {
  let selected = ''

  render(
    <HistoryPanel
      records={records}
      selectedId="a"
      onSelect={(id) => {
        selected = id
      }}
    />,
  )

  const options = screen.getAllByRole('option')

  expect(options[0]).toHaveAttribute('tabindex', '0')
  expect(options[1]).toHaveAttribute('tabindex', '-1')
  options[0].focus()
  await userEvent.keyboard('{ArrowDown}')
  expect(selected).toBe('b')
  expect(options[1]).toHaveFocus()
})
