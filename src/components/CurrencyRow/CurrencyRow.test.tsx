// @vitest-environment jsdom
import '../../test/setup'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { CurrencyRow } from './CurrencyRow'

it('uses a labelled native select and displays the amount as read-only text', async () => {
  let currency = ''
  render(
    <CurrencyRow
      side="from"
      currency="USD"
      currencies={['USD', 'EUR']}
      value="1000"
      onChange={(value) => {
        currency = value
      }}
    />,
  )
  await userEvent.selectOptions(screen.getByLabelText('From currency'), 'EUR')
  expect(currency).toBe('EUR')
  expect(screen.getByTestId('amount')).toHaveTextContent('1000')
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
})
