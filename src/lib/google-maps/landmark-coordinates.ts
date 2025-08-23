// Helper to adjust coordinates to landmark-rich areas for better 3D views
export const getLandmarkCoordinates = (city: string, country: string, defaultLat: number, defaultLng: number) => {
  // Map of major cities to their landmark-rich downtown/tourist areas
  const landmarkAreas: Record<string, { lat: number; lng: number; description: string }> = {
    'london,england': { lat: 51.5014, lng: -0.1419, description: 'Westminster/Big Ben area' },
    'london,united kingdom': { lat: 51.5014, lng: -0.1419, description: 'Westminster/Big Ben area' },
    'london,uk': { lat: 51.5014, lng: -0.1419, description: 'Westminster/Big Ben area' },
    'paris,france': { lat: 48.8584, lng: 2.2945, description: 'Eiffel Tower area' },
    'new york,united states': { lat: 40.7484, lng: -73.9857, description: 'Times Square/Empire State area' },
    'new york,usa': { lat: 40.7484, lng: -73.9857, description: 'Times Square/Empire State area' },
    'tokyo,japan': { lat: 35.6585, lng: 139.7454, description: 'Tokyo Tower area' },
    'sydney,australia': { lat: -33.8568, lng: 151.2153, description: 'Opera House area' },
    'rome,italy': { lat: 41.8902, lng: 12.4922, description: 'Colosseum area' },
    'dubai,united arab emirates': { lat: 25.1972, lng: 55.2744, description: 'Burj Khalifa area' },
    'dubai,uae': { lat: 25.1972, lng: 55.2744, description: 'Burj Khalifa area' },
    'san francisco,united states': { lat: 37.8199, lng: -122.4783, description: 'Golden Gate Bridge area' },
    'san francisco,usa': { lat: 37.8199, lng: -122.4783, description: 'Golden Gate Bridge area' },
    'barcelona,spain': { lat: 41.4036, lng: 2.1744, description: 'Sagrada Familia area' },
    'amsterdam,netherlands': { lat: 52.3676, lng: 4.9041, description: 'Dam Square area' },
    'berlin,germany': { lat: 52.5200, lng: 13.4050, description: 'Brandenburg Gate area' },
    'singapore,singapore': { lat: 1.2838, lng: 103.8600, description: 'Marina Bay area' },
    'hong kong,china': { lat: 22.2855, lng: 114.1577, description: 'Victoria Harbour area' },
    'moscow,russia': { lat: 55.7539, lng: 37.6208, description: 'Red Square area' },
    'istanbul,turkey': { lat: 41.0082, lng: 28.9784, description: 'Hagia Sophia area' },
    'rio de janeiro,brazil': { lat: -22.9519, lng: -43.2105, description: 'Christ the Redeemer area' },
    'bangkok,thailand': { lat: 13.7563, lng: 100.5018, description: 'Grand Palace area' },
    'los angeles,united states': { lat: 34.0522, lng: -118.2437, description: 'Downtown LA' },
    'los angeles,usa': { lat: 34.0522, lng: -118.2437, description: 'Downtown LA' },
    'chicago,united states': { lat: 41.8781, lng: -87.6298, description: 'Millennium Park area' },
    'chicago,usa': { lat: 41.8781, lng: -87.6298, description: 'Millennium Park area' },
    'honolulu,united states': { lat: 21.3099, lng: -157.8581, description: 'Waikiki/Diamond Head area' },
    'honolulu,usa': { lat: 21.3099, lng: -157.8581, description: 'Waikiki/Diamond Head area' },
    'honolulu,hawaii': { lat: 21.3099, lng: -157.8581, description: 'Waikiki/Diamond Head area' },
  }

  // Create a key from city and country
  const cityLower = city?.toLowerCase().trim() || ''
  const countryLower = country?.toLowerCase().trim() || ''
  
  // Try different key combinations
  const keys = [
    `${cityLower},${countryLower}`,
    `${cityLower},${countryLower.replace('united kingdom', 'uk')}`,
    `${cityLower},${countryLower.replace('united states', 'usa')}`,
  ]
  
  // Check if we have landmark coordinates for this location
  for (const key of keys) {
    const landmark = landmarkAreas[key]
    if (landmark) {
      console.log(`Using landmark coordinates for ${city}: ${landmark.description}`)
      return { lat: landmark.lat, lng: landmark.lng }
    }
  }
  
  // Return original coordinates if no landmark mapping exists
  return { lat: defaultLat, lng: defaultLng }
}
