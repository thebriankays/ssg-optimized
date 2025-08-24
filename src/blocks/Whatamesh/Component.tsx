import React from 'react'
import type { WhatameshBlock as WhatameshBlockType } from '@/payload-types'
import { WhatameshWrapper } from './ComponentWrapper'

export const WhatameshBlock: React.FC<WhatameshBlockType> = ({
  colors = [
    { color: '#dca8d8' }, // light purple
    { color: '#a3d3f9' }, // light blue
    { color: '#fcd6d6' }, // light pink
    { color: '#eae2ff' }, // light lavender
  ],
  amplitude = 320,
  speed = 1,
  darkenTop = true,
}) => {
  // Transform the colors array from the block format to the component format
  const colorStrings = colors?.map(colorObj => colorObj.color) || [
    '#dca8d8', // light purple
    '#a3d3f9', // light blue
    '#fcd6d6', // light pink
    '#eae2ff'  // light lavender
  ]

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      <WhatameshWrapper
        colors={colorStrings}
        amplitude={amplitude || undefined}
        speed={speed || undefined}
        darkenTop={darkenTop ?? undefined}
      />
    </div>
  )
}