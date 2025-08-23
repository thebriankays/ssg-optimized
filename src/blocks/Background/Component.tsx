import React from 'react'
import type { BackgroundBlock as BackgroundBlockType } from '../types'
import { Background as BackgroundCanvas } from '@/components/canvas/Background'

export const BackgroundBlock: React.FC<BackgroundBlockType> = ({
  type,
  colors,
  intensity,
  animationSpeed,
  fullScreen,
  fixed,
}) => {
  const settings = {
    type: type || 'whatamesh',
    color1: colors?.color1 || '#c3e4ff',
    color2: colors?.color2 || '#6ec3f4',
    color3: colors?.color3 || '#eae2ff',
    color4: colors?.color4 || '#b9beff',
    intensity: intensity || 0.5,
  }

  const className = [
    'background-block',
    fullScreen && 'background-block--fullscreen',
    fixed && 'background-block--fixed',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div 
      className={className}
      style={{
        position: fixed ? 'fixed' : 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: fullScreen ? '100vh' : '100%',
        zIndex: -1,
      }}
    >
      <BackgroundCanvas 
        settings={settings} 
        className="background-block__canvas"
      />
    </div>
  )
}