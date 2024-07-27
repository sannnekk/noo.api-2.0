/*
 * All the dates on the backend are in UTC
 *
 */

type DatePrecision = 'day' | 'hour' | 'minute' | 'second' | 'millisecond'

function toISOString(date: Date): string {
  return date.toISOString()
}

function fromISOString(date: string): Date {
  return new Date(date)
}

function isISOString(dateStr: string): boolean {
  return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateStr)
}

function compare(a: Date, b: Date, precision: DatePrecision = 'day'): number {
  const aCopy = new Date(a)
  const bCopy = new Date(b)

  if (precision === 'day') {
    aCopy.setHours(0, 0, 0, 0)
    bCopy.setHours(0, 0, 0, 0)
  } else if (precision === 'hour') {
    aCopy.setMinutes(0, 0, 0)
    bCopy.setMinutes(0, 0, 0)
  } else if (precision === 'minute') {
    aCopy.setSeconds(0, 0)
    bCopy.setSeconds(0, 0)
  } else if (precision === 'second') {
    aCopy.setMilliseconds(0)
    bCopy.setMilliseconds(0)
  }

  return aCopy.getTime() - bCopy.getTime()
}

function isInFuture(date: Date, precision: DatePrecision = 'day'): boolean {
  return compare(date, new Date(), precision) > 0
}

function isInPast(date: Date, precision: DatePrecision = 'day'): boolean {
  return compare(date, new Date(), precision) < 0
}

function isInLast(date: Date, ms: number): boolean {
  return compare(new Date(), date, 'millisecond') < ms
}

function now(): Date {
  return new Date()
}

function addDays(date: Date, days: number): Date {
  date.setDate(date.getDate() + days)
  return date
}

export default {
  toISOString,
  fromISOString,
  isISOString,
  compare,
  isInFuture,
  isInPast,
  now,
  addDays,
  isInLast,
}
