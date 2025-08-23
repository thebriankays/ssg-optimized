import { formatDate } from './date'
import { formatLongNumber } from './format'

interface ChartValue {
  value: string | number | Date
}

export function renderNumberLabels(label: string) {
  return +label > 1000 ? formatLongNumber(+label) : label
}

export function renderDateLabels(unit: string) {
  return (label: string, index: number, values: ChartValue[]) => {
    // Check if the value exists at the given index
    if (!values[index]?.value) {
      return label
    }

    const d = new Date(values[index].value)

    switch (unit) {
      case 'minute':
        return formatDate(d, 'h:mm')
      case 'hour':
        return formatDate(d, 'p')
      case 'day':
        return formatDate(d, 'MMM d')
      case 'month':
        return formatDate(d, 'MMM')
      case 'year':
        return formatDate(d, 'YYY')
      default:
        return label
    }
  }
}
