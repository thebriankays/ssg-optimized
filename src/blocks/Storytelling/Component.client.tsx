'use client'

import { Storytelling } from '@/components/Storytelling/Storytelling'
import type { StorySection } from '@/components/Storytelling/types'

interface StorytellingClientProps {
  sections: StorySection[]
}

export function StorytellingClient({ sections }: StorytellingClientProps) {
  return (
    <Storytelling
      sections={sections}
      className="storytelling-block"
    />
  )
}