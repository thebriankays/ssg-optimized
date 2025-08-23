import { NextApiRequest } from 'next'
import * as yup from 'yup'
import { TIME_UNIT } from './date'
import { Dispatch, SetStateAction } from 'react'
import {
  COLLECTION_TYPE,
  DATA_TYPE,
  EVENT_TYPE,
  KAFKA_TOPIC,
  PERMISSIONS,
  REPORT_TYPES,
  ROLES,
} from './constants'

type ObjectValues<T> = T[keyof T]

// Base type exports
export type TimeUnit = ObjectValues<typeof TIME_UNIT>
export type Permission = ObjectValues<typeof PERMISSIONS>
export type CollectionType = ObjectValues<typeof COLLECTION_TYPE>
export type Role = ObjectValues<typeof ROLES>
export type EventType = ObjectValues<typeof EVENT_TYPE>
export type DynamicDataType = ObjectValues<typeof DATA_TYPE>
export type KafkaTopic = ObjectValues<typeof KAFKA_TOPIC>
export type ReportType = ObjectValues<typeof REPORT_TYPES>

// Generic types for pagination and querying
export interface PageParams {
  query?: string
  page?: number
  pageSize?: number
  orderBy?: string
  sortDescending?: boolean
}

export interface PageResult<T> {
  data: T
  count: number
  page: number
  pageSize: number
  orderBy?: string
  sortDescending?: boolean
}

export interface PagedQueryResult<T> {
  result: PageResult<T>
  query: unknown
  params: PageParams
  setParams: Dispatch<SetStateAction<T | PageParams>>
}

// Data and authentication types
export interface DynamicData {
  [key: string]: number | string | number[] | string[]
}

export interface Auth {
  user?: {
    id: string
    username: string
    role: string
    isAdmin: boolean
  }
  grant?: Permission[]
  shareToken?: {
    websiteId: string
  }
}

// Yup type definition
interface YupObject {
  [key: string]: unknown
}

export interface YupRequest {
  GET?: yup.ObjectSchema<YupObject>
  POST?: yup.ObjectSchema<YupObject>
  PUT?: yup.ObjectSchema<YupObject>
  DELETE?: yup.ObjectSchema<YupObject>
}

export interface NextApiRequestQueryBody<TQuery = unknown, TBody = unknown> extends NextApiRequest {
  auth?: Auth
  query: TQuery & { [key: string]: string | string[] }
  body: TBody
  headers: Record<string, string | string[] | undefined>
  yup: YupRequest
}

export interface NextApiRequestAuth extends NextApiRequest {
  auth?: Auth
  headers: Record<string, string | string[] | undefined>
}

// Core data models
export interface User {
  id: string
  username: string
  password?: string
  role: string
  createdAt?: Date
}

export interface Website {
  id: string
  userId: string
  resetAt: Date
  name: string
  domain: string
  shareId: string
  createdAt: Date
}

export interface Share {
  id: string
  token: string
}

// Website analytics interfaces
export interface WebsiteActive {
  x: number
}

export interface WebsiteMetric {
  x: string
  y: number
}

export interface WebsiteEventMetric {
  x: string
  t: string
  y: number
}

export interface WebsiteEventData {
  eventName?: string
  propertyName: string
  dataType: number
  propertyValue?: string
  total: number
}

export interface WebsitePageviews {
  pageviews: {
    t: string
    y: number
  }
  sessions: {
    t: string
    y: number
  }
}

export interface WebsiteStats {
  pageviews: { value: number; prev: number }
  visitors: { value: number; prev: number }
  visits: { value: number; prev: number }
  bounces: { value: number; prev: number }
  totalTime: { value: number; prev: number }
}

export interface DateRange {
  value: string
  startDate: Date
  endDate: Date
  unit?: TimeUnit
  num?: number
  offset?: number
}

export interface QueryFilters {
  startDate?: Date
  endDate?: Date
  timezone?: string
  unit?: string
  eventType?: number
  url?: string
  referrer?: string
  title?: string
  query?: string
  host?: string
  os?: string
  browser?: string
  device?: string
  country?: string
  region?: string
  city?: string
  language?: string
  event?: string
  search?: string
  tag?: string
}

export interface QueryOptions {
  joinSession?: boolean
  columns?: Record<string, string>
  limit?: number
}

export interface RealtimeData {
  countries: Record<string, number>
  events: WebsiteEventData[]
  pageviews: WebsitePageviews[]
  referrers: Record<string, number>
  timestamp: number
  series: {
    views: WebsiteMetric[]
    visitors: WebsiteMetric[]
  }
  totals: {
    views: number
    visitors: number
    events: number
    countries: number
  }
  urls: Record<string, number>
  visitors: WebsiteActive[]
}

export interface SessionData {
  id: string
  websiteId: string
  visitId: string
  hostname: string
  browser: string
  os: string
  device: string
  screen: string
  language: string
  country: string
  subdivision1: string
  subdivision2: string
  city: string
}

// Auth module types
export type GetAuthTokenFn = (req: NextApiRequest) => string | null
export type ParseShareTokenFn = (req: NextApiRequest) => unknown
export type SaveAuthFn = (data: Record<string, unknown>, expire?: number) => Promise<string>
export type HasPermissionFn = (role: string, permission: string | string[]) => Promise<boolean>

// Charts module types
export type RenderNumberLabelsFn = (label: string) => string
export type RenderDateLabelsFn = (unit: string, locale: string) => (label: string) => string

// Client module types
export type GetClientAuthTokenFn = () => string | null
export type SetClientAuthTokenFn = (t: string) => void
export type RemoveClientAuthTokenFn = () => void

// Colors module types
export interface RGB {
  r: number
  g: number
  b: number
}

export type Hex2RGBFn = (color: string, min?: number, max?: number) => RGB
export type RGB2HexFn = (r: number, g: number, b: number, prefix?: string) => string
export type GetPastelFn = (color: string, factor?: number, prefix?: string) => string
export type GetColorFn = (seed: string, min?: number, max?: number) => string

// Crypto module types
export type SecretFn = () => string
export type SaltFn = () => string
export type VisitSaltFn = () => string
export type UUIDFn = (...args: string[]) => string

// Data module types
export interface FlattenedData {
  key: string
  value: unknown
  dataType: number
}

export type FlattenJSONFn = (
  eventData: Record<string, unknown>,
  keyValues?: FlattenedData[],
  parentKey?: string,
) => FlattenedData[]

export type GetStringValueFn = (value: string, dataType: number) => string

// Format module types
export type FormatLongNumberFn = (value: number) => string
export type StringToColorFn = (str: string) => string
export type FormatCurrencyFn = (value: number, currency: string, locale?: string) => string

// Lang module types
export interface LanguageInfo {
  label: string
  dateLocale: unknown
  dir?: string
}

export type Languages = Record<string, LanguageInfo>
export type GetDateLocaleFn = (locale: string) => unknown
export type GetTextDirectionFn = (locale: string) => string
