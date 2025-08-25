'use client'

import { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { 
  Vector3, 
  CatmullRomCurve3, 
  DataTexture, 
  RGBFormat, 
  FloatType, 
  NearestFilter, 
  Mesh, 
  Box3,
  Path,
  PlaneGeometry,
  RepeatWrapping,
  TextureLoader,
  MeshStandardMaterial
} from 'three'
import { Water } from 'three/examples/jsm/objects/Water.js'
import { OrbitControls } from '@react-three/drei'
import { Sky } from '@react-three/drei'
import { gsap } from 'gsap'
import CustomEase from 'gsap/CustomEase'
import { ScrollScene, UseCanvas, useScrollRig } from '@14islands/r3f-scroll-rig'
// import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'
import * as THREE from 'three'

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
  const [gltf, setGltf] = useState<any>(null)
  const spatialTexture = useRef<DataTexture | null>(null)
  
  useEffect(() => {
    const loader = new GLTFLoader()
    loader.load('/dolphin.glb', (loadedGltf) => {
      setGltf(loadedGltf)
    })
  }, [])
  
  useEffect(() => {
    if (!curve) return
    
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
    const geometry = mesh.geometry.clone()
    geometry.rotateZ(-Math.PI * 0.5)
    
    const positionAttribute = geometry.getAttribute('position')
    const objBox = new Box3()
    if (positionAttribute instanceof THREE.BufferAttribute) {
      objBox.setFromBufferAttribute(positionAttribute)
    }
    const objSize = new Vector3()
    objBox.getSize(objSize)
    
    const material = (mesh.material as MeshStandardMaterial).clone()
    material.onBeforeCompile = (shader: any) => {
      shader.uniforms.uSpatialTexture = { value: spatialTexture.current }
      shader.uniforms.uTextureSize = { value: new Vector3(512, 4, 0) }
      shader.uniforms.uTime = { value: 0 }
      shader.uniforms.uLengthRatio = { value: objSize.z / curve.getLength() }
      shader.uniforms.uObjSize = { value: objSize }
      
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
    
    return new Mesh(geometry, material)
  }, [gltf, curve])
  
  if (!dolphinMesh) return null
  
  return <primitive ref={meshRef} object={dolphinMesh} />
}

function WaterPlane() {
  const waterRef = useRef<Water | null>(null)
  const { scene } = useThree()
  const [waterLoaded, setWaterLoaded] = useState(false)
  
  useEffect(() => {
    const waterGeometry = new PlaneGeometry(100, 100)
    
    const textureLoader = new TextureLoader()
    textureLoader.load(
      '/dolphin-waternormals.jpg',
      (texture) => {
        texture.wrapS = texture.wrapT = RepeatWrapping
        
        const water = new Water(waterGeometry, {
          textureWidth: 512,
          textureHeight: 512,
          waterNormals: texture,
          sunDirection: new Vector3(),
          sunColor: 0xffffff,
          waterColor: 0x001e0f,
          distortionScale: 3.7,
          fog: scene.fog !== undefined
        })
        
        water.rotation.x = -Math.PI / 2
        waterRef.current = water
        setWaterLoaded(true)
      }
    )
  }, [scene])
  
  useFrame(() => {
    if (waterRef.current && waterRef.current.material) {
      waterRef.current.material.uniforms['time'].value += 1.0 / 60.0
    }
  })
  
  if (!waterLoaded || !waterRef.current) return null
  
  return <primitive object={waterRef.current} />
}

interface DolphinsSceneProps {
  dolphinCount?: number
  showWater?: boolean
  showSky?: boolean
  animationSpeed?: number
  waterColor?: string
  skyColor?: string
}

function DolphinsScene({ 
  dolphinCount = 3,
  showWater = true,
  showSky = true,
  animationSpeed = 1,
  waterColor = '#001e0f',
  skyColor = '#87CEEB'
}: DolphinsSceneProps) {
  const { camera, scene } = useThree()
  
  // Animation timelines
  const playHead1 = useRef({ value: 0 })
  const playHead2 = useRef({ value: 0 })
  const playHead3 = useRef({ value: 0 })
  
  // Create the path
  const path = useMemo(() => {
    const p = new Path()
    p.moveTo(0, 40)
    p.bezierCurveTo(39.4459, 17.0938, 62.5, 0, 100, 0)
    p.bezierCurveTo(137.5, 0, 173.133, 19.1339, 200, 40)
    return p
  }, [])
  
  // Create curves
  const curves = useMemo(() => {
    const pathPoints = path.getPoints()
    
    const map = (value: number, sMin: number, sMax: number, dMin: number, dMax: number) => {
      return dMin + ((value - sMin) / (sMax - sMin)) * (dMax - dMin)
    }
    
    const getCurve = (wMin: number, wMax: number, hMin: number, hMax: number, z: number) => {
      const points = pathPoints.map(({ x, y }) => 
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
      getCurve(-1.4, 0.8, -0.1, 0.2, 0.1),
      getCurve(-1.0, 1.0, -0.15, 0.25, 0.3),
      getCurve(-0.8, 1.2, -0.1, 0.2, 0.5)
    ]
  }, [path])
  
  // Setup animation
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const ease = CustomEase.create(
      "custom",
      "M0,0,C0.042,0.224,0.268,0.35,0.524,0.528,0.708,0.656,0.876,0.808,1,1"
    )
    
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 })
    tl.timeScale(animationSpeed)
    
    tl.to(playHead1.current, { value: 1, duration: 3, ease }, 0.3)
    tl.to(playHead2.current, { value: 1, duration: 3, ease }, 0)
    tl.to(playHead3.current, { value: 1, duration: 3, ease }, 0.4)
    
    return () => {
      tl.kill()
    }
  }, [animationSpeed])
  
  // Set initial camera position and scene settings
  useEffect(() => {
    // r3f-scroll-rig uses a scale multiplier of 0.01, so we need smaller values
    camera.position.set(0, 0.5, 1.5)
    camera.lookAt(0, 0, 0)
    
    // Add fog for depth with adjusted values
    scene.fog = new THREE.Fog(0x001e0f, 1, 10)
  }, [camera, scene])
  
  const playHeads = [playHead1, playHead2, playHead3]
  const visibleDolphins = Math.min(dolphinCount, 3)
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      
      
      {/* Sky */}
      {showSky && (
        <>
          <Sky />
          <directionalLight position={[0, 1, 0]} intensity={0.5} />
        </>
      )}
      
      {/* Water */}
      {showWater && <WaterPlane />}
      
      {/* Dolphins */}
      {curves.slice(0, visibleDolphins).map((curve, index) => (
        <DolphinPath
          key={index}
          curve={curve}
          playHead={playHeads[index].current}
          index={index}
        />
      ))}
      
      {/* Camera Controls */}
      <OrbitControls 
        maxPolarAngle={Math.PI * 0.495}
        target={[0, 0, 0]}
        minDistance={0.4}
        maxDistance={2}
      />
    </>
  )
}

interface DolphinsProps {
  className?: string
  dolphinCount?: number
  showBubbles?: boolean
  autoCamera?: boolean
  showSky?: boolean
  waterColor?: string
  skyColor?: string
  animationSpeed?: number
}

export function Dolphins({ 
  className = '',
  dolphinCount = 3,
  showBubbles = true,
  autoCamera = true,
  showSky = true,
  waterColor = '#001e0f',
  skyColor = '#87CEEB',
  animationSpeed = 1
}: DolphinsProps) {
  const el = useRef<HTMLDivElement>(null)
  const { hasSmoothScrollbar } = useScrollRig()
  const [ready, setReady] = useState(false)
  
  useEffect(() => {
    // Give smooth scrollbar time to initialize
    const timer = setTimeout(() => {
      console.log('Dolphins ready check, hasSmoothScrollbar:', hasSmoothScrollbar)
      setReady(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [hasSmoothScrollbar])

  return (
    <>
      {/* DOM element that gets tracked */}
      <div className={`dolphins-scene ${className}`}>
        <div 
          ref={el}
          className="dolphins-proxy" 
          style={{
            height: '100vh',
            minHeight: '600px',
            width: '100%',
            background: showSky 
              ? `linear-gradient(to bottom, ${skyColor} 0%, ${waterColor} 50%, #000080 100%)`
              : waterColor,
            position: 'relative',
          }} 
        >
          {!hasSmoothScrollbar && (
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: 'white',
              fontSize: '2em'
            }}>
              🐬 Dolphins Scene
            </div>
          )}
        </div>
      </div>
      
      {/* WebGL Scene */}
      {hasSmoothScrollbar && ready && (
        <UseCanvas>
          <ScrollScene track={el}>
            {(props) => (
              <DolphinsScene
                dolphinCount={dolphinCount}
                showWater={showBubbles}
                showSky={showSky}
                animationSpeed={animationSpeed}
                waterColor={waterColor}
                skyColor={skyColor}
              />
            )}
          </ScrollScene>
        </UseCanvas>
      )}
    </>
  )
}