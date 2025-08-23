import { getPayload } from 'payload'
import { generateSessionId } from './utils'
import configPromise from '@payload-config'

interface SessionData {
  sessionId?: string
  userAgent?: string
  browser?: string
  os?: string
  device?: string
  screen?: string
  language?: string
  country?: string
  region?: string
  city?: string
  ip?: string
}

export async function getSession(data: SessionData) {
  const payload = await getPayload({ config: configPromise })
  const { sessionId } = data

  // Try to find existing session
  if (sessionId) {
    const existingSession = await payload.find({
      collection: 'analytics-sessions',
      where: {
        sessionId: {
          equals: sessionId,
        },
      },
    })

    if (existingSession.docs.length > 0) {
      return existingSession.docs[0]
    }
  }

  // Create new session
  const session = await payload.create({
    collection: 'analytics-sessions',
    data: {
      sessionId: sessionId || generateSessionId(),
      startTime: new Date().toISOString(),
      browser: data.browser,
      os: data.os,
      device: data.device,
      screen: data.screen,
      language: data.language,
      country: data.country,
      region: data.region,
      city: data.city,
      pageViews: 0,
      events: 0,
    },
  })

  return session
}

export async function updateSession(sessionId: string, data: Partial<SessionData>) {
  const payload = await getPayload({ config: configPromise })

  return payload.update({
    collection: 'analytics-sessions',
    where: {
      sessionId: {
        equals: sessionId,
      },
    },
    data: {
      ...data,
      endTime: new Date().toISOString(),
    },
  })
}

export interface SessionMetricsUpdate {
  endTime: string
  pageViews?: number
  events?: number
}

export async function incrementSessionMetrics(sessionId: string, type: 'pageview' | 'event') {
  const payload = await getPayload({ config: configPromise })

  const session = await payload.findByID({
    collection: 'analytics-sessions',
    id: sessionId,
  })

  if (!session) return

  const update: SessionMetricsUpdate = {
    endTime: new Date().toISOString(),
  }

  if (type === 'pageview') {
    update.pageViews = (session.pageViews || 0) + 1
  } else {
    update.events = (session.events || 0) + 1
  }

  return payload.update({
    collection: 'analytics-sessions',
    id: sessionId,
    data: update,
  })
}
