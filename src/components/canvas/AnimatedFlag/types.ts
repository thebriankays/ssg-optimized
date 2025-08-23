export interface AnimatedFlagConfig {
  flagTexture: string
  poleTexture?: string
  width?: number
  height?: number
  segments?: number
  windStrength?: number
  windDirection?: [number, number, number]
  enablePhysics?: boolean
  autoWind?: boolean
  flagColor?: string
  poleColor?: string
  shadows?: boolean
}

export interface FlagProps extends AnimatedFlagConfig {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
  onClick?: () => void
  onHover?: (isHovered: boolean) => void
}