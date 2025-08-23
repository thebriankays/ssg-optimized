import { Client } from '@googlemaps/google-maps-services-js'
import type { PlaceData } from '@googlemaps/google-maps-services-js'

export interface GoogleMapsConfig {
  apiKey: string
}

export interface PlaceDetails {
  placeId: string
  name: string
  formattedAddress: string
  coordinates: {
    latitude: number
    longitude: number
  }
  types: string[]
  country: string
  region?: string
  city?: string
  timezone?: string
  photos?: string[]
  rating?: number
  website?: string
  phoneNumber?: string
}

export class GoogleMapsService {
  private client: Client
  private apiKey: string

  constructor(config: GoogleMapsConfig) {
    this.client = new Client({})
    this.apiKey = config.apiKey
  }

  async searchPlace(query: string): Promise<PlaceDetails | null> {
    try {
      const response = await this.client.findPlaceFromText({
        params: {
          input: query,
          inputtype: 'textquery' as any,
          fields: [
            'place_id',
            'name',
            'formatted_address',
            'geometry',
            'types',
            'photos',
            'rating',
            'website',
            'international_phone_number'
          ],
          key: this.apiKey,
        },
      })

      if (response.data.candidates && response.data.candidates.length > 0) {
        const place = response.data.candidates[0]
        
        // Get detailed information
        const details = await this.getPlaceDetails(place.place_id!)
        return details
      }

      return null
    } catch (error) {
      console.error('Error searching place:', error)
      throw error
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'place_id',
            'name',
            'formatted_address',
            'geometry',
            'types',
            'address_components',
            'photos',
            'rating',
            'website',
            'international_phone_number',
            'utc_offset'
          ],
          key: this.apiKey,
        },
      })

      if (response.data.result) {
        const place = response.data.result
        
        // Extract country and region from address components
        let country = ''
        let region = ''
        let city = ''

        if (place.address_components) {
          for (const component of place.address_components) {
            if (component.types.includes('country' as any)) {
              country = component.long_name
            }
            if (component.types.includes('administrative_area_level_1' as any)) {
              region = component.long_name
            }
            if (component.types.includes('locality' as any) || component.types.includes('administrative_area_level_2' as any)) {
              city = component.long_name
            }
          }
        }

        const placeDetails: PlaceDetails = {
          placeId: place.place_id!,
          name: place.name!,
          formattedAddress: place.formatted_address!,
          coordinates: {
            latitude: place.geometry!.location.lat,
            longitude: place.geometry!.location.lng,
          },
          types: place.types || [],
          country,
          region,
          city,
          rating: place.rating,
          website: place.website,
          phoneNumber: place.international_phone_number,
        }

        return placeDetails
      }

      return null
    } catch (error) {
      console.error('Error getting place details:', error)
      throw error
    }
  }

  async getNearbyAirports(latitude: number, longitude: number, radius: number = 100000): Promise<any[]> {
    try {
      const response = await this.client.placesNearby({
        params: {
          location: { lat: latitude, lng: longitude },
          radius,
          type: 'airport',
          key: this.apiKey,
        },
      })

      return response.data.results || []
    } catch (error) {
      console.error('Error getting nearby airports:', error)
      throw error
    }
  }

  async searchLuxuryHotels(destinationName: string, latitude: number, longitude: number): Promise<any[]> {
    try {
      const response = await this.client.placesNearby({
        params: {
          location: { lat: latitude, lng: longitude },
          radius: 50000,
          type: 'lodging',
          keyword: 'luxury hotel 5 star',
          key: this.apiKey,
        },
      })

      return response.data.results || []
    } catch (error) {
      console.error('Error searching luxury hotels:', error)
      throw error
    }
  }

  async searchFineDining(latitude: number, longitude: number): Promise<any[]> {
    try {
      const response = await this.client.placesNearby({
        params: {
          location: { lat: latitude, lng: longitude },
          radius: 25000,
          type: 'restaurant',
          keyword: 'fine dining michelin star',
          key: this.apiKey,
        },
      })

      return response.data.results || []
    } catch (error) {
      console.error('Error searching fine dining:', error)
      throw error
    }
  }
}