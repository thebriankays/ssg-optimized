import { generateText, generateObject } from 'ai'
import { aiProviders, type AIProvider } from './providers'
import { destinationPrompts } from './prompts'
import { z } from 'zod'
import type { Payload } from 'payload'

export interface ContentGenerationOptions {
  provider?: AIProvider
  model?: string
  temperature?: number
}

export interface DestinationContentRequest {
  destinationId: string
  destinationName: string
  country: string
  sections: string[]
  options?: ContentGenerationOptions
}

export interface AIGenerationLog {
  timestamp: string
  service: string
  section: string
  prompt: string
  status: 'success' | 'partial' | 'failed'
  error?: string
}

const defaultOptions: ContentGenerationOptions = {
  provider: 'openai',
  model: 'gpt-4-turbo-preview',
  temperature: 0.7
}

export class DestinationContentGenerator {
  private payload: Payload

  constructor(payload: Payload) {
    this.payload = payload
  }

  async generateBasicDescription(
    destinationName: string, 
    country: string, 
    options: ContentGenerationOptions = defaultOptions
  ): Promise<{ content: string; log: AIGenerationLog }> {
    const providerName = options.provider || 'openai'
    const provider = aiProviders[providerName]
    const modelName = options.model || (provider.models as any).gpt4 || Object.values(provider.models)[0]
    
    // Get the model based on provider
    let model: any
    if (providerName === 'openai') {
      model = (provider.client as any).chat(modelName)
    } else if (providerName === 'anthropic') {
      model = (provider.client as any).chat(modelName)
    } else if (providerName === 'google') {
      model = (provider.client as any).chat(modelName)
    }
    
    const prompt = destinationPrompts.basicDescription(destinationName, country)
    
    try {
      const result = await generateText({
        model,
        prompt,
        temperature: options.temperature || 0.7,
      })

      const log: AIGenerationLog = {
        timestamp: new Date().toISOString(),
        service: `${options.provider}-${options.model}`,
        section: 'basic-description',
        prompt,
        status: 'success'
      }

      return { content: result.text, log }
    } catch (error) {
      const log: AIGenerationLog = {
        timestamp: new Date().toISOString(),
        service: `${options.provider}-${options.model}`,
        section: 'basic-description',
        prompt,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }

      throw { error, log }
    }
  }

  async generateLuxuryAccommodations(
    destinationName: string,
    country: string,
    options: ContentGenerationOptions = defaultOptions
  ): Promise<{ content: any[]; log: AIGenerationLog }> {
    const providerName = options.provider || 'openai'
    const provider = aiProviders[providerName]
    const modelName = options.model || (provider.models as any).gpt4 || Object.values(provider.models)[0]
    
    // Get the model based on provider
    let model: any
    if (providerName === 'openai') {
      model = (provider.client as any).chat(modelName)
    } else if (providerName === 'anthropic') {
      model = (provider.client as any).chat(modelName)
    } else if (providerName === 'google') {
      model = (provider.client as any).chat(modelName)
    }
    
    const prompt = destinationPrompts.luxuryAccommodations(destinationName, country)

    const accommodationSchema = z.object({
      hotels: z.array(z.object({
        name: z.string(),
        category: z.enum(['5-star-hotel', 'luxury-resort', 'boutique-hotel', 'palace-hotel', 'private-villa', 'luxury-lodge']),
        starRating: z.number().min(1).max(5),
        luxuryRating: z.enum(['ultra-luxury', 'luxury', 'premium']),
        priceRange: z.object({
          min: z.number(),
          max: z.number(),
          currency: z.string()
        }),
        description: z.string(),
        highlights: z.array(z.string()),
        amenities: z.array(z.object({
          amenity: z.string(),
          category: z.enum(['spa-wellness', 'dining', 'recreation', 'business', 'transportation', 'concierge'])
        })),
        suiteTypes: z.array(z.object({
          name: z.string(),
          size: z.string(),
          features: z.string(),
          pricePerNight: z.number().optional()
        })),
        contactInfo: z.object({
          phone: z.string().optional(),
          email: z.string().optional(),
          website: z.string().optional(),
          address: z.string().optional(),
          reservationEmail: z.string().optional()
        }),
        awards: z.array(z.object({
          award: z.string(),
          year: z.number(),
          organization: z.string()
        })).optional()
      }))
    })

    try {
      const result = await generateObject({
        model,
        prompt,
        schema: accommodationSchema,
        temperature: options.temperature || 0.7,
      })

      const log: AIGenerationLog = {
        timestamp: new Date().toISOString(),
        service: `${options.provider}-${options.model}`,
        section: 'luxury-accommodations',
        prompt,
        status: 'success'
      }

      return { content: result.object.hotels, log }
    } catch (error) {
      const log: AIGenerationLog = {
        timestamp: new Date().toISOString(),
        service: `${options.provider}-${options.model}`,
        section: 'luxury-accommodations',
        prompt,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }

      throw { error, log }
    }
  }

  async generateFineDining(
    destinationName: string,
    country: string,
    options: ContentGenerationOptions = defaultOptions
  ): Promise<{ content: any; log: AIGenerationLog }> {
    const providerName = options.provider || 'openai'
    const provider = aiProviders[providerName]
    const modelName = options.model || (provider.models as any).gpt4 || Object.values(provider.models)[0]
    
    // Get the model based on provider
    let model: any
    if (providerName === 'openai') {
      model = (provider.client as any).chat(modelName)
    } else if (providerName === 'anthropic') {
      model = (provider.client as any).chat(modelName)
    } else if (providerName === 'google') {
      model = (provider.client as any).chat(modelName)
    }
    
    const prompt = destinationPrompts.fineDining(destinationName, country)

    const diningSchema = z.object({
      michelinStarRestaurants: z.array(z.object({
        name: z.string(),
        michelinStars: z.number().min(1).max(3),
        chef: z.string(),
        cuisine: z.string(),
        priceRange: z.enum(['expensive', 'very-expensive', 'ultra-expensive']),
        description: z.string(),
        signature_dishes: z.array(z.object({
          dish: z.string(),
          description: z.string()
        })),
        reservationInfo: z.object({
          advanceBooking: z.string(),
          phone: z.string().optional(),
          email: z.string().optional(),
          website: z.string().optional(),
          specialRequirements: z.string().optional()
        }),
        dressCode: z.string(),
        operatingHours: z.string(),
        address: z.string()
      })),
      otherFineDining: z.array(z.object({
        name: z.string(),
        category: z.enum(['fine-dining', 'celebrity-chef', 'local-specialty', 'wine-bar', 'rooftop-dining', 'private-dining']),
        chef: z.string().optional(),
        cuisine: z.string(),
        priceRange: z.string(),
        description: z.string(),
        specialties: z.array(z.string()),
        contactInfo: z.object({
          phone: z.string().optional(),
          website: z.string().optional(),
          address: z.string()
        })
      }))
    })

    try {
      const result = await generateObject({
        model,
        prompt,
        schema: diningSchema,
        temperature: options.temperature || 0.7,
      })

      const log: AIGenerationLog = {
        timestamp: new Date().toISOString(),
        service: `${options.provider}-${options.model}`,
        section: 'fine-dining',
        prompt,
        status: 'success'
      }

      return { content: result.object, log }
    } catch (error) {
      const log: AIGenerationLog = {
        timestamp: new Date().toISOString(),
        service: `${options.provider}-${options.model}`,
        section: 'fine-dining',
        prompt,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }

      throw { error, log }
    }
  }

  async generateCompleteDestination(
    request: DestinationContentRequest
  ): Promise<{ success: boolean; logs: AIGenerationLog[]; errors: any[] }> {
    const logs: AIGenerationLog[] = []
    const errors: any[] = []
    let success = true

    try {
      // Get the destination document
      const destination = await this.payload.findByID({
        collection: 'destinations',
        id: request.destinationId,
      })

      if (!destination) {
        throw new Error(`Destination with ID ${request.destinationId} not found`)
      }

      const updates: any = {}

      // Generate basic description
      if (request.sections.includes('basic-description')) {
        try {
          const { content, log } = await this.generateBasicDescription(
            request.destinationName,
            request.country,
            request.options
          )
          updates.description = content
          logs.push(log)
        } catch (error: any) {
          errors.push(error)
          logs.push(error.log)
          success = false
        }
      }

      // Generate short description
      if (request.sections.includes('short-description')) {
        try {
          const providerName = request.options?.provider || 'openai'
          const provider = aiProviders[providerName]
          const modelName = request.options?.model || (provider.models as any).gpt4 || Object.values(provider.models)[0]
          
          // Get the model based on provider
          let model: any
          if (providerName === 'openai') {
            model = (provider.client as any).chat(modelName)
          } else if (providerName === 'anthropic') {
            model = (provider.client as any).chat(modelName)
          } else if (providerName === 'google') {
            model = (provider.client as any).chat(modelName)
          }
          
          const result = await generateText({
            model,
            prompt: destinationPrompts.shortDescription(request.destinationName),
            temperature: request.options?.temperature || 0.7,
          })

          updates.shortDescription = result.text
          logs.push({
            timestamp: new Date().toISOString(),
            service: `${request.options?.provider || 'openai'}-${request.options?.model || 'gpt-4'}`,
            section: 'short-description',
            prompt: destinationPrompts.shortDescription(request.destinationName),
            status: 'success'
          })
        } catch (error: any) {
          errors.push(error)
          success = false
        }
      }

      // Generate luxury accommodations
      if (request.sections.includes('luxury-accommodations')) {
        try {
          const { content, log } = await this.generateLuxuryAccommodations(
            request.destinationName,
            request.country,
            request.options
          )
          updates.luxuryHotels = content
          logs.push(log)
        } catch (error: any) {
          errors.push(error)
          logs.push(error.log)
          success = false
        }
      }

      // Generate fine dining
      if (request.sections.includes('fine-dining')) {
        try {
          const { content, log } = await this.generateFineDining(
            request.destinationName,
            request.country,
            request.options
          )
          updates.michelinStarRestaurants = content.michelinStarRestaurants
          updates.otherFineDining = content.otherFineDining
          logs.push(log)
        } catch (error: any) {
          errors.push(error)
          logs.push(error.log)
          success = false
        }
      }

      // Update the destination with generated content
      if (Object.keys(updates).length > 0) {
        updates.aiGenerated = true
        updates.lastUpdated = new Date().toISOString()
        
        // Check if destination has aiGenerationLog field
        const hasAIGenerationLog = 'aiGenerationLog' in destination
        if (hasAIGenerationLog) {
          updates.aiGenerationLog = [...((destination as any).aiGenerationLog || []), ...logs]
        }

        await this.payload.update({
          collection: 'destinations',
          id: request.destinationId,
          data: updates,
        })
      }

      return { success, logs, errors }
    } catch (error) {
      errors.push(error)
      return { success: false, logs, errors }
    }
  }

  async generateBulkDestinations(
    destinations: string[],
    options: ContentGenerationOptions = defaultOptions
  ): Promise<{ results: any[]; logs: AIGenerationLog[] }> {
    const providerName = options.provider || 'openai'
    const provider = aiProviders[providerName]
    const modelName = options.model || (provider.models as any).gpt4 || Object.values(provider.models)[0]
    
    // Get the model based on provider
    let model: any
    if (providerName === 'openai') {
      model = (provider.client as any).chat(modelName)
    } else if (providerName === 'anthropic') {
      model = (provider.client as any).chat(modelName)
    } else if (providerName === 'google') {
      model = (provider.client as any).chat(modelName)
    }
    
    const prompt = destinationPrompts.bulkDestinationPrompt(destinations)
    const logs: AIGenerationLog[] = []

    const bulkSchema = z.array(z.object({
      name: z.string(),
      country: z.string(),
      region: z.string().optional(),
      description: z.string(),
      bestTimeToVisit: z.string(),
      attractions: z.array(z.string()),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number()
      })
    }))

    try {
      const result = await generateObject({
        model,
        prompt,
        schema: bulkSchema,
        temperature: options.temperature || 0.7,
      })

      const log: AIGenerationLog = {
        timestamp: new Date().toISOString(),
        service: `${options.provider}-${options.model}`,
        section: 'bulk-destinations',
        prompt,
        status: 'success'
      }

      logs.push(log)

      return { results: result.object, logs }
    } catch (error) {
      const log: AIGenerationLog = {
        timestamp: new Date().toISOString(),
        service: `${options.provider}-${options.model}`,
        section: 'bulk-destinations',
        prompt,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }

      logs.push(log)
      throw { error, logs }
    }
  }
}
