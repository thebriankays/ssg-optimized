/**
 * Utility functions for working with geographic coordinates
 */

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Convert radians to degrees
 */
export function toDegrees(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

/**
 * Calculate the center point of multiple coordinates
 */
export function calculateCenter(
  coordinates: Array<{ lat: number; lng: number }>
): { lat: number; lng: number } {
  if (coordinates.length === 0) {
    return { lat: 0, lng: 0 }
  }
  
  let x = 0
  let y = 0
  let z = 0
  
  for (const coord of coordinates) {
    const lat = toRadians(coord.lat)
    const lng = toRadians(coord.lng)
    
    x += Math.cos(lat) * Math.cos(lng)
    y += Math.cos(lat) * Math.sin(lng)
    z += Math.sin(lat)
  }
  
  const total = coordinates.length
  x = x / total
  y = y / total
  z = z / total
  
  const centralLng = Math.atan2(y, x)
  const centralSquareRoot = Math.sqrt(x * x + y * y)
  const centralLat = Math.atan2(z, centralSquareRoot)
  
  return {
    lat: toDegrees(centralLat),
    lng: toDegrees(centralLng)
  }
}

/**
 * Calculate bounds that encompass all given coordinates
 */
export function calculateBounds(
  coordinates: Array<{ lat: number; lng: number }>
): {
  north: number
  south: number
  east: number
  west: number
} {
  if (coordinates.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 }
  }
  
  let north = -90
  let south = 90
  let east = -180
  let west = 180
  
  for (const coord of coordinates) {
    north = Math.max(north, coord.lat)
    south = Math.min(south, coord.lat)
    east = Math.max(east, coord.lng)
    west = Math.min(west, coord.lng)
  }
  
  return { north, south, east, west }
}

/**
 * Check if a point is within a bounding box
 */
export function isWithinBounds(
  point: { lat: number; lng: number },
  bounds: { north: number; south: number; east: number; west: number }
): boolean {
  return (
    point.lat <= bounds.north &&
    point.lat >= bounds.south &&
    point.lng <= bounds.east &&
    point.lng >= bounds.west
  )
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number, precision = 4): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  
  return `${Math.abs(lat).toFixed(precision)}°${latDir}, ${Math.abs(lng).toFixed(precision)}°${lngDir}`
}

/**
 * Parse coordinate string in various formats
 */
export function parseCoordinates(coordString: string): { lat: number; lng: number } | null {
  // Remove extra spaces and normalize
  const normalized = coordString.trim().replace(/\s+/g, ' ')
  
  // Try to match various coordinate formats
  // Format: 40.7128° N, 74.0060° W
  const degreeFormat = /^(-?\d+\.?\d*)\s*°?\s*([NS]?)\s*,?\s*(-?\d+\.?\d*)\s*°?\s*([EW]?)$/i
  const match = normalized.match(degreeFormat)
  
  if (match) {
    let lat = parseFloat(match[1])
    let lng = parseFloat(match[3])
    
    // Apply direction if specified
    if (match[2] && match[2].toUpperCase() === 'S') lat = -Math.abs(lat)
    if (match[4] && match[4].toUpperCase() === 'W') lng = -Math.abs(lng)
    
    return { lat, lng }
  }
  
  return null
}

/**
 * Extract coordinates from destination object
 */
export function extractDestinationCoordinates(destination: any): { lat: number; lng: number } | null {
  // Check various possible coordinate fields
  if (destination?.locationData?.coordinates) {
    const coords = destination.locationData.coordinates
    if (coords.lat !== null && coords.lng !== null) {
      return { lat: coords.lat, lng: coords.lng }
    }
  }
  
  if (destination?.coordinates) {
    if (destination.coordinates.lat !== null && destination.coordinates.lng !== null) {
      return { lat: destination.coordinates.lat, lng: destination.coordinates.lng }
    }
  }
  
  if (destination?.lat !== null && destination?.lng !== null) {
    return { lat: destination.lat, lng: destination.lng }
  }
  
  if (destination?.latitude !== null && destination?.longitude !== null) {
    return { lat: destination.latitude, lng: destination.longitude }
  }
  
  return null
}

/**
 * Extract destination coordinates from experience object
 */
export function extractExperienceDestinationCoordinates(experience: any): Array<{ lat: number; lng: number }> {
  const coordinates: Array<{ lat: number; lng: number }> = []
  
  // Check destinations array
  if (experience?.destinations && Array.isArray(experience.destinations)) {
    for (const dest of experience.destinations) {
      const destination = typeof dest === 'object' && 'destination' in dest ? dest.destination : dest
      const coords = extractDestinationCoordinates(destination)
      if (coords) {
        coordinates.push(coords)
      }
    }
  }
  
  // Check itinerary items
  if (experience?.itinerary && Array.isArray(experience.itinerary)) {
    for (const item of experience.itinerary) {
      if (item?.destination) {
        const coords = extractDestinationCoordinates(item.destination)
        if (coords) {
          coordinates.push(coords)
        }
      }
    }
  }
  
  return coordinates
}