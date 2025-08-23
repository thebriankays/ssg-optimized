'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'
import { gsap } from 'gsap'
import { WebGLView } from '@/components/canvas/WebGLView'
import { GlassCard } from '@/components/ui/glass/GlassCard'
import type { StorySection } from './types'
import dynamic from 'next/dynamic'

// Dynamic WebGL component imports
const WebGLComponents: Record<string, any> = {
  'spiral': dynamic(() => import('@/components/canvas/Spiral').then(m => m.Spiral)),
  'particles': dynamic(() => import('@/components/canvas/Particles').then(m => m.Particles)),
  'waves': dynamic(() => import('@/components/canvas/Waves').then(m => m.Waves)),
}

interface StorySectionProps {
  section: StorySection
  index: number
}

function StorySectionComponent({ section, index }: StorySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { amount: 0.3 })
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  
  // Parallax transforms
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8])
  
  // GSAP animation
  useGSAPAnimation(() => {
    if (!ref.current) return
    
    gsap.fromTo(ref.current, {
      opacity: 0,
      y: 50,
      scale: 0.95,
    }, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: section.animation?.duration || 1,
      delay: section.animation?.delay || 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
      },
    })
  }, [])
  
  const WebGLComponent = section.media?.webglComponent 
    ? WebGLComponents[section.media.webglComponent] 
    : null
  
  return (
    <motion.section
      ref={ref}
      className={`storytelling__section storytelling__section--${section.type} storytelling__section--${section.layout || 'center'}`}
      style={{
        y: section.animation?.type === 'parallax' ? y : 0,
        opacity: section.animation?.type === 'fade' ? opacity : 1,
        scale: section.animation?.type === 'scale' ? scale : 1,
        background: section.background?.gradient || section.background?.color,
      }}
    >
      {/* Background */}
      {section.background?.image && (
        <div 
          className="storytelling__background"
          style={{
            backgroundImage: `url(${section.background.image})`,
            filter: section.background.blur ? `blur(${section.background.blur}px)` : undefined,
          }}
        >
          {section.background.overlay && (
            <div 
              className="storytelling__background-overlay"
              style={{ background: section.background.overlay }}
            />
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="storytelling__content">
        {section.type === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className="storytelling__intro"
          >
            {section.subtitle && (
              <span className="storytelling__subtitle">{section.subtitle}</span>
            )}
            {section.title && (
              <h1 className="storytelling__title">{section.title}</h1>
            )}
            {section.content && (
              <p className="storytelling__text">{section.content}</p>
            )}
          </motion.div>
        )}
        
        {section.type === 'chapter' && (
          <GlassCard
            variant="frosted"
            className="storytelling__chapter"
          >
            {section.title && (
              <h2 className="storytelling__chapter-title">{section.title}</h2>
            )}
            {section.content && (
              <div 
                className="storytelling__chapter-content"
                dangerouslySetInnerHTML={{ __html: section.content }}
              />
            )}
          </GlassCard>
        )}
        
        {section.type === 'quote' && (
          <motion.blockquote
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="storytelling__quote"
          >
            {section.content && (
              <p className="storytelling__quote-text">{section.content}</p>
            )}
            {section.subtitle && (
              <cite className="storytelling__quote-author">{section.subtitle}</cite>
            )}
          </motion.blockquote>
        )}
        
        {section.type === 'parallax' && section.media && (
          <div className="storytelling__parallax">
            {section.media.type === 'image' && section.media.src && (
              <motion.img
                src={section.media.src}
                alt={section.title || ''}
                style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-20%']) }}
                className="storytelling__parallax-image"
              />
            )}
            {section.media.type === 'video' && section.media.src && (
              <motion.video
                src={section.media.src}
                autoPlay
                loop
                muted
                playsInline
                style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-20%']) }}
                className="storytelling__parallax-video"
              />
            )}
          </div>
        )}
      </div>
      
      {/* WebGL Media */}
      {section.media?.type === 'webgl' && WebGLComponent && (
        <div className="storytelling__webgl" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}>
          <WebGLView>
            <WebGLComponent {...(section.media.webglProps || {})} />
          </WebGLView>
        </div>
      )}
      
      {/* Regular Media */}
      {section.media?.type === 'image' && section.media.src && section.type !== 'parallax' && (
        <motion.div 
          className="storytelling__media"
          initial={{ opacity: 0, x: section.layout === 'left' ? -50 : 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <img src={section.media.src} alt={section.title || ''} />
        </motion.div>
      )}
      
      {section.media?.type === 'video' && section.media.src && section.type !== 'parallax' && (
        <motion.div 
          className="storytelling__media"
          initial={{ opacity: 0, x: section.layout === 'left' ? -50 : 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <video
            src={section.media.src}
            autoPlay
            loop
            muted
            playsInline
          />
        </motion.div>
      )}
    </motion.section>
  )
}

interface StorytellingProps {
  sections: StorySection[]
  className?: string
}

export function Storytelling({ sections, className = '' }: StorytellingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState(0)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })
  
  // Update active section based on scroll
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (progress) => {
      const sectionIndex = Math.floor(progress * sections.length)
      setActiveSection(Math.min(sectionIndex, sections.length - 1))
    })
    
    return unsubscribe
  }, [scrollYProgress, sections.length])
  
  return (
    <div ref={containerRef} className={`storytelling ${className}`}>
      {/* Progress indicator */}
      <motion.div 
        className="storytelling__progress"
        style={{
          scaleX: scrollYProgress,
        }}
      />
      
      {/* Navigation dots */}
      <div className="storytelling__nav">
        {sections.map((section, index) => (
          <button
            key={section.id}
            className={`storytelling__nav-dot ${index === activeSection ? 'active' : ''}`}
            onClick={() => {
              const element = document.querySelector(`#story-section-${index}`)
              element?.scrollIntoView({ behavior: 'smooth' })
            }}
            aria-label={`Go to ${section.title || `section ${index + 1}`}`}
          />
        ))}
      </div>
      
      {/* Sections */}
      {sections.map((section, index) => (
        <div key={section.id} id={`story-section-${index}`}>
          <StorySectionComponent section={section} index={index} />
        </div>
      ))}
    </div>
  )
}