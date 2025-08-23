'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/glass/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'

// Import all WebGL components
import { Background } from '@/components/canvas/Background'
import { TravelDataGlobe } from '@/components/TravelDataGlobe/TravelDataGlobe'
import { AreaExplorer } from '@/components/AreaExplorer/AreaExplorer'
import { Storytelling } from '@/components/Storytelling/Storytelling'
import { WebGLTextWrapper } from '@/components/canvas/WebGLText'
import { SpiralCarousel } from '@/components/canvas/SpiralCarousel'
import { KineticImages } from '@/components/canvas/KineticImages'
import { AnimatedFlag } from '@/components/canvas/AnimatedFlag'
import { WebGLCarousel } from '@/components/canvas/WebGLCarousel'
import { ThreeDCarousel } from '@/components/canvas/ThreeDCarousel'
import { Dolphins } from '@/components/canvas/Dolphins'

const components = [
  {
    id: 'background',
    name: 'Whatamesh Background',
    description: 'Animated gradient mesh background with configurable colors',
    component: Background,
    props: {
      settings: {
        type: 'whatamesh',
        color1: '#c3e4ff',
        color2: '#6ec3f4', 
        color3: '#eae2ff',
        color4: '#b9beff',
        intensity: 0.7,
      }
    }
  },
  {
    id: 'webgl-text',
    name: 'WebGL 3D Text',
    description: 'Troika-based 3D text with animations and effects',
    component: WebGLTextWrapper,
    props: {
      text: 'Hello WebGL!',
      fontSize: 2,
      color: '#00ff88',
      animation: { type: 'typewriter', duration: 2000 },
      style: { height: '400px' }
    }
  },
  {
    id: 'spiral-carousel',
    name: 'Spiral Carousel',
    description: '3D spiral image carousel with custom shaders',
    component: SpiralCarousel,
    props: {
      items: [
        { id: '1', image: '/1.jpg', title: 'Image 1', description: 'Beautiful landscape' },
        { id: '2', image: '/2.jpg', title: 'Image 2', description: 'Urban architecture' },
        { id: '3', image: '/3.jpg', title: 'Image 3', description: 'Natural scenery' },
        { id: '4', image: '/4.jpg', title: 'Image 4', description: 'Modern design' },
        { id: '5', image: '/5.jpg', title: 'Image 5', description: 'Artistic view' },
      ]
    }
  },
  {
    id: 'kinetic-images',
    name: 'Kinetic Images',
    description: '3D image gallery with multiple layout variants',
    component: KineticImages,
    props: {
      images: [
        { id: '1', src: '/1.jpg' },
        { id: '2', src: '/2.jpg' },
        { id: '3', src: '/3.jpg' },
        { id: '4', src: '/4.jpg' },
        { id: '5', src: '/5.jpg' },
      ],
      variant: 'tower'
    }
  },
  {
    id: 'animated-flag',
    name: 'Animated Flag',
    description: 'Realistic flag animation with wind physics',
    component: AnimatedFlag,
    props: {
      flagTexture: '/SSG_Logo_Square-400-x-250-px-1.webp',
      windStrength: 0.8,
      autoWind: true
    }
  },
  {
    id: 'webgl-carousel',
    name: 'WebGL Carousel',
    description: 'Circular 3D image carousel',
    component: WebGLCarousel,
    props: {
      items: [
        { id: '1', image: '/1.jpg', title: 'Slide 1', description: 'First slide' },
        { id: '2', image: '/2.jpg', title: 'Slide 2', description: 'Second slide' },
        { id: '3', image: '/3.jpg', title: 'Slide 3', description: 'Third slide' },
        { id: '4', image: '/4.jpg', title: 'Slide 4', description: 'Fourth slide' },
      ]
    }
  },
  {
    id: 'threed-carousel',
    name: '3D Shape Carousel',
    description: 'Carousel with 3D geometric shapes',
    component: ThreeDCarousel,
    props: {
      items: [
        { id: '1', shape: 'box', color: '#ff6b6b', title: 'Red Box', description: 'A red cube' },
        { id: '2', shape: 'sphere', color: '#4ecdc4', title: 'Teal Sphere', description: 'A teal ball' },
        { id: '3', shape: 'cylinder', color: '#45b7d1', title: 'Blue Cylinder', description: 'A blue cylinder' },
        { id: '4', shape: 'box', color: '#f9ca24', title: 'Yellow Box', description: 'A yellow cube' },
      ]
    }
  },
  {
    id: 'dolphins',
    name: 'Dolphins Ocean Scene',
    description: 'Immersive ocean environment with animated dolphins',
    component: Dolphins,
    props: {
      dolphinCount: 3,
      showBubbles: true,
      autoCamera: true
    }
  }
]

export function ShowcaseDemo() {
  const [selectedComponent, setSelectedComponent] = useState<typeof components[0] | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const openComponent = (component: typeof components[0]) => {
    setSelectedComponent(component)
    setIsFullscreen(true)
  }
  
  const closeComponent = () => {
    setSelectedComponent(null)
    setIsFullscreen(false)
  }
  
  return (
    <div className="showcase-demo">
      {/* Component Grid */}
      <div style={{
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <h1 style={{
            textAlign: 'center',
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '20px',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}>
            🚀 WebGL Component Showcase
          </h1>
          
          <p style={{
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '18px',
            marginBottom: '50px',
            maxWidth: '600px',
            margin: '0 auto 50px',
          }}>
            Interactive React Three Fiber components built with modern WebGL architecture.
            Click on any component to see it in fullscreen action!
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px',
          }}>
            {components.map((component) => (
              <motion.div
                key={component.id}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                style={{ cursor: 'pointer' }}
                onClick={() => openComponent(component)}
              >
                <GlassCard
                  variant="frosted"
                  style={{
                    padding: '30px',
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h3 style={{
                      margin: '0 0 15px',
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: '600',
                    }}>
                      {component.name}
                    </h3>
                    <p style={{
                      margin: '0 0 20px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '16px',
                      lineHeight: '1.5',
                    }}>
                      {component.description}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{
                      color: '#00ff88',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}>
                      Click to explore →
                    </span>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(0, 255, 136, 0.2)',
                      border: '2px solid #00ff88',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}>
                      🎮
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Fullscreen Component Viewer */}
      <AnimatePresence>
        {isFullscreen && selectedComponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.9)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
            }}>
              <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>
                {selectedComponent.name}
              </h2>
              <button
                onClick={closeComponent}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>
            
            {/* Component Content */}
            <div style={{ flex: 1, position: 'relative' }}>
              <selectedComponent.component {...selectedComponent.props} />
            </div>
            
            {/* Instructions */}
            <div style={{
              padding: '15px 20px',
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(10px)',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '14px',
              textAlign: 'center',
            }}>
              Press ESC or click the × button to close • Interact with the component above
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}