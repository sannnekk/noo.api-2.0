export function round(value: number, precision = 0): number {
  const multiplier = Math.pow(10, precision)
  return Math.round(value * multiplier) / multiplier
}
