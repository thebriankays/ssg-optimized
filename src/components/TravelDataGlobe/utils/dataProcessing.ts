import { feature } from 'topojson-client'
import centroid from '@turf/centroid'
import simplify from '@turf/simplify'
import { 
  GeoFeature, 
  TravelAdvisory, 
  VisaRequirement, 
  Airport, 
  MichelinRestaurant,
  GlobePoint 
} from '../types'
import { normalizeCountryName } from '@/lib/country-mappings'

// Process TopoJSON to GeoJSON features
export function processTopoJSON(topology: any): GeoFeature[] {
  const geo = feature(topology, topology.objects.countries) as any
  return geo.features as GeoFeature[]
}

// Simplify country polygons for performance
export function simplifyCountryFeatures(features: GeoFeature[]): GeoFeature[] {
  return features.map(feature => {
    if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
      const simplified = simplify(feature as any, {
        tolerance: 0.01,
        highQuality: true,
      })
      return simplified as GeoFeature
    }
    return feature
  })
}

// Get country centroid for label placement
export function getCountryCentroid(feature: GeoFeature): [number, number] | null {
  try {
    const center = centroid(feature as any)
    if (center.geometry.coordinates) {
      return center.geometry.coordinates as [number, number]
    }
  } catch (error) {
    console.warn('Failed to get centroid for', feature.properties.NAME)
  }
  return null
}

// Process travel advisories data
export function processTravelAdvisories(
  advisories: TravelAdvisory[],
  features: GeoFeature[]
): Map<string, TravelAdvisory> {
  const advisoryMap = new Map<string, TravelAdvisory>()
  
  advisories.forEach(advisory => {
    const normalizedName = normalizeCountryName(advisory.countryName)
    
    // Try to find matching feature
    const feature = features.find(f => {
      const featureName = normalizeCountryName(f.properties.NAME)
      return featureName === normalizedName ||
             f.properties.ISO_A2 === advisory.countryCode ||
             f.properties.ISO_A3 === advisory.countryCode
    })
    
    if (feature) {
      advisoryMap.set(feature.properties.NAME, advisory)
    }
  })
  
  return advisoryMap
}

// Process visa requirements data
export function processVisaRequirements(
  requirements: VisaRequirement[],
  selectedCountry: string
): Map<string, VisaRequirement> {
  const visaMap = new Map<string, VisaRequirement>()
  
  requirements
    .filter(req => normalizeCountryName(req.fromCountry) === selectedCountry)
    .forEach(req => {
      const toCountry = normalizeCountryName(req.toCountry)
      visaMap.set(toCountry, req)
    })
  
  return visaMap
}

// Convert airports to globe points
export function airportsToGlobePoints(airports: Airport[]): GlobePoint[] {
  return airports.map(airport => ({
    lat: airport.latitude,
    lng: airport.longitude,
    size: 0.2,
    color: '#00ff88',
    label: `${airport.name} (${airport.code})`,
    data: airport,
  }))
}

// Convert Michelin restaurants to globe points
export function restaurantsToGlobePoints(restaurants: MichelinRestaurant[]): GlobePoint[] {
  return restaurants.map(restaurant => ({
    lat: restaurant.latitude,
    lng: restaurant.longitude,
    size: 0.15 + (restaurant.stars * 0.1),
    color: restaurant.stars === 3 ? '#ff0000' : 
           restaurant.stars === 2 ? '#ff8800' : 
           '#ffff00',
    label: `${restaurant.name} (${restaurant.stars}★)`,
    data: restaurant,
  }))
}

// Get color for travel advisory level
export function getAdvisoryColor(level: number): string {
  switch (level) {
    case 1: return '#00ff00' // Green - Exercise normal precautions
    case 2: return '#ffff00' // Yellow - Exercise increased caution
    case 3: return '#ff8800' // Orange - Reconsider travel
    case 4: return '#ff0000' // Red - Do not travel
    default: return '#888888' // Gray - No data
  }
}

// Get color for visa requirement
export function getVisaColor(requirementType: string): string {
  switch (requirementType) {
    case 'visa-free': return '#00ff00' // Green
    case 'visa-on-arrival': return '#88ff00' // Light green
    case 'evisa': return '#ffff00' // Yellow
    case 'visa-required': return '#ff8800' // Orange
    default: return '#888888' // Gray
  }
}

// Filter and search functions
export function searchAirports(airports: Airport[], searchTerm: string): Airport[] {
  if (!searchTerm) return airports
  
  const term = searchTerm.toLowerCase()
  return airports.filter(airport => 
    airport.name.toLowerCase().includes(term) ||
    airport.code.toLowerCase().includes(term) ||
    airport.city.toLowerCase().includes(term) ||
    airport.country.toLowerCase().includes(term)
  )
}

export function searchRestaurants(restaurants: MichelinRestaurant[], searchTerm: string): MichelinRestaurant[] {
  if (!searchTerm) return restaurants
  
  const term = searchTerm.toLowerCase()
  return restaurants.filter(restaurant => 
    restaurant.name.toLowerCase().includes(term) ||
    restaurant.city.toLowerCase().includes(term) ||
    restaurant.country.toLowerCase().includes(term) ||
    (restaurant.chef && restaurant.chef.toLowerCase().includes(term)) ||
    (restaurant.cuisine && restaurant.cuisine.toLowerCase().includes(term))
  )
}

// Calculate great circle distance between two points
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}