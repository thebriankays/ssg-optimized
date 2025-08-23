import type { Metadata } from 'next/types'

import { DestinationArchive } from '@/components/DestinationArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { SplashHero } from '@/heros/splash/SplashHero'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  // Fetch site settings for the hero configuration
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 2,
  })

  const destinations = await payload.find({
    collection: 'destinations',
    depth: 1,
    limit: 12,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      country: true,
      city: true,
      continent: true,
      featuredImage: true,
      flagSvg: true,
      countryData: true,
    },
  })

  return (
    <div>
      <PageClient />
      
      {/* HERO SECTION (S-1) */}
      <SplashHero splashHero={{
        enabled: (siteSettings as any)?.destinationsPageHero?.heroEnabled || true,
        background: {
          type: (siteSettings as any)?.destinationsPageHero?.heroBgType || 'video',
          videoSrc: typeof (siteSettings as any)?.destinationsPageHero?.heroBgVideo === 'object' 
            ? (siteSettings as any).destinationsPageHero.heroBgVideo?.url 
            : '/8588881-uhd_2732_1440_25fps.mp4',
          image: (siteSettings as any)?.destinationsPageHero?.heroBgImage,
          dataSpeed: (siteSettings as any)?.destinationsPageHero?.heroBgSpeed || 0.5,
        },
        title: (siteSettings as any)?.destinationsPageHero?.heroTitle || 'Destinations',
        titleSubtext: (siteSettings as any)?.destinationsPageHero?.heroSubtext || 'Explore the World',
        textPosition: (siteSettings as any)?.destinationsPageHero?.heroTextPos || 'center',
        animationDirection: (siteSettings as any)?.destinationsPageHero?.heroAnimDir || 'left',
        showBottomGradient: (siteSettings as any)?.destinationsPageHero?.heroBottomGradient ?? true,
        showLogo: (siteSettings as any)?.destinationsPageHero?.heroShowLogo ?? true,
        logoConfig: {
          size: (siteSettings as any)?.destinationsPageHero?.heroLogoSize || 400,
          color: (siteSettings as any)?.destinationsPageHero?.heroLogoColor || 'rgba(0,0,0,0.9)',
          speed: (siteSettings as any)?.destinationsPageHero?.heroLogoSpeed || 0.3,
        },
      }} />
      
      <div className="pt-24 pb-24">
        <div className="container mb-16">
          <div className="prose dark:prose-invert max-w-none">
            <h1>Destinations</h1>
          </div>
        </div>

        <div className="container mb-8">
          <PageRange
            collection="destinations"
            currentPage={destinations.page}
            limit={12}
            totalDocs={destinations.totalDocs}
          />
        </div>

        <DestinationArchive destinations={destinations.docs} />

        <div className="container">
          {destinations.totalPages > 1 && destinations.page && (
            <Pagination page={destinations.page} totalPages={destinations.totalPages} />
          )}
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Travel Destinations`,
  }
}
