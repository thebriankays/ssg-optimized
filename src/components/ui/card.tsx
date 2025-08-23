'use client'

import { cn } from '@/utilities/ui'
import * as React from 'react'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>
  glassVariant?: 'none' | 'frosted' | 'clear' | 'refractive' | 'holographic'
  animateHover?: boolean
  liquidEffect?: boolean
}

const Card: React.FC<CardProps> = ({ 
  className, 
  ref,
  glassVariant = 'none',
  animateHover = false,
  liquidEffect = false,
  children,
  ...props 
}) => {
  const internalRef = useRef<HTMLDivElement>(null)
  const cardRef = (ref as any) || internalRef
  const liquidRef = useRef<HTMLDivElement>(null)

  // Mouse tracking for liquid effect
  useEffect(() => {
    if (!liquidEffect || !cardRef.current) return

    const card = cardRef.current
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      card.style.setProperty('--mouse-x', `${x}%`)
      card.style.setProperty('--mouse-y', `${y}%`)
    }

    card.addEventListener('mousemove', handleMouseMove)
    return () => card.removeEventListener('mousemove', handleMouseMove)
  }, [liquidEffect])

  // GSAP hover animation
  useGSAPAnimation(() => {
    if (!animateHover || !cardRef.current) return

    const card = cardRef.current
    let hoverTween: gsap.core.Tween | null = null

    const handleMouseEnter = () => {
      hoverTween = gsap.to(card, {
        y: -4,
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      })
    }

    const handleMouseLeave = () => {
      hoverTween = gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      })
    }

    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter)
      card.removeEventListener('mouseleave', handleMouseLeave)
      hoverTween?.kill()
    }
  }, [animateHover])

  // Liquid animation
  useGSAPAnimation(() => {
    if (!liquidEffect || !liquidRef.current) return

    const liquid = liquidRef.current
    const tl = gsap.timeline({ repeat: -1 })
    
    tl.to(liquid, {
      backgroundPosition: '200% 200%',
      duration: 15,
      ease: 'none',
    })

    return () => {
      tl.kill()
    }
  }, [liquidEffect])

  const glassClasses = {
    none: 'rounded-lg border bg-card text-card-foreground shadow-sm',
    frosted: 'rounded-lg border border-white/20 bg-white/10 backdrop-blur-md text-card-foreground shadow-lg',
    clear: 'rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm text-card-foreground shadow',
    refractive: 'rounded-lg border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg text-card-foreground shadow-xl',
    holographic: 'rounded-lg border border-white/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-cyan-500/10 backdrop-blur-md text-card-foreground shadow-xl',
  }

  return (
    <div
      className={cn(
        glassClasses[glassVariant],
        'relative overflow-hidden',
        className
      )}
      ref={cardRef}
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
      } as React.CSSProperties}
      {...props}
    >
      {/* Glass effects */}
      {glassVariant !== 'none' && (
        <>
          {/* Noise texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-noise" />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 pointer-events-none" />
          
          {/* Liquid effect */}
          {liquidEffect && (
            <div 
              ref={liquidRef}
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(100, 200, 255, 0.3) 0%, transparent 40%)`,
                filter: 'blur(40px)',
              }}
            />
          )}
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

const CardHeader: React.FC<
  { ref?: React.Ref<HTMLDivElement> } & React.HTMLAttributes<HTMLDivElement>
> = ({ className, ref, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} ref={ref} {...props} />
)

const CardTitle: React.FC<
  { ref?: React.Ref<HTMLHeadingElement> } & React.HTMLAttributes<HTMLHeadingElement>
> = ({ className, ref, ...props }) => (
  <h3
    className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
    ref={ref}
    {...props}
  />
)

const CardDescription: React.FC<
  { ref?: React.Ref<HTMLParagraphElement> } & React.HTMLAttributes<HTMLParagraphElement>
> = ({ className, ref, ...props }) => (
  <p className={cn('text-sm text-muted-foreground', className)} ref={ref} {...props} />
)

const CardContent: React.FC<
  { ref?: React.Ref<HTMLDivElement> } & React.HTMLAttributes<HTMLDivElement>
> = ({ className, ref, ...props }) => (
  <div className={cn('p-6 pt-0', className)} ref={ref} {...props} />
)

const CardFooter: React.FC<
  { ref?: React.Ref<HTMLDivElement> } & React.HTMLAttributes<HTMLDivElement>
> = ({ className, ref, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0', className)} ref={ref} {...props} />
)

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
