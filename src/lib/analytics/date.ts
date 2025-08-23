import {
  addMinutes,
  addHours,
  addDays,
  addMonths,
  addYears,
  subMinutes,
  subHours,
  subDays,
  subMonths,
  subYears,
  startOfMinute,
  startOfHour,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfHour,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  differenceInMinutes,
  differenceInHours,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  differenceInCalendarMonths,
  differenceInCalendarYears,
  format,
  max,
  min,
  isDate,
  addWeeks,
  subWeeks,
  endOfMinute,
} from 'date-fns'
import type { DateRange } from './types'

export const TIME_UNIT = {
  minute: 'minute',
  hour: 'hour',
  day: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
} as const

export type TimeUnit = (typeof TIME_UNIT)[keyof typeof TIME_UNIT]

interface DateFunctions {
  diff: (dateLeft: Date | number, dateRight: Date | number) => number
  add: (date: Date | number, amount: number) => Date
  sub: (date: Date | number, amount: number) => Date
  start: (date: Date | number) => Date
  end: (date: Date | number) => Date
}

const DATE_FUNCTIONS: Record<TimeUnit, DateFunctions> = {
  minute: {
    diff: differenceInMinutes,
    add: addMinutes,
    sub: subMinutes,
    start: startOfMinute,
    end: endOfMinute,
  },
  hour: {
    diff: differenceInHours,
    add: addHours,
    sub: subHours,
    start: startOfHour,
    end: endOfHour,
  },
  day: {
    diff: differenceInCalendarDays,
    add: addDays,
    sub: subDays,
    start: startOfDay,
    end: endOfDay,
  },
  week: {
    diff: differenceInCalendarWeeks,
    add: addWeeks,
    sub: subWeeks,
    start: startOfWeek,
    end: endOfWeek,
  },
  month: {
    diff: differenceInCalendarMonths,
    add: addMonths,
    sub: subMonths,
    start: startOfMonth,
    end: endOfMonth,
  },
  year: {
    diff: differenceInCalendarYears,
    add: addYears,
    sub: subYears,
    start: startOfYear,
    end: endOfYear,
  },
}

export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

export function getTimezone(): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return timeZone || 'UTC'
}

export function parseDateValue(
  value: string,
): { num: number; unit: 'hour' | 'day' | 'week' | 'month' | 'year' } | null {
  const match = value.match(/^(?<num>[0-9]+)(?<unit>hour|day|week|month|year)$/)
  if (!match?.groups) return null

  const groups = match.groups as { num: string; unit: 'hour' | 'day' | 'week' | 'month' | 'year' }
  return { num: Number(groups.num), unit: groups.unit }
}

export const parseDateRange = (value: string | object): DateRange => {
  if (typeof value === 'object') return value as DateRange
  if (value === 'all') return { startDate: new Date(0), endDate: new Date(1), value }
  if (value.startsWith('range')) {
    const parts = value.split(':')
    if (parts.length < 3) throw new Error('Invalid range format')
    const [, startTime, endTime] = parts
    const startDate = new Date(Number(startTime))
    const endDate = new Date(Number(endTime))
    const parsed = parseDateValue(value) || { num: 1, unit: 'day' }
    return {
      startDate,
      endDate,
      value,
      num: parsed.num,
      unit: getMinimumUnit(startDate, endDate),
      offset: 0,
    }
  }

  const now = new Date()
  const parsed = parseDateValue(value)
  if (!parsed) throw new Error('Invalid date range format')
  const { num, unit } = parsed

  switch (unit) {
    case 'hour':
      return {
        startDate: num ? subHours(startOfHour(now), num - 1) : startOfHour(now),
        endDate: endOfHour(now),
        offset: 0,
        num: num || 1,
        unit: 'hour',
        value,
      }
    case 'day':
      return {
        startDate: num ? subDays(startOfDay(now), num - 1) : startOfDay(now),
        endDate: endOfDay(now),
        unit: 'day',
        offset: 0,
        num: num || 1,
        value,
      }
    case 'week':
      return {
        startDate: num ? subWeeks(startOfWeek(now), num - 1) : startOfWeek(now),
        endDate: endOfWeek(now),
        unit: 'day',
        offset: 0,
        num: num || 1,
        value,
      }
    case 'month':
      return {
        startDate: num ? subMonths(startOfMonth(now), num - 1) : startOfMonth(now),
        endDate: endOfMonth(now),
        unit: 'day',
        offset: 0,
        num: num || 1,
        value,
      }
    case 'year':
      return {
        startDate: num ? subYears(startOfYear(now), num - 1) : startOfYear(now),
        endDate: endOfYear(now),
        unit: 'month',
        offset: 0,
        num: num || 1,
        value,
      }
    default:
      throw new Error('Unsupported unit')
  }
}

export const getMinimumUnit = (startDate: number | Date, endDate: number | Date): TimeUnit => {
  if (differenceInMinutes(endDate, startDate) <= 60) return 'minute'
  else if (differenceInHours(endDate, startDate) <= 48) return 'hour'
  else if (differenceInCalendarMonths(endDate, startDate) <= 6) return 'day'
  else if (differenceInCalendarMonths(endDate, startDate) <= 24) return 'month'
  return 'year'
}

export const getOffsetDateRange = (dateRange: DateRange, increment: number): DateRange => {
  const { startDate, endDate, unit = 'day', num = 1, offset = 0 } = dateRange
  const change = num * increment

  if (!unit || !(unit in DATE_FUNCTIONS)) {
    throw new Error(`Unsupported unit: ${unit}`)
  }

  const func = DATE_FUNCTIONS[unit as TimeUnit]
  const newStart = func.add(startDate, change)
  const newEnd = func.add(endDate, change)

  return {
    ...dateRange,
    startDate: newStart,
    endDate: newEnd,
    offset: offset + increment,
  }
}

export const getAllowedUnits = (startDate: Date, endDate: Date): TimeUnit[] => {
  const units: TimeUnit[] = ['minute', 'hour', 'day', 'month', 'year']
  const minUnit = getMinimumUnit(startDate, endDate)
  const index = units.indexOf(minUnit === 'year' ? 'month' : minUnit)
  return index >= 0 ? units.slice(index) : []
}

export const getDateArray = (
  data: Array<{ x: unknown; y: number }>,
  startDate: Date,
  endDate: Date,
  unit: keyof typeof DATE_FUNCTIONS,
): Array<{ x: Date; y: number }> => {
  const arr: Array<{ x: Date; y: number }> = []
  const func = DATE_FUNCTIONS[unit]
  const n = func.diff(endDate, startDate)
  for (let i = 0; i <= n; i++) {
    const t = func.start(func.add(startDate, i))
    const found = data.find(({ x }) => func.start(new Date(String(x))).getTime() === t.getTime())
    const y = found ? found.y : 0
    arr.push({ x: t, y })
  }
  return arr
}

export const formatDate = (date: string | number | Date, formatStr: string): string => {
  return format(typeof date === 'string' ? new Date(date) : date, formatStr)
}

export const maxDate = (...args: Date[]): Date => {
  return max(args.filter((n) => isDate(n)))
}

export const minDate = (...args: Date[]): Date => {
  return min(args.filter((n) => isDate(n)))
}

export const getLocalTime = (t: string | number | Date): Date => {
  return addMinutes(new Date(t), new Date().getTimezoneOffset())
}

export const getDateLength = (
  startDate: Date,
  endDate: Date,
  unit: keyof typeof DATE_FUNCTIONS,
): number => {
  const func = DATE_FUNCTIONS[unit]
  return func.diff(endDate, startDate) + 1
}

export const getCompareDate = (
  compare: string,
  startDate: Date,
  endDate: Date,
): { startDate: Date; endDate: Date } => {
  if (compare === 'yoy') {
    return { startDate: subYears(startDate, 1), endDate: subYears(endDate, 1) }
  }
  const diffVal = differenceInMinutes(endDate, startDate)
  return { startDate: subMinutes(startDate, diffVal), endDate: subMinutes(endDate, diffVal) }
}
