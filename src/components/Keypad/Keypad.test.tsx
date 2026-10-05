// @vitest-environment jsdom
import '../../test/setup'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'
import { Keypad } from './Keypad'
import type { KeypadAction } from '../../types/exchange'

it('dispatches a single action when clicking a nested backspace icon', async () => {
  const actions: KeypadAction[] = []
  render(<Keypad tab="exchange" onAction={(action) => actions.push(action)} canSave hasSelection />)
  await userEvent.click(screen.getByTestId('key-backspace').querySelector('svg')!)
  expect(actions).toEqual(['backspace'])
})
it('disables numeric input and memory in history, but allows navigation', async () => {
  const actions: KeypadAction[] = []
  render(
    <Keypad
      tab="history"
      onAction={(action) => actions.push(action)}
      canSave={false}
      hasSelection
    />,
  )
  expect(screen.getByTestId('key-7')).toBeDisabled()
  expect(screen.getByTestId('key-save')).toBeDisabled()
  await userEvent.click(screen.getByTestId('key-down'))
  await userEvent.click(screen.getByTestId('key-ok'))
  expect(actions).toEqual(['down', 'load'])
})
it('disables selection actions when history is empty', () => {
  render(<Keypad tab="history" onAction={() => {}} canSave={false} hasSelection={false} />)
  for (const key of ['backspace', 'up', 'down', 'ok'])
    expect(screen.getByTestId(`key-${key}`)).toBeDisabled()
})
