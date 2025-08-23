'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { 
  InstancedMesh, 
  Matrix4, 
  Vector3, 
  Color, 
  MeshPhysicalMaterial,
  Object3D,
  MathUtils
} from 'three'
import { ViewportScrollScene } from '@14islands/r3f-scroll-rig'
import { Environment } from '@react-three/drei'
import { GlassButton } from '@/components/ui/glass/GlassButton'

interface Sphere {
  position: Vector3
  velocity: Vector3
  radius: number
  color: Color
  targetColor: Color
  mass: number
}

interface SpherePacking2Props {
  count?: number
  minSize?: number
  maxSize?: number
  colors?: string[]
  gravity?: number
  friction?: number
  wallBounce?: number
  maxVelocity?: number
  followCursor?: boolean
  background?: {
    backgroundType?: 'color' | 'image' | 'transparent'
    backgroundColor?: string
    backgroundImage?: {
      url: string
      alt?: string
    }
  }
}

function SpherePacking2Scene({
  count = 250,
  minSize = 0.1,
  maxSize = 0.4,
  colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#dfe6e9'],
  gravity = 0.02,
  friction = 0.99,
  wallBounce = 0.7,
  maxVelocity = 0.5,
  followCursor = true,
}: Omit<SpherePacking2Props, 'background'>) {
  const meshRef = useRef<InstancedMesh>(null)
  const { size, camera } = useThree()
  const dummy = useMemo(() => new Object3D(), [])
  
  // State
  const [gravityEnabled, setGravityEnabled] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const mousePos = useRef(new Vector3())
  
  // Initialize spheres
  const spheres = useMemo(() => {
    const sphereArray: Sphere[] = []
    const colorObjects = colors.map(c => new Color(c))
    
    for (let i = 0; i < count; i++) {
      const radius = MathUtils.randFloat(minSize, maxSize)
      sphereArray.push({
        position: new Vector3(
          (Math.random() - 0.5) * 8,
          Math.random() * 5 + 2,
          (Math.random() - 0.5) * 8
        ),
        velocity: new Vector3(
          (Math.random() - 0.5) * 0.1,
          0,
          (Math.random() - 0.5) * 0.1
        ),
        radius,
        color: colorObjects[Math.floor(Math.random() * colorObjects.length)].clone(),
        targetColor: colorObjects[Math.floor(Math.random() * colorObjects.length)].clone(),
        mass: radius * radius * radius,
      })
    }
    
    return sphereArray
  }, [count, minSize, maxSize, colors])
  
  // Material
  const material = useMemo(() => {
    return new MeshPhysicalMaterial({
      roughness: 0.3,
      metalness: 0.2,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      transmission: 0.6,
      thickness: 0.5,
      envMapIntensity: 1.5,
      iridescence: 0.3,
      iridescenceIOR: 1.5,
      sheen: 0.5,
      sheenColor: new Color('#c0c0c0'),
    })
  }, [])
  
  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      mousePos.current.set(x * 5, y * 5, 0)
    }
    
    if (followCursor) {
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [followCursor])
  
  // Physics simulation
  const updatePhysics = (delta: number) => {
    const deltaTime = Math.min(delta * 60, 2) // Cap delta time
    
    for (let i = 0; i < spheres.length; i++) {
      const sphere = spheres[i]
      
      // Apply gravity
      if (gravityEnabled) {
        sphere.velocity.y -= gravity * deltaTime
      }
      
      // Mouse attraction (when cursor following is enabled)
      if (followCursor) {
        const direction = mousePos.current.clone().sub(sphere.position)
        const distance = direction.length()
        
        if (distance > 0.1 && distance < 5) {
          direction.normalize()
          const force = direction.multiplyScalar(0.02 * deltaTime / distance)
          sphere.velocity.add(force)
        }
      }
      
      // Sphere-to-sphere collision
      for (let j = i + 1; j < spheres.length; j++) {
        const other = spheres[j]
        const diff = sphere.position.clone().sub(other.position)
        const dist = diff.length()
        const minDist = sphere.radius + other.radius
        
        if (dist < minDist && dist > 0) {
          diff.normalize()
          const overlap = minDist - dist
          const pushForce = diff.multiplyScalar(overlap * 0.5)
          
          sphere.position.add(pushForce)
          other.position.sub(pushForce)
          
          // Calculate collision response
          const relativeVelocity = sphere.velocity.clone().sub(other.velocity)
          const velocityAlongNormal = relativeVelocity.dot(diff)
          
          if (velocityAlongNormal > 0) {
            const restitution = 0.8
            const impulse = 2 * velocityAlongNormal / (sphere.mass + other.mass)
            const impulseVector = diff.multiplyScalar(impulse * restitution)
            
            sphere.velocity.sub(impulseVector.clone().multiplyScalar(other.mass))
            other.velocity.add(impulseVector.clone().multiplyScalar(sphere.mass))
          }
        }
      }
      
      // Apply friction
      sphere.velocity.multiplyScalar(friction)
      
      // Limit velocity
      if (sphere.velocity.length() > maxVelocity) {
        sphere.velocity.normalize().multiplyScalar(maxVelocity)
      }
      
      // Update position
      sphere.position.add(sphere.velocity.clone().multiplyScalar(deltaTime))
      
      // Wall collisions
      const boundary = 5
      
      // X boundaries
      if (Math.abs(sphere.position.x) > boundary - sphere.radius) {
        sphere.position.x = Math.sign(sphere.position.x) * (boundary - sphere.radius)
        sphere.velocity.x *= -wallBounce
      }
      
      // Y boundaries (floor and ceiling)
      if (sphere.position.y - sphere.radius < -boundary) {
        sphere.position.y = -boundary + sphere.radius
        sphere.velocity.y *= -wallBounce
        
        // Add some random horizontal velocity on bounce
        sphere.velocity.x += (Math.random() - 0.5) * 0.1
        sphere.velocity.z += (Math.random() - 0.5) * 0.1
      }
      if (sphere.position.y + sphere.radius > boundary) {
        sphere.position.y = boundary - sphere.radius
        sphere.velocity.y *= -wallBounce
      }
      
      // Z boundaries
      if (Math.abs(sphere.position.z) > boundary - sphere.radius) {
        sphere.position.z = Math.sign(sphere.position.z) * (boundary - sphere.radius)
        sphere.velocity.z *= -wallBounce
      }
      
      // Color interpolation
      sphere.color.lerp(sphere.targetColor, 0.05)
    }
  }
  
  // Update instanced mesh
  const updateInstances = () => {
    if (!meshRef.current) return
    
    const matrix = new Matrix4()
    for (let i = 0; i < spheres.length; i++) {
      const sphere = spheres[i]
      
      matrix.makeScale(sphere.radius, sphere.radius, sphere.radius)
      matrix.setPosition(sphere.position)
      meshRef.current.setMatrixAt(i, matrix)
      meshRef.current.setColorAt(i, sphere.color)
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }
  
  // Animation loop
  useFrame((state, delta) => {
    if (!isPaused) {
      updatePhysics(delta)
      updateInstances()
    }
  })
  
  // Randomize colors
  const randomizeColors = () => {
    const colorObjects = colors.map(c => new Color(c))
    spheres.forEach(sphere => {
      sphere.targetColor = colorObjects[Math.floor(Math.random() * colorObjects.length)].clone()
    })
  }
  
  // Reset positions
  const resetPositions = () => {
    spheres.forEach(sphere => {
      sphere.position.set(
        (Math.random() - 0.5) * 8,
        Math.random() * 5 + 2,
        (Math.random() - 0.5) * 8
      )
      sphere.velocity.set(
        (Math.random() - 0.5) * 0.1,
        0,
        (Math.random() - 0.5) * 0.1
      )
    })
  }
  
  return (
    <>
      <Environment preset="sunset" />
      
      {/* Floor */}
      <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
      </mesh>
      
      {/* Spheres */}
      <instancedMesh 
        ref={meshRef} 
        args={[undefined, undefined, count]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 32, 16]} />
        <primitive object={material} attach="material" />
      </instancedMesh>
      
      {/* Controls UI (rendered outside canvas) */}
      <div className="sphere-packing2__controls">
        <GlassButton
          variant="secondary"
          size="sm"
          onClick={() => setGravityEnabled(!gravityEnabled)}
        >
          {gravityEnabled ? 'Disable' : 'Enable'} Gravity
        </GlassButton>
        <GlassButton
          variant="secondary"
          size="sm"
          onClick={randomizeColors}
        >
          Randomize Colors
        </GlassButton>
        <GlassButton
          variant="secondary"
          size="sm"
          onClick={resetPositions}
        >
          Reset Positions
        </GlassButton>
        <GlassButton
          variant="secondary"
          size="sm"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </GlassButton>
      </div>
    </>
  )
}

export function SpherePacking2({ 
  background,
  ...props 
}: SpherePacking2Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  return (
    <div 
      ref={containerRef} 
      className="sphere-packing2"
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        background: background?.backgroundType === 'color' 
          ? background.backgroundColor 
          : background?.backgroundType === 'image' && background.backgroundImage
          ? `url(${background.backgroundImage.url})`
          : 'transparent'
      }}
    >
      <ViewportScrollScene
        track={containerRef as React.MutableRefObject<HTMLElement>}
        hideOffscreen={false}
      >
        {() => <SpherePacking2Scene {...props} />}
      </ViewportScrollScene>
    </div>
  )
}