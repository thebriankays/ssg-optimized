# WebGL Components Guide

## Component Structure

Every WebGL-enabled component follows a consistent pattern that separates concerns between server-side data fetching, client-side DOM rendering, and WebGL enhancement.

### Basic Component Pattern

```typescript
// blocks/webgl/MyWebGLBlock/Component.tsx (Server Component)
import { getPayloadHMR } from '@payloadcms/next/utilities'
import config from '@/payload.config'
import { MyWebGLBlockClient } from './Component.client'

export async function MyWebGLBlock({ id, ...props }) {
  const payload = await getPayloadHMR({ config })
  
  // Fetch any additional data needed
  const data = await payload.find({
    collection: 'media',
    where: { id: { equals: props.mediaId } },
  })
  
  return <MyWebGLBlockClient {...props} media={data} />
}

// blocks/webgl/MyWebGLBlock/Component.client.tsx (Client Component)
'use client'

import { WebGLView } from '@/components/canvas/WebGLView'
import { MyWebGLScene } from './Scene'
import { useRef } from 'react'

export function MyWebGLBlockClient({ media, ...props }) {
  const containerRef = useRef<HTMLDivElement>(null!)
  
  return (
    <section className="my-webgl-block" ref={containerRef}>
      {/* SEO-friendly DOM content */}
      <div className="content">
        <h2>{props.title}</h2>
        <p>{props.description}</p>
      </div>
      
      {/* WebGL enhancement */}
      <WebGLView track={containerRef} className="webgl-layer">
        <MyWebGLScene {...props} media={media} />
      </WebGLView>
    </section>
  )
}

// blocks/webgl/MyWebGLBlock/Scene.tsx (WebGL Scene)
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

export function MyWebGLScene({ media, ...props }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.5
  })
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshStandardMaterial />
    </mesh>
  )
}
```

## Common WebGL Components

### 1. Hero with 3D Model

```typescript
// blocks/webgl/Hero3D/Scene.tsx
import { Suspense, useRef } from 'react'
import { useGLTF, Float, Stage, ContactShadows } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'

interface Hero3DSceneProps {
  modelUrl: string
  floatSpeed?: number
  rotationSpeed?: number
  scale?: number
}

export function Hero3DScene({ 
  modelUrl, 
  floatSpeed = 2,
  rotationSpeed = 0.5,
  scale = 1 
}: Hero3DSceneProps) {
  const groupRef = useRef<Group>(null!)
  const { scene } = useGLTF(modelUrl)
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * rotationSpeed
    }
  })
  
  return (
    <Suspense fallback={<LoadingMesh />}>
      <Stage
        intensity={0.5}
        environment="city"
        adjustCamera={false}
      >
        <Float
          speed={floatSpeed}
          rotationIntensity={0.5}
          floatIntensity={0.5}
        >
          <group ref={groupRef} scale={scale}>
            <primitive object={scene} />
          </group>
        </Float>
      </Stage>
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.5}
        scale={10}
        blur={2}
      />
    </Suspense>
  )
}

function LoadingMesh() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="gray" wireframe />
    </mesh>
  )
}
```

### 2. Image Gallery with Distortion

```typescript
// blocks/webgl/DistortionGallery/Scene.tsx
import { useRef, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { DistortionMaterial } from './DistortionMaterial'

interface ImageData {
  url: string
  alt: string
}

interface DistortionGalleryProps {
  images: ImageData[]
  distortionScale?: number
}

export function DistortionGalleryScene({ 
  images, 
  distortionScale = 0.5 
}: DistortionGalleryProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  const textures = useTexture(images.map(img => img.url))
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Create render targets for transitions
  const renderTargets = useMemo(() => {
    return textures.map(texture => {
      const target = new THREE.WebGLRenderTarget(
        texture.image.width,
        texture.image.height
      )
      return target
    })
  }, [textures])
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uMouse.value = state.mouse
    }
  })
  
  return (
    <mesh>
      <planeGeometry args={[16, 9, 32, 32]} />
      <distortionMaterial
        ref={materialRef}
        texture={textures[currentIndex]}
        distortionScale={distortionScale}
      />
    </mesh>
  )
}
```

### 3. Particle System

```typescript
// blocks/webgl/ParticleField/Scene.tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ParticleFieldProps {
  count?: number
  size?: number
  color?: string
  speed?: number
}

export function ParticleFieldScene({ 
  count = 5000,
  size = 0.01,
  color = '#ffffff',
  speed = 0.1
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null!)
  
  // Generate particle positions
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 10
      positions[i3 + 1] = (Math.random() - 0.5) * 10
      positions[i3 + 2] = (Math.random() - 0.5) * 10
      
      velocities[i3] = (Math.random() - 0.5) * speed
      velocities[i3 + 1] = (Math.random() - 0.5) * speed
      velocities[i3 + 2] = (Math.random() - 0.5) * speed
    }
    
    return { positions, velocities }
  }, [count, speed])
  
  useFrame((state, delta) => {
    if (!pointsRef.current) return
    
    const positions = pointsRef.current.geometry.attributes.position
    const array = positions.array as Float32Array
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      
      // Update positions
      array[i3] += particles.velocities[i3] * delta
      array[i3 + 1] += particles.velocities[i3 + 1] * delta
      array[i3 + 2] += particles.velocities[i3 + 2] * delta
      
      // Wrap around
      if (Math.abs(array[i3]) > 5) array[i3] *= -0.9
      if (Math.abs(array[i3 + 1]) > 5) array[i3 + 1] *= -0.9
      if (Math.abs(array[i3 + 2]) > 5) array[i3 + 2] *= -0.9
    }
    
    positions.needsUpdate = true
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
```

### 4. Interactive Globe

```typescript
// blocks/webgl/InteractiveGlobe/Scene.tsx
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { GlobeMarker } from './GlobeMarker'

interface Location {
  id: string
  name: string
  coordinates: [number, number] // [lat, lng]
  color?: string
}

interface InteractiveGlobeProps {
  locations: Location[]
  autoRotate?: boolean
  rotationSpeed?: number
}

export function InteractiveGlobeScene({ 
  locations,
  autoRotate = true,
  rotationSpeed = 0.1
}: InteractiveGlobeProps) {
  const globeRef = useRef<THREE.Mesh>(null!)
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null)
  
  // Load textures
  const [earthMap, earthBump, earthSpec, clouds] = useTexture([
    '/textures/earth-blue-marble.jpg',
    '/textures/earth-bump.jpg',
    '/textures/earth-lights.jpg',
    '/textures/clouds.png',
  ])
  
  useFrame((state, delta) => {
    if (globeRef.current && autoRotate) {
      globeRef.current.rotation.y += delta * rotationSpeed
    }
  })
  
  // Convert lat/lng to 3D position
  const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    )
  }
  
  return (
    <group>
      {/* Earth */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={earthMap}
          bumpMap={earthBump}
          bumpScale={0.05}
          specularMap={earthSpec}
          specular={new THREE.Color('grey')}
        />
      </mesh>
      
      {/* Atmosphere */}
      <mesh scale={1.1}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={clouds}
          opacity={0.4}
          transparent
          depthWrite={false}
        />
      </mesh>
      
      {/* Location markers */}
      {locations.map((location) => {
        const position = latLngToVector3(
          location.coordinates[0],
          location.coordinates[1],
          2.05
        )
        
        return (
          <GlobeMarker
            key={location.id}
            position={position}
            location={location}
            hovered={hoveredLocation === location.id}
            onHover={setHoveredLocation}
          />
        )
      })}
    </group>
  )
}
```

## Shader Materials

### Custom Shader Material

```typescript
// components/canvas/materials/GlassMaterial.tsx
import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import * as THREE from 'three'

const GlassMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: new THREE.Vector2(),
    uRefraction: 0.5,
    uChromaticAberration: 0.1,
    uDistortion: 0.2,
    envMap: null,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vWorldNormal = normalize(mat3(modelMatrix) * normal);
      
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uRefraction;
    uniform float uChromaticAberration;
    uniform float uDistortion;
    uniform samplerCube envMap;
    
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    
    void main() {
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      
      // Refraction with chromatic aberration
      vec3 refractedR = refract(viewDirection, vWorldNormal, uRefraction);
      vec3 refractedG = refract(viewDirection, vWorldNormal, uRefraction + uChromaticAberration);
      vec3 refractedB = refract(viewDirection, vWorldNormal, uRefraction + uChromaticAberration * 2.0);
      
      // Sample environment map
      vec4 envColorR = textureCube(envMap, refractedR);
      vec4 envColorG = textureCube(envMap, refractedG);
      vec4 envColorB = textureCube(envMap, refractedB);
      
      vec3 color = vec3(envColorR.r, envColorG.g, envColorB.b);
      
      // Add distortion
      color += sin(vUv.y * 10.0 + uTime) * uDistortion;
      
      gl_FragColor = vec4(color, 0.8);
    }
  `
)

// Extend Three.js
extend({ GlassMaterial })

// TypeScript support
declare global {
  namespace JSX {
    interface IntrinsicElements {
      glassMaterial: any
    }
  }
}

// Usage
export function GlassSphere() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })
  
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <glassMaterial
        ref={materialRef}
        transparent
        envMap={environment}
      />
    </mesh>
  )
}
```

## Performance Patterns

### 1. LOD (Level of Detail)

```typescript
import { Detailed } from '@react-three/drei'

export function OptimizedModel({ url }) {
  const [high, medium, low] = useGLTF([
    url.replace('.glb', '-high.glb'),
    url.replace('.glb', '-medium.glb'),
    url.replace('.glb', '-low.glb'),
  ])
  
  return (
    <Detailed distances={[0, 10, 25]}>
      <primitive object={high.scene} />
      <primitive object={medium.scene} />
      <primitive object={low.scene} />
    </Detailed>
  )
}
```

### 2. Instanced Rendering

```typescript
import { Instance, Instances } from '@react-three/drei'
import { useMemo } from 'react'

export function InstancedObjects({ count = 1000 }) {
  const instances = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        scale: Math.random() * 0.5 + 0.5,
      })
    }
    return temp
  }, [count])
  
  return (
    <Instances limit={count}>
      <boxGeometry />
      <meshStandardMaterial />
      {instances.map((props, i) => (
        <Instance key={i} {...props} />
      ))}
    </Instances>
  )
}
```

### 3. Texture Optimization

```typescript
import { useTexture } from '@react-three/drei'
import { RepeatWrapping, LinearFilter } from 'three'

export function OptimizedTextures() {
  const props = useTexture({
    map: '/textures/diffuse.jpg',
    normalMap: '/textures/normal.jpg',
    roughnessMap: '/textures/roughness.jpg',
    metalnessMap: '/textures/metalness.jpg',
  })
  
  // Optimize all textures
  Object.values(props).forEach((texture) => {
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(4, 4)
    texture.minFilter = LinearFilter
    texture.generateMipmaps = false
  })
  
  return (
    <mesh>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial {...props} />
    </mesh>
  )
}
```

## Testing WebGL Components

```typescript
// __tests__/WebGLComponent.test.tsx
import { render } from '@testing-library/react'
import { Canvas } from '@react-three/fiber'
import { MyWebGLComponent } from '../MyWebGLComponent'

// Mock WebGL context
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    // Mock WebGL methods as needed
  }))
})

describe('MyWebGLComponent', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Canvas>
        <MyWebGLComponent />
      </Canvas>
    )
    
    expect(container).toBeInTheDocument()
  })
})
```