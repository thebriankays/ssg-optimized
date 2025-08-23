import type { Metadata } from 'next/types'
import { notFound } from 'next/navigation'

import { ExperienceArchive } from '@/components/ExperienceArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

export const dynamic = 'force-static'
export const revalidate = 600

type Args = {
  params: Promise<{
    page: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { page: pageParam } = await paramsPromise
  const page = parseInt(pageParam)

  if (isNaN(page) || page < 1) {
    notFound()
  }

  const payload = await getPayload({ config: configPromise })

  const experiences = await payload.find({
    collection: 'experiences',
    depth: 2,
    limit: 12,
    page,
    overrideAccess: false,
    where: {
      status: {
        equals: 'published',
      },
    },
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

  if (page > experiences.totalPages || experiences.docs.length === 0) {
    notFound()
  }

  return (
    <div className="pt-24 pb-24">
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

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  
  const experiences = await payload.find({
    collection: 'experiences',
    limit: 0,
    where: {
      status: {
        equals: 'published',
      },
    },
  })

  const totalPages = Math.ceil(experiences.totalDocs / 12)

  return Array.from({ length: totalPages }, (_, i) => ({
    page: String(i + 1),
  }))
}

export function generateMetadata({ params: paramsPromise }: Args): Metadata {
  return {
    title: `Travel Experiences - Page ${paramsPromise}`,
    description: 'Explore our collection of carefully curated travel experiences, from Amazon adventures to cultural journeys. Find your perfect trip.',
  }
}
