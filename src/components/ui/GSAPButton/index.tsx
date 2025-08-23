'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { gsap } from 'gsap'
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
  
  useEffect(() => {
    const button = buttonRef.current
    const text = textRef.current
    
    if (!button || !text) return
    
    let bounds: DOMRect
    
    const onMouseEnter = () => {
      bounds = button.getBoundingClientRect()
      gsap.to(button, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
    
    const onMouseMove = (e: MouseEvent) => {
      if (!bounds) return
      
      const x = e.clientX - bounds.left - bounds.width / 2
      const y = e.clientY - bounds.top - bounds.height / 2
      
      const xMove = x * magneticStrength
      const yMove = y * magneticStrength
      
      gsap.to(button, {
        x: xMove,
        y: yMove,
        duration: 0.3,
        ease: 'power2.out'
      })
      
      gsap.to(text, {
        x: xMove * 0.3,
        y: yMove * 0.3,
        duration: 0.3,
        ease: 'power2.out'
      })
    }
    
    const onMouseLeave = () => {
      gsap.to([button, text], {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'elastic.out(1, 0.3)'
      })
    }
    
    const onMouseDown = () => {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1
      })
    }
    
    const onMouseUp = () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.1
      })
    }
    
    button.addEventListener('mouseenter', onMouseEnter)
    button.addEventListener('mousemove', onMouseMove)
    button.addEventListener('mouseleave', onMouseLeave)
    button.addEventListener('mousedown', onMouseDown)
    button.addEventListener('mouseup', onMouseUp)
    
    return () => {
      button.removeEventListener('mouseenter', onMouseEnter)
      button.removeEventListener('mousemove', onMouseMove)
      button.removeEventListener('mouseleave', onMouseLeave)
      button.removeEventListener('mousedown', onMouseDown)
      button.removeEventListener('mouseup', onMouseUp)
    }
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