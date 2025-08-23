import Router from 'next/router'

export interface TrackerOptions {
  websiteId: string
  tag?: string
  autoTrack?: boolean
}

export interface TrackEventData {
  type: 'pageview' | 'custom'
  eventName?: string
  url?: string
  metadata?: Record<string, unknown>
  sessionId?: string
}

export interface TrackingPayload extends TrackEventData {
  websiteId: string
  tag?: string
  url: string
  referrer: string
  screen: string
  // Ensure "type" is defined
  type: 'pageview' | 'custom'
}

export const createTracker = (options: TrackerOptions) => {
  const { websiteId, tag, autoTrack = true } = options
  const endpoint = '/api/collect'

  const getPayload = (data: Partial<TrackEventData> = {}): TrackingPayload => {
    return {
      websiteId,
      tag,
      url: window.location.pathname + window.location.search,
      referrer: document.referrer,
      screen: `${window.screen.width}x${window.screen.height}`,
      // Default to "pageview" if not provided
      type: data.type ?? 'pageview',
      ...data,
    }
  }

  const track = async (data: Partial<TrackEventData> = {}): Promise<void> => {
    try {
      await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ payload: getPayload(data) }),
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      console.error('Tracking error:', err)
    }
  }

  if (autoTrack) {
    // Send pageview on initial load
    track({ type: 'pageview' })

    // Hook into Next.js router events if available
    if (Router?.events) {
      Router.events.on('routeChangeComplete', (url?: string) => {
        if (url) {
          track({ type: 'pageview', url })
        }
      })
    }
  }

  return { track }
}
