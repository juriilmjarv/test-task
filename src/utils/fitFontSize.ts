export function fitFontSize(
  availableWidth: number,
  textWidth: number,
  minFontSize: number,
  maxFontSize: number,
): number {
  if (textWidth <= availableWidth || textWidth <= 0) return maxFontSize
  return Math.max(minFontSize, Math.floor(((maxFontSize * availableWidth) / textWidth) * 10) / 10)
}
