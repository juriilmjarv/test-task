export function getItem<T>(items: readonly T[], index: number): T {
  const item = items[index]

  if (item === undefined) throw new Error(`Missing test item at index ${index}`)

  return item
}
