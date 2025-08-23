export const destinationPrompts = {
  basicDescription: (destinationName: string, country: string) => `
    Write a compelling, luxury-focused description for ${destinationName}, ${country} as a high-end travel destination. 
    Focus on what makes this destination special for luxury travelers. Include:
    - Unique characteristics and atmosphere
    - Luxury appeal and exclusivity
    - Cultural significance
    - Natural beauty or architectural marvels
    
    Write in an engaging, sophisticated tone that appeals to affluent travelers seeking extraordinary experiences.
    Length: 200-300 words.
  `,

  shortDescription: (destinationName: string) => `
    Write a brief, enticing description of ${destinationName} for use in travel cards and search results.
    Focus on the most compelling luxury aspects in 1-2 sentences.
    Maximum 150 characters.
  `,

  luxuryAccommodations: (destinationName: string, country: string) => `
    Research and provide detailed information about the top 5 most luxurious hotels and resorts in ${destinationName}, ${country}.
    For each property, include:
    - Name and category (5-star hotel, luxury resort, etc.)
    - Star rating and luxury classification
    - Price range per night in USD
    - Detailed description emphasizing luxury features
    - Key amenities and services
    - Suite types and their features
    - Awards or recognition
    - Contact information
    
    Focus on ultra-luxury properties that cater to the most discerning travelers.
  `,

  fineDining: (destinationName: string, country: string) => `
    Provide comprehensive information about fine dining in ${destinationName}, ${country}, including:
    
    Michelin Star Restaurants:
    - All Michelin-starred establishments
    - Chef names and their background
    - Signature dishes and cuisine style
    - Price ranges and reservation requirements
    - Dress codes and special requirements
    
    Other High-End Dining:
    - Celebrity chef restaurants
    - Exclusive dining experiences
    - Local specialty restaurants of exceptional quality
    - Private dining options
    
    Focus on establishments that offer exceptional culinary experiences for luxury travelers.
  `,

  luxuryExperiences: (destinationName: string, country: string) => `
    Detail exclusive, luxury experiences available in ${destinationName}, ${country}:
    
    - Private tours and VIP access experiences
    - Exclusive cultural experiences
    - Luxury adventure activities
    - Wellness and spa experiences
    - Art and cultural immersion
    - Shopping experiences
    - Unique local experiences only available to luxury travelers
    
    For each experience, include:
    - Description and what makes it special
    - Duration and pricing
    - Exclusivity level (private, small group, VIP access)
    - Best time to experience
    - Booking requirements
  `,

  travelRequirements: (destinationName: string, country: string) => `
    Provide comprehensive travel requirements and safety information for ${destinationName}, ${country}:
    
    Visa Requirements:
    - Requirements for US citizens
    - Processing time and costs
    - Application process
    
    Health Requirements:
    - Required vaccinations
    - Recommended vaccinations
    - Health insurance requirements
    - Medical facilities quality
    
    Safety Information:
    - Overall safety rating
    - Common scams to avoid
    - Areas to avoid
    - Emergency contact numbers
    - Political situation if relevant
    
    Customs and Laws:
    - Important laws tourists should know
    - Customs regulations
    - Cultural norms and etiquette
    - Tipping customs
  `,

  weatherAndClimate: (destinationName: string, country: string) => `
    Provide detailed weather and climate information for ${destinationName}, ${country}:
    
    - Overall climate description
    - Best time to visit with detailed reasoning
    - Peak season (pros and cons)
    - Shoulder season (pros and cons)
    - Off season (pros and cons)
    - Seasonal weather breakdown with temperatures, rainfall, humidity
    - Weather alerts (hurricane season, extreme weather, etc.)
    - Clothing recommendations by season
    
    Focus on helping luxury travelers choose the optimal time for their visit.
  `,

  transportation: (destinationName: string, country: string) => `
    Detail luxury transportation options for ${destinationName}, ${country}:
    
    Getting There:
    - Major airports and airlines
    - Private jet options
    - Luxury ground transportation from airports
    
    Local Transportation:
    - Private driver services
    - Luxury car rental options
    - Helicopter transfers
    - Yacht charters if applicable
    - Luxury train services if available
    
    Include provider names, contact information, and price ranges where possible.
  `,

  shoppingAndLuxuryGoods: (destinationName: string, country: string) => `
    Detail luxury shopping opportunities in ${destinationName}, ${country}:
    
    - High-end department stores and boutiques
    - Designer flagship stores
    - Local luxury brands and artisans
    - Jewelry and watch boutiques
    - Art galleries and antique shops
    - Unique local specialties worth purchasing
    - Personal shopping services
    - Shopping districts and luxury malls
    
    Include addresses and what makes each shopping destination special.
  `,

  seoContent: (destinationName: string, country: string) => `
    Generate SEO-optimized content for ${destinationName}, ${country}:
    
    - SEO title (50-60 characters)
    - Meta description (150-160 characters)
    - Keywords (focus on luxury travel terms)
    - Marketing tagline
    - Key highlights for marketing materials
    - Target audience identification
    - Social media hashtags
    
    Focus on luxury travel keywords and appeal to high-end travelers.
  `,

  bulkDestinationPrompt: (destinations: string[]) => `
    For each of the following destinations, provide basic information suitable for a luxury travel database:
    ${destinations.map(dest => `- ${dest}`).join('\n')}
    
    For each destination, provide:
    1. Country and region
    2. Brief luxury appeal description (50 words)
    3. Best time to visit
    4. Primary luxury attractions (top 3)
    5. Approximate coordinates (latitude, longitude)
    
    Format as JSON array with consistent structure.
  `
}
