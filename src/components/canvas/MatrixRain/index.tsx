'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, useTexture } from '@react-three/drei'
import { ViewportScrollScene, UseCanvas } from '@14islands/r3f-scroll-rig'
import * as THREE from 'three'

interface Drop {
  id: number
  character: string
  x: number
  y: number
  speed: number
  size: number
  opacity: number
  lifetime: number
}

function MatrixRainScene() {
  const { size } = useThree()
  const [drops, setDrops] = useState<Drop[]>([])
  const nextDropId = useRef(0)
  const lastSpawnTime = useRef(0)
  
  const characters = '¿¥!@#$%^*()?¢×+©€£%@[]¿{}~'
  
  // Cloud mesh for the header
  const cloudGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    
    // Create cloud-like shape
    shape.moveTo(0, 0)
    shape.bezierCurveTo(25, -25, 25, -25, 50, -25)
    shape.bezierCurveTo(80, -25, 80, -25, 100, 0)
    shape.bezierCurveTo(125, -25, 125, -25, 150, -25)
    shape.bezierCurveTo(175, -25, 175, -25, 200, 0)
    shape.bezierCurveTo(200, 25, 200, 25, 175, 50)
    shape.bezierCurveTo(175, 75, 175, 75, 150, 75)
    shape.bezierCurveTo(125, 75, 125, 75, 100, 50)
    shape.bezierCurveTo(75, 75, 75, 75, 50, 75)
    shape.bezierCurveTo(25, 75, 25, 75, 0, 50)
    shape.bezierCurveTo(0, 25, 0, 25, 0, 0)
    
    return new THREE.ShapeGeometry(shape)
  }, [])
  
  // Spawn new drops
  useFrame((state) => {
    const currentTime = state.clock.elapsedTime * 1000
    
    // Spawn new drop every 50ms
    if (currentTime - lastSpawnTime.current > 50) {
      lastSpawnTime.current = currentTime
      
      const newDrop: Drop = {
        id: nextDropId.current++,
        character: characters[Math.floor(Math.random() * characters.length)],
        x: (Math.random() - 0.5) * 6, // Random position within cloud width
        y: 3, // Start position
        speed: 0.5 + Math.random() * 1,
        size: 0.1 + Math.random() * 0.3,
        opacity: 1,
        lifetime: 0
      }
      
      setDrops(prev => [...prev, newDrop])
    }
    
    // Update drops
    setDrops(prev => prev
      .map(drop => ({
        ...drop,
        y: drop.y - drop.speed * 0.016, // 60fps frame time
        lifetime: drop.lifetime + 0.016,
        opacity: drop.lifetime < 0.5 ? drop.lifetime * 2 : 
                 drop.lifetime > 3 ? Math.max(0, 1 - (drop.lifetime - 3) * 0.5) : 1
      }))
      .filter(drop => drop.y > -5 && drop.lifetime < 6) // Remove drops that are too far or too old
    )
  })
  
  return (
    <>
      {/* Cloud Header */}
      <group position={[0, 3, 0]}>
        {/* Cloud shape with glow */}
        <mesh geometry={cloudGeometry} scale={[0.01, 0.01, 1]}>
          <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
        </mesh>
        
        {/* Glow effect */}
        <mesh geometry={cloudGeometry} scale={[0.011, 0.011, 1]} position={[0, 0, -0.1]}>
          <meshBasicMaterial 
            color="#00ff00" 
            transparent 
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* Text */}
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.5}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
          font="/fonts/AlienRobot.ttf"
          outlineWidth={0.02}
          outlineColor="#00ff00"
          outlineOpacity={0.5}
        >
          Alien Integrations
        </Text>
      </group>
      
      {/* Falling drops */}
      {drops.map(drop => (
        <Text
          key={drop.id}
          position={[drop.x, drop.y, 0]}
          fontSize={drop.size}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
          fillOpacity={drop.opacity}
          font="/fonts/AlienRobot.ttf"
          outlineWidth={drop.size * 0.1}
          outlineColor="#00ff00"
          outlineOpacity={drop.opacity * 0.5}
        >
          {drop.character}
        </Text>
      ))}
      
      {/* Background plane for color effect */}
      <mesh position={[0, 0, -5]} scale={[20, 20, 1]}>
        <planeGeometry />
        <meshBasicMaterial 
          color="#000000" 
          transparent 
          opacity={0.8}
        />
      </mesh>
    </>
  )
}

interface MatrixRainProps {
  className?: string
}

export function MatrixRain({ className = '' }: MatrixRainProps) {
  const proxyRef = useRef<HTMLDivElement>(null)
  const [hue, setHue] = useState(0)
  
  // Animate hue rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setHue(prev => (prev + 1) % 360)
    }, 50)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <section className={`block matrix-rain ${className}`}>
      <h2 className="mb-3 text-xl font-semibold">Matrix Rain</h2>
      
      {/* SMALL proxy to track – this is key */}
      <div ref={proxyRef} className="webgl-proxy h-[45vh] rounded-lg" />
      
      {/* Apply the filter to a wrapper div */}
      <div style={{ filter: `hue-rotate(${hue}deg)` }}>
        <UseCanvas>
          <ViewportScrollScene
            track={proxyRef as React.MutableRefObject<HTMLElement>}
            hideOffscreen={false}
            camera={{ position: [0, 0, 10] }}
          >
            {() => <MatrixRainScene />}
          </ViewportScrollScene>
        </UseCanvas>
      </div>
    </section>
  )
}