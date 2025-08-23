'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'

interface SpringyLineProps {
  className?: string
  color?: string
  strokeWidth?: number
  sensitivity?: number
}

export function SpringyLine({
  className = '',
  color = 'black',
  strokeWidth = 3,
  sensitivity = 40
}: SpringyLineProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const gradientPathRef = useRef<SVGPathElement | null>(null)
  
  // Initialize gradient path
  useEffect(() => {
    if (!svgRef.current || !pathRef.current) return
    
    // Create gradient path
    const gradientPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    gradientPath.setAttribute('stroke', 'url(#springy-gradient)')
    gradientPath.setAttribute('stroke-width', String(strokeWidth + 2))
    gradientPath.setAttribute('fill', 'none')
    gradientPath.setAttribute('opacity', '0')
    gradientPath.style.strokeLinecap = 'round'
    gradientPath.style.strokeDasharray = '800'
    gradientPath.style.strokeDashoffset = '800'
    
    svgRef.current.appendChild(gradientPath)
    gradientPathRef.current = gradientPath
    
    return () => {
      gradientPath.remove()
    }
  }, [strokeWidth])
  
  useGSAPAnimation(() => {
    if (!pathRef.current || !gradientPathRef.current) return
    
    const path = pathRef.current
    const gradientPath = gradientPathRef.current
    
    // Initial state
    gsap.set([path, gradientPath], {
      attr: { d: 'M0,20 Q400,20 800,20' }
    })
    
    // Timeline for animations
    const tl = gsap.timeline()
    
    // Initial animation
    tl.to(path, {
      attr: { d: 'M0,20 Q400,10 800,20' },
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)',
    })
    .to(path, {
      attr: { d: 'M0,20 Q400,20 800,20' },
      duration: 0.6,
      ease: 'elastic.out(1, 0.3)',
    })
    
    // Mouse interactions
    const handleMouseEnter = () => {
      gsap.to(path, {
        attr: { d: 'M0,20 Q400,5 800,20' },
        duration: 0.6,
        ease: 'elastic.out(1, 0.3)',
      })
      
      gsap.to(gradientPath, {
        opacity: 1,
        duration: 0.3,
      })
      
      gsap.to(gradientPath, {
        strokeDashoffset: 0,
        duration: 0.8,
        ease: 'power2.inOut',
      })
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = svgRef.current!.getBoundingClientRect()
      const y = ((e.clientY - rect.top) / rect.height) * sensitivity
      
      gsap.to([path, gradientPath], {
        attr: { d: `M0,20 Q400,${y} 800,20` },
        duration: 0.3,
        overwrite: 'auto',
      })
    }
    
    const handleMouseLeave = () => {
      gsap.to([path, gradientPath], {
        attr: { d: 'M0,20 Q400,20 800,20' },
        duration: 0.8,
        ease: 'elastic.out(1, 0.3)',
      })
      
      gsap.to(gradientPath, {
        opacity: 0,
        strokeDashoffset: 800,
        duration: 0.4,
      })
    }
    
    // Add event listeners
    const svg = svgRef.current!
    svg.addEventListener('mouseenter', handleMouseEnter)
    svg.addEventListener('mousemove', handleMouseMove)
    svg.addEventListener('mouseleave', handleMouseLeave)
    
    // Cleanup
    return () => {
      svg.removeEventListener('mouseenter', handleMouseEnter)
      svg.removeEventListener('mousemove', handleMouseMove)
      svg.removeEventListener('mouseleave', handleMouseLeave)
      tl.kill()
    }
  }, [sensitivity])
  
  return (
    <svg
      ref={svgRef}
      className={`springy-line ${className}`}
      viewBox="0 0 800 40"
      preserveAspectRatio="none"
      style={{
        width: '100%',
        height: '40px',
        display: 'block',
        cursor: 'pointer',
      }}
    >
      <defs>
        <linearGradient id="springy-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="25%" stopColor="#ec4899" />
          <stop offset="75%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      
      <path
        ref={pathRef}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        style={{ strokeLinecap: 'round' }}
      />
    </svg>
  )
}