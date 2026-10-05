import { describe, expect, it } from 'vitest'
import { formatElapsed } from './time'

describe('formatElapsed', () => {
  const time = Date.parse('2026-10-05T10:00:00Z')
  it('handles a fresh quote and server clock skew', () => {
    expect(formatElapsed(time, time + 1000)).toBe('just now')
    expect(formatElapsed(time, time - 1000)).toBe('just now')
  })
  it('shows elapsed minutes and hours', () => {
    expect(formatElapsed(time, time + 120000)).toBe('2 min ago')
    expect(formatElapsed(time, time + 7200000)).toBe('2 hr ago')
  })
})
