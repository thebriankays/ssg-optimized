import type { Payload } from 'payload'
import type { MapDataCacheItem } from '@/collections/MapDataCache'

export class MapCacheService {
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  /**
   * Get cached data or null if not found/expired
   */
  async get(cacheKey: string): Promise<any | null> {
    try {
      const result = await this.payload.find({
        collection: 'map-data-cache',
        where: {
          cacheKey: { equals: cacheKey },
          expiresAt: { greater_than: new Date().toISOString() },
        },
        limit: 1,
      })

      if (result.docs.length > 0) {
        const doc = result.docs[0]
        if (doc && 'data' in doc) {
          return doc.data
        }
      }
    } catch (error) {
      console.error('Error fetching from map cache:', error)
    }

    return null
  }

  /**
   * Set cache data
   */
  async set(
    destinationId: string,
    dataType: MapDataCacheItem['dataType'],
    coordinates: { lat: number; lng: number },
    data: any,
    searchParams?: { radius?: number; types?: string[] },
    expirationDays: number = 7
  ): Promise<void> {
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expirationDays)

      // Generate cache key
      let cacheKey = `${dataType}-${coordinates.lat.toFixed(6)}-${coordinates.lng.toFixed(6)}`
      if (dataType === 'places-nearby' && searchParams) {
        cacheKey += `-r${searchParams.radius || 1000}`
        if (searchParams.types?.length) {
          cacheKey += `-t${searchParams.types.sort().join(',')}`
        }
      }

      // Check if entry exists
      const existing = await this.payload.find({
        collection: 'map-data-cache',
        where: {
          cacheKey: { equals: cacheKey },
        },
        limit: 1,
      })

      if (existing.docs.length > 0 && existing.docs[0]) {
        // Update existing
        await this.payload.update({
          collection: 'map-data-cache',
          id: existing.docs[0].id,
          data: {
            destinationId,
            dataType,
            coordinates,
            searchParams,
            data,
            expiresAt: expiresAt.toISOString(),
          },
        })
      } else {
        // Create new
        await this.payload.create({
          collection: 'map-data-cache',
          data: {
            destinationId,
            cacheKey,
            dataType,
            coordinates,
            searchParams,
            data,
            expiresAt: expiresAt.toISOString(),
          },
        })
      }
    } catch (error) {
      console.error('Error setting map cache:', error)
    }
  }

  /**
   * Get cached places for a location
   */
  async getCachedPlaces(
    coordinates: { lat: number; lng: number },
    radius: number,
    types: string[]
  ): Promise<any | null> {
    const cacheKey = this.generatePlacesCacheKey(coordinates, radius, types)
    return this.get(cacheKey)
  }

  /**
   * Set cached places for a location
   */
  async setCachedPlaces(
    destinationId: string,
    coordinates: { lat: number; lng: number },
    radius: number,
    types: string[],
    places: any[]
  ): Promise<void> {
    await this.set(
      destinationId,
      'places-nearby',
      coordinates,
      places,
      { radius, types },
      7 // Cache for 7 days
    )
  }

  /**
   * Generate cache key for places
   */
  private generatePlacesCacheKey(
    coordinates: { lat: number; lng: number },
    radius: number,
    types: string[]
  ): string {
    return `places-nearby-${coordinates.lat.toFixed(6)}-${coordinates.lng.toFixed(6)}-r${radius}-t${types.sort().join(',')}`
  }

  /**
   * Clean expired cache entries
   */
  async cleanExpired(): Promise<void> {
    try {
      const expired = await this.payload.find({
        collection: 'map-data-cache',
        where: {
          expiresAt: { less_than: new Date().toISOString() },
        },
        limit: 100,
      })

      for (const doc of expired.docs) {
        await this.payload.delete({
          collection: 'map-data-cache',
          id: doc.id,
        })
      }
    } catch (error) {
      console.error('Error cleaning expired cache:', error)
    }
  }

  /**
   * Clear all cache for a destination
   */
  async clearDestinationCache(destinationId: string): Promise<void> {
    try {
      const items = await this.payload.find({
        collection: 'map-data-cache',
        where: {
          destinationId: { equals: destinationId },
        },
        limit: 100,
      })

      for (const doc of items.docs) {
        await this.payload.delete({
          collection: 'map-data-cache',
          id: doc.id,
        })
      }
    } catch (error) {
      console.error('Error clearing destination cache:', error)
    }
  }
}

// Export singleton getter
let cacheService: MapCacheService | null = null

export const getMapCacheService = (payload: Payload): MapCacheService => {
  if (!cacheService) {
    cacheService = new MapCacheService(payload)
  }
  return cacheService
}
