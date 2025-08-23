'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function syncCurrencyExchangeRates() {
  const payload = await getPayload({ config })
  
  try {
    // Queue the currency exchange sync job
    const job = await payload.jobs.queue({
      task: 'currency-exchange-sync' as any,
      input: {},
      waitUntil: new Date(), // Run immediately
    })
    
    payload.logger.info(`Currency exchange sync job queued with ID: ${job.id}`)
    
    return {
      success: true,
      jobId: job.id,
      message: 'Currency exchange rate sync has been queued successfully',
    }
  } catch (error) {
    payload.logger.error('Failed to queue currency exchange sync:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to queue currency exchange sync',
    }
  }
}