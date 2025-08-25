'use client'

import { Background } from '@/components/canvas/Background'
import { useEffect, useState } from 'react'

interface BackgroundSettings {
  type?: ('none' | 'gradient' | 'particles' | 'fluid' | 'whatamesh') | null
  color1?: string | null
  color2?: string | null
  color3?: string | null
  color4?: string | null
  intensity?: number | null
}

interface GlobalBackgroundClientProps {
  backgroundSettings: BackgroundSettings
}

export function GlobalBackgroundClient({ backgroundSettings }: GlobalBackgroundClientProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  // Use the original Background component with Whatamesh
  return <Background settings={backgroundSettings as any} />
}