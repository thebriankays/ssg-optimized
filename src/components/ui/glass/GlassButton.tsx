'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'
import { useRipple } from '@/hooks/useRipple'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', size = 'md', glow = false, onClick, ...props }, ref) => {
    const { rippleProps, createRipple } = useRipple()
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(e)
      onClick?.(e)
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          'glass-button',
          `glass-button--${variant}`,
          `glass-button--${size}`,
          {
            'glass-button--glow': glow,
          },
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="glass-button__content">{props.children}</span>
        {rippleProps.style.map((style, index) => (
          <span
            key={index}
            className="glass-button__ripple"
            style={{
              position: 'absolute',
              left: style.left,
              top: style.top,
              width: style.width,
              height: style.height,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </button>
    )
  }
)

GlassButton.displayName = 'GlassButton'