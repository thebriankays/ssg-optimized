import type { TaskHandler } from 'payload'
import type { Currency } from '@/payload-types'

interface ExchangeRatesResponse {
  disclaimer: string
  license: string
  timestamp: number
  base: string
  rates: Record<string, number>
  error?: boolean
  status?: number
  message?: string
  description?: string
}

export const currencyExchangeSync: TaskHandler<any> = async ({ req }) => {
  const { payload } = req
  const API_KEY = process.env.OPEN_EXCHANGE_RATES_API_KEY
  
  if (!API_KEY) {
    payload.logger.error('Open Exchange Rates API key not configured')
    throw new Error('OPEN_EXCHANGE_RATES_API_KEY environment variable is required')
  }
  
  payload.logger.info('Starting currency exchange rate sync...')
  
  try {
    // Fetch latest exchange rates from Open Exchange Rates API
    // The free tier only allows USD as base currency
    const response = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${API_KEY}&base=USD`
    )
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`)
    }
    
    const data: ExchangeRatesResponse = await response.json()
    
    if (data.error) {
      throw new Error(data.description || data.message || 'API error')
    }
    
    // Get all currencies from the database
    const { docs: currencies } = await payload.find({
      collection: 'currencies',
      limit: 0, // Get all currencies
      depth: 0,
    }) as { docs: Currency[] }
    
    payload.logger.info(`Found ${currencies.length} currencies to update`)
    
    let updated = 0
    let failed = 0
    const errors: string[] = []
    
    // Update each currency with its exchange rate
    for (const currency of currencies) {
      try {
        const code = currency.code
        
        // Check if we have a rate for this currency
        if (!(code in data.rates)) {
          payload.logger.warn(`No exchange rate found for ${code}`)
          continue
        }
        
        const rate = data.rates[code]
        
        // Update the currency with the new exchange rate
        await payload.update({
          collection: 'currencies',
          id: currency.id,
          data: {
            exchangeRate: rate,
            exchangeRateUpdatedAt: new Date().toISOString(),
          },
        })
        
        updated++
        
        // Log progress every 10 currencies
        if (updated % 10 === 0) {
          payload.logger.info(`Updated ${updated} currencies...`)
        }
      } catch (error) {
        failed++
        const errorMsg = `Failed to update ${currency.code}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMsg)
        payload.logger.error(errorMsg)
      }
    }
    
    // Special handling for USD (base currency) - should always be 1
    try {
      const usdCurrency = currencies.find((c: Currency) => c.code === 'USD')
      if (usdCurrency) {
        await payload.update({
          collection: 'currencies',
          id: usdCurrency.id,
          data: {
            exchangeRate: 1,
            exchangeRateUpdatedAt: new Date().toISOString(),
          },
        })
      }
    } catch (error) {
      payload.logger.warn('Failed to update USD rate')
    }
    
    const result = {
      success: true,
      timestamp: new Date(data.timestamp * 1000).toISOString(),
      baseCurrency: data.base,
      currenciesTotal: currencies.length,
      currenciesUpdated: updated,
      currenciesFailed: failed,
      errors: errors.length > 0 ? errors : undefined,
    }
    
    payload.logger.info('Currency exchange rate sync completed', result)
    
    return {
      output: result,
    }
  } catch (error) {
    payload.logger.error('Currency exchange rate sync failed:', error)
    throw error
  }
}