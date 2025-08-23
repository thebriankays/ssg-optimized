'use client'

import { useRef, useState, useEffect, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations, Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { ViewportScrollScene } from '@/components/canvas/ViewportScrollScene'
import { GlassCard } from '@/components/ui/glass/GlassCard'

interface DolphinModelProps {
  position: [number, number, number]
  scale?: number
  animation?: string
}

function DolphinModel({ position, scale = 1, animation = 'swimming' }: DolphinModelProps) {
  const group = useRef<THREE.Group>(null)
  
  // Use the dolphin model from the public folder
  const { scene, animations } = useGLTF('/models/dolphin.glb')
  const { actions } = useAnimations(animations, group)
  
  // Play animation
  useEffect(() => {
    if (actions[animation]) {
      actions[animation]?.play()
    }
  }, [actions, animation])
  
  // Add swimming motion
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1
    }
  })
  
  return (
    <group ref={group} position={position} scale={scale}>
      <primitive object={scene.clone()} />
    </group>
  )
}

function OceanFloor() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current && meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      // Animate water-like effect
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.02
    }
  })
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[50, 50, 32, 32]} />
      <meshStandardMaterial
        color="#1e6091"
        roughness={0.1}
        metalness={0.7}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

interface BubblesProps {
  count?: number
}

function Bubbles({ count = 50 }: BubblesProps) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((bubble, index) => {
        if (bubble instanceof THREE.Mesh) {
          // Animate bubbles rising
          bubble.position.y += 0.01
          bubble.position.x += Math.sin(state.clock.elapsedTime + index) * 0.001
          bubble.position.z += Math.cos(state.clock.elapsedTime + index) * 0.001
          
          // Reset when they reach the top
          if (bubble.position.y > 10) {
            bubble.position.y = -10
            bubble.position.x = (Math.random() - 0.5) * 20
            bubble.position.z = (Math.random() - 0.5) * 20
          }
        }
      })
    }
  })
  
  return (
    <group ref={groupRef}>
      {Array.from({ length: count }, (_, index) => (
        <mesh
          key={index}
          position={[
            (Math.random() - 0.5) * 20,
            Math.random() * 20 - 10,
            (Math.random() - 0.5) * 20,
          ]}
        >
          <sphereGeometry args={[0.05 + Math.random() * 0.1, 8, 8]} />
          <meshStandardMaterial
            color="#87CEEB"
            transparent
            opacity={0.3}
            roughness={0}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  )
}

interface DolphinsR3FProps {
  dolphinCount?: number
  showBubbles?: boolean
  autoCamera?: boolean
}

function DolphinsR3F({ dolphinCount = 5, showBubbles = true, autoCamera = true }: DolphinsR3FProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  
  useFrame((state) => {
    if (autoCamera && state.camera) {
      // Gentle camera movement
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 5
      state.camera.position.y = Math.sin(state.clock.elapsedTime * 0.15) * 2 + 2
      state.camera.lookAt(0, 0, 0)
    }
  })
  
  const dolphins = Array.from({ length: dolphinCount }, (_, index) => {
    const angle = (index / dolphinCount) * Math.PI * 2
    const radius = 3 + Math.random() * 3
    return {
      id: index,
      position: [
        Math.cos(angle) * radius,
        Math.random() * 4 - 2,
        Math.sin(angle) * radius,
      ] as [number, number, number],
      scale: 0.5 + Math.random() * 0.5,
    }
  })
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} color="#004d7a" />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        color="#ffffff"
        castShadow
      />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#00d4ff" />
      
      {/* Environment */}
      <Environment preset="sunset" background={false} />
      
      {/* Ocean scene */}
      <OceanFloor />
      
      {/* Dolphins */}
      <Suspense fallback={null}>
        {dolphins.map((dolphin) => (
          <DolphinModel
            key={dolphin.id}
            position={dolphin.position}
            scale={dolphin.scale}
          />
        ))}
      </Suspense>
      
      {/* Bubbles */}
      {showBubbles && <Bubbles />}
      
      {/* Controls */}
      {!autoCamera && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={20}
        />
      )}
    </>
  )
}

interface DolphinsProps {
  dolphinCount?: number
  showBubbles?: boolean
  autoCamera?: boolean
  className?: string
}

export function Dolphins({
  dolphinCount = 5,
  showBubbles = true,
  autoCamera = true,
  className = '',
}: DolphinsProps) {
  const [currentDolphinCount, setCurrentDolphinCount] = useState(dolphinCount)
  const [currentShowBubbles, setCurrentShowBubbles] = useState(showBubbles)
  const [currentAutoCamera, setCurrentAutoCamera] = useState(autoCamera)
  const containerRef = useRef<HTMLDivElement>(null)
  
  return (
    <div ref={containerRef} className={`dolphins-scene ${className}`}>
      <ViewportScrollScene
        track={containerRef as React.MutableRefObject<HTMLElement>}
        style={{
          width: '100%',
          height: '100vh',
          minHeight: '600px',
          background: 'linear-gradient(to bottom, #87CEEB 0%, #004d7a 50%, #000080 100%)',
        }}
      >
        {() => (
          <DolphinsR3F
            dolphinCount={currentDolphinCount}
            showBubbles={currentShowBubbles}
            autoCamera={currentAutoCamera}
          />
        )}
      </ViewportScrollScene>
      
      {/* Controls */}
      <GlassCard
        variant="frosted"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '20px',
          minWidth: '280px',
          zIndex: 10,
        }}
      >
        <h3 style={{ margin: '0 0 15px', color: 'white' }}>
          🐬 Dolphins Ocean Scene
        </h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'white', fontSize: '14px' }}>
            Dolphin Count: {currentDolphinCount}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={currentDolphinCount}
            onChange={(e) => setCurrentDolphinCount(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={currentShowBubbles}
              onChange={(e) => setCurrentShowBubbles(e.target.checked)}
            />
            Show Bubbles
          </label>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={currentAutoCamera}
              onChange={(e) => setCurrentAutoCamera(e.target.checked)}
            />
            Auto Camera Movement
          </label>
        </div>
        
        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
          <p style={{ margin: '5px 0' }}>🌊 Immersive ocean environment</p>
          <p style={{ margin: '5px 0' }}>🐬 Animated dolphin models</p>
          <p style={{ margin: '5px 0' }}>💨 Rising bubble effects</p>
          <p style={{ margin: '5px 0' }}>🎮 Interactive controls</p>
        </div>
      </GlassCard>
    </div>
  )
}

// Preload the dolphin model
useGLTF.preload('/models/dolphin.glb')