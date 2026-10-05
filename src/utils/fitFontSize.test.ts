import { describe, expect, it } from 'vitest'
import { fitFontSize } from './fitFontSize'

describe('fitFontSize', () => {
  it.each([
    [300, 200, 36],
    [150, 200, 27],
    [100, 200, 18],
    [50, 200, 18],
    [100, 0, 36],
  ])(
    'fits a %spx space and %spx text without exceeding the readable bounds',
    (available, text, expected) => {
      expect(fitFontSize(available, text, 18, 36)).toBe(expected)
    },
  )
})
