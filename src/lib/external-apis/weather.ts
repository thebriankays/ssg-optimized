export interface WeatherData {
  location: string
  current: {
    temperature: number
    humidity: number
    description: string
    windSpeed: number
  }
  seasonal: Array<{
    season: 'spring' | 'summer' | 'fall' | 'winter'
    months: string
    averageTemp: {
      high: number
      low: number
      unit: 'F' | 'C'
    }
    rainfall: {
      amount: number
      rainyDays: number
    }
    humidity: number
    sunshineHours: number
    description: string
    clothingRecommendations: string
  }>
  bestTimeToVisit: {
    overall: string
    peakSeason: {
      months: string
      description: string
      pros: string[]
      cons: string[]
    }
    shoulderSeason: {
      months: string
      description: string
      pros: string[]
      cons: string[]
    }
    offSeason: {
      months: string
      description: string
      pros: string[]
      cons: string[]
    }
  }
  weatherAlerts: Array<{
    type: string
    period: string
    description: string
    precautions: string
  }>
}

export class WeatherService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getWeatherData(latitude: number, longitude: number, locationName: string): Promise<WeatherData> {
    // This is a mock implementation
    // In reality, you would integrate with OpenWeatherMap, WeatherAPI, or similar services
    
    const mockWeatherData: WeatherData = {
      location: locationName,
      current: {
        temperature: 75,
        humidity: 65,
        description: 'Partly cloudy',
        windSpeed: 8
      },
      seasonal: [
        {
          season: 'spring',
          months: 'March - May',
          averageTemp: { high: 70, low: 55, unit: 'F' },
          rainfall: { amount: 80, rainyDays: 12 },
          humidity: 60,
          sunshineHours: 7,
          description: 'Mild temperatures with occasional rain showers. Perfect for sightseeing.',
          clothingRecommendations: 'Light layers, waterproof jacket, comfortable walking shoes.'
        },
        {
          season: 'summer',
          months: 'June - August',
          averageTemp: { high: 85, low: 70, unit: 'F' },
          rainfall: { amount: 40, rainyDays: 6 },
          humidity: 55,
          sunshineHours: 10,
          description: 'Warm and sunny with minimal rainfall. Peak tourist season.',
          clothingRecommendations: 'Light, breathable fabrics, sun hat, sunscreen, comfortable sandals.'
        },
        {
          season: 'fall',
          months: 'September - November',
          averageTemp: { high: 72, low: 58, unit: 'F' },
          rainfall: { amount: 90, rainyDays: 14 },
          humidity: 65,
          sunshineHours: 6,
          description: 'Cooler temperatures with increased rainfall. Beautiful autumn colors.',
          clothingRecommendations: 'Layers, waterproof jacket, warm sweater, sturdy shoes.'
        },
        {
          season: 'winter',
          months: 'December - February',
          averageTemp: { high: 60, low: 45, unit: 'F' },
          rainfall: { amount: 120, rainyDays: 18 },
          humidity: 70,
          sunshineHours: 4,
          description: 'Cool and wet with shorter days. Fewer crowds.',
          clothingRecommendations: 'Warm coat, waterproof boots, umbrella, thermal layers.'
        }
      ],
      bestTimeToVisit: {
        overall: 'The best time to visit is during late spring (April-May) and early fall (September-October) when weather is pleasant and crowds are manageable.',
        peakSeason: {
          months: 'June - August',
          description: 'Warmest weather with long sunny days.',
          pros: ['Best weather', 'Long daylight hours', 'All attractions open'],
          cons: ['Highest prices', 'Largest crowds', 'Booking required well in advance']
        },
        shoulderSeason: {
          months: 'April-May, September-October',
          description: 'Pleasant weather with moderate crowds.',
          pros: ['Good weather', 'Moderate prices', 'Fewer crowds', 'Better availability'],
          cons: ['Occasional rain', 'Some seasonal closures possible']
        },
        offSeason: {
          months: 'November - March',
          description: 'Cooler weather with minimal crowds.',
          pros: ['Lowest prices', 'No crowds', 'Authentic local experience'],
          cons: ['Cooler weather', 'Shorter days', 'Some attractions may be closed']
        }
      },
      weatherAlerts: [
        {
          type: 'extreme-heat',
          period: 'July - August',
          description: 'Temperatures can exceed 90°F during peak summer.',
          precautions: 'Stay hydrated, seek shade during midday, wear sun protection.'
        }
      ]
    }

    return mockWeatherData
  }

  async getCurrentWeather(latitude: number, longitude: number): Promise<any> {
    // Mock current weather - integrate with real weather API
    return {
      temperature: 75,
      humidity: 65,
      description: 'Partly cloudy',
      windSpeed: 8,
      pressure: 1013,
      visibility: 10
    }
  }
}