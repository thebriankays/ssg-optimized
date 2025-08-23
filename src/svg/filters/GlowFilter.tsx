// src/components/svg/filters/GlowFilter.tsx
import React from 'react'

interface GlowFilterProps {
  id?: string
  stdDeviation?: number
  floodColor?: string
  floodOpacity?: number
}

const GlowFilter: React.FC<GlowFilterProps> = ({
  id = 'glow',
  stdDeviation = 2,
  floodColor = '#ffffff',
  floodOpacity = 0.5,
}) => (
  <svg style={{ position: 'absolute', width: 0, height: 0 }}>
    <defs>
      <filter id={id}>
        <feGaussianBlur stdDeviation={stdDeviation} result="blur" />
        <feFlood floodColor={floodColor} floodOpacity={floodOpacity} result="glow" />
        <feComposite in="glow" in2="blur" operator="in" result="softGlow" />
        <feMerge>
          <feMergeNode in="softGlow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
)

export default GlowFilter
