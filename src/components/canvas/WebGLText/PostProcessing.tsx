'use client'

import { useRef, useMemo, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { EffectComposer } from '@react-three/postprocessing'
import { Effect } from 'postprocessing'
import * as THREE from 'three'
import { postProcessingVertexShader, postProcessingFragmentShader } from './shaders'

interface PostProcessingProps {
  velocity?: number
  distortion?: number
  rgbShift?: number
}

// Custom effect class for the text post-processing
class TextDistortionEffect extends Effect {
  constructor({
    velocity = 0,
    distortion = 1,
    rgbShift = 1,
  }: {
    velocity?: number
    distortion?: number
    rgbShift?: number
  } = {}) {
    super('TextDistortionEffect', postProcessingFragmentShader, {
      uniforms: new Map([
        ['uVelocity', new THREE.Uniform(velocity)],
        ['uTime', new THREE.Uniform(0)],
        ['uDistortion', new THREE.Uniform(distortion)],
        ['uRGBShift', new THREE.Uniform(rgbShift)],
      ]),
    })
  }

  update(renderer: THREE.WebGLRenderer, inputBuffer: THREE.WebGLRenderTarget, deltaTime: number) {
    this.uniforms.get('uTime')!.value += deltaTime
  }
}

// React component wrapper for the effect
const TextDistortion = forwardRef<
  TextDistortionEffect,
  PostProcessingProps
>(({ velocity = 0, distortion = 1, rgbShift = 1 }, ref) => {
  const effect = useMemo(
    () => new TextDistortionEffect({ velocity, distortion, rgbShift }),
    []
  )

  useFrame((state) => {
    if (effect.uniforms.has('uVelocity')) {
      effect.uniforms.get('uVelocity')!.value = velocity
    }
    if (effect.uniforms.has('uDistortion')) {
      effect.uniforms.get('uDistortion')!.value = distortion
    }
    if (effect.uniforms.has('uRGBShift')) {
      effect.uniforms.get('uRGBShift')!.value = rgbShift
    }
  })

  return <primitive ref={ref} object={effect} />
})

TextDistortion.displayName = 'TextDistortion'

export function PostProcessing({ 
  velocity = 0,
  distortion = 1,
  rgbShift = 1 
}: PostProcessingProps) {
  // For now, disable post-processing to avoid Canvas context errors
  // This needs to be implemented differently with the scroll rig architecture
  return null
  
  // TODO: Implement post-processing compatible with scroll rig
  // return (
  //   <EffectComposer>
  //     <TextDistortion 
  //       velocity={velocity}
  //       distortion={distortion}
  //       rgbShift={rgbShift}
  //     />
  //   </EffectComposer>
  // )
}