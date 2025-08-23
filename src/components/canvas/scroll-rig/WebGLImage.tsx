'use client'

import React, {
  useRef,
  useMemo,
  useEffect,
  forwardRef,
  RefObject,
  ForwardedRef,
  useImperativeHandle,
} from 'react'
import { Color, Vector2, ShaderMaterial, Mesh, ShaderMaterialParameters, VideoTexture, Texture } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useScrollRig, useImageAsTexture, useScrollbar } from '@14islands/r3f-scroll-rig'

interface WebGLImageProps {
  el: RefObject<HTMLImageElement | HTMLVideoElement>
  scale?: any
  scrollState?: any
  vertexShader?: string
  fragmentShader?: string
  invalidateFrameLoop?: boolean
  widthSegments?: number
  heightSegments?: number
  parallaxSpeed?: number
  isVideo?: boolean
}

export const WebGLImage = forwardRef(
  (
    {
      el,
      scale,
      scrollState,
      vertexShader,
      fragmentShader,
      invalidateFrameLoop = false,
      widthSegments = 128,
      heightSegments = 128,
      parallaxSpeed = 0,
      isVideo = false,
      ...props
    }: WebGLImageProps,
    ref: ForwardedRef<Mesh>
  ) => {
    const material = useRef<ShaderMaterial>(null!)
    const mesh = useRef<Mesh>(null!)
    const videoTexture = useRef<VideoTexture | null>(null)
    
    useImperativeHandle(ref, () => mesh.current)

    const { invalidate, gl, size } = useThree()
    const pixelRatio = useThree((s) => s.viewport.dpr)
    const { scroll } = useScrollbar()
    const { scaleMultiplier } = useScrollRig()

    // Use image texture for images
    const imageTexture = useImageAsTexture(el as RefObject<HTMLImageElement>, !isVideo)

    const uniforms = useMemo(() => {
      return {
        u_color: { value: new Color('black') },
        u_time: { value: 0 },
        u_pixelRatio: { value: pixelRatio },
        u_progress: { value: 0 },
        u_visibility: { value: 0 },
        u_viewport: { value: 0 },
        u_velocity: { value: 0 }, // scroll speed
        u_res: { value: new Vector2() }, // screen dimensions
        u_rect: { value: new Vector2() }, // DOM el dimensions
        u_size: { value: new Vector2() }, // Texture dimensions
        u_texture: { value: null },
        u_loaded: { value: false },
        u_scaleMultiplier: { value: scaleMultiplier },
        u_parallaxSpeed: { value: parallaxSpeed },
      }
    }, [pixelRatio, scaleMultiplier, parallaxSpeed])

    // Handle video texture
    useEffect(() => {
      if (!isVideo || !el.current) return
      
      const video = el.current as HTMLVideoElement
      
      if (video.readyState >= 2) { // Video has enough data
        videoTexture.current = new VideoTexture(video)
        videoTexture.current.needsUpdate = true
        
        if (material.current) {
          material.current.uniforms.u_texture.value = videoTexture.current
          material.current.uniforms.u_size.value.set(video.videoWidth, video.videoHeight)
          material.current.uniforms.u_loaded.value = true
        }
      } else {
        // Wait for video to load
        const handleLoadedData = () => {
          videoTexture.current = new VideoTexture(video)
          videoTexture.current.needsUpdate = true
          
          if (material.current) {
            material.current.uniforms.u_texture.value = videoTexture.current
            material.current.uniforms.u_size.value.set(video.videoWidth, video.videoHeight)
            material.current.uniforms.u_loaded.value = true
          }
        }
        
        video.addEventListener('loadeddata', handleLoadedData)
        
        return () => {
          video.removeEventListener('loadeddata', handleLoadedData)
          if (videoTexture.current) {
            videoTexture.current.dispose()
          }
        }
      }
    }, [isVideo, el])

    // Handle image texture
    useEffect(() => {
      if (isVideo || !imageTexture) return
      if (!material.current) return
      
      material.current.uniforms.u_texture.value = imageTexture
      material.current.uniforms.u_size.value.set(imageTexture.image.width, imageTexture.image.height)
      material.current.uniforms.u_loaded.value = true
    }, [imageTexture, isVideo, gl])

    useEffect(() => {
      if (!material.current) return
      material.current.uniforms.u_res.value.set(size.width, size.height)
      material.current.uniforms.u_rect.value.set(scale?.[0], scale?.[1])
    }, [size, scale])

    useFrame((_, delta) => {
      if (!scrollState?.inViewport || !mesh.current || !material.current) return

      if (!material.current.uniforms.u_loaded.value) return

      // Update video texture
      if (isVideo && videoTexture.current) {
        videoTexture.current.needsUpdate = true
      }

      material.current.uniforms.u_time.value += delta

      // update scale while animating too
      material.current.uniforms.u_rect.value.set(mesh.current.scale.x, mesh.current.scale.y)

      // px velocity
      material.current.uniforms.u_velocity.value = scroll.velocity

      // percent of total visible distance that was scrolled
      material.current.uniforms.u_progress.value = scrollState.progress

      // percent of item height in view
      material.current.uniforms.u_visibility.value = scrollState.visibility
      // percent of window height scrolled since visible
      material.current.uniforms.u_viewport.value = scrollState.viewport

      if (invalidateFrameLoop) invalidate()
    })

    const args = useMemo(
      () => [
        {
          vertexShader: vertexShader || `
            varying vec2 vUv;
            uniform float u_time;
            uniform float u_velocity;
            uniform float u_progress;
            uniform float u_parallaxSpeed;
            
            void main() {
              vUv = uv;
              vec3 pos = position;
              
              // Add subtle wave distortion based on scroll velocity
              float wave = sin(uv.y * 10.0 + u_time * 2.0) * 0.01;
              pos.z += wave * u_velocity * 0.1;
              
              // Parallax effect
              pos.y += u_progress * u_parallaxSpeed * 0.1;
              
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `,
          fragmentShader: fragmentShader || `
            uniform sampler2D u_texture;
            uniform float u_loaded;
            uniform float u_time;
            uniform float u_progress;
            uniform float u_velocity;
            uniform float u_parallaxSpeed;
            
            varying vec2 vUv;
            
            void main() {
              // Apply parallax distortion
              vec2 distortedUv = vUv;
              distortedUv.y += u_progress * u_parallaxSpeed * 0.05;
              
              // Add subtle wave distortion for videos
              float wave = sin(vUv.x * 5.0 + u_time * 1.0) * 0.002;
              distortedUv.y += wave * abs(u_velocity) * 0.1;
              
              vec4 finalColor = texture2D(u_texture, distortedUv);
              
              // Fade in effect
              finalColor.a *= u_loaded;
              
              // Add glass effect overlay
              float glassTint = 0.95 + sin(u_time * 0.5) * 0.05;
              finalColor.rgb *= glassTint;
              
              gl_FragColor = finalColor;
            }
          `,
        },
      ],
      [vertexShader, fragmentShader]
    )

    return (
      <>
        <mesh ref={mesh} {...props}>
          <planeGeometry attach="geometry" args={[1, 1, widthSegments, heightSegments]} />
          <shaderMaterial
            ref={material}
            args={args as [ShaderMaterialParameters]}
            transparent={true}
            uniforms={uniforms}
          />
        </mesh>
      </>
    )
  }
)

WebGLImage.displayName = 'WebGLImage'
