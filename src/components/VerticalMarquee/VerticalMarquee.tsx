'use client'

import React, { useRef } from 'react'
import './VerticalMarquee.scss'
import { sairaExtraCondensed } from '@/fonts/fonts'

type VerticalMarqueeProps = {
  text: string
  repeatCount?: number
  animationDuration?: number
  animationSpeed?: number
  className?: string
  position?: 'left' | 'right'
}

const VerticalMarquee: React.FC<VerticalMarqueeProps> = ({
  text,
  repeatCount = 20, // More items for continuous flow
  animationDuration,
  animationSpeed = 1,
  className = '',
  position = 'left',
}) => {
  const marqueeRef = useRef<HTMLDivElement>(null)

  // Calculate the actual animation duration
  const calculatedDuration = animationDuration || 40 / animationSpeed

  // Create continuous text WITHOUT extra symbols between each repeat
  const textItems = Array(repeatCount).fill(text)

  const containerStyle = {
    ...(position === 'right' ? { right: 0, left: 'auto' } : {}),
  }

  return (
    <div
      className={`vertical-marquee-container ${sairaExtraCondensed.className} ${className}`}
      style={containerStyle}
      ref={marqueeRef}
    >
      <div
        className="vertical-marquee-content"
        style={{ animationDuration: `${calculatedDuration}s` }}
      >
        {textItems.map((item, index) => (
          <React.Fragment key={`text-${index}`}>
            <div className="vertical-text">{item}</div>
          </React.Fragment>
        ))}
        {/* Duplicate for seamless loop */}
        {textItems.map((item, index) => (
          <React.Fragment key={`duplicate-${index}`}>
            <div className="vertical-text">{item}</div>
            <div className="vertical-text vertical-symbols">• 🦋 •</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default VerticalMarquee
