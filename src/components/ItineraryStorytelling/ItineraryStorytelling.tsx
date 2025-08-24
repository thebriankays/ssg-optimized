// ItineraryStorytelling.tsx - Component to display 3D storytelling view for travel itineraries
'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import type { TravelItinerary } from '@/payload-types'

// Dynamic import to avoid SSR issues with Cesium
const Storytelling = dynamic(
  () => import('@/components/Storytelling/Storytelling').then(mod => mod.Storytelling),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        width: '100%', 
        height: '700px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#000',
        color: '#fff'
      }}>
        <p>Loading 3D Story...</p>
      </div>
    )
  }
)

interface ItineraryStorytellingProps {
  itinerary: Partial<TravelItinerary>
  className?: string
  height?: string
}

export const ItineraryStorytelling: React.FC<ItineraryStorytellingProps> = ({ 
  itinerary, 
  className,
  height = '700px'
}) => {
  // Check if storytelling is enabled and we have chapters
  if (!itinerary.enable3DStorytelling || !itinerary.storyChapters?.length) {
    return null
  }

  // Get API keys from environment
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const googleMapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID

  if (!googleApiKey || !googleMapId) {
    return (
      <div className={`itinerary-storytelling-error ${className || ''}`}>
        <p>Google Maps API key or Map ID is not configured.</p>
      </div>
    )
  }

  // Build chapters from the new structure
  const chapters: any[] = []
  
  itinerary.storyChapters?.forEach((chapter: any, index: number) => {
    let coords = null
    
    // Get coordinates based on location type
    if (chapter.locationType === 'coordinates' && chapter.coordinates) {
      coords = chapter.coordinates
    } else if (chapter.locationType === 'destination' && chapter.destination) {
      // If destination is populated, get its coordinates
      if (typeof chapter.destination === 'object' && chapter.destination.locationData?.coordinates) {
        coords = chapter.destination.locationData.coordinates
      } else if (typeof chapter.destination === 'object' && chapter.destination.lat && chapter.destination.lng) {
        coords = { lat: chapter.destination.lat, lng: chapter.destination.lng }
      }
    } else if (chapter.locationType === 'search' && chapter.coordinates) {
      // If geocoding was done, use those coordinates
      coords = chapter.coordinates
    }
    
    if (coords) {
      const storyChapter: any = {
        id: `chapter-${index}`,
        title: chapter.title,
        content: chapter.content,
        coords: coords,
        dateTime: chapter.dateTime || '',
        address: chapter.address || '',
        locationName: chapter.destination && typeof chapter.destination === 'object' 
          ? chapter.destination.title || chapter.destination.name 
          : chapter.locationSearch || chapter.address,
        destination: chapter.destination && typeof chapter.destination === 'object' ? {
          title: chapter.destination.title || chapter.destination.name,
          id: chapter.destination.id
        } : undefined,
        duration: chapter.duration || 10,
        focusOptions: {
          showFocus: chapter.focusOptions?.showFocus || false,
          focusRadius: chapter.focusOptions?.focusRadius || 250,
          showLocationMarker: chapter.focusOptions?.showLocationMarker !== false,
        },
      }
      
      // Add media if present
      if (chapter.media?.type === 'image' && chapter.media.image) {
        if (typeof chapter.media.image === 'object' && chapter.media.image.url) {
          storyChapter.imageUrl = chapter.media.image.url
          storyChapter.imageCredit = chapter.media.imageCredit || ''
        }
      } else if (chapter.media?.type === 'youtube' && chapter.media.youtubeUrl) {
        storyChapter.imageUrl = chapter.media.youtubeUrl
      }
      
      // Add custom camera if specified
      if (chapter.cameraOptions?.useCustomCamera) {
        storyChapter.cameraOptions = {
          heading: chapter.cameraOptions.heading,
          pitch: chapter.cameraOptions.pitch,
          roll: chapter.cameraOptions.roll,
        }
      }
      
      chapters.push(storyChapter)
    }
  })

  // If no chapters with coordinates, don't render
  if (chapters.length === 0) {
    return (
      <div className={`itinerary-storytelling-error ${className || ''}`}>
        <p>No locations with coordinates found in this itinerary. Please add location data to your story chapters.</p>
      </div>
    )
  }

  // Build config from itinerary data
  const config = {
    properties: {
      title: itinerary.title || 'Travel Itinerary',
      description: itinerary.description || getItineraryDescription(itinerary),
      date: getDateRange(itinerary),
      createdBy: typeof itinerary.user === 'object' && itinerary.user?.name ? itinerary.user.name : 'Travel Agency',
      imageUrl: typeof itinerary.coverImage === 'object' && itinerary.coverImage?.url ? itinerary.coverImage.url : undefined,
    },
    chapters,
    appearance: {
      theme: itinerary.storytellingConfig?.theme || 'dark',
      showNavigation: itinerary.storytellingConfig?.showNavigation !== false,
      showTimeline: itinerary.storytellingConfig?.showTimeline !== false,
      autoPlay: itinerary.storytellingConfig?.autoPlay || false,
      autoPlayDelay: itinerary.storytellingConfig?.autoPlayDelay || 2,
      transparentBackground: itinerary.storytellingConfig?.transparentBackground || false,
    },
  }

  return (
    <div 
      className={`itinerary-storytelling ${className || ''}`}
      style={{ width: '100%', height }}
    >
      <Storytelling 
        config={config} 
        apiKey={googleApiKey}
        mapId={googleMapId}
        className={itinerary.storytellingConfig?.theme === 'light' ? 'theme-light' : ''}
      />
    </div>
  )
}

// Helper functions
function getDateRange(itinerary: Partial<TravelItinerary>): string {
  if (!itinerary.travelDates) return ''
  const start = formatDate(itinerary.travelDates.startDate)
  const end = formatDate(itinerary.travelDates.endDate)
  return start && end ? `${start} - ${end}` : ''
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function getItineraryDescription(itinerary: Partial<TravelItinerary>): string {
  const parts = []
  
  if (itinerary.summary?.totalDays) {
    parts.push(`${itinerary.summary.totalDays} days`)
  }
  
  if (itinerary.summary?.totalChapters) {
    parts.push(`${itinerary.summary.totalChapters} locations`)
  }
  
  if (itinerary.groupType) {
    parts.push(itinerary.groupType)
  }
  
  if (itinerary.budgetRange) {
    parts.push(itinerary.budgetRange)
  }
  
  return parts.join(' • ')
}

export default ItineraryStorytelling