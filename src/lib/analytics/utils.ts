import { NextRequest } from 'next/server'
import { UAParser } from 'ua-parser-js'

// Constants moved from lib/constants
const DESKTOP_OS = ['Windows', 'Mac OS', 'Linux', 'Chrome OS']
const MOBILE_OS = ['Android', 'iOS']
const DESKTOP_SCREEN_WIDTH = 1920
const LAPTOP_SCREEN_WIDTH = 1024
const MOBILE_SCREEN_WIDTH = 479

export function getClientIP(req: NextRequest): string | undefined {
  const forwardedFor = req.headers.get('x-forwarded-for')

  if (forwardedFor) {
    const ips = forwardedFor.split(',')
    return ips[0]?.trim()
  }

  return req.headers.get('x-real-ip') || undefined
}

export function getDevice(screen: string, os: string) {
  if (!screen) return 'unknown'

  const [width = '0'] = screen.split('x')
  const numWidth = parseInt(width, 10)

  if (DESKTOP_OS.includes(os)) {
    if (os === 'Chrome OS' || numWidth < DESKTOP_SCREEN_WIDTH) {
      return 'laptop'
    }
    return 'desktop'
  }

  if (MOBILE_OS.includes(os)) {
    if (os === 'Amazon OS' || numWidth > MOBILE_SCREEN_WIDTH) {
      return 'tablet'
    }
    return 'mobile'
  }

  if (numWidth >= DESKTOP_SCREEN_WIDTH) {
    return 'desktop'
  } else if (numWidth >= LAPTOP_SCREEN_WIDTH) {
    return 'laptop'
  } else if (numWidth >= MOBILE_SCREEN_WIDTH) {
    return 'tablet'
  }

  return 'mobile'
}

export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent)

  return {
    browser: parser.getBrowser().name,
    os: parser.getOS().name,
    device: parser.getDevice().type || 'desktop',
  }
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function cleanURL(url: string): string {
  try {
    const parsedUrl = new URL(url)
    return parsedUrl.pathname + parsedUrl.search
  } catch (_error) {
    return url
  }
}

export function getTimestamp(): number {
  return Math.floor(Date.now() / 1000)
}
