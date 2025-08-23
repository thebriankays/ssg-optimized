import type { TaskHandler } from 'payload'

export const hourlySync: TaskHandler<'hourly-sync'> = async ({ req, job: _job }) => {
  const { payload } = req
  
  payload.logger.info('Running hourly sync tasks...')
  
  const results = {
    airportMisery: { success: false, error: null as unknown },
  }
  
  // Run airport misery sync
  try {
    await payload.jobs.queue({
      task: 'airport-misery-sync',
      input: {},
      waitUntil: new Date(), // Run immediately
    })
    results.airportMisery.success = true
    payload.logger.info('Airport misery sync queued successfully')
  } catch (error) {
    results.airportMisery.error = error
    payload.logger.error('Airport misery sync failed:', error)
  }
  
  payload.logger.info('Hourly sync completed', results)
  
  return {
    output: results
  }
}