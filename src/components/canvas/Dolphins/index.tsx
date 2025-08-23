'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { TextureLoader, Vector3, CatmullRomCurve3, DataTexture, RGBFormat, FloatType, NearestFilter, Mesh, Group } from 'three'
// import { Water } from '@react-three/drei' // Water not available in current drei version
import { gsap } from 'gsap'
import CustomEase from 'gsap/CustomEase'
import { ViewportScrollScene } from '@14islands/r3f-scroll-rig'
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'

// Register CustomEase
if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase)
}

interface DolphinPathProps {
  curve: CatmullRomCurve3
  playHead: { value: number }
  index: number
}

function DolphinPath({ curve, playHead, index }: DolphinPathProps) {
  const meshRef = useRef<Mesh>(null)
  const gltf = useLoader(GLTFLoader, '/dolphin.glb')
  const spatialTexture = useRef<DataTexture | null>(null)
  
  useEffect(() => {
    // Prepare curve data
    const numPoints = 511
    const cPoints = curve.getSpacedPoints(numPoints)
    const cObjects = curve.computeFrenetFrames(numPoints, true)
    
    const data: number[] = []
    cPoints.forEach((v) => {
      data.push(v.x, v.y, v.z)
    })
    cObjects.binormals.forEach((v) => {
      data.push(v.x, v.y, v.z)
    })
    cObjects.normals.forEach((v) => {
      data.push(v.x, v.y, v.z)
    })
    cObjects.tangents.forEach((v) => {
      data.push(v.x, v.y, v.z)
    })
    
    const dataArray = new Float32Array(data)
    spatialTexture.current = new DataTexture(
      dataArray,
      numPoints + 1,
      4,
      RGBFormat,
      FloatType
    )
    spatialTexture.current.magFilter = NearestFilter
    spatialTexture.current.needsUpdate = true
  }, [curve])
  
  useFrame(() => {
    if (!meshRef.current || !spatialTexture.current) return
    
    const material = meshRef.current.material as any
    if (material.uniforms) {
      material.uniforms.uTime.value = playHead.value
    }
  })
  
  // Clone and modify the dolphin mesh
  const dolphinMesh = useMemo(() => {
    if (!gltf) return null
    
    const mesh = gltf.scene.children[0].clone() as Mesh
    mesh.geometry.rotateZ(-Math.PI * 0.5)
    
    const material = mesh.material as any
    material.onBeforeCompile = (shader: any) => {
      shader.uniforms.uSpatialTexture = { value: spatialTexture.current }
      shader.uniforms.uTextureSize = { value: new Vector3(512, 4, 0) }
      shader.uniforms.uTime = { value: 0 }
      shader.uniforms.uLengthRatio = { value: 0.1 }
      shader.uniforms.uObjSize = { value: new Vector3(1, 1, 3) }
      
      shader.vertexShader = `
        uniform sampler2D uSpatialTexture;
        uniform vec2 uTextureSize;
        uniform float uTime;
        uniform float uLengthRatio;
        uniform vec3 uObjSize;
  
        struct splineData {
          vec3 point;
          vec3 binormal;
          vec3 normal;
        };
  
        splineData getSplineData(float t){
          float xstep = 1. / uTextureSize.y;
          float halfStep = xstep * 0.5;
          splineData sd;
          sd.point    = texture2D(uSpatialTexture, vec2(t, xstep * 0. + halfStep)).rgb;
          sd.binormal = texture2D(uSpatialTexture, vec2(t, xstep * 1. + halfStep)).rgb;
          sd.normal   = texture2D(uSpatialTexture, vec2(t, xstep * 2. + halfStep)).rgb;
          return sd;
        }
      ` + shader.vertexShader
      
      shader.vertexShader = shader.vertexShader.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
  
          vec3 pos = position;
    
          float wStep = 1. / uTextureSize.x;
          float hWStep = wStep * 0.5;
    
          float d = pos.z / uObjSize.z;
          float t = uTime + (d * uLengthRatio);
          float numPrev = floor(t / wStep);
          float numNext = numPrev + 1.;
          float tPrev = numPrev * wStep + hWStep;
          float tNext = numNext * wStep + hWStep;
          splineData splinePrev = getSplineData(tPrev);
          splineData splineNext = getSplineData(tNext);
    
          float f = (t - tPrev) / wStep;
          vec3 P = mix(splinePrev.point, splineNext.point, f);
          vec3 B = mix(splinePrev.binormal, splineNext.binormal, f);
          vec3 N = mix(splinePrev.normal, splineNext.normal, f);
    
          transformed = P + (N * pos.x) + (B * pos.y);
        `
      )
    }
    
    return mesh
  }, [gltf])
  
  if (!dolphinMesh) return null
  
  return <primitive ref={meshRef} object={dolphinMesh} />
}

interface DolphinsProps {
  className?: string
}

export function Dolphins({ className }: DolphinsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const waterNormals = useLoader(TextureLoader, '/dolphin-waternormals.jpg')
  
  // Animation timelines
  const playHead1 = useRef({ value: 0 })
  const playHead2 = useRef({ value: 0 })
  const playHead3 = useRef({ value: 0 })
  
  // Create curves
  const curves = useMemo(() => {
    const path = new CatmullRomCurve3([
      new Vector3(0, 0, 0),
      new Vector3(39.4459, 22.9062, 0),
      new Vector3(62.5, 40, 0),
      new Vector3(100, 40, 0),
      new Vector3(137.5, 40, 0),
      new Vector3(173.133, 20.8661, 0),
      new Vector3(200, 0, 0),
    ])
    
    const map = (value: number, sMin: number, sMax: number, dMin: number, dMax: number) => {
      return dMin + ((value - sMin) / (sMax - sMin)) * (dMax - dMin)
    }
    
    const getCurve = (wMin: number, wMax: number, hMin: number, hMax: number, z: number) => {
      const points = path.getPoints().map(({ x, y }) => 
        new Vector3(
          map(x, 0, 200, wMin, wMax),
          map(y, 0, 40, hMax, hMin),
          z
        )
      )
      const curve = new CatmullRomCurve3(points)
      curve.curveType = 'centripetal'
      curve.closed = false
      return curve
    }
    
    return [
      getCurve(-140, 80, -10, 20, 10),
      getCurve(-100, 100, -15, 25, 30),
      getCurve(-80, 120, -10, 20, 50)
    ]
  }, [])
  
  // Setup animation
  useGSAPAnimation(() => {
    if (typeof window === 'undefined') return
    
    const ease = CustomEase.create(
      "custom",
      "M0,0,C0.042,0.224,0.268,0.35,0.524,0.528,0.708,0.656,0.876,0.808,1,1"
    )
    
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 })
    tl.to(playHead1.current, { value: 1, duration: 3, ease }, 0.3)
    tl.to(playHead2.current, { value: 1, duration: 3, ease }, 0)
    tl.to(playHead3.current, { value: 1, duration: 3, ease }, 0.4)
    
    return () => {
      tl.kill()
    }
  }, [])
  
  return (
    <div ref={containerRef} className={`dolphins-container ${className || ''}`}>
      <ViewportScrollScene
        track={containerRef as React.MutableRefObject<HTMLElement>}
        hideOffscreen={false}
        camera={{ position: [3.16, 12.56, 162.85], fov: 55 }}
      >
        {() => (
          <>
        {/* Fog */}
        <fog attach="fog" args={['#000', 5, 20]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        
        {/* Water - needs custom implementation */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} scale={[10000, 10000, 10000]}>
          <planeGeometry args={[1, 1, 32, 32]} />
          <meshStandardMaterial color={0x001e0f} roughness={0.3} metalness={0.5} />
        </mesh>
        
        {/* Sky */}
        <mesh scale={[10000, 10000, 10000]}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color="#87CEEB" side={2} />
        </mesh>
        
        {/* Dolphins */}
        <DolphinPath curve={curves[0]} playHead={playHead1.current} index={0} />
        <DolphinPath curve={curves[1]} playHead={playHead2.current} index={1} />
        <DolphinPath curve={curves[2]} playHead={playHead3.current} index={2} />
          </>
        )}
      </ViewportScrollScene>
    </div>
  )
}