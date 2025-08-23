// HexDB.io API client for aircraft data
// https://hexdb.io/api-docs

const HEXDB_API = 'https://hexdb.io/api/v1'

export interface AircraftData {
  icao24: string
  registration: string
  manufacturer: string
  model: string
  type: string
  serialnumber: string
  operator: string
  operatoricao: string
  operatoriata: string
  owner: string
  built: string
  firstflightdate: string
  engines: string
  modes: boolean
  adsb: boolean
  acars: boolean
  notes: string
  categoryDescription: string
}

export interface AirlineData {
  icao: string
  iata: string
  name: string
  callsign: string
  country: string
  active: boolean
}

// Cache for aircraft lookups
const aircraftCache = new Map<string, AircraftData>()
const airlineCache = new Map<string, AirlineData>()

// Batch fetch aircraft data
export async function fetchAircraftData(icao24List: string[]): Promise<Map<string, AircraftData>> {
  const results = new Map<string, AircraftData>()
  const toFetch: string[] = []

  // Check cache first
  for (const icao24 of icao24List) {
    const cached = aircraftCache.get(icao24.toLowerCase())
    if (cached) {
      results.set(icao24, cached)
    } else {
      toFetch.push(icao24)
    }
  }

  if (toFetch.length === 0) return results

  try {
    // HexDB allows batch queries
    const batchSize = 50 // API limit
    for (let i = 0; i < toFetch.length; i += batchSize) {
      const batch = toFetch.slice(i, i + batchSize)
      
      // Note: HexDB.io might require authentication for batch requests
      // For now, we'll fetch individually (check their docs for batch endpoint)
      const promises = batch.map(icao24 => 
        icao24 ? fetch(`${HEXDB_API}/aircraft/${icao24.toLowerCase()}`)
          .then(res => res.ok ? res.json() : null)
          .catch(() => null) : Promise.resolve(null)
      )
      
      const responses = await Promise.all(promises)
      
      responses.forEach((data, index) => {
        if (data && batch[index]) {
          const icao24 = batch[index]!
          aircraftCache.set(icao24.toLowerCase(), data)
          results.set(icao24, data)
        }
      })
    }
  } catch (error) {
    console.error('Error fetching aircraft data from HexDB:', error)
  }

  return results
}

// Get airline data from callsign prefix
export async function getAirlineFromCallsign(callsign: string): Promise<AirlineData | null> {
  if (!callsign || callsign.length < 2) return null
  
  // Extract airline prefix (usually first 3 characters)
  const prefix = callsign.substring(0, 3).toUpperCase()
  
  // Check cache
  const cached = airlineCache.get(prefix)
  if (cached) return cached
  
  try {
    // Note: This endpoint might vary based on HexDB.io API structure
    const response = await fetch(`${HEXDB_API}/airline/icao/${prefix}`)
    if (response.ok) {
      const data = await response.json()
      airlineCache.set(prefix, data)
      return data
    }
  } catch (error) {
    console.error('Error fetching airline data:', error)
  }
  
  return null
}

// Get single aircraft data
export async function getAircraftData(icao24: string): Promise<AircraftData | null> {
  const cached = aircraftCache.get(icao24.toLowerCase())
  if (cached) return cached
  
  try {
    const response = await fetch(`${HEXDB_API}/aircraft/${icao24.toLowerCase()}`)
    if (response.ok) {
      const data = await response.json()
      aircraftCache.set(icao24.toLowerCase(), data)
      return data
    }
  } catch (error) {
    console.error('Error fetching aircraft data:', error)
  }
  
  return null
}

// Parse aircraft photo URL from registration
export function getAircraftPhotoUrl(registration: string): string {
  // You could integrate with planespotters.net or jetphotos.com API here
  // For now, return a placeholder or construct a search URL
  return `https://www.jetphotos.com/photo/keyword/${registration}`
}

// Common airline callsign prefixes (fallback if API fails)
const commonAirlines: Record<string, { name: string; iata: string }> = {
  'AAL': { name: 'American Airlines', iata: 'AA' },
  'UAL': { name: 'United Airlines', iata: 'UA' },
  'DAL': { name: 'Delta Air Lines', iata: 'DL' },
  'SWA': { name: 'Southwest Airlines', iata: 'WN' },
  'BAW': { name: 'British Airways', iata: 'BA' },
  'DLH': { name: 'Lufthansa', iata: 'LH' },
  'AFR': { name: 'Air France', iata: 'AF' },
  'KLM': { name: 'KLM', iata: 'KL' },
  'UAE': { name: 'Emirates', iata: 'EK' },
  'QTR': { name: 'Qatar Airways', iata: 'QR' },
  'SIA': { name: 'Singapore Airlines', iata: 'SQ' },
  'CPA': { name: 'Cathay Pacific', iata: 'CX' },
  'ANA': { name: 'All Nippon Airways', iata: 'NH' },
  'JAL': { name: 'Japan Airlines', iata: 'JL' },
  'QFA': { name: 'Qantas', iata: 'QF' },
  'RYR': { name: 'Ryanair', iata: 'FR' },
  'EZY': { name: 'easyJet', iata: 'U2' },
  'THY': { name: 'Turkish Airlines', iata: 'TK' },
  'ACA': { name: 'Air Canada', iata: 'AC' },
  'AAR': { name: 'Asiana Airlines', iata: 'OZ' },
}

// Fallback airline lookup
export function getAirlineFromCallsignPrefix(callsign: string): { name: string; iata: string } | null {
  if (!callsign || callsign.length < 3) return null
  const prefix = callsign.substring(0, 3).toUpperCase()
  return commonAirlines[prefix] || null
}
