'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/utilities/ui'
import AnimatedFlag from '@/components/AnimatedFlag'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'
import type { Destination, Media } from '@/payload-types'
// Import the simplified component and its font object from the correct path
import TitleShadowMotion, { paytoneOne } from '@/components/TitleMotionShadow/TitleMotionShadow'

// --- DestinationInfoProps and DestinationInfo component with glass theme ---
interface DestinationInfoProps {
  destination: Destination
  backgroundColor?: string
  textColor?: string
  destinationTitleColor?: string
  fieldLabelsColor?: string
  separatorLinesColor?: string
}

const DestinationInfo: React.FC<DestinationInfoProps> = ({
  destination,
  backgroundColor = 'transparent',
  textColor = '#ffffff',
  destinationTitleColor = '#60a5fa',
  fieldLabelsColor = '#94a3b8',
  separatorLinesColor = 'rgba(255, 255, 255, 0.1)',
}) => {
  const getCountryData = () => {
    return destination.countryData || destination.locationData?.countryData
  }

  const countryData = getCountryData()

  const getFirstValue = (...values: (string | null | undefined)[]): string => {
    return values.find((val) => val && val !== null && val !== undefined) || 'N/A'
  }

  const coordinates = destination.locationData?.coordinates
  const lat = coordinates?.lat ?? destination.lat
  const lng = coordinates?.lng ?? destination.lng

  const infoItems = [
    {
      label: 'Country',
      value: getFirstValue(
        countryData?.label,
        destination.locationData?.country,
        destination.title,
      ),
      link: !!countryData?.label,
    },
    { label: 'Capital', value: getFirstValue(countryData?.capital) },
    { label: 'Official Language', value: getFirstValue(countryData?.language?.label) },
    {
      label: 'Continent',
      value: getFirstValue(destination.continent, destination.locationData?.continent),
    },
    {
      label: 'Currency',
      value: countryData?.currency
        ? `${countryData.currency.label || 'Unknown'} (${countryData.currency.code || 'N/A'}${countryData.currency.symbol ? ` ${countryData.currency.symbol}` : ''})`
        : 'N/A',
    },
    {
      label: 'Country Code',
      value: getFirstValue(
        countryData?.code,
        countryData?.countryCode,
        countryData?.isoCode,
        destination.flagSvg?.toUpperCase(),
      ),
    },
    {
      label: 'Coordinates',
      value:
        lat && lng && typeof lat === 'number' && typeof lng === 'number'
          ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          : 'N/A',
    },
  ]

  return (
    <GlassContainer preset="frosted" className="p-6" animated>
      <div className="space-y-4">
        {destination.title && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold" style={{ color: destinationTitleColor }}>
              {destination.title}
            </h3>
          </div>
        )}
        <div className="space-y-3">
          {infoItems.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 border-b"
              style={{ borderColor: separatorLinesColor }}
            >
              <span className="text-sm font-medium" style={{ color: fieldLabelsColor }}>
                {item.label}:
              </span>
              <span className="text-sm" style={{ color: textColor }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlassContainer>
  )
}

// --- DestinationDetailBlockProps and Main Component ---
interface DestinationDetailBlockProps {
  destination: Destination
  flagImageUrl: string
  flagSettings?: {
    animationSpeed?: number
    wireframe?: boolean
    segments?: number
    frequencyX?: number
    frequencyY?: number
    strength?: number
    showControls?: boolean
  }
  customTitle?: string
  textColor?: string
  quickLookText?: string
  quickLookColor?: string
  destinationTitleColor?: string
  fieldLabelsColor?: string
  separatorLinesColor?: string
  background?: {
    backgroundType: 'color' | 'transparent' | 'image'
    backgroundColor?: string
    backgroundImage?: Media
  }
}

export const DestinationDetailBlockClient: React.FC<DestinationDetailBlockProps> = ({
  destination,
  flagImageUrl,
  flagSettings,
  customTitle,
  textColor = '#ffffff',
  quickLookText = 'Quick Look',
  quickLookColor = '#60a5fa',
  destinationTitleColor = '#60a5fa',
  fieldLabelsColor = '#94a3b8',
  separatorLinesColor = 'rgba(255, 255, 255, 0.1)',
  background,
}) => {
  const [isFontLoaded, setIsFontLoaded] = useState(false)

  useEffect(() => {
    const checkFont = async () => {
      if ('fonts' in document && paytoneOne) {
        try {
          await document.fonts.load(`400 1em ${paytoneOne.style.fontFamily}`)
          setIsFontLoaded(true)
        } catch {
          setIsFontLoaded(true)
        }
      } else {
        setIsFontLoaded(true)
      }
    }
    checkFont()
  }, [])

  const getBackgroundStyles = () => {
    if (!background) return {}
    
    if (background.backgroundType === 'transparent') {
      return { backgroundColor: 'transparent' }
    }
    
    if (background.backgroundType === 'color' && background.backgroundColor) {
      return { backgroundColor: background.backgroundColor }
    }
    
    if (background.backgroundType === 'image' && background.backgroundImage) {
      const imageUrl = typeof background.backgroundImage === 'string' 
        ? background.backgroundImage 
        : background.backgroundImage.url
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    
    return {}
  }

  // Title display logic
  const displayTitle = customTitle || destination.title || 'Destination'

  return (
    <div className="relative py-16" style={getBackgroundStyles()}>
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Flag */}
          <div className="flex justify-center">
            <AnimatedFlag 
              imageSrc={flagImageUrl} 
              {...flagSettings}
            />
          </div>

          {/* Right side - Information */}
          <div className="space-y-6">
            {/* Quick Look Label */}
            {quickLookText && (
              <GlassContainer preset="clear" className="inline-block px-4 py-2">
                <span 
                  className="text-sm font-semibold uppercase tracking-wider"
                  style={{ color: quickLookColor }}
                >
                  {quickLookText}
                </span>
              </GlassContainer>
            )}

            {/* Title with Motion Shadow */}
            {isFontLoaded && displayTitle && (
              <div className="mb-6">
                <TitleShadowMotion
                  text={displayTitle}
                  textColor={textColor}
                  shadowColor="#000000"
                  shadowOpacity={0.3}
                />
              </div>
            )}

            {/* Destination Info */}
            <DestinationInfo
              destination={destination}
              backgroundColor="transparent"
              textColor={textColor}
              destinationTitleColor={destinationTitleColor}
              fieldLabelsColor={fieldLabelsColor}
              separatorLinesColor={separatorLinesColor}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
