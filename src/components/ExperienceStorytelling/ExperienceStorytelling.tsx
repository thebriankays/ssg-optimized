'use client'

import React, { useMemo } from 'react'
import dynamic from 'next/dynamic'
import { extractDestinationCoordinates, extractExperienceDestinationCoordinates } from '@/utils/coordinates'
import type { Experience } from '@/payload-types'

// Dynamic import to avoid SSR issues with Cesium
const Storytelling = dynamic(
  () => import('@/components/Storytelling/Storytelling').then(mod => mod.Storytelling),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        width: '100%', 
        height: '850px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'transparent',
        color: '#fff'
      }}>
        <p>Loading Experience Story...</p>
      </div>
    )
  }
)

interface ExperienceStorytellingProps {
  experience: Partial<Experience>
  className?: string
  height?: string
}

export const ExperienceStorytelling: React.FC<ExperienceStorytellingProps> = React.memo(({ 
  experience, 
  className,
  height = '850px'
}) => {
  // Check if storytelling is enabled and we have chapters
  if (!experience.enable3DStorytelling || !experience.storyChapters?.length) {
    return null
  }

  // Get API keys from environment
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const cesiumToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN

  if (!googleApiKey) {
    return (
      <div className={`experience-storytelling-error ${className || ''}`}>
        <p>Google Maps API key is not configured.</p>
      </div>
    )
  }

  // Build chapters from the story configuration using useMemo to prevent re-calculation
  const chapters = useMemo(() => {
    const chapterList: any[] = []
    
    // First, let's log the raw destinations to understand the structure
    if (process.env.NODE_ENV === 'development' && experience.destinations?.[0]) {
      console.log('\n=== RAW DESTINATION CHECK ===')
      const firstDest = experience.destinations[0]
      console.log('First destination item:', firstDest)
      if (firstDest.destination && typeof firstDest.destination === 'object') {
        console.log('Destination object keys:', Object.keys(firstDest.destination))
        console.log('Full destination object:', JSON.stringify(firstDest.destination, null, 2))
        console.log('LocationData:', firstDest.destination.locationData)
        console.log('LocationData stringified:', JSON.stringify(firstDest.destination.locationData, null, 2))
        console.log('LocationData.coordinates:', firstDest.destination.locationData?.coordinates)
        if (firstDest.destination.locationData?.coordinates) {
          console.log('Coordinates lat:', firstDest.destination.locationData.coordinates.lat)
          console.log('Coordinates lng:', firstDest.destination.locationData.coordinates.lng)
        }
        console.log('Direct lat:', firstDest.destination.lat)
        console.log('Direct lng:', firstDest.destination.lng)
      }
    }
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('=== ExperienceStorytelling Debug ===')
      console.log('Experience title:', experience.title)
      console.log('Destinations array:', experience.destinations)
      console.log('Story chapters:', experience.storyChapters)
      
      // Log destination details
      experience.destinations?.forEach((dest: any, idx: number) => {
        console.log(`Destination ${idx}:`, {
          hasDestination: !!dest.destination,
          destinationType: typeof dest.destination,
          destinationObject: dest.destination,
          customLocation: dest.customLocation
        })
      })
    }
    
    experience.storyChapters?.forEach((chapter: any, index: number) => {
      let coords: any = null
      let locationName = chapter.title
      
      // First priority: Check if coordinates were populated by the hook
      if (chapter.coordinates && 
          typeof chapter.coordinates.lat === 'number' && 
          typeof chapter.coordinates.lng === 'number') {
        coords = chapter.coordinates
        if (chapter.locationName) {
          locationName = chapter.locationName
        }
      } 
      // Second priority: Direct custom location on the chapter
      else if (!chapter.useDestination && chapter.customLocation) {
        // Try to extract coordinates from custom location
        const extracted = extractExperienceDestinationCoordinates({ customLocation: chapter.customLocation })
        if (extracted) {
          coords = extracted
        }
      }
      // Third priority: Try to get from destination
      else if (chapter.useDestination && 
               typeof chapter.destinationIndex === 'number' && 
               experience.destinations?.[chapter.destinationIndex]) {
        const destItem = experience.destinations[chapter.destinationIndex]
        
        if (destItem) {
          // Debug log the destination structure
          if (process.env.NODE_ENV === 'development') {
            console.log(`\n=== Chapter ${index} - Processing ===`)
            console.log('Destination item:', destItem)
            console.log('Has destination:', !!destItem.destination)
            console.log('Destination type:', typeof destItem.destination)
          }
          
          // Try to extract coordinates from the destination item
          const extracted = extractExperienceDestinationCoordinates(destItem)
          if (extracted) {
            coords = extracted
            // Get location name
            if (destItem.destination && typeof destItem.destination === 'object') {
              locationName = destItem.destination.title || chapter.title
            } else if (destItem.customLocation?.title) {
              locationName = destItem.customLocation.title || chapter.title
            }
          }
        }
      }
      
      // Only add chapter if we have valid coordinates
      if (coords && 
          typeof coords.lat === 'number' && 
          typeof coords.lng === 'number' && 
          !isNaN(coords.lat) && 
          !isNaN(coords.lng)) {
        const storyChapter: any = {
          id: `chapter-${index}`,
          title: chapter.title,
          content: chapter.content,
          coords: { lat: coords.lat, lng: coords.lng },
          duration: chapter.duration || 15,
          locationName: locationName,
          focusOptions: {
            showFocus: true,
            focusRadius: 500,
            showLocationMarker: true,
          },
        }
        
        // Add camera options if specified
        if (chapter.cameraOptions) {
          storyChapter.cameraOptions = chapter.cameraOptions
        }
        
        // Add media if present
        if (chapter.media && typeof chapter.media === 'object' && chapter.media.url) {
          storyChapter.imageUrl = chapter.media.url
          if (process.env.NODE_ENV === 'development') {
            console.log(`Chapter ${index} has media:`, chapter.media.url)
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Chapter ${index} media status:`, {
              hasMedia: !!chapter.media,
              mediaType: typeof chapter.media,
              media: chapter.media
            })
          }
        }
        
        chapterList.push(storyChapter)
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Added chapter ${index} with coords:`, coords)
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Skipping chapter ${index} - no valid coordinates found`)
          console.log('Chapter data:', chapter)
        }
      }
    })

    return chapterList
  }, [experience.storyChapters, experience.destinations])

  // If no chapters with valid coordinates, show error
  if (chapters.length === 0) {
    return (
      <div className={`experience-storytelling-error ${className || ''}`} style={{ padding: '2rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Story Configuration Issue</h3>
        <p>No valid locations found in the story chapters. Please ensure:</p>
        <ul>
          <li>Each chapter has either a destination selected or custom coordinates</li>
          <li>Selected destinations have location data (use Google Places to set location)</li>
          <li>Custom locations have valid latitude and longitude values</li>
        </ul>
        <details style={{ marginTop: '1rem' }}>
          <summary>Debug Info</summary>
          <pre style={{ fontSize: '0.8em', background: '#fff', padding: '1rem', overflow: 'auto' }}>
{JSON.stringify({
  totalChapters: experience.storyChapters?.length || 0,
  destinations: experience.destinations?.map((d: any, i: number) => ({
    index: i,
    hasDestination: !!d.destination,
    destinationType: typeof d.destination,
    destinationTitle: typeof d.destination === 'object' ? d.destination?.title : null,
    extractedCoords: extractExperienceDestinationCoordinates(d),
    hasCustomLocation: !!d.customLocation,
    customLocationTitle: d.customLocation?.title
  })),
  chapters: experience.storyChapters?.map((c: any, i: number) => ({
    index: i,
    title: c.title,
    useDestination: c.useDestination,
    destinationIndex: c.destinationIndex,
    hasCoordinates: !!c.coordinates,
    coordinates: c.coordinates,
    hasCustomLocation: !!c.customLocation,
    customLocation: c.customLocation
  }))
}, null, 2)}
          </pre>
        </details>
      </div>
    )
  }

  // Build config from experience data
  const config = useMemo(() => {
    const title = typeof experience.title === 'string' ? experience.title : 'Experience'
    return {
      properties: {
        title: title,
        description: experience.shortDescription || '',
        imageUrl: typeof experience.heroImage === 'object' && experience.heroImage?.url ? experience.heroImage.url : undefined,
        createdBy: 'Travel Agency',
      },
      chapters,
      appearance: {
        theme: experience.storytellingConfig?.theme || 'dark',
        showNavigation: experience.storytellingConfig?.showNavigation !== false,
        showTimeline: true,
        autoPlay: experience.storytellingConfig?.autoPlay !== false,
        autoPlayDelay: 3,
        transparentBackground: true,
      },
    }
  }, [experience, chapters])

  return (
    <div 
      className={`experience-storytelling ${className || ''}`}
      style={{ width: '100%', height }}
    >
      <Storytelling 
        config={config} 
        apiKey={googleApiKey}
        cesiumToken={cesiumToken}
        className={experience.storytellingConfig?.theme === 'light' ? 'theme-light' : ''}
      />
    </div>
  )
})

ExperienceStorytelling.displayName = 'ExperienceStorytelling'

export default ExperienceStorytelling