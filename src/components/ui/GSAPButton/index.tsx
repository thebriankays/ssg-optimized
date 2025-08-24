'use client'

import { useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'
import './styles.scss'

interface GSAPButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  magneticStrength?: number
}

export function GSAPButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  magneticStrength = 0.3
}: GSAPButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  
  useGSAPAnimation(() => {
    const button = buttonRef.current
    const text = textRef.current
    
    if (!button || !text) return
    
    let bounds: DOMRect
    const ctx = gsap.context(() => {
      // Store tween references for cleanup
      const tweens: gsap.core.Tween[] = []
      
      const killTweens = () => {
        tweens.forEach(t => t.kill())
        tweens.length = 0
      }
      
      const onMouseEnter = () => {
        bounds = button.getBoundingClientRect()
        killTweens()
        tweens.push(
          gsap.to(button, {
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out'
          })
        )
      }
      
      const onMouseMove = (e: MouseEvent) => {
        if (!bounds) return
        
        const x = e.clientX - bounds.left - bounds.width / 2
        const y = e.clientY - bounds.top - bounds.height / 2
        
        const xMove = x * magneticStrength
        const yMove = y * magneticStrength
        
        killTweens()
        tweens.push(
          gsap.to(button, {
            x: xMove,
            y: yMove,
            duration: 0.3,
            ease: 'power2.out'
          }),
          gsap.to(text, {
            x: xMove * 0.3,
            y: yMove * 0.3,
            duration: 0.3,
            ease: 'power2.out'
          })
        )
      }
      
      const onMouseLeave = () => {
        killTweens()
        tweens.push(
          gsap.to([button, text], {
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: 'elastic.out(1, 0.3)'
          })
        )
      }
      
      const onMouseDown = () => {
        killTweens()
        tweens.push(
          gsap.to(button, {
            scale: 0.95,
            duration: 0.1
          })
        )
      }
      
      const onMouseUp = () => {
        killTweens()
        tweens.push(
          gsap.to(button, {
            scale: 1.05,
            duration: 0.1
          })
        )
      }
      
      button.addEventListener('mouseenter', onMouseEnter)
      button.addEventListener('mousemove', onMouseMove)
      button.addEventListener('mouseleave', onMouseLeave)
      button.addEventListener('mousedown', onMouseDown)
      button.addEventListener('mouseup', onMouseUp)
      
      return () => {
        killTweens()
        button.removeEventListener('mouseenter', onMouseEnter)
        button.removeEventListener('mousemove', onMouseMove)
        button.removeEventListener('mouseleave', onMouseLeave)
        button.removeEventListener('mousedown', onMouseDown)
        button.removeEventListener('mouseup', onMouseUp)
      }
    }, buttonRef)
    
    return () => ctx.revert()
  }, [magneticStrength])
  
  return (
    <button
      ref={buttonRef}
      className={`gsap-button gsap-button--${variant} gsap-button--${size} ${className}`}
      onClick={onClick}
    >
      <span ref={textRef} className="gsap-button__text">
        {children}
      </span>
    </button>
  )
}