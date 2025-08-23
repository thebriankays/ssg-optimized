// Example of how to schedule the hourly sync job
// Add this to your server initialization or a separate scheduling file

import { getPayload } from 'payload'
import config from '@payload-config'

export async function setupScheduledJobs() {
  const payload = await getPayload({ config })
  
  // Schedule hourly sync to run every hour
  // This would typically be done through your hosting provider's cron system
  // or a job scheduling service
  
  // Example using a simple interval (for development)
  if (process.env.NODE_ENV === 'production') {
    setInterval(async () => {
      try {
        await payload.jobs.queue({
          task: 'hourly-sync',
          input: {},
        })
        console.log('Hourly sync job queued at', new Date().toISOString())
      } catch (error) {
        console.error('Failed to queue hourly sync:', error)
      }
    }, 60 * 60 * 1000) // Every hour
  }
}

// Call this when your server starts
// setupScheduledJobs()