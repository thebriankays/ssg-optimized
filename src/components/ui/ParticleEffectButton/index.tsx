'use client'

import { useRef, ReactNode, cloneElement, ReactElement } from 'react'
import { gsap } from 'gsap'
import './styles.scss'

interface Particle {
  x: number
  y: number
  size: number
  color: string
  velocity: { x: number; y: number }
  life: number
}

interface ParticleEffectButtonProps {
  children: ReactElement
  particleCount?: number
  colors?: string[]
  maxDistance?: number
  duration?: number
}

export function ParticleEffectButton({
  children,
  particleCount = 30,
  colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3'],
  maxDistance = 100,
  duration = 1
}: ParticleEffectButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement[]>([])
  
  const createParticle = (x: number, y: number): Particle => {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 3 + 2
    
    return {
      x,
      y,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      },
      life: 1
    }
  }
  
  const explodeParticles = (e: MouseEvent) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    // Clear existing particles
    particlesRef.current.forEach(p => p?.remove())
    particlesRef.current = []
    
    // Create new particles
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(x, y))
    }
    
    // Render particles
    particles.forEach((particle, index) => {
      const div = document.createElement('div')
      div.className = 'particle'
      div.style.cssText = `
        position: absolute;
        left: ${particle.x}px;
        top: ${particle.y}px;
        width: ${particle.size}px;
        height: ${particle.size}px;
        background: ${particle.color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 100;
      `
      
      containerRef.current?.appendChild(div)
      particlesRef.current[index] = div
      
      // Animate particle
      gsap.to(div, {
        x: particle.velocity.x * maxDistance,
        y: particle.velocity.y * maxDistance,
        opacity: 0,
        scale: 0,
        duration,
        ease: 'power2.out',
        onComplete: () => {
          div.remove()
        }
      })
    })
    
    // Animate button
    const button = containerRef.current.querySelector('button, .gsap-button')
    if (button) {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      })
    }
  }
  
  // Clone the child element and add onClick handler
  const enhancedChild = cloneElement(children, {
    onClick: (e: React.MouseEvent) => {
      explodeParticles(e as any)
      // Call original onClick if it exists
      const originalOnClick = (children.props as any).onClick
      if (originalOnClick) {
        originalOnClick(e)
      }
    }
  })
  
  return (
    <div ref={containerRef} className="particle-effect-button">
      {enhancedChild}
    </div>
  )
}