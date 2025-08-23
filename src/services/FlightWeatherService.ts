// Weather overlay service for FlightTracker
import { WeatherService } from '@/services/WeatherService'

interface WeatherOverlayOptions {
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
  opacity?: number
  type?: 'clouds' | 'precipitation' | 'temperature' | 'wind'
}

export class FlightWeatherService {
  private weatherService: WeatherService
  private overlayCache: Map<string, { url: string; timestamp: number }> = new Map()
  private CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  constructor() {
    this.weatherService = new WeatherService()
  }

  // Get weather overlay tile URL for the map
  getWeatherOverlayUrl(options: WeatherOverlayOptions): string {
    const { bounds, type = 'clouds' } = options
    
    // Create a unique key for this overlay
    const key = `${type}_${bounds.north}_${bounds.south}_${bounds.east}_${bounds.west}`
    
    // Check cache
    const cached = this.overlayCache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.url
    }

    // Build overlay URL based on type
    let overlayUrl = ''
    switch (type) {
      case 'clouds':
        overlayUrl = `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
        break
      case 'precipitation':
        overlayUrl = `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
        break
      case 'temperature':
        overlayUrl = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
        break
      case 'wind':
        overlayUrl = `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
        break
    }

    // Cache the URL
    this.overlayCache.set(key, { url: overlayUrl, timestamp: Date.now() })
    
    return overlayUrl
  }

  // Get weather data for a specific point (airport or flight position)
  async getWeatherForPoint(lat: number, lon: number): Promise<any> {
    try {
      const weather = await this.weatherService.getWeatherForLocation(lat, lon)
      return {
        temperature: weather.main.temp,
        feels_like: weather.main.feels_like,
        humidity: weather.main.humidity,
        pressure: weather.main.pressure,
        visibility: weather.visibility,
        wind: {
          speed: weather.wind.speed,
          direction: weather.wind.deg,
          gust: weather.wind.gust
        },
        clouds: weather.clouds.all,
        weather: weather.weather[0],
        description: weather.weather[0].description
      }
    } catch (error) {
      console.error('Error fetching weather for point:', error)
      return null
    }
  }

  // Get weather along a flight route
  async getRouteWeather(departureCoords: [number, number], arrivalCoords: [number, number], waypoints?: [number, number][]): Promise<any[]> {
    const points = [departureCoords, ...(waypoints || []), arrivalCoords]
    const weatherData = []

    for (const [lon, lat] of points) {
      const weather = await this.getWeatherForPoint(lat, lon)
      if (weather) {
        weatherData.push({
          location: [lon, lat],
          weather
        })
      }
    }

    return weatherData
  }

  // Add weather overlay to Mapbox map
  addWeatherOverlay(map: mapboxgl.Map, type: WeatherOverlayOptions['type'] = 'clouds', opacity = 0.6) {
    const sourceId = `weather-${type}`
    const layerId = `weather-${type}-layer`

    // Remove existing layer if it exists
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId)
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId)
    }

    // Add weather tile source
    map.addSource(sourceId, {
      type: 'raster',
      tiles: [this.getWeatherOverlayUrl({ 
        bounds: { north: 90, south: -90, east: 180, west: -180 }, 
        type 
      })],
      tileSize: 256
    })

    // Add weather layer
    map.addLayer({
      id: layerId,
      type: 'raster',
      source: sourceId,
      paint: {
        'raster-opacity': opacity
      }
    }, 'flight-trajectory-line') // Add below flight trajectory
  }

  // Remove weather overlay
  removeWeatherOverlay(map: mapboxgl.Map, type: WeatherOverlayOptions['type'] = 'clouds') {
    const layerId = `weather-${type}-layer`
    const sourceId = `weather-${type}`

    if (map.getLayer(layerId)) {
      map.removeLayer(layerId)
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId)
    }
  }
}

export const flightWeatherService = new FlightWeatherService()
