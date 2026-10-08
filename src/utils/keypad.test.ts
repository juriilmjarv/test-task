import { describe, expect, it } from 'vitest'
import { editAmount } from './keypad'

describe('editAmount', () => {
  it.each([
    ['0', '7', '7'],
    ['0', '00', '0'],
    ['12', '00', '1200'],
    ['0', 'decimal', '0.'],
    ['1.2', 'decimal', '1.2'],
    ['1.20', 'backspace', '1.2'],
    ['7', 'backspace', '0'],
    ['123', 'clear', '0'],
    ['123456789012345', '6', '123456789012345'],
  ] as const)('edits %s with %s into %s', (amount, key, expected) => {
    expect(editAmount(amount, key)).toBe(expected)
  })
})
