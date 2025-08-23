import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
})

// ... (keep all the interfaces the same)

export class TravelItineraryAI {
  async generateItinerary(request: ItineraryRequest): Promise<GeneratedItinerary> {
    const prompt = this.buildPrompt(request)
    
    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-opus-20240229', // or 'claude-3-sonnet-20240229' for faster/cheaper
        max_tokens: 4000,
        temperature: 0.7,
        system: "You are a professional travel planner creating detailed itineraries.",
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
      
      const text = message.content[0]?.text || ''
      
      // Parse the AI response and structure it
      const itinerary = this.parseAIResponse(text, request)
      
      return itinerary
    } catch (error) {
      console.error('Error generating itinerary:', error)
      // Return a fallback itinerary
      return this.generateFallbackItinerary(request)
    }
  }
  
  // ... rest of the methods remain the same
}
