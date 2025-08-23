// src/types/react-particle-effect-button.d.ts
declare module 'react-particle-effect-button' {
  import { FC, ReactNode } from 'react'

  export interface ParticleEffectButtonProps {
    hidden: boolean
    color?: string
    duration?: number
    easing?: string
    type?: 'circle' | 'rectangle' | 'triangle'
    style?: 'fill' | 'stroke'
    direction?: 'left' | 'right' | 'top' | 'bottom'
    canvasPadding?: number
    size?: number | (() => number)
    speed?: number | (() => number)
    particlesAmountCoefficient?: number
    oscillationCoefficient?: number
    onBegin?: () => void
    onComplete?: () => void
    children?: ReactNode // Add this line
  }

  const ParticleEffectButton: FC<ParticleEffectButtonProps>
  export default ParticleEffectButton
}
