import type { TaskHandler } from 'payload'
import Parser from 'rss-parser'

const parser = new Parser()

export const travelAdvisorySync: TaskHandler<'travel-advisory-sync'> = async ({ req, job: _job }) => {
  const { payload } = req
  try {
    payload.logger.info('Starting travel advisory sync...')

    // US State Department RSS feed
    const rssUrl = 'https://travel.state.gov/content/travel/en/traveladvisories/_jcr_content.feed'

    const feed = await parser.parseURL(rssUrl)

    let created = 0
    let updated = 0

    for (const item of feed.items) {
      const title = item.title || ''
      const countryMatch = title.match(/Travel Advisory - (.+)/)
      const countryTag = countryMatch ? countryMatch[1] : ''

      // Extract threat level from content
      let threatLevel: '1' | '2' | '3' | '4' = '1'
      const content = item.contentSnippet || item.content || ''

      if (content.includes('Do Not Travel')) {
        threatLevel = '4'
      } else if (content.includes('Reconsider Travel')) {
        threatLevel = '3'
      } else if (content.includes('Exercise Increased Caution')) {
        threatLevel = '2'
      }

      // Try to find matching country in our database
      let countryId: number | undefined
      if (countryTag) {
        const countries = await payload.find({
          collection: 'countries',
          where: {
            name: {
              equals: countryTag,
            },
          },
          limit: 1,
        })

        if (countries.docs.length > 0) {
          countryId = countries.docs[0]?.id
        }
      }

      // Check if advisory already exists
      const existingAdvisory = await payload.find({
        collection: 'travel-advisories',
        where: {
          and: [
            {
              title: {
                equals: title,
              },
            },
            {
              link: {
                equals: item.link,
              },
            },
          ],
        },
      })

      if (existingAdvisory.docs.length === 0) {
        await payload.create({
          collection: 'travel-advisories',
          data: {
            title,
            pubDate: item.pubDate || new Date().toISOString(),
            link: item.link,
            threatLevel,
            countryTag,
            country: countryId,
            category: 'advisory',
            description: item.contentSnippet || item.content || '',
            isActive: true,
          },
        })

        created++
        payload.logger.info(`Created new travel advisory: ${title}`)
      } else {
        // Update existing advisory
        const existingDoc = existingAdvisory.docs[0]
        if (existingDoc) {
          await payload.update({
            collection: 'travel-advisories',
            id: existingDoc.id,
            data: {
              threatLevel,
              description: item.contentSnippet || item.content || '',
              pubDate: item.pubDate || new Date().toISOString(),
              country: countryId,
              isActive: true,
            },
          })

          updated++
          payload.logger.info(`Updated travel advisory: ${title}`)
        }
      }
    }

    payload.logger.info(`Travel advisory sync completed. Created: ${created}, Updated: ${updated}`)

    return {
      output: {
        created,
        updated
      }
    }
  } catch (error) {
    payload.logger.error('Error syncing travel advisories:', error)
    throw error
  }
}