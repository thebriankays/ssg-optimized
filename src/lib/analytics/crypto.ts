// lib/analytics/crypto.ts
import { v4, v5 } from 'uuid'

const simpleHash = (str: string): string => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash.toString()
}

export const secret = (): string => process.env.APP_SECRET || 'default_secret'

export const salt = (): string => simpleHash(secret())

export const visitSalt = (): string => simpleHash(secret())

export const uuid = (...args: string[]): string =>
  args.length === 0 ? v4() : v5(args.join(''), v5.DNS)
