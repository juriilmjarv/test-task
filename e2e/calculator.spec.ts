import { expect, test } from './fixtures'

test('converts, saves, restores history and resets it after a page reload', async ({
  page,
}, testInfo) => {
  await page.goto('/')
  await expect(page.getByLabel('From currency')).toBeEnabled()

  for (const key of ['1', '00', '0']) await page.getByTestId(`key-${key}`).click()

  await expect(page.getByTestId('amount')).toHaveText('1000')
  await page.getByLabel('From currency').selectOption('GBP')
  await expect(page.getByTestId('key-save')).toBeEnabled()
  await expect(page.getByTestId('updated-at')).toContainText('Last updated')
  const result = await page.getByTestId('result').innerText()

  expect(result).toMatch(/^\d[\d,]*(?:\.\d{1,2})?$/)

  if (!testInfo.config.metadata.liveApi) expect(result).toBe('1,170')

  await page.getByTestId('key-save').click()
  await page.getByTestId('tab-history').click()
  await expect(page.getByTestId('history-count')).toHaveText('8 records')
  await expect(page.getByTestId('history-item').last()).toHaveText(`GBP 1000 → EUR ${result}`)
  await expect(page.getByTestId('history-item').last()).toHaveAttribute('aria-selected', 'true')

  await page.getByTestId('history-item').first().click()
  await page.getByTestId('key-ok').click()
  await expect(page.getByTestId('tab-exchange')).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByLabel('From currency')).toHaveValue('USD')
  await expect(page.getByLabel('To currency')).toHaveValue('EUR')
  await expect(page.getByTestId('amount')).toHaveText('1000')
  await expect(page.getByTestId('key-save')).toBeEnabled()

  if (!testInfo.config.metadata.liveApi) {
    await expect(page.getByTestId('result')).toHaveText('922.25')
  }

  await page.reload()
  await page.getByTestId('tab-history').click()
  await expect(page.getByTestId('history-count')).toHaveText('7 records')
})

test('navigates history with the keyboard, deletes a record and clears the list', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByTestId('tab-history').click()
  const records = page.getByRole('option')

  await expect(page.getByTestId('history-count')).toHaveText('7 records')
  await expect(page.getByTestId('key-1')).toBeDisabled()
  await records.first().focus()
  await page.keyboard.press('ArrowDown')
  await expect(records.nth(1)).toBeFocused()
  await expect(records.nth(1)).toHaveAttribute('aria-selected', 'true')

  await page.getByTestId('key-backspace').click()
  await expect(page.getByTestId('history-count')).toHaveText('6 records')
  await expect(records).toHaveCount(6)
  await expect(records.filter({ hasText: 'EUR 500 → USD 542.15' })).toHaveCount(0)
  await expect(records.nth(1)).toHaveAttribute('aria-selected', 'true')

  await page.getByTestId('key-clear').click()
  await expect(page.getByTestId('history-count')).toHaveText('0 records')
  await expect(page.getByText('No saved conversions', { exact: false })).toBeVisible()
  await expect(records).toHaveCount(0)

  for (const key of ['backspace', 'up', 'down', 'ok']) {
    await expect(page.getByTestId(`key-${key}`)).toBeDisabled()
  }
})
