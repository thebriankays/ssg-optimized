import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { SplashHero } from '@/heros/splash/SplashHero'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const destinations = await payload.find({
    collection: 'destinations',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = destinations.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function DestinationPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const url = '/destinations/' + slug
  const destination = await queryDestinationBySlug({ slug })

  if (!destination) return <PayloadRedirects url={url} />

  // Create blocks dynamically for the destination template
  // These match the structure that RenderBlocks expects
  const blocks = [
    {
      blockType: 'destinationDetailBlock' as const,
      destination: destination.id,
      background: { backgroundType: 'transparent' as const },
      separatorLinesColor: '#ffd074',
      quickLookColor: '#ffffff',
      destinationTitleColor: '#ffffff',
      textColor: '#ffffff',
      fieldLabelsColor: '#ffffff',
      flagSettings: {
        animationSpeed: 6,
        wireframe: false,
        segments: 64,
        frequencyX: 5,
        frequencyY: 3,
        strength: 0.2,
        showControls: false,
      },
    } as const,
    // Add 3D Area Explorer if destination has coordinates and 3D is enabled
    ...(destination.enable3DMap && destination.locationData?.coordinates?.lat && destination.locationData?.coordinates?.lng ? [{
      blockType: 'areaExplorer' as const,
      locationName: destination.title,
      locationDescription: `Explore ${destination.title} in 3D`,
      latitude: destination.locationData.coordinates.lat,
      longitude: destination.locationData.coordinates.lng,
      showPOIs: true,
      poiTypes: ['tourist_attraction', 'restaurant', 'lodging', 'park', 'cafe'] as Array<'tourist_attraction' | 'restaurant' | 'park' | 'bar' | 'cafe' | 'store' | 'supermarket' | 'bank' | 'school' | 'bus_station' | 'train_station' | 'airport' | 'parking' | 'lodging'>,
      poiDensity: 50,
      searchRadius: 2000,
      autoOrbit: false,
      cameraSpeed: 0.5,
      initialHeading: 0,
      initialPitch: -45,
      initialRange: 5000,
      theme: 'dark' as const,
      height: '100vh',
      marginTop: '0',
      marginBottom: '0',
      showControls: true,
      showAttribution: true,
      showSidebar: true,
    }] : []),
    {
      blockType: 'weatherCardBlock' as const,
      title: 'Weather Forecast',
      location: destination.title,
      lat: destination.locationData?.coordinates?.lat || destination.lat || null,
      lng: destination.locationData?.coordinates?.lng || destination.lng || null,
      useMockData: false,
    } as const,
  ]

  return (
    <article>
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      {/* HERO SECTION (S-1) */}
      <SplashHero splashHero={(destination as any).splashHero || { 
        enabled: true, 
        title: destination.title, 
        titleSubtext: 'Destination' 
      }} />

      <div className="pt-16 pb-16">
        <div className="container mb-8">
          <h1 className="text-4xl font-bold">{destination.title}</h1>
        </div>

        {/* Render blocks using the same system as pages */}
        <RenderBlocks blocks={blocks} />
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const destination = await queryDestinationBySlug({ slug })

  return generateMeta({ doc: destination })
}

const queryDestinationBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'destinations',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
