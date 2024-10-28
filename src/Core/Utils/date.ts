/*
 * All the dates on the backend are in UTC
 *
 */

export type DatePrecision = 'day' | 'hour' | 'minute' | 'second' | 'millisecond'

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

function format(date: Date, formatStr: string): string {
  const year = date.getFullYear()
  const month = ('0' + (date.getMonth() + 1)).slice(-2)
  const day = ('0' + date.getDate()).slice(-2)
  const hours = ('0' + date.getHours()).slice(-2)
  const minutes = ('0' + date.getMinutes()).slice(-2)
  const seconds = ('0' + date.getSeconds()).slice(-2)

  return formatStr
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
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
  format,
}
