'use client'

import { useRef, useEffect, useState } from 'react'
import { UseCanvas, ScrollScene } from '@14islands/r3f-scroll-rig'
import { Box } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

function RotatingBox({ scale }: { scale: any }) {
  const meshRef = useRef<any>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5
      meshRef.current.rotation.y += delta * 0.5
    }
  })
  
  return (
    <Box ref={meshRef} scale={scale}>
      <meshNormalMaterial />
    </Box>
  )
}

export default function TestWebGLPage() {
  const [mounted, setMounted] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})
  // Fix: Use proper type for refs that ScrollScene expects
  const boxRef = useRef<HTMLDivElement>(null!) as React.MutableRefObject<HTMLElement>
  const sphereRef = useRef<HTMLDivElement>(null!) as React.MutableRefObject<HTMLElement>
  
  useEffect(() => {
    setMounted(true)
    
    // Debug info
    const checkStatus = () => {
      const canvas = document.querySelector('canvas')
      const canvasParent = canvas?.parentElement
      
      setDebugInfo({
        hasCanvas: !!canvas,
        canvasDisplay: canvas ? getComputedStyle(canvas).display : 'N/A',
        canvasVisibility: canvas ? getComputedStyle(canvas).visibility : 'N/A',
        canvasOpacity: canvas ? getComputedStyle(canvas).opacity : 'N/A',
        canvasZIndex: canvas ? getComputedStyle(canvas).zIndex : 'N/A',
        canvasWidth: canvas ? canvas.width : 'N/A',
        canvasHeight: canvas ? canvas.height : 'N/A',
        parentDisplay: canvasParent ? getComputedStyle(canvasParent).display : 'N/A',
        boxRefExists: !!boxRef.current,
        boxRefDimensions: boxRef.current ? 
          `${boxRef.current.offsetWidth}x${boxRef.current.offsetHeight}` : 'N/A',
      })
    }
    
    checkStatus()
    const timer = setTimeout(checkStatus, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">
          WebGL Test Page
        </h1>
        
        {/* Debug Info */}
        <section className="mb-8 bg-black/50 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2 text-white">Debug Info:</h2>
          <details>
            <summary className="cursor-pointer text-white">Show Details</summary>
            <pre className="text-xs text-green-400 mt-2">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>
        </section>

        {/* Test 1: Simple Box */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Test 1: Rotating WebGL Box
          </h2>
          <div 
            ref={boxRef as any} 
            className="bg-white/10 rounded-lg flex items-center justify-center border-2 border-white/30 overflow-hidden"
            style={{
              height: '400px',
              width: '100%',
              position: 'relative',
            }}
          >
            <span className="text-white/50 absolute z-10 pointer-events-none">
              Box placeholder (WebGL renders over this)
            </span>
          </div>
          
          {mounted && boxRef.current && (
            <UseCanvas>
              <ScrollScene track={boxRef}>
                {({ scale }) => <RotatingBox scale={scale} />}
              </ScrollScene>
            </UseCanvas>
          )}
        </section>

        {/* Test 2: Sphere */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Test 2: Pink Sphere
          </h2>
          <div 
            ref={sphereRef as any} 
            className="bg-white/10 rounded-lg flex items-center justify-center border-2 border-white/30 overflow-hidden"
            style={{
              height: '400px',
              width: '100%',
              position: 'relative',
            }}
          >
            <span className="text-white/50 absolute z-10 pointer-events-none">
              Sphere placeholder
            </span>
          </div>
          
          {mounted && sphereRef.current && (
            <UseCanvas>
              <ScrollScene track={sphereRef}>
                {({ scale }) => (
                  <mesh scale={scale}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial color="#ff6090" metalness={0.5} roughness={0.2} />
                  </mesh>
                )}
              </ScrollScene>
            </UseCanvas>
          )}
        </section>

        <section className="glass-card p-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Status Check
          </h2>
          <ul className="space-y-2 text-gray-200">
            <li>DOM content should be visible</li>
            <li>WebGL objects should render over placeholders</li>
            <li>Page should be scrollable</li>
            <li>Canvas should stay fixed when scrolling</li>
          </ul>
        </section>
      </div>
    </main>
  )
}