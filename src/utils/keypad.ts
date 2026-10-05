import type { InputKey } from '../types/exchange'

export function editAmount(amount: string, key: InputKey): string {
  if (key === 'clear') return '0'

  if (key === 'backspace') return amount.length > 1 ? amount.slice(0, -1) : '0'

  if (key === 'decimal') return amount.includes('.') ? amount : `${amount}.`

  const next = amount === '0' ? String(Number(key)) : amount + key

  return next.replace('.', '').length <= 15 ? next : amount
}
