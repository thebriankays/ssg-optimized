'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { ShaderMaterial, PlaneGeometry, Mesh } from 'three'
import { ViewportScrollScene, UseCanvas } from '@14islands/r3f-scroll-rig'

const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform bool uDarkMode;
  uniform vec2 uResolution;
  
  varying vec2 vUv;
  
  // Create repeating stripes
  float stripes(vec2 uv, float angle, float frequency) {
    vec2 dir = vec2(cos(angle), sin(angle));
    float coord = dot(uv, dir) * frequency;
    float stripe = smoothstep(0.0, 0.07, abs(sin(coord * 3.14159)));
    return stripe;
  }
  
  // Rainbow gradient
  vec3 rainbow(float t) {
    vec3 colors[5];
    colors[0] = vec3(0.376, 0.647, 0.980); // #60a5fa
    colors[1] = vec3(0.910, 0.475, 0.976); // #e879f9
    colors[2] = vec3(0.376, 0.647, 0.980); // #60a5fa
    colors[3] = vec3(0.369, 0.918, 0.831); // #5eead4
    colors[4] = vec3(0.376, 0.647, 0.980); // #60a5fa
    
    float segment = t * 4.0;
    int idx = int(floor(segment));
    float fract = fract(segment);
    
    vec3 color1 = colors[idx];
    vec3 color2 = colors[min(idx + 1, 4)];
    
    return mix(color1, color2, fract);
  }
  
  void main() {
    vec2 uv = vUv;
    vec2 centeredUv = uv - 0.5;
    
    // Animated UV for movement
    vec2 animatedUv = uv + vec2(uTime * 0.05, 0.0);
    
    // Create stripes at 100 degree angle
    float angle = 1.745; // ~100 degrees in radians
    float stripePattern = stripes(animatedUv, angle, 10.0);
    
    // Rainbow overlay
    vec3 rainbowColor = rainbow(animatedUv.x * 2.0);
    
    // Radial gradient mask
    vec2 maskCenter = vec2(1.0, 0.0); // top-right
    float maskRadius = length((uv - maskCenter) * vec2(uResolution.x / uResolution.y, 1.0));
    float mask = 1.0 - smoothstep(0.0, 1.0, maskRadius);
    
    // Base color
    vec3 stripeColor = uDarkMode ? vec3(0.0) : vec3(1.0);
    vec3 baseColor = mix(vec3(0.0), stripeColor, stripePattern);
    
    // Apply rainbow with mix blend mode
    vec3 finalColor = mix(baseColor, rainbowColor * baseColor, 0.7);
    
    // Apply mask and opacity
    float opacity = uDarkMode ? 0.4 : 0.7;
    finalColor *= mask;
    
    gl_FragColor = vec4(finalColor, opacity * mask);
  }
`

interface RaysBackgroundWebGLProps {
  darkMode?: boolean
  className?: string
}

function RaysBackgroundMesh({ darkMode = false }: { darkMode?: boolean }) {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<ShaderMaterial>(null)
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDarkMode: { value: darkMode },
    uResolution: { value: [window.innerWidth, window.innerHeight] }
  }), [])
  
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      materialRef.current.uniforms.uDarkMode.value = darkMode
    }
  })
  
  return (
    <mesh ref={meshRef} scale={[2, 2, 1]}>
      <planeGeometry args={[10, 10, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

export function RaysBackgroundWebGL({ 
  darkMode = false,
  className = ''
}: RaysBackgroundWebGLProps) {
  const proxyRef = useRef<HTMLDivElement>(null)
  
  return (
    <div className={`global-bg pointer-events-none ${className}`}>
      {/* This proxy can be 1px if you truly want a fullscreen bg; it's tracked for visibility */}
      <div ref={proxyRef} className="webgl-proxy h-[1px] w-[1px]" />
      
      <UseCanvas>
        <ViewportScrollScene
          track={proxyRef as React.MutableRefObject<HTMLElement>}
          hideOffscreen={false}
          inViewportThreshold={0}
          inViewportMargin="0px"
          hud
        >
          {() => <RaysBackgroundMesh darkMode={darkMode} />}
        </ViewportScrollScene>
      </UseCanvas>
    </div>
  )
}