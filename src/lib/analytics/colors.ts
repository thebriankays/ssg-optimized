// lib/analytics/colors.ts
import crypto from 'crypto'

const md5 = (str: string): string => crypto.createHash('md5').update(str).digest('hex')

export const hex2RGB = (color: string, min = 0, max = 255) => {
  const c = color.replace(/^#/, '')
  const diff = max - min
  const normalize = (num: number) => Math.floor((num / 255) * diff + min)
  const r = normalize(parseInt(c.substring(0, 2), 16))
  const g = normalize(parseInt(c.substring(2, 4), 16))
  const b = normalize(parseInt(c.substring(4, 6), 16))
  return { r, g, b }
}

export const rgb2Hex = (r: number, g: number, b: number, prefix = '#') =>
  `${prefix}${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`

export const getPastel = (color: string, factor = 0.5, prefix = '#') => {
  let { r, g, b } = hex2RGB(color)
  r = Math.floor((r + 255 * factor) / (1 + factor))
  g = Math.floor((g + 255 * factor) / (1 + factor))
  b = Math.floor((b + 255 * factor) / (1 + factor))
  return rgb2Hex(r, g, b, prefix)
}

export const getColor = (seed: string, min = 0, max = 255) => {
  const color = md5(seed).substring(0, 6)
  const { r, g, b } = hex2RGB(color, min, max)
  return rgb2Hex(r, g, b)
}
