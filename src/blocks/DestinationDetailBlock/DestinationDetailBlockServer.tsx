import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { DestinationDetailBlockClient } from './DestinationDetailBlockClient'
import type { Destination } from '@/payload-types'
// Manual type definition until payload types are regenerated
interface DestinationDetailBlockType {
  blockType: 'destinationDetailBlock'
  destination: number | Destination
  flagSettings?: {
    flagImage?: number | null
    amplitude?: number | null
    speed?: number | null
    size?: number | null
    opacity?: number | null
    blurAmount?: number | null
    zoom?: number | null
    showShadow?: boolean | null
  }
  background?: {
    backgroundType?: string | null
    backgroundColor?: string | null
    gradientStart?: string | null
    gradientEnd?: string | null
    backgroundImage?: number | null
    backgroundVideo?: number | null
  }
  separatorLinesColor?: string | null
  customTitle?: string | null
  textColor?: string | null
  quickLookText?: string | null
  quickLookColor?: string | null
  destinationTitleColor?: string | null
  fieldLabelsColor?: string | null
}

// The component receives block data as direct props from RenderBlocks
interface DestinationDetailBlockServerProps extends DestinationDetailBlockType {
  disableInnerContainer?: boolean
}

export const DestinationDetailBlock: React.FC<DestinationDetailBlockServerProps> = async (props) => {
  const payload = await getPayload({ config })
  
  let destinationData: Destination | null = null
  let flagImageUrl = 'https://i.imgur.com/fokRJkR.jpg' // Default fallback

  try {
    // Always fetch fresh data at proper depth, regardless of what's passed in
    let destinationId: number | null = null
    
    if (typeof props.destination === 'number') {
      destinationId = props.destination
    } else if (props.destination && typeof props.destination === 'object' && 'id' in props.destination) {
      destinationId = props.destination.id as number
    }

    if (!destinationId) {
      return (
        <div className="destination-detail-block">
          <div className="destination-detail-block__error">
            <p>No destination specified</p>
          </div>
        </div>
      )
    }
    
    // Fetch destination at depth 2 to hydrate locationData (same as GlobeComponent)
    const destinationDoc = await payload.findByID({
      collection: 'destinations',
      id: destinationId,
      depth: 2, // This should hydrate locationData properly
    })
    
    destinationData = destinationDoc

    if (!destinationData) {
      return (
        <div className="destination-detail-block">
          <div className="destination-detail-block__error">
            <p>Destination not found</p>
          </div>
        </div>
      )
    }

    // Flag resolution logic - check all possible sources
    let countryCode = null

    // Priority 1: flagSvg field
    if (destinationData.flagSvg) {
      countryCode = destinationData.flagSvg.toLowerCase()
    }
    // Priority 2: countryData.code
    else if (destinationData.countryData?.code) {
      countryCode = destinationData.countryData.code.toLowerCase()
    }
    // Priority 3: locationData.countryData.code
    else if (destinationData.locationData?.countryData?.code) {
      countryCode = destinationData.locationData.countryData.code.toLowerCase()
    }
    // Priority 4: Try to infer from title (for Jamaica case)
    else if (destinationData.title?.toLowerCase().includes('jamaica')) {
      countryCode = 'jm'
    }
    // Priority 5: Check other country patterns in title
    else if (destinationData.title) {
      const titleLower = destinationData.title.toLowerCase()
      const countryPatterns: Record<string, string> = {
        'bahamas': 'bs',
        'barbados': 'bb',
        'mexico': 'mx',
        'costa rica': 'cr',
        'france': 'fr',
        'italy': 'it',
        'spain': 'es',
        'japan': 'jp',
        'thailand': 'th',
        'greece': 'gr',
        'turkey': 'tr',
        'egypt': 'eg'
      }
      
      for (const [country, code] of Object.entries(countryPatterns)) {
        if (titleLower.includes(country)) {
          countryCode = code
          break
        }
      }
    }

    // Set flag URL
    if (countryCode) {
      flagImageUrl = `/flags/${countryCode}.svg`
    }

  } catch (_error) {
    return (
      <div className="destination-detail-block">
        <div className="destination-detail-block__error">
          <p>Error loading destination data</p>
        </div>
      </div>
    )
  }

  // Convert payload types (which can be null) to component types (which expect undefined)
  const flagSettings = props.flagSettings ? {
    animationSpeed: props.flagSettings.animationSpeed ?? undefined,
    wireframe: props.flagSettings.wireframe ?? undefined,
    segments: props.flagSettings.segments ?? undefined,
    frequencyX: props.flagSettings.frequencyX ?? undefined,
    frequencyY: props.flagSettings.frequencyY ?? undefined,
    strength: props.flagSettings.strength ?? undefined,
    showControls: props.flagSettings.showControls ?? undefined,
  } : undefined

  // Convert background types safely
  const background = props.background ? {
    backgroundType: props.background.backgroundType as 'color' | 'transparent' | 'image',
    backgroundColor: props.background.backgroundColor ?? undefined,
    backgroundImage: (typeof props.background.backgroundImage === 'object' && props.background.backgroundImage !== null) 
      ? props.background.backgroundImage 
      : undefined,
  } : undefined

  return (
    <DestinationDetailBlockClient
      destination={destinationData}
      flagImageUrl={flagImageUrl}
      flagSettings={flagSettings}
      customTitle={props.customTitle ?? undefined}
      textColor={props.textColor ?? undefined}
      quickLookText={props.quickLookText ?? undefined}
      quickLookColor={props.quickLookColor ?? undefined}
      destinationTitleColor={props.destinationTitleColor ?? undefined}
      fieldLabelsColor={props.fieldLabelsColor ?? undefined}
      separatorLinesColor={props.separatorLinesColor ?? undefined}
      background={background}
    />
  )
}