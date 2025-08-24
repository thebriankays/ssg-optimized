'use client'

import React, { Suspense, useEffect, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  OrbitControls,
  useGLTF,
  useAnimations,
  Stage,
  CameraShake,
  PerspectiveCamera,
} from '@react-three/drei'
import * as THREE from 'three'
import { ViewportScrollScene } from '@/components/canvas/ViewportScrollScene'

interface ModelProps extends React.ComponentPropsWithoutRef<'group'> {
  onLoaded?: () => void
  currentState?: 'idle' | 'thinking' | 'talking' | 'excited' | 'welcome' | 'flipped'
}

function LoadingScreen() {
  // Simple loading indicator without Html portal
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#666" wireframe />
    </mesh>
  )
}

function Model({ onLoaded, currentState = 'idle', ...props }: ModelProps) {
  const { scene, animations } = useGLTF('/robot.glb')
  const { actions, mixer } = useAnimations(animations, scene)
  const [_isHovered, setIsHovered] = useState(false)
  const robotRef = useRef<THREE.Group>(null)
  const [currentAnimation, setCurrentAnimation] = useState<string>('idle')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(false)
  const [texturesLoaded, setTexturesLoaded] = useState(false)

  // Wait for textures to load before showing robot
  useEffect(() => {
    let mounted = true
    
    const checkTextures = async () => {
      console.log('🔍 Checking textures...')
      
      const texturePromises: Promise<void>[] = []
      
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach(mat => {
            if (mat.map && mat.map.image) {
              if (!mat.map.image.complete) {
                const promise = new Promise<void>((resolve) => {
                  mat.map!.image.onload = () => {
                    mat.needsUpdate = true
                    resolve()
                  }
                  mat.map!.image.onerror = () => {
                    console.warn('Texture failed to load:', mat.map!.image.src)
                    resolve() // Continue anyway
                  }
                })
                texturePromises.push(promise)
              }
            }
          })
        }
      })
      
      // Wait for all textures or timeout after 5 seconds
      await Promise.race([
        Promise.all(texturePromises),
        new Promise(resolve => setTimeout(resolve, 5000))
      ])
      
      if (mounted) {
        console.log('✅ All textures loaded!')
        setTexturesLoaded(true)
      }
    }
    
    checkTextures()
    
    return () => {
      mounted = false
    }
  }, [scene])

  // Spectacular Fade-in Welcome Sequence
  useEffect(() => {
    if (robotRef.current && isInitialLoad && !hasPlayedWelcome && animations.length > 0 && texturesLoaded) {
      const playWelcomeSequence = async () => {
        console.log('🎭 Starting welcome sequence...')
        
        // Robot is invisible until textures load
        robotRef.current!.scale.set(0, 0, 0)
        robotRef.current!.position.y = -10
        
        // Now that textures are loaded, make visible and start animation
        robotRef.current!.visible = true
        console.log('🎨 Robot ready with textures, starting animation...')
        
        // 1. Dramatic entrance with presentation pose
        const presentationAnim = animations[0]?.name
        if (presentationAnim && actions[presentationAnim]) {
          actions[presentationAnim].play()
          setCurrentAnimation(presentationAnim)
        }
        
        // 2. Animate scale and position using GSAP-like easing
        const startTime = Date.now()
        const animateEntrance = () => {
          const elapsed = Date.now() - startTime
          const duration = 2000 // 2 seconds
          const progress = Math.min(elapsed / duration, 1)
          
          // Easing function (ease-out-back)
          const easeOutBack = (t: number) => {
            const c1 = 1.70158
            const c3 = c1 + 1
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
          }
          
          const easedProgress = easeOutBack(progress)
          
          if (robotRef.current && robotRef.current.visible) {
            // Scale animation - keep it reasonable
            const scale = 0 + (3.0 * easedProgress) // From 0 to 3.0
            robotRef.current.scale.set(scale, scale, scale)
            
            // Position animation
            const y = -10 + (8 * easedProgress) // From -10 to -2
            robotRef.current.position.y = y
            
            // Add some rotation for flair
            robotRef.current.rotation.y = (1 - progress) * Math.PI * 2
          }
          
          if (progress < 1) {
            requestAnimationFrame(animateEntrance)
          } else {
            // Entrance complete, start welcome sequence
            setTimeout(() => {
              // 3. Switch to welcome pose
              const welcomeAnim = animations[3]?.name // pose 4 - warm welcome
              if (welcomeAnim && actions[welcomeAnim] && presentationAnim) {
                actions[presentationAnim]?.fadeOut(0.5)
                actions[welcomeAnim].reset().fadeIn(0.5).play()
                setCurrentAnimation(welcomeAnim)
                console.log('👋 Playing welcome gesture...')
              }
            }, 500)
            
            setTimeout(() => {
              // 4. Wave hello
              const helloAnim = animations[2]?.name // pose 3 - hello
              if (helloAnim && actions[helloAnim]) {
                const welcomeAnimName = animations[3]?.name
                if (welcomeAnimName) {
                  actions[welcomeAnimName]?.fadeOut(0.5)
                }
                actions[helloAnim].reset().fadeIn(0.5).play()
                setCurrentAnimation(helloAnim)
                console.log('👋 Saying hello...')
              }
            }, 2500)
            
            setTimeout(() => {
              // 5. Final flourish - OMFG pose
              const omfgAnim = animations[1]?.name // pose 2 - omfg
              if (omfgAnim && actions[omfgAnim]) {
                const helloAnimName = animations[2]?.name
                if (helloAnimName) {
                  actions[helloAnimName]?.fadeOut(0.3)
                }
                actions[omfgAnim].reset().fadeIn(0.3).play()
                setCurrentAnimation(omfgAnim)
                console.log('🤯 OMFG moment...')
              }
            }, 4000)
            
            setTimeout(() => {
              // 6. Settle into idle presentation
              const idleAnim = animations[0]?.name // pose 1 - presentation
              if (idleAnim && actions[idleAnim]) {
                const omfgAnimName = animations[1]?.name
                if (omfgAnimName) {
                  actions[omfgAnimName]?.fadeOut(0.5)
                }
                actions[idleAnim].reset().fadeIn(0.5).play()
                setCurrentAnimation(idleAnim)
                console.log('✨ Welcome sequence complete! Ready to chat.')
                setIsInitialLoad(false)
                onLoaded?.()
              }
            }, 5500)
          }
        }
        
        requestAnimationFrame(animateEntrance)
        setHasPlayedWelcome(true)
      }
      
      // Start sequence immediately
      playWelcomeSequence()
    }
  }, [animations, actions, isInitialLoad, hasPlayedWelcome, onLoaded, scene, texturesLoaded])

  // Handle animation state changes (only after welcome sequence)
  useEffect(() => {
    if (!actions || !mixer || isInitialLoad) return

    // Map states to actual animation names based on your 6 poses
    const stateAnimationMap: Record<string, string> = {
      idle: animations[0]?.name || 'pose 1 - presentation',
      thinking: animations[4]?.name || 'pose 5 - sit sad', 
      talking: animations[2]?.name || 'pose 3 - hello',
      excited: animations[1]?.name || 'pose 2 - omfg',
      welcome: animations[3]?.name || 'pose 4 - warm welcome',
      flipped: animations[5]?.name || 'pose 6 - presentation flipped'
    }

    const targetAnimation = stateAnimationMap[currentState] || stateAnimationMap.idle || animations[0]?.name

    if (targetAnimation && actions[targetAnimation] && targetAnimation !== currentAnimation) {
      // Fade out current animation
      if (actions[currentAnimation]) {
        actions[currentAnimation].fadeOut(0.3)
      }
      
      // Fade in new animation
      actions[targetAnimation].reset().fadeIn(0.3).play()
      setCurrentAnimation(targetAnimation)
    }
  }, [currentState, actions, mixer, currentAnimation, animations, isInitialLoad])

  // Initial setup (only run if not doing welcome sequence)
  useEffect(() => {
    if (isInitialLoad) return // Skip if welcome sequence will handle this
    // Start with the first available animation or a default pose
    const initialAnimation = animations[0]?.name || 'pose 1 - presentation'
    if (initialAnimation && actions[initialAnimation]) {
      actions[initialAnimation].play()
      actions[initialAnimation].setEffectiveTimeScale(0.8)
      actions[initialAnimation].setEffectiveWeight(1)
      setCurrentAnimation(initialAnimation)
    }

    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.receiveShadow = true
        obj.castShadow = true
        
        // Ensure materials and textures are properly initialized
        if (obj.material) {
          const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
          materials.forEach(mat => {
            mat.needsUpdate = true
            if (mat.map) {
              mat.map.needsUpdate = true
              mat.map.flipY = false // Ensure correct texture orientation
              mat.map.generateMipmaps = true
            }
            if (mat.normalMap) {
              mat.normalMap.needsUpdate = true
            }
            if (mat.roughnessMap) {
              mat.roughnessMap.needsUpdate = true
            }
            if (mat.metalnessMap) {
              mat.metalnessMap.needsUpdate = true
            }
          })
        }
      }
    })

    scene.scale.set(3, 3, 3) // Reduced from 6 to 3 for proper container fit
    scene.rotation.x = -0.2

    if (!isInitialLoad) {
      onLoaded?.()
    }
  }, [actions, scene, onLoaded, animations, isInitialLoad])

  // Enhanced Continuous Animations with Personality
  useFrame((state, _delta) => {
    if (robotRef.current && !isInitialLoad) {
      const time = state.clock.elapsedTime
      
      // Ensure scale never gets out of control
      const baseScale = 3
      
      switch(currentState) {
        case 'idle':
          // Gentle floating with slight variation
          robotRef.current.position.y = -2 + Math.sin(time * 2) * 0.05 + Math.sin(time * 0.7) * 0.02
          // Subtle head movement like it's observing
          robotRef.current.rotation.y = Math.sin(time * 0.5) * 0.05 + Math.sin(time * 0.3) * 0.02
          // Reset scale to base
          robotRef.current.scale.set(baseScale, baseScale, baseScale)
          break
          
        case 'excited':
          // Energetic bouncing with multiple frequencies
          robotRef.current.position.y = -1.8 + Math.sin(time * 4) * 0.1 + Math.sin(time * 6) * 0.05
          robotRef.current.rotation.y = Math.sin(time * 3) * 0.1
          robotRef.current.rotation.z = Math.sin(time * 5) * 0.03
          // Keep base scale, just add tiny breathing effect
          const scale = baseScale + Math.sin(time * 4) * 0.05 // Very small scale variation
          robotRef.current.scale.set(scale, scale, scale)
          break
          
        case 'thinking':
          // Slow, contemplative movement
          robotRef.current.position.y = -2.1 + Math.sin(time * 1) * 0.02
          robotRef.current.rotation.z = Math.sin(time * 0.8) * 0.02
          // Slight tilt like deep in thought
          robotRef.current.rotation.x = -0.2 + Math.sin(time * 0.6) * 0.01
          // Reset scale to base
          robotRef.current.scale.set(baseScale, baseScale, baseScale)
          break
          
        case 'talking':
          // Active gesturing motion
          robotRef.current.position.y = -1.95 + Math.sin(time * 3) * 0.06
          robotRef.current.rotation.y = Math.sin(time * 2) * 0.08
          // Slight forward lean when talking
          robotRef.current.rotation.x = -0.15 + Math.sin(time * 2.5) * 0.02
          // Reset scale to base
          robotRef.current.scale.set(baseScale, baseScale, baseScale)
          break
          
        case 'welcome':
          // Welcoming gestures - more open movement
          robotRef.current.position.y = -1.9 + Math.sin(time * 1.5) * 0.08
          robotRef.current.rotation.y = Math.sin(time * 1.2) * 0.12
          const welcomeScale = baseScale + 0.05 + Math.sin(time * 2) * 0.02 // Very small scale variation
          robotRef.current.scale.set(welcomeScale, welcomeScale, welcomeScale)
          break
          
        case 'flipped':
          // Mirror movement of idle but with slight differences
          robotRef.current.position.y = -2 + Math.sin(time * 2.2) * 0.05
          robotRef.current.rotation.y = -Math.sin(time * 0.5) * 0.05 // Opposite direction
          // Reset scale to base
          robotRef.current.scale.set(baseScale, baseScale, baseScale)
          break
          
        default:
          // Fallback idle animation
          robotRef.current.position.y = -2 + Math.sin(time * 2) * 0.05
          // Reset scale to base
          robotRef.current.scale.set(baseScale, baseScale, baseScale)
      }
    }
  })

  // Enhanced Hover interactions
  const handlePointerEnter = () => {
    setIsHovered(true)
    if (currentState === 'idle' && !isInitialLoad) {
      console.log('👋 Robot noticed you hovering!')
      // Quick greeting on hover
      window.dispatchEvent(new CustomEvent('robotStateChange', { detail: { state: 'welcome' } }))
    }
  }

  const handlePointerLeave = () => {
    setIsHovered(false)
  }

  const handleClick = () => {
    if (!isInitialLoad) {
      console.log('💫 Robot clicked! Playing random animation...')
      // Cycle through fun poses on click
      const funStates = ['excited', 'flipped', 'talking']
      const randomState = funStates[Math.floor(Math.random() * funStates.length)] as typeof currentState
      window.dispatchEvent(new CustomEvent('robotStateChange', { detail: { state: randomState } }))
    }
  }

  return (
    <group
      ref={robotRef}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      position={[0, -2, 0]}
      visible={texturesLoaded} // Only show when textures are loaded
      {...props}
    >
      <primitive object={scene} />
    </group>
  )
}

function SceneContent() {
  const [modelLoaded, setModelLoaded] = useState(false)
  const [robotState, setRobotState] = useState<'idle' | 'thinking' | 'talking' | 'excited' | 'welcome' | 'flipped'>('idle')
  const [lastActivityTime, setLastActivityTime] = useState(Date.now())
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Listen for global state changes with activity tracking
  useEffect(() => {
    const handleChatStateChange = (event: CustomEvent) => {
      const newState = event.detail.state
      console.log('🤖 Robot state change:', robotState, '→', newState)
      
      setRobotState(newState)
      setLastActivityTime(Date.now())
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      
      // Only set return-to-idle timeout for manual button triggers
      if (newState !== 'idle' && !['thinking', 'talking'].includes(newState)) {
        timeoutRef.current = setTimeout(() => {
          console.log('🔄 Auto-returning to idle from:', newState)
          setRobotState('idle')
        }, newState === 'excited' ? 2000 : 1500)
      }
    }

    window.addEventListener('robotStateChange', handleChatStateChange as EventListener)
    
    // Cleanup function
    return () => {
      window.removeEventListener('robotStateChange', handleChatStateChange as EventListener)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [robotState])

  // Random Idle Behaviors - Robot gets bored and does things!
  useEffect(() => {
    if (robotState === 'idle' && modelLoaded) {
      const checkForIdleBehavior = () => {
        const timeSinceActivity = Date.now() - lastActivityTime
        const IDLE_THRESHOLD = 30000 // 30 seconds
        
        if (timeSinceActivity > IDLE_THRESHOLD) {
          const idleBehaviors = ['welcome', 'flipped', 'thinking']
          const randomBehavior = idleBehaviors[Math.floor(Math.random() * idleBehaviors.length)]
          
          console.log(`🥱 Robot got bored after ${Math.round(timeSinceActivity/1000)}s - doing ${randomBehavior}!`)
          
          setRobotState(randomBehavior as typeof robotState)
          
          // Return to idle after the random behavior
          setTimeout(() => {
            setRobotState('idle')
            setLastActivityTime(Date.now()) // Reset activity timer
          }, 2500)
        }
      }
      
      // Check every 10 seconds for idle behavior
      const interval = setInterval(checkForIdleBehavior, 10000)
      return () => clearInterval(interval)
    }
  }, [robotState, modelLoaded, lastActivityTime])

  return (
    <>
      <Model
        currentState={robotState}
        onLoaded={() => setModelLoaded(true)}
      />
      {modelLoaded && (
        <Stage
          intensity={1}
          environment="city"
          adjustCamera={false}
          shadows={{
            type: 'contact',
            opacity: 0.8,
            blur: 2,
          }}
        />
      )}
    </>
  )
}

export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', touchAction: 'none' }}>
      <ViewportScrollScene
        track={containerRef as React.MutableRefObject<HTMLElement>}
        hideOffscreen={false}
        orthographic={false}
      >
        {() => (
          <>
            <PerspectiveCamera
              makeDefault
              fov={50}
              position={[0, 1, 8]}
              near={0.1}
              far={1000}
            />
            
            <Suspense fallback={<LoadingScreen />}>
              <SceneContent />
            </Suspense>

            <OrbitControls
              makeDefault
              enablePan={false}
              enableZoom={false} // Disable zoom to prevent interference with page scroll
              maxPolarAngle={Math.PI / 2}
              target={[0, 0.5, 0]}
            />

            <CameraShake
              maxYaw={0.1}
              maxPitch={0.1}
              maxRoll={0.1}
              yawFrequency={0.1}
              pitchFrequency={0.1}
              rollFrequency={0.1}
              intensity={0.5}
              decayRate={0.65}
            />
          </>
        )}
      </ViewportScrollScene>
    </div>
  )
}

useGLTF.preload('/robot.glb')