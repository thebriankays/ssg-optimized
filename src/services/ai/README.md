# AI Services Documentation

## Overview

This directory contains AI services that use the Vercel AI SDK to provide unified access to multiple AI providers.

## Main Service

### TravelItineraryAI.ts
The main travel itinerary generation service that:
- Uses Vercel AI SDK for provider abstraction
- Reads configuration from Payload CMS Site Settings
- Supports OpenAI, Anthropic, and Google AI providers
- Automatically selects the configured provider and model

## Configuration

Configuration is managed through the Payload CMS admin panel under:
**Settings → Site Settings → AI Configuration**

### Available Providers

1. **OpenAI**
   - Models: GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
   - Best for: General purpose, widely supported
   - Cost: Variable (GPT-3.5 is most affordable)

2. **Anthropic**
   - Models: Claude 3 Opus, Sonnet, Haiku
   - Best for: Nuanced responses, large context
   - Cost: Opus is premium, Haiku is affordable

3. **Google**
   - Models: Gemini Pro, Gemini Pro Vision
   - Best for: Free tier available
   - Cost: Generous free tier, then pay-as-you-go

## Usage Example

```typescript
import { travelAI } from '@/services/ai/TravelItineraryAI'

const itinerary = await travelAI.generateItinerary({
  destinations: ['Paris', 'Rome'],
  startDate: '2024-06-01',
  endDate: '2024-06-10',
  groupType: 'couple',
  interests: ['culture', 'food'],
  preferredPace: 'moderate',
  budgetRange: 'mid-range',
  accommodationPreferences: ['hotel'],
  transportationPreferences: ['train']
})
```

## Environment Variables

Required API keys should be set in your `.env` file:

```env
# At least one of these is required
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GEMINI_API_KEY=AIza...
```

## How It Works

1. **Provider Selection**: The service checks Site Settings for the configured provider
2. **Model Loading**: Loads the appropriate model using Vercel AI SDK
3. **Prompt Generation**: Builds a structured prompt for the itinerary
4. **AI Generation**: Sends the prompt to the selected AI provider
5. **Response Parsing**: Structures the AI response into a typed itinerary
6. **Fallback**: If AI fails, generates a basic itinerary

## Extending the Service

To add new AI features:

1. Create a new method in the service class
2. Use the `getAIModel()` method to get the configured provider
3. Use `generateText()` from Vercel AI SDK
4. Parse and structure the response

Example:
```typescript
async generatePackingList(destination: string, season: string) {
  const { model, temperature } = await this.getAIModel()
  
  const { text } = await generateText({
    model,
    prompt: `Create a packing list for ${destination} in ${season}`,
    temperature,
    maxTokens: 500,
  })
  
  return this.parsePackingList(text)
}
```

## Backup Files

The `backup/` directory contains provider-specific implementations for reference.
These show how to use each provider's SDK directly if needed.
