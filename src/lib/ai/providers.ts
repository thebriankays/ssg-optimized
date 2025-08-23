import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'

const openaiProvider = openai({
  apiKey: process.env.OPENAI_API_KEY,
})

const anthropicProvider = anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
})

const googleProvider = google({
  apiKey: process.env.GOOGLE_AI_API_KEY,
})

export const aiProviders = {
  openai: {
    client: openaiProvider,
    models: {
      gpt4: 'gpt-4-turbo-preview',
      gpt35: 'gpt-3.5-turbo',
    }
  },
  anthropic: {
    client: anthropicProvider,
    models: {
      claude3: 'claude-3-sonnet-20240229',
      claude3Haiku: 'claude-3-haiku-20240307',
    }
  },
  google: {
    client: googleProvider,
    models: {
      gemini: 'models/gemini-1.5-pro-latest',
      geminiFlash: 'models/gemini-1.5-flash-latest',
    }
  }
}

export type AIProvider = keyof typeof aiProviders
export type AIModel = string
