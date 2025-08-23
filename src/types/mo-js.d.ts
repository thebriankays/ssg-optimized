declare module 'mo-js' {
  export interface BurstOptions {
    parent: Element
    x: string
    y: string
    angle: { [key: number]: number }
    radius: { [key: number]: number }
    count: number
    children: {
      shape: string
      radius: number
      scale: { [key: number]: number }
      strokeWidth?: { [key: number]: number }
      opacity?: { [key: number]: number }
      fill: string | string[]
      stroke?: string[]
      duration: number
      easing: string
    }
  }

  export class Burst {
    constructor(options: BurstOptions)
    play(): void
  }

  const MojsModule = {
    Burst,
  }

  export default MojsModule
}

// src/types/global.d.ts
declare module '*.css' {
  const classes: Record<string, string>
  export default classes
}
