export interface Location {
  lat: number
  lng: number
  altitude?: number
  heading?: number
  tilt?: number
  range?: number
}

export interface POI {
  id: string
  name: string
  description?: string
  location: Location
  category?: string
  image?: string
  icon?: string
}

export interface Tour {
  id: string
  name: string
  description?: string
  waypoints: TourWaypoint[]
  duration?: number // in seconds
}

export interface TourWaypoint {
  location: Location
  name?: string
  description?: string
  duration?: number // seconds to stay at this point
  transitionDuration?: number // seconds to transition to next point
}

export interface AreaExplorerConfig {
  mapId: string
  defaultLocation: Location
  mapTypeId?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
  gestureHandling?: 'cooperative' | 'greedy' | 'none' | 'auto'
  zoomControl?: boolean
  mapTypeControl?: boolean
  scaleControl?: boolean
  streetViewControl?: boolean
  rotateControl?: boolean
  fullscreenControl?: boolean
  tiltEnabled?: boolean
  headingEnabled?: boolean
  enable3D?: boolean
  restrictBounds?: {
    north: number
    south: number
    east: number
    west: number
  }
}