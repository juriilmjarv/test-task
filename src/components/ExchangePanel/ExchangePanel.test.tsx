// @vitest-environment jsdom
import '../../test/setup'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { ExchangePanel } from './ExchangePanel'

it('shows an actionable error and lets the user retry', async () => {
  let retries = 0
  render(
    <ExchangePanel
      from="USD"
      to="EUR"
      amount="1000"
      result={null}
      currencies={['USD', 'EUR']}
      status="error"
      message="Too many requests. Wait a moment, then refresh."
      onCurrencyChange={() => {}}
      onRefresh={() => {
        retries++
      }}
    />,
  )
  expect(screen.getByRole('alert')).toHaveTextContent('Too many requests')
  expect(screen.getByTestId('result')).toHaveTextContent('—')
  await userEvent.click(screen.getByTestId('refresh'))
  expect(retries).toBe(1)
})
