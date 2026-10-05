# Findings

## Result sometimes belongs to another currency

**Symptom:** Rapid amount/currency changes can display an older response as the
current result. Memory can also save a result that does not match the input.

**Cause:** Concurrent quote requests all wrote into the same state without
cancellation or checking which input produced the response. The previous result
remained available while another request was pending.

**Fix:** `useQuote` cancels superseded requests and ignores their completions.
Every input change, history load, and explicit refresh has a request revision;
only a response with the current key can be displayed or saved. API validation
also checks the returned amount and currencies against the request. Loading and
error states have no usable result. Expired quotes remain visible with their
update time but must be refreshed before saving.

## Loading history changes the amount

**Symptom:** Loading a saved `1,000` converts `1` instead of `1000`.

**Cause:** History stored formatted values and `parseFloat('1,000')` stops at the
comma. Formatting and calculation data were mixed.

**Fix:** History stores the canonical input string and numeric result; formatting
happens at display time. Initial records use canonical amounts too. The amount
parser also handles correctly grouped legacy values and rejects malformed input.
Tests cover grouped amounts and loading the full raw amount from history.

## Keypad actions become inconsistent after switching tabs

**Symptom:** Saving or deleting can use old currencies, results, selection, or
history length; repeated tab changes can trigger more than one action per click.

**Cause:** A DOM listener captured stale render state, used element text to decide
the action, and was never removed when the effect ran again.

**Fix:** Buttons dispatch typed actions through React callbacks. A reducer handles
input/history transitions from current state. Nested SVG clicks work like clicks
on the button itself, covered by a component test.

## History rows or selection become incorrect after deletion

**Symptom:** Rows can retain an old label, or deletion/navigation can leave an
invalid selection, particularly on an empty list.

**Cause:** Array-index keys and labels copied into local state preserved stale
row content. Selection used an index without maintaining validity after changes.

**Fix:** Stable record IDs, labels derived from props, and selection stored by ID.
Deletion selects the next available neighbor; clearing removes selection and
disables selection actions. Navigation is clamped. Selection scrolls into view;
rows also support direct selection and standard listbox keyboard navigation.

## Existing tests hid a rounding problem

**Symptom:** The old suite passed while replacing the conversion implementation
with a mock; formatting `250 × 1.0843` could produce `271.07`.

**Cause:** A mocked conversion bypassed the actual calculation, and `toFixed(2)`
exposed the binary floating-point representation at this rounding boundary.

**Fix:** Test the real functions and use `Intl.NumberFormat` for display rounding
(`271.08`), grouping, and omission of unnecessary trailing zeroes. Numeric
calculations remain JavaScript numbers, appropriate for this quote calculator;
it is not an accounting ledger. Keypad input is capped at 15 digits.

## Failed requests left loading or stale content

**Symptom:** Errors only reached the console, and quote failures could leave the
screen loading indefinitely or showing the previous conversion.

**Cause:** Loading was reset only on success, with no user-visible recovery.
Quotes also started before the supported currency list was available.

**Fix:** Explicit loading, ready, and error states; quotes start after currency
loading. Failed currency loading and quotes can be retried with refresh. The real
API returned HTTP 429 during verification, so that case has a clear wait-and-retry
message. Invalid response shapes are rejected before use. The candidate ID and
existing proxy configuration are preserved.

## UI and accessibility

**Symptom:** The starter used unstyled markup and had little accessible context.

**Fix:** Responsive calculator based on the supplied screenshot, colocated CSS
Modules, shared design tokens, labelled native selects and buttons, selected and
disabled states, focus indicators, visible errors, and empty history guidance.
The two pictured screens are implemented as tabs of one calculator. History uses
the original varied seed data; sample rates from the screenshot are not hardcoded.
Small tab text and backspace colors are slightly darker for legibility. The home
indicator is decorative and hidden from assistive technology.

## Large numbers did not fit the exchange rows

**Symptom:** Long amounts and grouped results could be cut off at the row edge.

**Fix:** A shared `AmountDisplay` measures text at its maximum size and fits each
value independently between 36px and 18px. It observes container resizing and
restores the larger size for short values. Values beyond the minimum-size limit
remain fully available through horizontal scrolling and the accessible text/title;
input scrolls to the newest digit. Overflowing outputs are keyboard focusable.
Sizing uses a tested utility, and component tests supply layout measurements
because jsdom has no layout engine. Browser checks verify actual text fitting,
responsive width changes, and scrolling.

## Verification and scope

- Automated tests cover real money/input/time utilities, reducer transitions,
  response validation, component interactions, and complete quote flows. React
  tests use jsdom. App integration tests use a controlled fetch stub to complete
  requests in any order, including after cancellation. No mocking library was
  added, and the real app, hooks, and API validation remain under test.
- Lint, TypeScript checking, production build, and the complete test suite run
  locally. Browser checks use the actual configured API for entering, converting,
  saving, restoring, navigating, deleting, and clearing history.
- Deterministic regression tests cover stale successes and failures, recovery
  from HTTP 429/500 and network failures, blocked saving while a new amount is
  pending, and returning to a previously quoted amount. In a temporary copy,
  removing response guards, request-key matching, or refresh revisions made the
  corresponding tests fail. Expiry timing remains outside automated coverage.
- History stays in memory as required. Amount changes, currency changes, and
  explicit refresh request quotes immediately, without debounce or an automatic
  retry loop. Pending requests cannot display or save a previous quote.
