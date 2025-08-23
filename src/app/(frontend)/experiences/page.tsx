import type { Metadata } from 'next/types'

import { ExperienceArchive } from '@/components/ExperienceArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const experiences = await payload.find({
    collection: 'experiences',
    depth: 2, // Deeper depth to get related data
    limit: 12,
    overrideAccess: false,
    // Temporarily remove status filter to see all experiences
    // where: {
    //   status: {
    //     equals: 'published',
    //   },
    // },
    select: {
      title: true,
      slug: true,
      shortDescription: true,
      heroImage: true,
      experienceType: true,
      duration: true,
      priceRange: true,
      destinations: true,
      featured: true,
    },
  })

  console.log('Found experiences:', experiences.totalDocs, experiences.docs)

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Travel Experiences</h1>
          <p className="lead">
            Discover our curated collection of extraordinary travel experiences. 
            From thrilling adventures to cultural immersions, each journey is 
            carefully crafted to create unforgettable memories.
          </p>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="experiences"
          currentPage={experiences.page}
          limit={12}
          totalDocs={experiences.totalDocs}
        />
      </div>

      <ExperienceArchive experiences={experiences.docs} />

      <div className="container">
        {experiences.totalPages > 1 && experiences.page && (
          <Pagination page={experiences.page} totalPages={experiences.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Travel Experiences | Curated Adventures & Tours',
    description: 'Explore our collection of carefully curated travel experiences, from Amazon adventures to cultural journeys. Find your perfect trip.',
  }
}
