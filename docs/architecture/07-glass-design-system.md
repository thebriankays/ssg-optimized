# Glass Design System

## Overview

The glass design system creates a cohesive visual language that blends UI elements with the 3D WebGL content. It uses a combination of CSS backdrop filters, WebGL shaders, and carefully crafted materials to achieve a premium, translucent aesthetic.

## Design Principles

1. **Translucency**: Elements reveal content behind them
2. **Depth**: Multiple layers create visual hierarchy
3. **Refraction**: Light bends through surfaces
4. **Blur**: Background content is softly obscured
5. **Reflection**: Subtle environmental reflections
6. **Consistency**: Unified look across 2D and 3D

## CSS Glass Components

### Base Glass Styles

Create `src/styles/glass/glass-base.scss`:

```scss
// Glass variables
:root {
  --glass-blur: 10px;
  --glass-saturation: 180%;
  --glass-opacity: 0.1;
  --glass-border-opacity: 0.2;
  --glass-shadow-opacity: 0.1;
  --glass-refraction: 1.1;
  
  // Light theme
  --glass-bg: rgba(255, 255, 255, var(--glass-opacity));
  --glass-border: rgba(255, 255, 255, var(--glass-border-opacity));
  --glass-shadow: rgba(0, 0, 0, var(--glass-shadow-opacity));
  
  // Dark theme
  @media (prefers-color-scheme: dark) {
    --glass-bg: rgba(0, 0, 0, var(--glass-opacity));
    --glass-border: rgba(255, 255, 255, var(--glass-border-opacity));
    --glass-shadow: rgba(255, 255, 255, var(--glass-shadow-opacity));
  }
}

// Base glass mixin
@mixin glass-base {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
  border: 1px solid var(--glass-border);
  position: relative;
  
  // Fallback for browsers without backdrop-filter
  @supports not (backdrop-filter: blur(1px)) {
    background: rgba(255, 255, 255, 0.9);
  }
}

// Glass variants
@mixin glass-clear {
  @include glass-base;
  --glass-blur: 2px;
  --glass-opacity: 0.05;
  --glass-border-opacity: 0.1;
}

@mixin glass-frosted {
  @include glass-base;
  --glass-blur: 20px;
  --glass-opacity: 0.15;
  --glass-border-opacity: 0.3;
}

@mixin glass-refractive {
  @include glass-base;
  --glass-blur: 5px;
  --glass-opacity: 0.2;
  filter: contrast(1.1) brightness(1.05);
  
  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 70%
    );
    transform: translateX(-100%);
    animation: glass-shimmer 3s infinite;
  }
}

@keyframes glass-shimmer {
  to {
    transform: translateX(100%);
  }
}
```

### Glass Components

Create `src/components/ui/glass/GlassCard.tsx`:

```typescript
'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { useMouse } from '@/components/providers/MouseProvider'

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'clear' | 'frosted' | 'refractive'
  interactive?: boolean
  glow?: boolean
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'frosted', interactive = false, glow = false, ...props }, ref) => {
    const { addState, removeState } = useMouse()
    
    return (
      <div
        ref={ref}
        className={cn(
          'glass-card',
          `glass-${variant}`,
          {
            'glass-interactive': interactive,
            'glass-glow': glow,
          },
          className
        )}
        onMouseEnter={() => interactive && addState('-glass')}
        onMouseLeave={() => interactive && removeState('-glass')}
        data-cursor-glass
        {...props}
      />
    )
  }
)

GlassCard.displayName = 'GlassCard'
```

Create `src/components/ui/glass/GlassButton.tsx`:

```typescript
'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { useRipple } from '@/hooks/useRipple'

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  glow?: boolean
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', size = 'md', glow = false, onClick, ...props }, ref) => {
    const { rippleProps, createRipple } = useRipple()
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(e)
      onClick?.(e)
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          'glass-button',
          `glass-button--${variant}`,
          `glass-button--${size}`,
          {
            'glass-button--glow': glow,
          },
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="glass-button__content">{props.children}</span>
        <span className="glass-button__ripple" {...rippleProps} />
      </button>
    )
  }
)

GlassButton.displayName = 'GlassButton'
```

### Glass Styles

Create `src/styles/glass/components.scss`:

```scss
@import './glass-base';

// Glass Card
.glass-card {
  @include glass-base;
  border-radius: 1rem;
  padding: 1.5rem;
  overflow: hidden;
  
  // Variants
  &.glass-clear {
    @include glass-clear;
  }
  
  &.glass-frosted {
    @include glass-frosted;
  }
  
  &.glass-refractive {
    @include glass-refractive;
  }
  
  // Interactive state
  &.glass-interactive {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 
        0 20px 25px -5px var(--glass-shadow),
        0 10px 10px -5px var(--glass-shadow);
    }
    
    &:active {
      transform: translateY(0);
    }
  }
  
  // Glow effect
  &.glass-glow {
    &::after {
      content: '';
      position: absolute;
      inset: -2px;
      background: conic-gradient(
        from 180deg at 50% 50%,
        #00ffff 0deg,
        #ff00ff 90deg,
        #00ff00 180deg,
        #ffff00 270deg,
        #00ffff 360deg
      );
      border-radius: inherit;
      opacity: 0;
      transition: opacity 0.3s;
      z-index: -1;
      filter: blur(20px);
    }
    
    &:hover::after {
      opacity: 0.5;
    }
  }
}

// Glass Button
.glass-button {
  @include glass-base;
  border-radius: 0.5rem;
  font-weight: 500;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
  
  // Remove default button styles
  appearance: none;
  outline: none;
  cursor: pointer;
  
  // Sizes
  &--sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  &--md {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
  
  &--lg {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }
  
  // Variants
  &--primary {
    background: rgba(59, 130, 246, var(--glass-opacity));
    border-color: rgba(59, 130, 246, var(--glass-border-opacity));
    
    &:hover {
      background: rgba(59, 130, 246, 0.2);
    }
  }
  
  &--secondary {
    background: rgba(107, 114, 128, var(--glass-opacity));
    border-color: rgba(107, 114, 128, var(--glass-border-opacity));
    
    &:hover {
      background: rgba(107, 114, 128, 0.2);
    }
  }
  
  &--ghost {
    background: transparent;
    
    &:hover {
      background: var(--glass-bg);
    }
  }
  
  // Ripple effect
  &__ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: translate(-50%, -50%);
    pointer-events: none;
    animation: ripple 0.6s ease-out;
  }
  
  @keyframes ripple {
    to {
      transform: translate(-50%, -50%) scale(4);
      opacity: 0;
    }
  }
}
```

## WebGL Glass Materials

### Glass Shader Material

Create `src/components/canvas/materials/glass/GlassMaterial.tsx`:

```typescript
import { shaderMaterial } from '@react-three/drei'
import { extend, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import vertexShader from './glass.vert'
import fragmentShader from './glass.frag'

const GlassMaterial = shaderMaterial(
  {
    // Time
    uTime: 0,
    
    // Glass properties
    uRefractiveIndex: 1.5,
    uChromaticAberration: 0.02,
    uFresnelPower: 2.0,
    
    // Environment
    uEnvMap: null,
    uEnvMapIntensity: 1.0,
    
    // Distortion
    uDistortionScale: 0.1,
    uDistortionFrequency: 2.0,
    
    // Color
    uTintColor: new THREE.Color(0.1, 0.1, 0.1),
    uTintStrength: 0.05,
    
    // Camera
    uCameraPosition: new THREE.Vector3(),
  },
  vertexShader,
  fragmentShader
)

extend({ GlassMaterial })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      glassMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
        uRefractiveIndex?: number
        uChromaticAberration?: number
        uFresnelPower?: number
        uEnvMap?: THREE.CubeTexture
        uEnvMapIntensity?: number
        uDistortionScale?: number
        uDistortionFrequency?: number
        uTintColor?: THREE.Color
        uTintStrength?: number
      }
    }
  }
}

export function GlassMesh({ children, ...props }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uCameraPosition.value = state.camera.position
    }
  })
  
  return (
    <mesh {...props}>
      {children}
      <glassMaterial
        ref={materialRef}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
```

### Glass Vertex Shader

Create `src/components/canvas/materials/glass/glass.vert`:

```glsl
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying vec3 vViewDirection;

uniform float uTime;
uniform float uDistortionScale;
uniform float uDistortionFrequency;

#pragma glslify: noise = require('glsl-noise/simplex/3d')

void main() {
  vUv = uv;
  
  // Calculate world position and normal
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  
  // Add distortion
  float distortion = noise(position * uDistortionFrequency + uTime * 0.5) * uDistortionScale;
  vec3 distortedPosition = position + normal * distortion;
  
  // Calculate view direction
  vec4 mvPosition = viewMatrix * modelMatrix * vec4(distortedPosition, 1.0);
  vViewDirection = normalize(-mvPosition.xyz);
  
  gl_Position = projectionMatrix * mvPosition;
}
```

### Glass Fragment Shader

Create `src/components/canvas/materials/glass/glass.frag`:

```glsl
varying vec3 vWorldPosition;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying vec3 vViewDirection;

uniform float uTime;
uniform float uRefractiveIndex;
uniform float uChromaticAberration;
uniform float uFresnelPower;
uniform samplerCube uEnvMap;
uniform float uEnvMapIntensity;
uniform vec3 uTintColor;
uniform float uTintStrength;
uniform vec3 uCameraPosition;

// Fresnel calculation
float fresnel(vec3 viewDirection, vec3 normal, float power) {
  return pow(1.0 - dot(viewDirection, normal), power);
}

// Chromatic aberration refraction
vec3 chromaticRefraction(vec3 viewDirection, vec3 normal, float ior, float aberration) {
  vec3 refractedR = refract(viewDirection, normal, 1.0 / (ior - aberration));
  vec3 refractedG = refract(viewDirection, normal, 1.0 / ior);
  vec3 refractedB = refract(viewDirection, normal, 1.0 / (ior + aberration));
  
  return vec3(
    texture(uEnvMap, refractedR).r,
    texture(uEnvMap, refractedG).g,
    texture(uEnvMap, refractedB).b
  );
}

void main() {
  vec3 viewDirection = normalize(vWorldPosition - uCameraPosition);
  vec3 normal = normalize(vWorldNormal);
  
  // Fresnel effect
  float fresnelFactor = fresnel(viewDirection, normal, uFresnelPower);
  
  // Reflection
  vec3 reflectedDirection = reflect(viewDirection, normal);
  vec3 reflectionColor = texture(uEnvMap, reflectedDirection).rgb;
  
  // Refraction with chromatic aberration
  vec3 refractionColor = chromaticRefraction(
    viewDirection,
    normal,
    uRefractiveIndex,
    uChromaticAberration
  );
  
  // Combine reflection and refraction
  vec3 color = mix(refractionColor, reflectionColor, fresnelFactor);
  
  // Apply environment intensity
  color *= uEnvMapIntensity;
  
  // Add tint
  color = mix(color, uTintColor, uTintStrength);
  
  // Output
  gl_FragColor = vec4(color, 0.9 * (1.0 - fresnelFactor * 0.5));
}
```

## Glass Effects

### Ripple Effect Hook

Create `src/hooks/useRipple.ts`:

```typescript
import { useState, useCallback } from 'react'

export function useRipple() {
  const [ripples, setRipples] = useState<Array<{
    x: number
    y: number
    size: number
    id: number
  }>>([])
  
  const createRipple = useCallback((event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    }
    
    setRipples((prev) => [...prev, newRipple])
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 600)
  }, [])
  
  const rippleProps = {
    style: ripples.map((ripple) => ({
      left: ripple.x,
      top: ripple.y,
      width: ripple.size,
      height: ripple.size,
    })),
  }
  
  return { rippleProps, createRipple }
}
```

### Glass Blur Transition

```typescript
import { useSpring, animated } from '@react-spring/web'

export function GlassTransition({ show, children }) {
  const styles = useSpring({
    opacity: show ? 1 : 0,
    backdropFilter: show ? 'blur(20px)' : 'blur(0px)',
    transform: show ? 'scale(1)' : 'scale(0.95)',
    config: {
      mass: 1,
      tension: 200,
      friction: 25,
    },
  })
  
  return (
    <animated.div
      style={styles}
      className="glass-transition"
    >
      {children}
    </animated.div>
  )
}
```

## Responsive Glass System

```scss
// Responsive glass adjustments
@media (max-width: 768px) {
  :root {
    // Reduce blur for performance on mobile
    --glass-blur: 5px;
    --glass-saturation: 150%;
  }
  
  .glass-card {
    // Simplify effects on mobile
    &.glass-refractive::before {
      display: none; // Disable shimmer
    }
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .glass-card {
    transition: none;
    
    &::before {
      animation: none;
    }
  }
  
  .glass-button__ripple {
    animation: none;
  }
}

// High contrast mode
@media (prefers-contrast: high) {
  :root {
    --glass-opacity: 0.9;
    --glass-border-opacity: 1;
    --glass-blur: 0px;
  }
}
```

## Usage Guidelines

### Do's
- Use glass effects sparingly for impact
- Ensure sufficient contrast for text
- Test on various backgrounds
- Provide fallbacks for older browsers
- Consider performance on mobile

### Don'ts
- Don't overuse blur effects
- Don't make text unreadable
- Don't use on critical UI elements
- Don't rely solely on glass for hierarchy
- Don't ignore accessibility

## Performance Considerations

1. **Backdrop Filter Performance**: Use sparingly on mobile
2. **Shader Complexity**: Simplify on low-end devices
3. **Render Order**: Glass objects should render last
4. **Batching**: Group glass elements when possible
5. **Quality Settings**: Adjust based on device capabilities