import React from 'react'
import type { DolphinsBlock as DolphinsBlockType } from '@/payload-types'
import { Dolphins } from '@/components/canvas/Dolphins'

export const DolphinsBlock: React.FC<DolphinsBlockType> = ({ 
  dolphinCount,
  showWater = true,
  showSky = true,
  animationSpeed = 1,
  waterColor = '#001e0f',
  skyColor = '#87CEEB',
}) => {
  // Convert null values to proper defaults
  const count = dolphinCount ?? 3
  const bubbles = showWater ?? true
  const sky = showSky ?? true
  const speed = animationSpeed ?? 1
  const water = waterColor || '#001e0f'
  const skyCol = skyColor || '#87CEEB'
  
  return (
    <section className="block my-16">
      <Dolphins
        dolphinCount={count}
        showBubbles={bubbles}
        autoCamera={true}
        showSky={sky}
        waterColor={water}
        skyColor={skyCol}
        animationSpeed={speed}
        className="dolphins-block"
      />
    </section>
  )
}