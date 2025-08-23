// Weather service for fetching weather data
export class WeatherService {
  private apiKey: string
  private baseUrl = 'https://api.openweathermap.org/data/2.5'

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || ''
    if (!this.apiKey) {
      console.warn('OpenWeather API key not found. Weather features will be limited.')
    }
  }

  async getWeatherForLocation(lat: number, lon: number): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Weather API key not configured')
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching weather:', error)
      throw error
    }
  }

  async getForecast(lat: number, lon: number, hours = 24): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Weather API key not configured')
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&cnt=${Math.ceil(hours / 3)}`
      )

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching forecast:', error)
      throw error
    }
  }
}
