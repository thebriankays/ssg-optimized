export interface TravelAdvisory {
  id: string
  countryName: string
  countryCode: string
  level: 1 | 2 | 3 | 4
  summary: string
  updatedAt: string
}

export interface VisaRequirement {
  id: string
  fromCountry: string
  toCountry: string
  requirementType: 'visa-free' | 'visa-on-arrival' | 'visa-required' | 'evisa'
  duration?: number
}

export interface Airport {
  id: string
  name: string
  code: string
  city: string
  country: string
  countryCode: string
  latitude: number
  longitude: number
  type: 'international' | 'domestic'
}

export interface MichelinRestaurant {
  id: string
  name: string
  city: string
  country: string
  countryCode: string
  latitude: number
  longitude: number
  stars: 1 | 2 | 3
  cuisine?: string
  chef?: string
}

export interface Country {
  id: string
  name: string
  code: string
  capital?: string
  region?: string
  subregion?: string
  population?: number
  flag?: string
}

export interface GeoFeature {
  type: 'Feature'
  properties: {
    NAME: string
    ISO_A2?: string
    ISO_A3?: string
    [key: string]: any
  }
  geometry: {
    type: string
    coordinates: any[]
  }
}

export interface GlobePoint {
  lat: number
  lng: number
  size?: number
  color?: string
  label?: string
  data?: any
}

export type GlobeView = 'advisories' | 'visa' | 'michelin' | 'airports'

export interface GlobeConfig {
  autoRotate?: boolean
  autoRotateSpeed?: number
  atmosphereColor?: string
  atmosphereAltitude?: number
  pointsInteractive?: boolean
  arcsInteractive?: boolean
}