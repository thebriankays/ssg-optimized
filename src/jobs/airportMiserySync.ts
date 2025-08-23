import type { TaskHandler } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'

interface AirportMiseryData {
  code: string
  name: string
  lat: number
  lng: number
  delays: number
  cancellations: number
  onTime: number
  total: number
  delayPercentage: number
  cancellationPercentage: number
}

// Major US airports to track
const TRACKED_AIRPORTS = [
  { code: 'ATL', name: 'Atlanta', lat: 33.6407, lng: -84.4277 },
  { code: 'LAX', name: 'Los Angeles', lat: 33.9425, lng: -118.4081 },
  { code: 'ORD', name: "Chicago O'Hare", lat: 41.9786, lng: -87.9048 },
  { code: 'DFW', name: 'Dallas/Fort Worth', lat: 32.8968, lng: -97.0380 },
  { code: 'DEN', name: 'Denver', lat: 39.8617, lng: -104.6731 },
  { code: 'JFK', name: 'New York JFK', lat: 40.6413, lng: -73.7781 },
  { code: 'SFO', name: 'San Francisco', lat: 37.6213, lng: -122.3790 },
  { code: 'SEA', name: 'Seattle-Tacoma', lat: 47.4502, lng: -122.3088 },
  { code: 'LAS', name: 'Las Vegas', lat: 36.0840, lng: -115.1537 },
  { code: 'MCO', name: 'Orlando', lat: 28.4294, lng: -81.3090 },
  { code: 'CLT', name: 'Charlotte', lat: 35.2140, lng: -80.9431 },
  { code: 'PHX', name: 'Phoenix', lat: 33.4343, lng: -112.0078 },
  { code: 'MIA', name: 'Miami', lat: 25.7959, lng: -80.2870 },
  { code: 'IAH', name: 'Houston', lat: 29.9902, lng: -95.3368 },
  { code: 'BOS', name: 'Boston', lat: 42.3656, lng: -71.0096 },
  { code: 'MSP', name: 'Minneapolis', lat: 44.8820, lng: -93.2218 },
  { code: 'DTW', name: 'Detroit', lat: 42.2161, lng: -83.3554 },
  { code: 'PHL', name: 'Philadelphia', lat: 39.8719, lng: -75.2410 },
  { code: 'BWI', name: 'Baltimore', lat: 39.1774, lng: -76.6684 },
  { code: 'SLC', name: 'Salt Lake City', lat: 40.7899, lng: -111.9791 },
  { code: 'DCA', name: 'Washington Reagan', lat: 38.8512, lng: -77.0402 },
  { code: 'SAN', name: 'San Diego', lat: 32.7338, lng: -117.1933 },
  { code: 'TPA', name: 'Tampa', lat: 27.9756, lng: -82.5333 },
  { code: 'PDX', name: 'Portland', lat: 45.5898, lng: -122.5951 },
]

export const airportMiserySync: TaskHandler = async ({ req, log }) => {
  const payload = await getPayload({ config })
  
  try {
    log('info', 'Starting airport misery data sync')
    
    // Check if we have a MapDataCache collection
    const collections = payload.config.collections
    const hasMapDataCache = collections.some(col => col.slug === 'map-data-cache')
    
    if (!hasMapDataCache) {
      log('error', 'MapDataCache collection not found')
      return {
        output: {
          success: false,
          error: 'MapDataCache collection not configured',
        },
      }
    }

    // In production, this would fetch from FlightAware's API
    // For now, we'll generate realistic data based on patterns
    const miseryData = await fetchAirportMiseryData()
    
    // Store in MapDataCache
    const cacheKey = 'airport-misery-latest'
    const timestamp = new Date()
    
    // Check if we have existing data
    const existing = await payload.find({
      collection: 'map-data-cache',
      where: {
        cacheKey: { equals: cacheKey },
      },
      limit: 1,
    })
    
    const dataToStore = {
      cacheKey,
      dataType: 'airport-misery',
      data: miseryData,
      lastUpdated: timestamp.toISOString(),
      expiresAt: new Date(timestamp.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
    }
    
    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'map-data-cache',
        id: existing.docs[0].id,
        data: dataToStore,
      })
      log('info', `Updated airport misery data for ${miseryData.airports.length} airports`)
    } else {
      await payload.create({
        collection: 'map-data-cache',
        data: dataToStore,
      })
      log('info', `Created airport misery data for ${miseryData.airports.length} airports`)
    }
    
    // Also store historical data (keep last 48 hours)
    const historicalKey = `airport-misery-${timestamp.toISOString()}`
    await payload.create({
      collection: 'map-data-cache',
      data: {
        cacheKey: historicalKey,
        dataType: 'airport-misery-historical',
        data: miseryData,
        lastUpdated: timestamp.toISOString(),
        expiresAt: new Date(timestamp.getTime() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours
      },
    })
    
    // Clean up old historical data
    const cutoffDate = new Date(timestamp.getTime() - 48 * 60 * 60 * 1000)
    const oldData = await payload.find({
      collection: 'map-data-cache',
      where: {
        and: [
          { dataType: { equals: 'airport-misery-historical' } },
          { lastUpdated: { less_than: cutoffDate.toISOString() } },
        ],
      },
    })
    
    for (const doc of oldData.docs) {
      await payload.delete({
        collection: 'map-data-cache',
        id: doc.id,
      })
    }
    
    log('info', `Cleaned up ${oldData.docs.length} old historical records`)
    
    return {
      output: {
        success: true,
        airportsUpdated: miseryData.airports.length,
        timestamp: timestamp.toISOString(),
      },
    }
  } catch (error) {
    log('error', `Error syncing airport misery data: ${error}`)
    return {
      output: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}

async function fetchAirportMiseryData() {
  // In production, this would:
  // 1. Fetch from FlightAware API
  // 2. Parse real-time flight data
  // 3. Calculate delays/cancellations per airport
  
  // For now, generate realistic patterns
  const now = new Date()
  const hour = now.getHours()
  
  // Simulate rush hour patterns
  const isRushHour = (hour >= 6 && hour <= 9) || (hour >= 16 && hour <= 19)
  const isNight = hour < 6 || hour > 22
  
  // You could also use Google Places API to check for weather/traffic conditions
  // near each airport to make the data more realistic
  
  const airports: AirportMiseryData[] = TRACKED_AIRPORTS.map(airport => {
    // Base rates
    let baseDelayRate = isRushHour ? 0.20 : isNight ? 0.05 : 0.10
    let baseCancellationRate = 0.02
    
    // Major hubs have more issues
    if (['ATL', 'ORD', 'LAX', 'JFK', 'DFW'].includes(airport.code)) {
      baseDelayRate *= 1.5
      baseCancellationRate *= 1.3
    }
    
    // Add randomness
    const delayVariation = (Math.random() - 0.5) * 0.1
    const cancellationVariation = (Math.random() - 0.5) * 0.02
    
    // Weather impact (could check actual weather here)
    const hasWeatherImpact = Math.random() < 0.15
    if (hasWeatherImpact) {
      baseDelayRate *= 2.5
      baseCancellationRate *= 3
    }
    
    const total = Math.floor(100 + Math.random() * 400) // 100-500 flights
    const delayRate = Math.max(0, Math.min(1, baseDelayRate + delayVariation))
    const cancellationRate = Math.max(0, Math.min(0.5, baseCancellationRate + cancellationVariation))
    
    const cancellations = Math.floor(total * cancellationRate)
    const delays = Math.floor((total - cancellations) * delayRate)
    const onTime = total - delays - cancellations
    
    return {
      code: airport.code,
      name: airport.name,
      lat: airport.lat,
      lng: airport.lng,
      delays,
      cancellations,
      onTime,
      total,
      delayPercentage: (delays / total) * 100,
      cancellationPercentage: (cancellations / total) * 100,
    }
  })
  
  return {
    timestamp: now.toISOString(),
    airports,
    weatherUrl: `https://www.flightaware.com/ajax/weather.rvt?projection=merc&lowlat=2738270.2535360805&lowlon=-7353075.46243437&hilat=6565152.453003368&hilon=-14156421.594820669&width=800&height=450&clock=${Math.floor(now.getTime() / 1000)}`,
  }
}