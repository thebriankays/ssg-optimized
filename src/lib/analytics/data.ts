import { DATA_TYPE, DATETIME_REGEX } from './constants'
import type { DynamicDataType } from './types'

interface KeyValue {
  key: string
  value: unknown
  dataType: DynamicDataType
}

interface AccumulatorType {
  keyValues: KeyValue[]
  parentKey: string
}

export function flattenJSON(
  eventData: Record<string, unknown>,
  keyValues: KeyValue[] = [],
  parentKey = '',
): KeyValue[] {
  return Object.keys(eventData).reduce(
    (acc: AccumulatorType, key: string) => {
      const value = eventData[key]
      const type = typeof value
      // nested object
      if (value && type === 'object' && !Array.isArray(value) && !isValidDateValue(value)) {
        flattenJSON(value as Record<string, unknown>, acc.keyValues, getKeyName(key, parentKey))
      } else {
        createKey(getKeyName(key, parentKey), value, acc)
      }
      return acc
    },
    { keyValues, parentKey },
  ).keyValues
}

export function isValidDateValue(value: unknown): boolean {
  return typeof value === 'string' && DATETIME_REGEX.test(value)
}

export function getDataType(value: unknown): string {
  let type: string = typeof value
  if (isValidDateValue(value)) {
    type = 'date'
  }
  return type
}

export function getStringValue(value: string, dataType: DynamicDataType): string {
  if (dataType === DATA_TYPE.number) {
    return parseFloat(value).toFixed(4)
  }
  if (dataType === DATA_TYPE.date) {
    return new Date(value).toISOString()
  }
  return value
}

function createKey(key: string, value: unknown, acc: AccumulatorType): void {
  const type = getDataType(value)
  let dataType: DynamicDataType = DATA_TYPE.string // Default value
  let processedValue: string = String(value)

  switch (type) {
    case 'number':
      dataType = DATA_TYPE.number
      break
    case 'string':
      dataType = DATA_TYPE.string
      break
    case 'boolean':
      dataType = DATA_TYPE.boolean
      processedValue = Boolean(value) ? 'true' : 'false'
      break
    case 'date':
      dataType = DATA_TYPE.date
      break
    case 'object':
      dataType = DATA_TYPE.array
      processedValue = JSON.stringify(value)
      break
  }

  acc.keyValues.push({ key, value: processedValue, dataType })
}

function getKeyName(key: string, parentKey: string): string {
  if (!parentKey) {
    return key
  }
  return `${parentKey}.${key}`
}

export function objectToArray<T>(obj: Record<string, T>): T[] {
  return Object.keys(obj).map((key) => obj[key] as T)
}
