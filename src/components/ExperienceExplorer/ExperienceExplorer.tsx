import React from 'react'
import { AreaExplorerBlock } from '@/blocks/AreaExplorer/Component'
import type { Experience } from '@/payload-types'

interface ExperienceExplorerProps {
  experience: Experience
  className?: string
}

export const ExperienceExplorer: React.FC<ExperienceExplorerProps> = ({ 
  experience, 
  className 
}) => {
  if (!experience.enable3DExplorer) {
    return null
  }

  const config = experience.explorerConfig || {}
  
  // Determine center coordinates
  let centerLat: number | null | undefined = null
  let centerLng: number | null | undefined = null
  
  if (config.centerLocation === 'custom' && config.customCenter) {
    centerLat = config.customCenter.lat
    centerLng = config.customCenter.lng
  } else if (config.centerLocation === 'first' && experience.destinations?.[0]) {
    const firstDest = experience.destinations[0]
    if (firstDest.destination && typeof firstDest.destination === 'object') {
      if (firstDest.destination.locationData?.coordinates) {
        centerLat = firstDest.destination.locationData.coordinates.lat
        centerLng = firstDest.destination.locationData.coordinates.lng
      } else if (firstDest.destination.lat && firstDest.destination.lng) {
        centerLat = firstDest.destination.lat
        centerLng = firstDest.destination.lng
      }
    } else if (firstDest.customLocation?.coordinates) {
      centerLat = firstDest.customLocation.coordinates.lat
      centerLng = firstDest.customLocation.coordinates.lng
    }
  } else {
    // Calculate center from all destinations
    let totalLat = 0
    let totalLng = 0
    let count = 0
    
    experience.destinations?.forEach(dest => {
      let lat, lng
      
      if (dest.destination && typeof dest.destination === 'object') {
        if (dest.destination.locationData?.coordinates) {
          lat = dest.destination.locationData.coordinates.lat
          lng = dest.destination.locationData.coordinates.lng
        } else if (dest.destination.lat && dest.destination.lng) {
          lat = dest.destination.lat
          lng = dest.destination.lng
        }
      } else if (dest.customLocation?.coordinates) {
        lat = dest.customLocation.coordinates.lat
        lng = dest.customLocation.coordinates.lng
      }
      
      if (lat && lng) {
        totalLat += lat
        totalLng += lng
        count++
      }
    })
    
    if (count > 0) {
      centerLat = totalLat / count
      centerLng = totalLng / count
    }
  }

  if (!centerLat || !centerLng) {
    return (
      <div className="experience-explorer-error">
        <p>No valid coordinates found for the experience destinations.</p>
      </div>
    )
  }

  // Build destination markers
  const markers = experience.destinations?.map((dest, index) => {
    let lat, lng, title
    
    if (dest.destination && typeof dest.destination === 'object') {
      title = dest.destination.title
      if (dest.destination.locationData?.coordinates) {
        lat = dest.destination.locationData.coordinates.lat
        lng = dest.destination.locationData.coordinates.lng
      } else if (dest.destination.lat && dest.destination.lng) {
        lat = dest.destination.lat
        lng = dest.destination.lng
      }
    } else if (dest.customLocation) {
      title = dest.customLocation.title
      lat = dest.customLocation.coordinates?.lat
      lng = dest.customLocation.coordinates?.lng
    }
    
    if (lat && lng) {
      return {
        id: `dest-${index}`,
        lat,
        lng,
        title: title || `Destination ${index + 1}`,
        description: dest.description || undefined,
      }
    }
    return null
  }).filter((marker): marker is NonNullable<typeof marker> => marker !== null) || []

  return (
    <AreaExplorerBlock
      blockType="area-explorer"
      locationName={experience.title}
      locationDescription={`${experience.experienceType && typeof experience.experienceType === 'object' && 'name' in experience.experienceType ? (experience.experienceType as any).name : ''} Experience • ${experience.duration?.days} Days`}
      latitude={centerLat}
      longitude={centerLng}
      showPOIs={config.showPOIs ?? true}
      poiTypes={config.poiTypes || ['tourist_attraction', 'restaurant', 'lodging']}
      poiDensity={50} // More POIs for experiences covering larger areas
      searchRadius={5000} // Larger radius for multi-destination experiences
      autoOrbit={false} // Don't auto-orbit for multi-destination views
      theme={config.theme || 'dark'}
      showControls={true}
      showAttribution={true}
      showSidebar={true}
      height="80vh"
      customMarkers={config.showDestinationMarkers !== false ? markers : undefined}
      className={className}
    />
  )
}

export default ExperienceExplorer