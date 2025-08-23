# Component Library Examples

## WebGL Text Components

### Basic WebGL Text with Scroll Sync

```tsx
import { UseCanvas, ScrollScene } from '@14islands/r3f-scroll-rig'
import { WebGLTextScrollRig } from '@/components/canvas/scroll-rig'
import { useRef } from 'react'

export function ScrollSyncedText() {
  const textRef = useRef<HTMLHeadingElement>(null)
  
  return (
    <>
      <h1 ref={textRef} className="text-6xl font-bold">
        Welcome to Paradise
      </h1>
      
      <UseCanvas>
        <ScrollScene track={textRef}>
          {({ scale }) => (
            <WebGLTextScrollRig 
              el={textRef}
              scale={scale}
              font="/fonts/inter-bold.woff"
              color="#64c8ff"
            >
              {textRef.current?.innerText}
            </WebGLTextScrollRig>
          )}
        </ScrollScene>
      </UseCanvas>
    </>
  )
}
```

### Animated WebGL Text

```tsx
import { WebGLText } from '@/components/canvas/WebGLText'
import { UseCanvas } from '@14islands/r3f-scroll-rig'

export function AnimatedText() {
  return (
    <UseCanvas>
      <WebGLText
        text="Explore the World"
        animation={{
          type: 'wave',
          duration: 2000,
          stagger: 0.1
        }}
        material="physical"
        metalness={0.3}
        roughness={0.4}
        emissive="#0080ff"
        emissiveIntensity={0.5}
      />
    </UseCanvas>
  )
}
```

## Glass Components

### Interactive Glass Card

```tsx
import { GlassContainer } from '@/components/ui/glass/GlassComponents'

export function InteractiveCard() {
  return (
    <GlassContainer
      preset="holographic"
      interactive
      animated
      glowOnHover
      liquidEffect
      className="p-8 max-w-md"
    >
      <h3 className="text-2xl font-bold mb-4">Premium Experience</h3>
      <p className="text-gray-300">
        Discover luxury travel destinations with our curated experiences.
      </p>
      <GlassButton 
        preset="frosted"
        variant="primary"
        size="md"
        href="/destinations"
      >
        Explore Now
      </GlassButton>
    </GlassContainer>
  )
}
```

### Glass Navigation Bar

```tsx
import { GlassNav, GlassButton } from '@/components/ui/glass/GlassComponents'

export function NavigationBar() {
  return (
    <GlassNav fixed transparent>
      <div className="flex justify-between items-center px-6">
        <Logo />
        <nav className="flex gap-4">
          <GlassButton preset="clear" variant="ghost" href="/about">
            About
          </GlassButton>
          <GlassButton preset="clear" variant="ghost" href="/destinations">
            Destinations
          </GlassButton>
          <GlassButton preset="frosted" variant="primary" href="/contact">
            Contact
          </GlassButton>
        </nav>
      </div>
    </GlassNav>
  )
}
```

## WebGL Image Components

### Parallax Image Gallery

```tsx
import { WebGLImage } from '@/components/canvas/scroll-rig'
import { ParallaxScrollScene } from '@/components/canvas/scroll-rig'
import { useRef } from 'react'

export function ParallaxGallery() {
  const imageRefs = [
    useRef<HTMLImageElement>(null),
    useRef<HTMLImageElement>(null),
    useRef<HTMLImageElement>(null),
  ]
  
  return (
    <div className="gallery">
      {imageRefs.map((ref, index) => (
        <div key={index} className="gallery-item">
          <img 
            ref={ref}
            src={`/images/destination-${index + 1}.jpg`}
            alt={`Destination ${index + 1}`}
            loading="lazy"
          />
          
          <UseCanvas>
            <ParallaxScrollScene 
              track={ref} 
              speed={0.5 + index * 0.2}
            >
              {({ scale, scrollState }) => (
                <WebGLImage
                  el={ref}
                  scale={scale}
                  scrollState={scrollState}
                  invalidateFrameLoop={false}
                />
              )}
            </ParallaxScrollScene>
          </UseCanvas>
        </div>
      ))}
    </div>
  )
}
```

### Distorted Hero Image

```tsx
import { WebGLImage } from '@/components/canvas/scroll-rig'
import { ScrollScene } from '@14islands/r3f-scroll-rig'

export function HeroImage() {
  const imageRef = useRef<HTMLImageElement>(null)
  
  const vertexShader = `
    varying vec2 vUv;
    uniform float u_time;
    uniform float u_velocity;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Wave distortion
      float wave = sin(uv.x * 10.0 + u_time) * 0.02;
      pos.z += wave * abs(u_velocity) * 0.5;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `
  
  return (
    <>
      <img 
        ref={imageRef}
        src="/images/hero.jpg"
        alt="Hero"
        className="w-full h-screen object-cover"
      />
      
      <UseCanvas>
        <ScrollScene track={imageRef}>
          {(props) => (
            <WebGLImage
              el={imageRef}
              vertexShader={vertexShader}
              {...props}
            />
          )}
        </ScrollScene>
      </UseCanvas>
    </>
  )
}
```

## Complex Scenes

### Sticky 3D Model with Glass UI

```tsx
import { StickyScrollScene } from '@/components/canvas/scroll-rig'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'
import { useGLTF } from '@react-three/drei'

export function StickyModelSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scene } = useGLTF('/models/luxury-car.glb')
  
  return (
    <section className="min-h-[200vh] relative">
      <div 
        ref={containerRef}
        className="sticky top-0 h-screen flex items-center justify-center"
      >
        <GlassContainer preset="refractive" className="p-8 z-10">
          <h2>Experience Luxury</h2>
          <p>Scroll to see the model rotate</p>
        </GlassContainer>
      </div>
      
      <UseCanvas>
        <StickyScrollScene track={containerRef} fillViewport>
          {({ scale, scrollState }) => (
            <group scale={scale.times(0.01)}>
              <primitive 
                object={scene} 
                rotation-y={scrollState.progress * Math.PI * 2}
              />
            </group>
          )}
        </StickyScrollScene>
      </UseCanvas>
    </section>
  )
}
```

### Liquid Glass Background Effect

```tsx
import { LiquidGlassEffect, GlassPanel3D } from '@/components/canvas/LiquidGlassEffect'
import { UseCanvas, ViewportScrollScene } from '@14islands/r3f-scroll-rig'

export function LiquidBackground() {
  const sectionRef = useRef<HTMLElement>(null)
  
  return (
    <section ref={sectionRef} className="min-h-screen relative">
      <UseCanvas>
        <ViewportScrollScene track={sectionRef}>
          {() => (
            <>
              <LiquidGlassEffect
                intensity={1.2}
                speed={0.3}
                distortion={5}
                followMouse
              />
              
              <GlassPanel3D
                preset="liquid"
                width={3}
                height={4}
                position={[0, 0, -2]}
              />
            </>
          )}
        </ViewportScrollScene>
      </UseCanvas>
      
      <div className="relative z-10 p-16">
        <GlassContainer preset="frosted">
          <h1>Immersive Experience</h1>
        </GlassContainer>
      </div>
    </section>
  )
}
```

## Travel-Specific Components

### Interactive Globe with Glass Info Cards

```tsx
import { TravelDataGlobe } from '@/components/TravelDataGlobe'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'

export function InteractiveGlobeSection() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  
  return (
    <div className="relative h-screen">
      <TravelDataGlobe
        markers={destinations}
        onMarkerClick={setSelectedLocation}
      />
      
      {selectedLocation && (
        <GlassContainer
          preset="holographic"
          className="absolute bottom-8 left-8 p-6 max-w-md"
          animated
        >
          <h3>{selectedLocation.name}</h3>
          <p>{selectedLocation.description}</p>
          <GlassButton href={`/destination/${selectedLocation.id}`}>
            Explore
          </GlassButton>
        </GlassContainer>
      )}
    </div>
  )
}
```

### 3D Carousel with Glass Controls

```tsx
import { ThreeDCarousel } from '@/components/canvas/ThreeDCarousel'
import { GlassButton } from '@/components/ui/glass/GlassComponents'

export function DestinationCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  return (
    <div className="relative h-screen">
      <ThreeDCarousel
        items={destinations}
        currentIndex={currentSlide}
        onSlideChange={setCurrentSlide}
      />
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        <GlassButton
          preset="frosted"
          onClick={() => setCurrentSlide(prev => prev - 1)}
          disabled={currentSlide === 0}
        >
          Previous
        </GlassButton>
        
        <GlassButton
          preset="frosted"
          onClick={() => setCurrentSlide(prev => prev + 1)}
          disabled={currentSlide === destinations.length - 1}
        >
          Next
        </GlassButton>
      </div>
    </div>
  )
}
```

## Animation Patterns

### Scroll-Triggered GSAP Sequence

```tsx
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'
import { ScrollScene } from '@14islands/r3f-scroll-rig'

export function AnimatedSection() {
  const containerRef = useRef()
  const meshRef = useRef()
  
  useGSAPAnimation(containerRef, {
    scrollTrigger: {
      trigger: containerRef,
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
    },
    timeline: (tl) => {
      tl.to(meshRef.current.rotation, {
        y: Math.PI * 2,
        duration: 1,
      })
      .to(meshRef.current.position, {
        y: 2,
        duration: 1,
      }, '-=0.5')
    }
  })
  
  return (
    <div ref={containerRef} className="h-screen">
      <UseCanvas>
        <ScrollScene track={containerRef}>
          {({ scale }) => (
            <mesh ref={meshRef} scale={scale}>
              <torusKnotGeometry args={[1, 0.3, 128, 16]} />
              <meshPhysicalMaterial
                color="#64c8ff"
                metalness={0.8}
                roughness={0.2}
                clearcoat={1}
              />
            </mesh>
          )}
        </ScrollScene>
      </UseCanvas>
    </div>
  )
}
```

### Mouse-Interactive Glass Shader

```tsx
export function InteractiveGlassShader() {
  const meshRef = useRef()
  const { mouse } = useThree()
  
  const uniforms = useMemo(() => ({
    u_mouse: { value: new THREE.Vector2() },
    u_time: { value: 0 },
  }), [])
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      uniforms.u_mouse.value.lerp(mouse, 0.1)
      uniforms.u_time.value += delta
    }
  })
  
  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[4, 4, 32, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={glassVertexShader}
        fragmentShader={glassFragmentShader}
        transparent
      />
    </mesh>
  )
}
```

## Performance Tips

### Lazy Loading with Suspense

```tsx
import { lazy, Suspense } from 'react'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'

const Heavy3DScene = lazy(() => import('./Heavy3DScene'))

export function LazyLoadedSection() {
  return (
    <Suspense 
      fallback={
        <GlassContainer preset="frosted" className="p-8">
          <p>Loading immersive experience...</p>
        </GlassContainer>
      }
    >
      <Heavy3DScene />
    </Suspense>
  )
}
```

### Viewport-Based Quality

```tsx
import { useCanvasStore } from '@/lib/stores/canvas-store'

export function AdaptiveQualityScene() {
  const { quality } = useCanvasStore()
  
  const segments = quality === 'high' ? 128 : 
                   quality === 'medium' ? 64 : 32
  
  return (
    <mesh>
      <sphereGeometry args={[1, segments, segments]} />
      <meshStandardMaterial />
    </mesh>
  )
}
```