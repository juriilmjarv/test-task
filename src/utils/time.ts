export function formatElapsed(timestamp: number, now: number): string {
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60_000))

  if (minutes === 0) return 'just now'

  if (minutes < 60) return `${minutes} min ago`

  return `${Math.floor(minutes / 60)} hr ago`
}
