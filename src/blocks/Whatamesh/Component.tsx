import React from 'react'
import dynamic from 'next/dynamic'
import type { WhatameshBlock as WhatameshBlockType } from '@/payload-types'

// Dynamic import for client-side only rendering
const Whatamesh = dynamic(
  () => import('@/components/canvas/Background/Whatamesh').then(mod => ({ default: mod.Whatamesh })),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#000',
        color: '#fff'
      }}>
        <div>Loading whatamesh...</div>
      </div>
    )
  }
)

export const WhatameshBlock: React.FC<WhatameshBlockType> = ({
  colors = [
    { color: '#000000' },
    { color: '#1a1a1a' },
    { color: '#2a2a2a' },
    { color: '#3a3a3a' },
  ],
  amplitude = 320,
  speed = 1,
  darkenTop = true,
}) => {
  // Transform the colors array from the block format to the component format
  const colorStrings = colors?.map(colorObj => colorObj.color) || [
    '#000000',
    '#1a1a1a', 
    '#2a2a2a',
    '#3a3a3a'
  ]

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      <Whatamesh
        colors={colorStrings}
        amplitude={amplitude || undefined}
        speed={speed || undefined}
        darkenTop={darkenTop ?? undefined}
      />
    </div>
  )
}