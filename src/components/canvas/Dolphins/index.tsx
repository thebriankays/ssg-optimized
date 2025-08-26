'use client'

import { useRef, useEffect, useState, Suspense, useMemo, useCallback, MutableRefObject } from 'react'
import { ViewportScrollScene, UseCanvas } from '@14islands/r3f-scroll-rig'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { Water } from './Water'
import { Sky } from './Sky'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'

// Register CustomEase plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase)
}

// Extend Three.js with Water and Sky
extend({ Water, Sky })

/* ---------------- Helper Functions ---------------- */
function map(value: number, sMin: number, sMax: number, dMin: number, dMax: number) {
  return dMin + ((value - sMin) / (sMax - sMin)) * (dMax - dMin)
}

/* ---------------- Ocean Component ---------------- */
function Ocean({ onWaterRef }: { onWaterRef?: (water: Water | null) => void }) {
  const waterRef = useRef<Water>(null)
  const { scene } = useThree()
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  
  const waterNormals = useMemo(() => {
    const texture = new THREE.TextureLoader().load('/dolphin-waternormals.jpg', (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    })
    return texture
  }, [])
  
  const water = useMemo(() => {
    const waterGeometry = new THREE.PlaneGeometry(10000, 10000)
    const waterInstance = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: waterNormals,
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined
    })
    waterInstance.rotation.x = -Math.PI / 2
    return waterInstance
  }, [waterNormals, scene.fog])
  
  useEffect(() => {
    if (onWaterRef) {
      onWaterRef(water)
    }
  }, [water, onWaterRef])
  
  useFrame(() => {
    if (water.material && water.material.uniforms && water.material.uniforms.time) {
      water.material.uniforms.time.value += 1.0 / 60.0
    }
  })
  
  return <primitive object={water} ref={waterRef} />
}

/* ---------------- Animated Dolphin Component ---------------- */
function AnimatedDolphin({ curve, playHead, scale }: { curve: THREE.CatmullRomCurve3; playHead: { value: number }; scale: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const gltf = useGLTF('/dolphin.glb')
  
  const { geometry, material } = useMemo(() => {
    console.log('Dolphin GLTF loaded:', gltf)
    const mesh = gltf.scene.children[0] as THREE.Mesh
    if (!mesh || !mesh.geometry) {
      console.error('No mesh found in dolphin.glb')
      return { geometry: new THREE.BoxGeometry(1, 1, 1), material: new THREE.MeshBasicMaterial({ color: 'red' }) }
    }
    const clonedGeometry = mesh.geometry.clone()
    clonedGeometry.rotateZ(-Math.PI * 0.5)
    return { geometry: clonedGeometry, material: mesh.material }
  }, [gltf])
  
  const { shaderMaterial } = useMemo(() => {
    const numPoints = 511
    const cPoints = curve.getSpacedPoints(numPoints)
    const cObjects = curve.computeFrenetFrames(numPoints, true)
    
    const data: number[] = []
    cPoints.forEach((v) => data.push(v.x, v.y, v.z))
    cObjects.binormals.forEach((v) => data.push(v.x, v.y, v.z))
    cObjects.normals.forEach((v) => data.push(v.x, v.y, v.z))
    cObjects.tangents.forEach((v) => data.push(v.x, v.y, v.z))
    
    const dataArray = new Float32Array(data)
    const tex = new THREE.DataTexture(
      dataArray,
      numPoints + 1,
      4,
      THREE.RGBFormat,
      THREE.FloatType
    )
    tex.magFilter = THREE.NearestFilter
    tex.needsUpdate = true
    
    const positionAttribute = geometry.getAttribute('position')
    const objBox = new THREE.Box3()
    if (positionAttribute && 'isBufferAttribute' in positionAttribute) {
      objBox.setFromBufferAttribute(positionAttribute as THREE.BufferAttribute)
    }
    const objSizeVec = new THREE.Vector3()
    objBox.getSize(objSizeVec)
    
    const mat = (material as THREE.Material).clone()
    const shaderMat = mat as any
    
    shaderMat.onBeforeCompile = (shader: any) => {
      shader.uniforms.uSpatialTexture = { value: tex }
      shader.uniforms.uTextureSize = { value: new THREE.Vector2(numPoints + 1, 4) }
      shader.uniforms.uTime = { value: 0 }
      shader.uniforms.uLengthRatio = { value: objSizeVec.z / curve.getLength() }
      shader.uniforms.uObjSize = { value: objSizeVec }
      
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
    
    return { shaderMaterial: shaderMat }
  }, [geometry, material, curve])
  
  useFrame(() => {
    if (shaderMaterial && shaderMaterial.uniforms && shaderMaterial.uniforms.uTime) {
      shaderMaterial.uniforms.uTime.value = playHead.value
    }
  })
  
  return (
    <group ref={groupRef} scale={scale * 0.01}>
      <mesh geometry={geometry} material={shaderMaterial} />
    </group>
  )
}

/* ---------------- Dolphins Scene Component ---------------- */
function DolphinsScene({ scale, scrollState, inViewport }: any) {
  const { camera, scene, gl } = useThree()
  const waterRef = useRef<Water | null>(null)
  const skyRef = useRef<Sky | null>(null)
  const playHead1 = useRef({ value: 0 })
  const playHead2 = useRef({ value: 0 })
  const playHead3 = useRef({ value: 0 })
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  
  useEffect(() => {
    console.log('DolphinsScene mounted, scale:', scale, 'inViewport:', inViewport)
  }, [scale, inViewport])
  
  // Setup GSAP timeline
  useGSAP(() => {
    if (typeof window !== 'undefined' && CustomEase) {
      const ease = CustomEase.create(
        "custom",
        "M0,0,C0.042,0.224,0.268,0.35,0.524,0.528,0.708,0.656,0.876,0.808,1,1"
      )
      
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 })
      tl.set([playHead1.current, playHead2.current, playHead3.current], { value: 0 }, 0)
      tl.to(playHead1.current, { value: 1, duration: 3, ease }, 0.3)
      tl.to(playHead2.current, { value: 1, duration: 3, ease }, 0)
      tl.to(playHead3.current, { value: 1, duration: 3, ease }, 0.4)
      
      timelineRef.current = tl
      
      // Cleanup handled automatically by useGSAP
    }
  }, [])
  
  // Create swimming paths for dolphins
  const curves = useMemo(() => {
    const path = new THREE.Path()
    path.moveTo(0, 40)
    path.bezierCurveTo(39.4459, 17.0938, 62.5, 0, 100, 0)
    path.bezierCurveTo(137.5, 0, 173.133, 19.1339, 200, 40)
    const points = path.getPoints()
    
    const getCurve = (wMin: number, wMax: number, hMin: number, hMax: number, z: number) => {
      const initialPoints = points.map(({ x, y }) =>
        new THREE.Vector3(
          map(x, 0, 200, wMin, wMax),
          map(y, 0, 40, hMax, hMin),
          z
        )
      )
      const curve = new THREE.CatmullRomCurve3(initialPoints)
      curve.curveType = 'centripetal'
      curve.closed = false
      return curve
    }
    
    return {
      curve1: getCurve(-140, 80, -10, 20, 10),
      curve2: getCurve(-100, 100, -15, 25, 30),
      curve3: getCurve(-80, 120, -10, 20, 50)
    }
  }, [])
  
  // Setup sun and environment
  const updateSun = useCallback((water: Water | null, sky: Sky | null) => {
    if (water && sky && gl) {
      const sun = new THREE.Vector3()
      const parameters = {
        elevation: 2,
        azimuth: 180
      }
      
      const pmremGenerator = new THREE.PMREMGenerator(gl)
      
      const phi = THREE.MathUtils.degToRad(90 - parameters.elevation)
      const theta = THREE.MathUtils.degToRad(parameters.azimuth)
      
      sun.setFromSphericalCoords(1, phi, theta)
      
      // Update sky uniforms
      const skyMaterial = sky.material as THREE.ShaderMaterial
      if (skyMaterial.uniforms) {
        skyMaterial.uniforms['sunPosition'].value.copy(sun)
        skyMaterial.uniforms['turbidity'].value = 10
        skyMaterial.uniforms['rayleigh'].value = 2
        skyMaterial.uniforms['mieCoefficient'].value = 0.005
        skyMaterial.uniforms['mieDirectionalG'].value = 0.8
      }
      
      // Update water uniforms
      if (water.material && water.material.uniforms) {
        water.material.uniforms['sunDirection'].value.copy(sun).normalize()
      }
      
      // Set environment
      scene.environment = pmremGenerator.fromScene(sky as any).texture
      
      pmremGenerator.dispose()
    }
  }, [scene, gl])
  
  // Get scale value for scene - handle the vecn type properly
  const sceneScale = scale ? scale.xy.min() * 0.5 : 1
  
  console.log('DolphinsScene rendering, sceneScale:', sceneScale)
  
  return (
    <group>
      {/* Ambient Light */}
      <ambientLight intensity={0.6} />
      
      {/* Sun */}
      <directionalLight
        position={[0, 100, 0]}
        intensity={1}
        color={0xffffff}
      />
      
      {/* Sky */}
      <primitive 
        object={useMemo(() => new Sky(), [])} 
        ref={(ref: Sky) => {
          skyRef.current = ref
          if (waterRef.current && ref) {
            updateSun(waterRef.current, ref)
          }
        }} 
      />
      
      {/* Ocean */}
      <Ocean onWaterRef={(water) => { 
        waterRef.current = water
        if (water && skyRef.current) {
          updateSun(water, skyRef.current)
        }
      }} />
      
      {/* Animated dolphins */}
      <Suspense fallback={null}>
        <AnimatedDolphin curve={curves.curve1} playHead={playHead1.current} scale={1} />
        <AnimatedDolphin curve={curves.curve2} playHead={playHead2.current} scale={1} />
        <AnimatedDolphin curve={curves.curve3} playHead={playHead3.current} scale={1} />
      </Suspense>
      
      {/* Camera controls removed - scroll-rig manages camera */}
    </group>
  )
}

/* ---------------- Main Dolphins Component ---------------- */
function DolphinsSection({ waterColor, skyColor, showSky }: { waterColor: string, skyColor: string, showSky: boolean }) {
  const proxyRef = useRef<HTMLDivElement>(null) as MutableRefObject<HTMLElement>
  const [isActive, setIsActive] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  
  useEffect(() => {
    // Mark as active after mount to hide the gradient proxy
    setIsActive(true)
    
    // Check if GlobalCanvas exists
    const checkCanvas = () => {
      const canvas = document.querySelector('canvas')
      console.log('Checking for canvas:', canvas)
      if (canvas) {
        setCanvasReady(true)
      } else {
        setTimeout(checkCanvas, 100)
      }
    }
    checkCanvas()
  }, [])
  
  return (
    <>
      {/* DOM proxy that defines the block size & gradient */}
      <div className="dolphins-scene">
        <div
          ref={proxyRef as any}
          data-active={isActive}
          className="dolphins-proxy"
          style={{
            height: '100vh',
            minHeight: '600px',
            width: '100%',
            background: showSky
              ? `linear-gradient(to bottom, ${skyColor} 0%, ${waterColor} 50%, #000080 100%)`
              : waterColor,
            position: 'relative',
            visibility: isActive ? 'hidden' : 'visible', // Hide after scene mounts
          }}
        />
      </div>

      {/* Always mount the scene - no hasSmoothScrollbar gate */}
      {canvasReady && (
        <UseCanvas>
          <ViewportScrollScene track={proxyRef} hideOffscreen={false}>
            {(props) => {
              console.log('ViewportScrollScene render props:', props)
              return (
                // Let the rig position/clip the group
                <group {...props}>
                  <Suspense fallback={null}>
                    <DolphinsScene {...props} />
                  </Suspense>
                </group>
              )
            }}
          </ViewportScrollScene>
        </UseCanvas>
      )}
    </>
  )
}

// Preload the dolphin model
useGLTF.preload('/dolphin.glb')

/* ---------------- Public Export ---------------- */
export function Dolphins({ 
  className = '',
  dolphinCount = 3,
  showBubbles = true,
  showSky = true,
  animationSpeed = 1,
  waterColor = '#001e0f',
  skyColor = '#87CEEB'
}: { 
  className?: string
  dolphinCount?: number
  showBubbles?: boolean
  showSky?: boolean
  animationSpeed?: number
  waterColor?: string
  skyColor?: string
}) {
  return (
    <div className={className}>
      <DolphinsSection waterColor={waterColor} skyColor={skyColor} showSky={showSky} />
    </div>
  )
}