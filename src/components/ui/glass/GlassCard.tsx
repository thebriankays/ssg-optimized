'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { useMouse } from '@/providers/Mouse'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'clear' | 'frosted' | 'refractive'
  interactive?: boolean
  glow?: boolean
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'frosted', interactive = false, glow = false, ...props }, ref) => {
    const { addState, removeState } = useMouse()
    
    return (
      <div
        ref={ref}
        className={cn(
          'glass-card',
          `glass-${variant}`,
          {
            'glass-interactive': interactive,
            'glass-glow': glow,
          },
          className
        )}
        onMouseEnter={() => interactive && addState('-glass')}
        onMouseLeave={() => interactive && removeState('-glass')}
        data-cursor-glass
        {...props}
      />
    )
  }
)

GlassCard.displayName = 'GlassCard'