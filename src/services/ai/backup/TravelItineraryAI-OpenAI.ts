import OpenAI from 'openai'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// ... (keep all the interfaces the same)

export class TravelItineraryAI {
  async generateItinerary(request: ItineraryRequest): Promise<GeneratedItinerary> {
    const prompt = this.buildPrompt(request)
    
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional travel planner creating detailed itineraries."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gpt-4-turbo-preview", // or "gpt-3.5-turbo" for cheaper option
        temperature: 0.7,
        max_tokens: 4000
      })
      
      const text = completion.choices[0]?.message?.content || ''
      
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
