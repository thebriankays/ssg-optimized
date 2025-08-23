import { UAParser } from 'ua-parser-js'
import { getClientLocationCached } from './geoip'
import { headers } from 'next/headers'

interface ClientInfo {
  sessionId: string
  userAgent?: string
  browser?: string
  os?: string
  device?: string
  ip?: string
  country?: string
  region?: string
  city?: string
}

interface EventPayload {
  sessionId: string
  [key: string]: unknown
}

export async function getClientInfo(
  headersList: ReturnType<typeof headers>,
  eventPayload: EventPayload,
): Promise<ClientInfo> {
  const headers = await headersList
  const userAgent = headers.get('user-agent')
  const forwardedFor = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const ip = forwardedFor ? forwardedFor.split(',')[0] : realIp || undefined

  const parser = new UAParser(userAgent || '')
  const browser = parser.getBrowser()
  const os = parser.getOS()
  const device = parser.getDevice()

  // Get geolocation data if IP is available
  const geoData = ip ? await getClientLocationCached(ip) : null

  return {
    sessionId: eventPayload.sessionId,
    userAgent: userAgent || undefined,
    browser: browser.name,
    os: os.name,
    device: device.type || 'desktop',
    ip,
    ...(geoData || {}),
  }
}
