# Findings

## Wrong currency result

- **Problem:** Changing the amount or currency quickly could show or save an older result.
- **Cause:** Requests completed out of order and all updated the same state.
- **Fix:** Cancel old requests and ignore outdated responses. Only a quote matching the current
  input can be displayed or saved; expired quotes cannot be saved.

## Wrong amount when loading history

- **Problem:** A saved `1,000` could load as `1`.
- **Cause:** History stored formatted text, and `parseFloat('1,000')` returns `1`.
- **Fix:** Store the raw amount and format it only for display. Loading restores the full amount and
  both currencies.

## Inconsistent keypad actions

- **Problem:** After switching tabs, actions could use old state or run more than once.
- **Cause:** DOM listeners kept old values and were not cleaned up.
- **Fix:** Use typed React callbacks and a reducer for calculator/history actions.

## Incorrect history rows and selection

- **Problem:** Deleting records could leave stale labels or an invalid selection.
- **Cause:** Rows used array-index keys and copied labels into local state.
- **Fix:** Use stable record IDs and labels from current props. Deletion selects a nearby record;
  clearing disables selection controls. Rows support keyboard navigation.

## Incorrect rounding

- **Problem:** Some conversions rounded down incorrectly, and mocked calculations hid the bug.
- **Cause:** JavaScript floating-point multiplication can turn `0.18 × 1.25` into
  `0.22499999999999998`, which then displays as `0.22`.
- **Fix:** Use `decimal.js` and round half-up to two decimal places. Tests use the real calculation
  and check that the displayed and saved results agree.

## Poor request-failure handling

- **Problem:** Failed requests could leave a loading state or an old result on screen.
- **Cause:** Loading was cleared only on success, and errors were not shown to users.
- **Fix:** Show loading/error states and allow retry with refresh. Wait for the currency list before
  requesting quotes, validate responses, and block saving on failure.

## Missing styling and accessible controls

- **Problem:** The starter did not match the design and controls lacked accessible context.
- **Cause:** The UI used mostly unstyled markup.
- **Fix:** Add a responsive layout, shared style tokens, labelled controls, keyboard support, focus
  indicators, and clear disabled/error/empty states.

## Large values were cut off

- **Problem:** Long amounts and results did not fit the exchange rows.
- **Cause:** A fixed font size could exceed the available space.
- **Fix:** Measure and shrink each value from 36px to 18px. If it still does not fit, allow
  horizontal scrolling and keep the full value accessible.

## CI failed because of the live API

- **Problem:** Browser tests failed on HTTP 429 or 500 even when the app handled the error
  correctly.
- **Cause:** CI depended on the remote service's availability and rate limits.
- **Fix:** Supply controlled HTTP responses for CI browser tests. Keep the real app under test and
  use `test:e2e:live` for a separate live-service check.

## Unchecked array access and unclear status logic

- **Problem:** Missing array items could go unnoticed by TypeScript, and status messages were hard
  to follow.
- **Cause:** Strict mode alone allowed unchecked array access; status logic used nested conditions.
- **Fix:** Enable `noUncheckedIndexedAccess`, handle missing entries, and use early returns.

## Same currency on both sides

- **Current behavior:** Both selects allow the same currency, such as USD → USD.
- **Decision:** Left unchanged because the assignment does not prohibit it and a same-currency
  conversion is mathematically valid.
- **Possible improvement:** Selecting the other side's currency could swap the pair, keeping the
  entered amount and requesting a fresh quote.

## Remaining limits

- The live service has returned HTTP 429 and 500 during checks. Refresh lets users retry, but
  service availability cannot be fixed in the frontend.
- Input is limited to 15 digits. API amounts and saved results remain JavaScript numbers, so
  extremely large values can still lose precision.
