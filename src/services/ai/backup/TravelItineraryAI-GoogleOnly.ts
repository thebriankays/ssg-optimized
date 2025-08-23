import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export interface ItineraryRequest {
  destinations: string[]
  startDate: string
  endDate: string
  groupType: 'solo' | 'couple' | 'family' | 'friends' | 'business'
  interests: string[]
  preferredPace: 'relaxed' | 'moderate' | 'fast-paced'
  budgetRange: 'budget' | 'mid-range' | 'luxury' | 'ultra-luxury'
  accommodationPreferences: string[]
  transportationPreferences: string[]
}

export interface ItineraryActivity {
  time: string
  title: string
  type: 'attraction' | 'restaurant' | 'activity' | 'shopping' | 'transport' | 'accommodation' | 'other'
  description: string
  location: {
    name: string
    address: string
  }
  duration: string
  estimatedCost: number
  bookingRequired: boolean
  tips?: string
}

export interface ItineraryDay {
  date: string
  dayTitle: string
  activities: ItineraryActivity[]
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner'
    restaurant: string
    cuisine: string
    address: string
    estimatedCost: number
    recommendations?: string
  }[]
  dayNotes: string
}

export interface ItineraryLeg {
  destination: string
  startDate: string
  endDate: string
  dailyPlans: ItineraryDay[]
  accommodationSuggestions: {
    name: string
    type: string
    priceRange: string
    location: string
    highlights: string[]
    bookingTips: string
  }[]
  transportationOptions: {
    type: string
    from: string
    to: string
    estimatedDuration: string
    estimatedCost: string
    tips: string
  }[]
}

export interface GeneratedItinerary {
  title: string
  overview: string
  legs: ItineraryLeg[]
  packingList: string[]
  travelTips: string[]
  estimatedBudget: {
    accommodation: number
    transportation: number
    activities: number
    food: number
    total: number
    currency: string
  }
}

const BUDGET_MULTIPLIERS = {
  'budget': { accommodation: 50, food: 30, activities: 20 },
  'mid-range': { accommodation: 150, food: 60, activities: 50 },
  'luxury': { accommodation: 400, food: 150, activities: 100 },
  'ultra-luxury': { accommodation: 1000, food: 300, activities: 200 }
}

const PACE_ACTIVITIES = {
  'relaxed': 2,
  'moderate': 3,
  'fast-paced': 5
}

export class TravelItineraryAI {
  private model: any

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  }

  async generateItinerary(request: ItineraryRequest): Promise<GeneratedItinerary> {
    const prompt = this.buildPrompt(request)
    
    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse the AI response and structure it
      const itinerary = this.parseAIResponse(text, request)
      
      return itinerary
    } catch (error) {
      console.error('Error generating itinerary:', error)
      // Return a fallback itinerary
      return this.generateFallbackItinerary(request)
    }
  }

  private buildPrompt(request: ItineraryRequest): string {
    const days = this.calculateDays(request.startDate, request.endDate)
    const activitiesPerDay = PACE_ACTIVITIES[request.preferredPace]
    
    return `Create a detailed ${days}-day travel itinerary for a ${request.groupType} trip.

Destinations: ${request.destinations.join(', ')}
Travel Dates: ${request.startDate} to ${request.endDate}
Interests: ${request.interests.join(', ')}
Budget: ${request.budgetRange}
Pace: ${request.preferredPace} (${activitiesPerDay} main activities per day)
Accommodation Preferences: ${request.accommodationPreferences.join(', ')}
Transportation Preferences: ${request.transportationPreferences.join(', ')}

Please provide a comprehensive itinerary with the following structure:

1. For each destination, create daily plans including:
   - ${activitiesPerDay} main activities/attractions based on the interests
   - Meal recommendations (breakfast, lunch, dinner) with specific restaurant names
   - Time allocations and durations
   - Estimated costs in USD
   - Practical tips and notes

2. Accommodation suggestions (3-5 options per destination) matching the budget level
3. Transportation options between destinations
4. Packing list specific to the destinations and activities
5. Travel tips relevant to the destinations

Format the response as a structured itinerary with clear sections for each day and destination.
Include specific place names, addresses where possible, and practical information.
Consider the group type (${request.groupType}) when suggesting activities and accommodations.`
  }

  private parseAIResponse(text: string, request: ItineraryRequest): GeneratedItinerary {
    // This is a simplified parser - in production, you'd want more robust parsing
    const days = this.calculateDays(request.startDate, request.endDate)
    const destinations = request.destinations
    const budget = BUDGET_MULTIPLIERS[request.budgetRange]
    
    // Create legs for each destination
    const legs: ItineraryLeg[] = []
    const daysPerDestination = Math.ceil(days / destinations.length)
    
    destinations.forEach((destination, index) => {
      const legStartDate = new Date(request.startDate)
      legStartDate.setDate(legStartDate.getDate() + (index * daysPerDestination))
      
      const legEndDate = new Date(legStartDate)
      legEndDate.setDate(legEndDate.getDate() + daysPerDestination - 1)
      
      // Create daily plans
      const dailyPlans: ItineraryDay[] = []
      for (let day = 0; day < daysPerDestination; day++) {
        const currentDate = new Date(legStartDate)
        currentDate.setDate(currentDate.getDate() + day)
        
        dailyPlans.push(this.generateDayPlan(
          destination,
          currentDate,
          day + 1,
          request.interests,
          request.preferredPace,
          request.budgetRange,
          request.groupType
        ))
      }
      
      legs.push({
        destination,
        startDate: legStartDate.toISOString().split('T')[0] || '',
        endDate: legEndDate.toISOString().split('T')[0] || '',
        dailyPlans,
        accommodationSuggestions: this.generateAccommodationSuggestions(
          destination,
          request.budgetRange,
          request.accommodationPreferences
        ) as any[],
        transportationOptions: index > 0 && destinations[index - 1] ? this.generateTransportationOptions(
          destinations[index - 1],
          destination,
          request.transportationPreferences
        ) as any[] : []
      })
    })
    
    // Calculate estimated budget
    const estimatedBudget = {
      accommodation: budget.accommodation * days,
      transportation: destinations.length * 200, // Rough estimate
      activities: budget.activities * days,
      food: budget.food * days,
      total: 0,
      currency: 'USD'
    }
    estimatedBudget.total = estimatedBudget.accommodation + estimatedBudget.transportation + 
      estimatedBudget.activities + estimatedBudget.food
    
    return {
      title: `${request.groupType.charAt(0).toUpperCase() + request.groupType.slice(1)} Adventure: ${destinations.join(' → ')}`,
      overview: `A ${days}-day ${request.preferredPace} journey through ${destinations.join(', ')} tailored for ${request.groupType} travelers with interests in ${request.interests.join(', ')}.`,
      legs,
      packingList: this.generatePackingList(destinations, request.interests),
      travelTips: this.generateTravelTips(destinations, request.groupType),
      estimatedBudget
    }
  }

  private generateDayPlan(
    destination: string,
    date: Date,
    dayNumber: number,
    interests: string[],
    pace: string,
    budget: string,
    groupType: string
  ): ItineraryDay {
    const activities = PACE_ACTIVITIES[pace as keyof typeof PACE_ACTIVITIES]
    const budgetMultiplier = BUDGET_MULTIPLIERS[budget as keyof typeof BUDGET_MULTIPLIERS]
    
    // Generate activities based on interests
    const dayActivities: ItineraryActivity[] = []
    const activityTypes = this.getActivityTypes(interests)
    const activityType1 = activityTypes[0] || 'Cultural'
    const activityType2 = activityTypes[1] || 'Local'
    
    // Morning activity
    dayActivities.push({
      time: '09:00 AM',
      title: `Explore ${destination} ${activityType1} Quarter`,
      type: 'attraction',
      description: `Start your day exploring the ${activityType1.toLowerCase()} attractions of ${destination}. Perfect for ${groupType} travelers.`,
      location: {
        name: `${destination} ${activityType1} District`,
        address: `Central ${destination}`
      },
      duration: '2-3 hours',
      estimatedCost: budgetMultiplier.activities,
      bookingRequired: false,
      tips: 'Best visited in the morning to avoid crowds'
    })
    
    // Afternoon activity
    if (activities >= 2) {
      dayActivities.push({
        time: '02:00 PM',
        title: `${activityType2} Experience`,
        type: 'activity',
        description: `Immerse yourself in the local ${activityType2.toLowerCase()} scene.`,
        location: {
          name: `${destination} ${activityType2} Center`,
          address: `Downtown ${destination}`
        },
        duration: '2 hours',
        estimatedCost: budgetMultiplier.activities * 0.8,
        bookingRequired: true,
        tips: 'Book in advance for better rates'
      })
    }
    
    // Evening activity
    if (activities >= 3) {
      dayActivities.push({
        time: '06:00 PM',
        title: interests.includes('nightlife') ? 'Evening Entertainment' : 'Sunset Viewpoint',
        type: interests.includes('nightlife') ? 'activity' : 'attraction',
        description: interests.includes('nightlife') 
          ? 'Experience the vibrant nightlife scene'
          : 'Watch the sunset from a scenic viewpoint',
        location: {
          name: interests.includes('nightlife') ? 'Entertainment District' : 'Sunset Hill',
          address: `${destination} Center`
        },
        duration: '2-3 hours',
        estimatedCost: budgetMultiplier.activities * 0.6,
        bookingRequired: false
      })
    }
    
    // Generate meals
    const meals = [
      {
        type: 'breakfast' as const,
        restaurant: `${budget === 'luxury' ? 'Grand Hotel' : 'Local Café'} ${destination}`,
        cuisine: 'International/Local',
        address: 'Near accommodation',
        estimatedCost: budgetMultiplier.food * 0.25,
        recommendations: 'Try the local breakfast specialties'
      },
      {
        type: 'lunch' as const,
        restaurant: `${this.getRestaurantName(interests, budget)} Restaurant`,
        cuisine: this.getCuisineType(interests),
        address: `${destination} City Center`,
        estimatedCost: budgetMultiplier.food * 0.35,
        recommendations: 'Peak hours are 12-2 PM, consider reservations'
      },
      {
        type: 'dinner' as const,
        restaurant: `${budget === 'budget' ? 'Street Food Market' : 'Fine Dining at'} ${destination}`,
        cuisine: 'Local Specialties',
        address: `${destination} ${budget === 'budget' ? 'Night Market' : 'Gourmet District'}`,
        estimatedCost: budgetMultiplier.food * 0.4,
        recommendations: 'Perfect for experiencing authentic local flavors'
      }
    ]
    
    return {
      date: date.toISOString().split('T')[0] || '',
      dayTitle: `Day ${dayNumber}: ${destination} ${activityType1} & ${activityType2}`,
      activities: dayActivities,
      meals,
      dayNotes: `Today focuses on ${interests.slice(0, 2).join(' and ')}. ${
        pace === 'relaxed' 
          ? 'Take your time and enjoy at a leisurely pace.' 
          : pace === 'fast-paced' 
            ? 'An action-packed day awaits!' 
            : 'A well-balanced day of exploration.'
      }`
    }
  }

  private generateAccommodationSuggestions(
    destination: string,
    budget: string,
    preferences: string[]
  ): any[] {
    const suggestions: any[] = []
    const accommodationTypes = {
      'budget': ['Hostel', 'Budget Hotel', 'Guesthouse'],
      'mid-range': ['Hotel', 'Boutique Hotel', 'Apartment'],
      'luxury': ['Luxury Hotel', 'Resort', 'Premium Hotel'],
      'ultra-luxury': ['Five-Star Hotel', 'Luxury Resort', 'Private Villa']
    }
    
    const types = accommodationTypes[budget as keyof typeof accommodationTypes]
    
    types.forEach((type, index) => {
      suggestions.push({
        name: `${destination} ${type} ${index + 1}`,
        type: type.toLowerCase().replace(' ', '-'),
        priceRange: `$${BUDGET_MULTIPLIERS[budget as keyof typeof BUDGET_MULTIPLIERS].accommodation} - $${
          BUDGET_MULTIPLIERS[budget as keyof typeof BUDGET_MULTIPLIERS].accommodation * 1.5
        }/night`,
        location: index === 0 ? 'City Center' : index === 1 ? 'Near Attractions' : 'Quiet Area',
        highlights: this.getAccommodationHighlights(type, preferences),
        bookingTips: 'Book 2-3 months in advance for best rates'
      })
    })
    
    return suggestions
  }

  private generateTransportationOptions(
    from: string,
    to: string,
    preferences: string[]
  ): any[] {
    const options: any[] = []
    const allOptions = [
      {
        type: 'flight',
        duration: '2-3 hours',
        cost: '$200-500',
        tips: 'Book early for better prices'
      },
      {
        type: 'train',
        duration: '4-6 hours',
        cost: '$50-150',
        tips: 'Scenic route available'
      },
      {
        type: 'bus',
        duration: '6-8 hours',
        cost: '$20-50',
        tips: 'Most economical option'
      },
      {
        type: 'car-rental',
        duration: '4-5 hours',
        cost: '$60-100/day + fuel',
        tips: 'Offers maximum flexibility'
      }
    ]
    
    // Filter based on preferences or include all if no preferences
    allOptions.forEach(option => {
      if (preferences.length === 0 || preferences.includes(option.type)) {
        options.push({
          type: option.type,
          from,
          to,
          estimatedDuration: option.duration,
          estimatedCost: option.cost,
          tips: option.tips
        })
      }
    })
    
    return options.length > 0 ? options : allOptions.slice(0, 2).map(option => ({
      type: option.type,
      from,
      to,
      estimatedDuration: option.duration,
      estimatedCost: option.cost,
      tips: option.tips
    }))
  }

  private generatePackingList(destinations: string[], interests: string[]): string[] {
    const basics = [
      'Passport and travel documents',
      'Travel insurance documents',
      'Medications and first aid kit',
      'Phone charger and adapter',
      'Comfortable walking shoes',
      'Weather-appropriate clothing',
      'Toiletries',
      'Reusable water bottle'
    ]
    
    const interestSpecific: { [key: string]: string[] } = {
      'beach': ['Swimsuit', 'Sunscreen', 'Beach towel', 'Snorkel gear'],
      'adventure': ['Hiking boots', 'Backpack', 'Quick-dry clothing', 'Headlamp'],
      'photography': ['Camera and lenses', 'Extra batteries', 'Memory cards', 'Tripod'],
      'culture': ['Modest clothing for temples', 'Guidebook', 'Language phrasebook'],
      'nature': ['Binoculars', 'Insect repellent', 'Hat and sunglasses', 'Field guide'],
      'shopping': ['Extra luggage space', 'Shopping bags', 'Cash and cards'],
      'wellness': ['Yoga mat', 'Workout clothes', 'Wellness journal'],
      'food': ['Antacids', 'Food journal', 'Reusable utensils']
    }
    
    let packingList = [...basics]
    interests.forEach(interest => {
      if (interestSpecific[interest]) {
        packingList = [...packingList, ...interestSpecific[interest]]
      }
    })
    
    // Remove duplicates
    return [...new Set(packingList)]
  }

  private generateTravelTips(destinations: string[], groupType: string): string[] {
    const generalTips = [
      'Check visa requirements for all destinations',
      'Notify your bank of travel plans',
      'Make copies of important documents',
      'Download offline maps for each destination',
      'Learn basic local phrases',
      'Research local customs and etiquette',
      'Check weather forecasts before packing',
      'Consider travel insurance'
    ]
    
    const groupSpecificTips: { [key: string]: string[] } = {
      'solo': [
        'Stay in well-reviewed accommodations',
        'Join group tours to meet other travelers',
        'Share your itinerary with someone at home',
        'Trust your instincts about safety'
      ],
      'couple': [
        'Book romantic dining experiences in advance',
        'Consider couple spa treatments',
        'Plan some surprise elements',
        'Balance together time with individual interests'
      ],
      'family': [
        'Pack entertainment for children',
        'Book family-friendly accommodations',
        'Plan shorter activity durations',
        'Research child-friendly restaurants'
      ],
      'business': [
        'Pack business attire appropriately',
        'Check meeting locations in advance',
        'Allow buffer time for meetings',
        'Research business etiquette'
      ],
      'friends': [
        'Discuss budget expectations upfront',
        'Plan group activities and free time',
        'Consider group discounts',
        'Designate a trip coordinator'
      ]
    }
    
    return [...generalTips, ...(groupSpecificTips[groupType] || [])]
  }

  private getActivityTypes(interests: string[]): string[] {
    const activityMap: { [key: string]: string } = {
      'adventure': 'Adventure',
      'beach': 'Beach',
      'culture': 'Cultural',
      'food': 'Culinary',
      'nature': 'Nature',
      'shopping': 'Shopping',
      'nightlife': 'Entertainment',
      'sports': 'Sports',
      'wellness': 'Wellness',
      'photography': 'Scenic',
      'art': 'Art',
      'architecture': 'Architecture'
    }
    
    return interests.map(interest => activityMap[interest] || 'Cultural')
  }

  private getRestaurantName(interests: string[], budget: string): string {
    if (interests.includes('food')) {
      return budget === 'luxury' ? 'Michelin-starred' : 'Popular Local'
    }
    return budget === 'budget' ? 'Authentic Local' : 'Recommended'
  }

  private getCuisineType(interests: string[]): string {
    if (interests.includes('food')) return 'Gourmet Local'
    if (interests.includes('adventure')) return 'Street Food'
    if (interests.includes('wellness')) return 'Healthy/Organic'
    return 'International'
  }

  private getAccommodationHighlights(type: string, preferences: string[]): string[] {
    const baseHighlights: { [key: string]: string[] } = {
      'Hostel': ['Social atmosphere', 'Budget-friendly', 'Central location'],
      'Budget Hotel': ['Clean and comfortable', 'Good value', 'Basic amenities'],
      'Guesthouse': ['Local experience', 'Personalized service', 'Homey atmosphere'],
      'Hotel': ['Full service', 'Restaurant on-site', 'Concierge service'],
      'Boutique Hotel': ['Unique design', 'Personalized service', 'Local character'],
      'Apartment': ['Kitchen facilities', 'More space', 'Local neighborhood'],
      'Luxury Hotel': ['Premium amenities', 'Spa services', 'Fine dining'],
      'Resort': ['All-inclusive options', 'Multiple restaurants', 'Activities on-site'],
      'Premium Hotel': ['Executive lounge', 'Business center', 'Luxury amenities'],
      'Five-Star Hotel': ['World-class service', 'Multiple restaurants', 'Exclusive experiences'],
      'Luxury Resort': ['Private beach/pool', 'Butler service', 'Gourmet dining'],
      'Private Villa': ['Complete privacy', 'Personal chef', 'Exclusive amenities']
    }
    
    return baseHighlights[type] || ['Comfortable stay', 'Good location', 'Friendly service']
  }

  private calculateDays(startDate: string, endDate: string): number {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  private generateFallbackItinerary(request: ItineraryRequest): GeneratedItinerary {
    // Generate a basic itinerary as fallback
    return this.parseAIResponse('', request)
  }

  async generateHotelRecommendations(
    destination: string,
    budget: string,
    preferences: string[],
    checkIn: string,
    checkOut: string
  ): Promise<any[]> {
    // This would integrate with hotel booking APIs
    // For now, return AI-generated suggestions
    const prompt = `Recommend 5 hotels in ${destination} for a ${budget} budget traveler, 
    checking in ${checkIn} and out ${checkOut}. 
    Preferences: ${preferences.join(', ')}.
    Include hotel names, locations, price ranges, and key features.`
    
    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse and return hotel recommendations
      return this.parseHotelRecommendations(text, destination, budget)
    } catch (error) {
      console.error('Error generating hotel recommendations:', error)
      return this.generateAccommodationSuggestions(destination, budget, preferences)
    }
  }

  private parseHotelRecommendations(text: string, destination: string, budget: string): any[] {
    // Simple parsing - in production, use more sophisticated parsing
    return this.generateAccommodationSuggestions(destination, budget, [])
  }

  async generateActivitySuggestions(
    destination: string,
    interests: string[],
    date: string,
    groupType: string
  ): Promise<ItineraryActivity[]> {
    const prompt = `Suggest 5 specific activities in ${destination} for ${groupType} travelers 
    interested in ${interests.join(', ')} for ${date}. 
    Include exact names of attractions, opening hours, ticket prices, and insider tips.`
    
    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse and return activity suggestions
      return this.parseActivitySuggestions(text, destination, interests)
    } catch (error) {
      console.error('Error generating activity suggestions:', error)
      // Return fallback activities
      return []
    }
  }

  private parseActivitySuggestions(text: string, destination: string, interests: string[]): ItineraryActivity[] {
    // Implement parsing logic
    return []
  }
}

// Export singleton instance
export const travelAI = new TravelItineraryAI()
