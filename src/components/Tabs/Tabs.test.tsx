// @vitest-environment jsdom
import '../../test/setup'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { Tabs } from './Tabs'

it('announces the active view and requests a tab change', async () => {
  let selected = ''
  render(
    <Tabs
      active="exchange"
      onChange={(tab) => {
        selected = tab
      }}
    />,
  )
  expect(screen.getByTestId('tab-exchange')).toHaveAttribute('aria-pressed', 'true')
  await userEvent.click(screen.getByTestId('tab-history'))
  expect(selected).toBe('history')
})
