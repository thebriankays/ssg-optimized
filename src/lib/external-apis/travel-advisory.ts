export interface TravelAdvisory {
  country: string
  level: 'level1' | 'level2' | 'level3' | 'level4'
  summary: string
  details: string
  lastUpdated: string
  sourceUrl: string
}

export class TravelAdvisoryService {
  private baseUrl = 'https://www.travel.state.gov/content/travel/en/traveladvisories/traveladvisories'

  async getTravelAdvisory(countryCode: string): Promise<TravelAdvisory | null> {
    try {
      // This is a simplified implementation
      // In a real implementation, you would integrate with the actual State Department API
      // or scrape their website (following their terms of service)
      
      const mockAdvisories: Record<string, TravelAdvisory> = {
        'IT': {
          country: 'Italy',
          level: 'level2',
          summary: 'Exercise increased caution in Italy due to terrorism.',
          details: 'Terrorist groups continue plotting possible attacks in Italy. Terrorists may attack with little or no warning, targeting tourist locations, transportation hubs, markets/shopping malls, local government facilities, hotels, clubs, restaurants, places of worship, parks, major sporting and cultural events, educational institutions, airports, and other public areas.',
          lastUpdated: new Date().toISOString(),
          sourceUrl: 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/italy-travel-advisory.html'
        },
        'GR': {
          country: 'Greece',
          level: 'level1',
          summary: 'Exercise normal precautions in Greece.',
          details: 'Exercise normal precautions in Greece. Read the country information page for additional information on travel to Greece.',
          lastUpdated: new Date().toISOString(),
          sourceUrl: 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/greece-travel-advisory.html'
        },
        'FR': {
          country: 'France',
          level: 'level2',
          summary: 'Exercise increased caution in France due to terrorism and civil unrest.',
          details: 'Terrorist groups continue plotting possible attacks in France. Terrorists may attack with little or no warning, targeting tourist locations, transportation hubs, markets/shopping malls, local government facilities, hotels, clubs, restaurants, places of worship, parks, major sporting and cultural events, educational institutions, airports, and other public areas.',
          lastUpdated: new Date().toISOString(),
          sourceUrl: 'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories/france-travel-advisory.html'
        }
      }

      return mockAdvisories[countryCode] || null
    } catch (error) {
      console.error('Error fetching travel advisory:', error)
      return null
    }
  }

  async getVisaRequirements(countryCode: string): Promise<any> {
    // Mock implementation - in reality, you'd integrate with visa requirement APIs
    const mockVisaInfo = {
      usaCitizens: 'US citizens can visit for tourism or business for up to 90 days without a visa as part of the Visa Waiver Program.',
      processingTime: 'Not applicable for visa waiver',
      cost: 'No visa fee, but ESTA authorization required ($14)',
      validityPeriod: '90 days',
      applicationUrl: 'https://esta.cbp.dhs.gov/'
    }

    return mockVisaInfo
  }

  async getHealthRequirements(countryCode: string): Promise<any> {
    // Mock implementation - integrate with CDC or WHO APIs
    const mockHealthInfo = {
      requiredVaccinations: [],
      recommendedVaccinations: [
        {
          vaccination: 'Routine vaccines',
          description: 'Make sure you are up-to-date on routine vaccines before every trip.',
          riskLevel: 'low'
        },
        {
          vaccination: 'Hepatitis A',
          description: 'Recommended for most travelers to this destination.',
          riskLevel: 'medium'
        }
      ],
      healthInsurance: 'Health insurance is recommended for all travelers.',
      medicalFacilities: 'Medical facilities are generally good in major cities.'
    }

    return mockHealthInfo
  }
}