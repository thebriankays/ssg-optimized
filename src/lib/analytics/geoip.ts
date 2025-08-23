interface GeoIPData {
  country?: string
  region?: string
  city?: string
}

export async function getClientLocation(_ip: string): Promise<GeoIPData | null> {
  try {
    // Using Google's Geolocation API
    const response = await fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.GOOGLE_MAPS_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          considerIp: true,
        }),
      },
    )

    if (!response.ok) {
      throw new Error('Failed to get location from Google')
    }

    const { location } = await response.json()

    if (!location) {
      return null
    }

    // Get address details using reverse geocoding
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}`,
    )

    if (!geocodeResponse.ok) {
      throw new Error('Failed to get address details')
    }

    const geocodeData = await geocodeResponse.json()

    if (!geocodeData.results?.length) {
      return null
    }

    // Extract location data from address components
    const addressComponents = geocodeData.results[0].address_components
    const locationData: GeoIPData = {}

    for (const component of addressComponents) {
      const types = component.types

      if (types.includes('country')) {
        locationData.country = component.short_name
      } else if (types.includes('administrative_area_level_1')) {
        locationData.region = component.short_name
      } else if (types.includes('locality')) {
        locationData.city = component.long_name
      }
    }

    return locationData
  } catch (error) {
    console.error('Error getting location data:', error)
    return null
  }
}

const locationCache = new Map<string, { data: GeoIPData; timestamp: number }>()
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export async function getClientLocationCached(ip: string): Promise<GeoIPData | null> {
  const now = Date.now()
  const cached = locationCache.get(ip)

  // Return cached data if it exists and hasn't expired
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  // Get fresh location data
  const locationData = await getClientLocation(ip)

  // Cache the new data if it exists
  if (locationData) {
    locationCache.set(ip, {
      data: locationData,
      timestamp: now,
    })

    // Clean up old cache entries
    if (locationCache.size > 1000) {
      for (const [key, value] of locationCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          locationCache.delete(key)
        }
      }
    }
  }

  return locationData
}
