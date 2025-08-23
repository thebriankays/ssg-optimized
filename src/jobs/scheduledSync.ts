import type { TaskHandler } from 'payload'

export const scheduledSync: TaskHandler<'scheduled-sync'> = async ({ req, job: _job }) => {
  const { payload } = req
  
  payload.logger.info('Running scheduled sync tasks...')
  
  const results = {
    travelAdvisory: { success: false, error: null as unknown },
    michelin: { success: false, error: null as unknown },
    airportMisery: { success: false, error: null as unknown },
    currencyExchange: { success: false, error: null as unknown },
  }
  
  // Run travel advisory sync
  try {
    await payload.jobs.queue({
      task: 'travel-advisory-sync',
      input: {},
      waitUntil: new Date(), // Run immediately
    })
    results.travelAdvisory.success = true
  } catch (error) {
    results.travelAdvisory.error = error
    payload.logger.error('Travel advisory sync failed:', error)
  }
  
  // Run Michelin sync
  try {
    await payload.jobs.queue({
      task: 'michelin-sync',
      input: {},
      waitUntil: new Date(), // Run immediately
    })
    results.michelin.success = true
  } catch (error) {
    results.michelin.error = error
    payload.logger.error('Michelin sync failed:', error)
  }
  
  // Run airport misery sync (hourly)
  try {
    await payload.jobs.queue({
      task: 'airport-misery-sync',
      input: {},
      waitUntil: new Date(), // Run immediately
    })
    results.airportMisery.success = true
  } catch (error) {
    results.airportMisery.error = error
    payload.logger.error('Airport misery sync failed:', error)
  }
  
  // Run currency exchange sync
  try {
    await payload.jobs.queue({
      task: 'currency-exchange-sync' as any,
      input: {},
      waitUntil: new Date(), // Run immediately
    })
    results.currencyExchange.success = true
    payload.logger.info('Currency exchange sync queued successfully')
  } catch (error) {
    results.currencyExchange.error = error
    payload.logger.error('Currency exchange sync failed:', error)
  }
  
  payload.logger.info('Scheduled sync completed', results)
  
  return {
    output: results
  }
}