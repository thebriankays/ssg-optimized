import React from 'react'
import type { StorytellingBlock as StorytellingBlockType } from '../types'
import { StorytellingClient } from './Component.client'

export const StorytellingBlock: React.FC<StorytellingBlockType> = async (props) => {
  // Transform Payload data to match Google's config structure
  const config = {
    properties: {
      title: props.title,
      date: props.date,
      description: props.description,
      createdBy: props.createdBy,
      imageUrl: typeof props.coverImage === 'object' && props.coverImage?.url ? props.coverImage.url : undefined,
      imageCredit: props.imageCredit,
    },
    chapters: props.chapters?.map((chapter: any, index: number) => ({
      id: index + 1,
      title: chapter.title,
      content: chapter.content,
      dateTime: chapter.dateTime,
      imageUrl: typeof chapter.chapterImage === 'object' && chapter.chapterImage?.url ? chapter.chapterImage.url : undefined,
      imageCredit: chapter.imageCredit,
      coords: {
        lat: chapter.location?.lat || 0,
        lng: chapter.location?.lng || 0,
      },
      address: chapter.address,
      cameraOptions: {
        zoom: chapter.cameraZoom,
        tilt: chapter.cameraTilt,
        heading: chapter.cameraHeading,
      },
      focusOptions: {
        showLocationMarker: chapter.showLocationMarker,
        showFocus: chapter.showFocusRadius,
        focusRadius: chapter.focusRadius,
      },
    })) || [],
    appearance: {
      theme: props.theme || 'dark',
    },
  }

  // Use environment variables - no API keys in the CMS
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || ''

  if (!apiKey || !mapId) {
    return (
      <div className="storytelling-error">
        <p>Google Maps configuration missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY and NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID to your environment variables.</p>
      </div>
    )
  }

  if (!props.chapters || props.chapters.length === 0) {
    return (
      <div className="storytelling-error">
        <p>Please add at least one chapter to your story.</p>
      </div>
    )
  }

  return (
    <section className="storytelling-block">
      <StorytellingClient
        config={config}
        apiKey={apiKey}
        mapId={mapId}
      />
    </section>
  )
}
