'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const SplashSection = dynamic(() => import('@/components/Splash/SplashSection'), {
  ssr: false,
})

interface SplashHeroProps {
  splashHero?: {
    enabled?: boolean | null
    background?: {
      type?: 'video' | 'image' | null
      videoSrc?: string | null
      image?: any
      dataSpeed?: number | null
    } | null
    title?: string | null
    titleSubtext?: string | null
    textPosition?: 'left' | 'center' | 'right' | null
    animationDirection?: 'left' | 'right' | null
    showBottomGradient?: boolean | null
    showLogo?: boolean | null
    logoConfig?: {
      size?: number | null
      color?: string | null
      speed?: number | null
    } | null
  } | null
}

export const SplashHero: React.FC<SplashHeroProps> = ({ splashHero }) => {
  if (!splashHero?.enabled) return null

  const background = splashHero.background || {}
  const backgroundType = background.type || 'video'
  const backgroundSrc = backgroundType === 'video' 
    ? background.videoSrc || '/8588881-uhd_2732_1440_25fps.mp4'
    : background.image?.url || '/default-hero.jpg'

  return (
    <SplashSection
      id="s-1"
      background={{
        type: backgroundType,
        src: backgroundSrc,
        dataSpeed: background.dataSpeed || 0.3,
      }}
      title={splashHero.title || 'destinations'}
      titleSubtext={splashHero.titleSubtext || 'SSG'}
      textPosition={splashHero.textPosition || 'center'}
      animationDirection={splashHero.animationDirection || 'left'}
      showBottomGradient={splashHero.showBottomGradient !== false}
      showLogo={splashHero.showLogo !== false}
      logoConfig={{
        size: splashHero.logoConfig?.size || 400,
        color: splashHero.logoConfig?.color || 'rgba(0,0,0,0.9)',
        speed: splashHero.logoConfig?.speed || 0.7,
      }}
      isHero
    />
  )
}

export default SplashHero