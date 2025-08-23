/**
 * Helper functions for handling coordinates in GooglePlaces field
 */

export interface Coordinates {
  lat: number | null
  lng: number | null
}

type CoordinateInput = number | string | null | undefined

/**
 * Parse an unknown value into a valid number | null
 */
const parseCoordinate = (val: CoordinateInput): number | null => {
  if (typeof val === 'number' && !isNaN(val)) return val
  if (typeof val === 'string') {
    const parsed = parseFloat(val)
    if (!isNaN(parsed)) return parsed
  }
  return null
}

/**
 * Ensure an arbitrary object is returned as `{ lat, lng }`
 */
export function validateCoordinates(
  coords: unknown,
): Coordinates {
  if (typeof coords !== 'object' || coords === null) {
    return { lat: null, lng: null }
  }

  const c = coords as Partial<Record<'lat' | 'lng', CoordinateInput>>
  return {
    lat: parseCoordinate(c.lat),
    lng: parseCoordinate(c.lng),
  }
}

/**
 * Build a coordinates object from two inputs
 */
export function createCoordinates(
  latInput: CoordinateInput,
  lngInput: CoordinateInput,
): Coordinates {
  return {
    lat: parseCoordinate(latInput),
    lng: parseCoordinate(lngInput),
  }
}