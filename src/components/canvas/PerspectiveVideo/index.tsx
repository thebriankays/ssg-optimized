'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, useVideoTexture } from '@react-three/drei'
import { ViewportScrollScene } from '@14islands/r3f-scroll-rig'
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'
import { gsap } from 'gsap'
import * as THREE from 'three'

interface PerspectiveVideoProps {
  videoUrl: string
  heading1?: string
  heading2?: string
  heading3?: string
  buttonText?: string
  onButtonClick?: () => void
  className?: string
}

function PerspectiveVideoScene({
  videoUrl,
  heading1 = '',
  heading2 = '',
  heading3 = '',
  buttonText = 'Click Me',
  onButtonClick,
}: Omit<PerspectiveVideoProps, 'className'>) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { camera, pointer } = useThree()
  
  // Load video texture
  const texture = useVideoTexture(videoUrl)
  
  // Mouse tracking for 3D tilt
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      setMousePos({ x, y })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  // Entrance animation
  useGSAPAnimation(() => {
    if (!groupRef.current) return
    
    gsap.fromTo(groupRef.current.scale,
      { x: 0, y: 0, z: 0 },
      { 
        x: 1, 
        y: 1, 
        z: 1, 
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)'
      }
    )
    
    // Animate text
    const texts = groupRef.current.children.filter(child => child.name.includes('text'))
    gsap.fromTo(texts,
      { visible: false },
      {
        visible: true,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.8,
        ease: 'power2.out'
      }
    )
  }, [])
  
  // 3D tilt effect
  useFrame(() => {
    if (!groupRef.current) return
    
    const rotationX = mousePos.y * 0.1
    const rotationY = -mousePos.x * 0.1
    
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      rotationX,
      0.1
    )
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      rotationY,
      0.1
    )
  })
  
  return (
    <group ref={groupRef}>
      {/* Video plane */}
      <mesh ref={meshRef} scale={[16, 9, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      
      {/* Text overlays */}
      {heading1 && (
        <Text
          name="text1"
          position={[0, 3, 0.1]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/AntiqueOlive.woff"
          visible={false}
        >
          {heading1}
        </Text>
      )}
      
      {heading2 && (
        <Text
          name="text2"
          position={[0, 0, 0.1]}
          fontSize={0.6}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/AntiqueOlive.woff"
          visible={false}
        >
          {heading2}
        </Text>
      )}
      
      {heading3 && (
        <Text
          name="text3"
          position={[0, -3, 0.1]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="/fonts/AntiqueOlive.woff"
          visible={false}
        >
          {heading3}
        </Text>
      )}
      
      {/* Interactive button area */}
      <mesh
        position={[0, 0, 0.2]}
        onClick={onButtonClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <planeGeometry args={[3, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}

export function PerspectiveVideo({
  className = '',
  ...props
}: PerspectiveVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  return (
    <div 
      ref={containerRef}
      className={`perspective-video ${className}`}
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        perspective: '2000px',
        overflow: 'hidden'
      }}
    >
      <ViewportScrollScene
        track={containerRef as React.MutableRefObject<HTMLElement>}
        hideOffscreen={false}
      >
        {() => <PerspectiveVideoScene {...props} />}
      </ViewportScrollScene>
      
      {/* DOM button overlay for better interaction */}
      {props.buttonText && (
        <button
          className="perspective-video__button"
          onClick={props.onButtonClick}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
        >
          {props.buttonText}
        </button>
      )}
    </div>
  )
}