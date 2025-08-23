'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'
import { gsap } from 'gsap'
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'
import './glass-styles.scss'

export type GlassPreset = 'frosted' | 'clear' | 'refractive' | 'holographic' | 'liquid'

interface GlassContainerProps {
  children: ReactNode
  preset?: GlassPreset
  className?: string
  interactive?: boolean
  animated?: boolean
  glowOnHover?: boolean
  liquidEffect?: boolean
  onClick?: () => void
}

export function GlassContainer({
  children,
  preset = 'frosted',
  className = '',
  interactive = false,
  animated = false,
  glowOnHover = false,
  liquidEffect = false,
  onClick,
}: GlassContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const noiseRef = useRef<HTMLDivElement>(null)
  const liquidRef = useRef<HTMLDivElement>(null)

  // Interactive mouse tracking
  useEffect(() => {
    if (!interactive || !containerRef.current) return

    const container = containerRef.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      container.style.setProperty('--mouse-x', `${x}%`)
      container.style.setProperty('--mouse-y', `${y}%`)
    }

    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [interactive])

  // Glow on hover animation using proper GSAP pattern
  useGSAPAnimation(() => {
    if (!glowOnHover || !containerRef.current) return

    const container = containerRef.current
    let hoverAnimation: gsap.core.Tween | null = null

    const handleMouseEnter = () => {
      hoverAnimation = gsap.to(container, {
        duration: 0.3,
        '--glow-opacity': 1,
        ease: 'power2.out',
      })
    }

    const handleMouseLeave = () => {
      hoverAnimation = gsap.to(container, {
        duration: 0.3,
        '--glow-opacity': 0,
        ease: 'power2.out',
      })
    }

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      hoverAnimation?.kill()
    }
  }, [glowOnHover])

  // Liquid animation using proper GSAP pattern
  useGSAPAnimation(() => {
    if (!liquidEffect || !liquidRef.current) return

    const liquid = liquidRef.current
    const tl = gsap.timeline({ repeat: -1 })
    
    tl.to(liquid, {
      x: 10,
      y: -10,
      scale: 1.1,
      duration: 2,
      ease: 'sine.inOut',
    })
    .to(liquid, {
      x: -10,
      y: 10,
      scale: 0.9,
      duration: 2,
      ease: 'sine.inOut',
    })

    return () => {
      tl.kill()
    }
  }, [liquidEffect])

  // Animated noise using proper GSAP pattern
  useGSAPAnimation(() => {
    if (!animated || !noiseRef.current) return

    const tl = gsap.timeline({ repeat: -1 })
    tl.to(noiseRef.current, {
      duration: 8,
      backgroundPosition: '100% 100%',
      ease: 'none',
    })

    return () => {
      tl.kill()
    }
  }, [animated])

  return (
    <div
      ref={containerRef}
      className={clsx(
        'glass-container',
        `glass-${preset}`,
        {
          'glass-interactive': interactive,
          'glass-animated': animated,
          'glass-liquid': liquidEffect,
        },
        className
      )}
      onClick={onClick}
      data-preset={preset}
    >
      {/* Noise layer */}
      <div ref={noiseRef} className="glass-noise" />
      
      {/* Liquid distortion layer */}
      {liquidEffect && (
        <div ref={liquidRef} className="glass-liquid-layer" />
      )}
      
      {/* Gradient overlay */}
      <div className="glass-gradient" />
      
      {/* Content */}
      <div className="glass-content">
        {children}
      </div>
      
      {/* Interactive glow */}
      {interactive && (
        <div className="glass-glow" />
      )}
    </div>
  )
}

// Glass Button Component
interface GlassButtonProps {
  children: ReactNode
  preset?: GlassPreset
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost'
  href?: string
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function GlassButton({
  children,
  preset = 'frosted',
  size = 'md',
  variant = 'primary',
  href,
  onClick,
  disabled = false,
  className = '',
}: GlassButtonProps) {
  const router = useRouter()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    if (disabled) return
    
    if (href) {
      router.push(href)
    } else if (onClick) {
      onClick()
    }
  }

  // Button hover animation using proper GSAP pattern
  useGSAPAnimation(() => {
    if (!buttonRef.current) return

    const button = buttonRef.current
    let hoverTween: gsap.core.Tween | null = null

    const handleMouseEnter = () => {
      hoverTween = gsap.to(button, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    const handleMouseLeave = () => {
      hoverTween = gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    }

    button.addEventListener('mouseenter', handleMouseEnter)
    button.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter)
      button.removeEventListener('mouseleave', handleMouseLeave)
      hoverTween?.kill()
    }
  }, [])

  return (
    <button
      ref={buttonRef}
      className={clsx(
        'glass-button',
        `glass-button-${size}`,
        `glass-button-${variant}`,
        `glass-${preset}`,
        {
          'glass-button-disabled': disabled,
        },
        className
      )}
      onClick={handleClick}
      disabled={disabled}
    >
      <span className="glass-button-content">{children}</span>
      <div className="glass-button-shine" />
    </button>
  )
}

// Glass Navigation Component
interface GlassNavProps {
  children: ReactNode
  fixed?: boolean
  transparent?: boolean
  className?: string
}

export function GlassNav({
  children,
  fixed = true,
  transparent = false,
  className = '',
}: GlassNavProps) {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!fixed || !navRef.current) return

    const handleScroll = () => {
      const scrollY = window.scrollY
      const threshold = 50

      if (navRef.current) {
        if (scrollY > threshold) {
          navRef.current.classList.add('glass-nav-scrolled')
        } else {
          navRef.current.classList.remove('glass-nav-scrolled')
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [fixed])

  return (
    <nav
      ref={navRef}
      className={clsx(
        'glass-nav',
        {
          'glass-nav-fixed': fixed,
          'glass-nav-transparent': transparent,
        },
        className
      )}
    >
      <GlassContainer preset="clear" className="glass-nav-container">
        {children}
      </GlassContainer>
    </nav>
  )
}