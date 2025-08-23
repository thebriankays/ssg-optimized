import type { TaskConfig, WorkflowConfig } from 'payload'
import { travelAdvisorySync } from './travelAdvisorySync'
import { michelinSync } from './michelinSync'
import { scheduledSync } from './scheduledSync'
import { optimizeMediaHandler } from './optimizeMedia'
import { airportMiserySync } from './airportMiserySync'
import { hourlySync } from './hourlySync'
import { currencyExchangeSync } from './currencyExchangeSync'

// Define the task configurations
export const tasks: TaskConfig[] = [
  {
    slug: 'travel-advisory-sync',
    handler: travelAdvisorySync,
  },
  {
    slug: 'michelin-sync',
    handler: michelinSync,
  },
  {
    slug: 'scheduled-sync',
    handler: scheduledSync,
  },
  {
    slug: 'optimize-media',
    handler: optimizeMediaHandler,
    retries: 2,
  },
  {
    slug: 'airport-misery-sync',
    handler: airportMiserySync,
  },
  {
    slug: 'hourly-sync',
    handler: hourlySync,
  },
  {
    slug: 'currency-exchange-sync' as const,
    handler: currencyExchangeSync,
    label: 'Currency Exchange Rate Sync',
    schedule: [
      {
        // Run daily at 2 AM UTC
        cron: '0 2 * * *',
        queue: 'daily',
      },
    ],
  } as TaskConfig,
]

export const workflows: WorkflowConfig[] = []