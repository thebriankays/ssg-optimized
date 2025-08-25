'use client'

import { useRef } from 'react'
import { UseCanvas, ScrollScene } from '@14islands/r3f-scroll-rig'
import { Box } from '@react-three/drei'

export default function TestWebGLPage() {
  const boxRef = useRef<HTMLDivElement>(null)
  const sphereRef = useRef<HTMLDivElement>(null)

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">
          WebGL Test Page
        </h1>
        
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Regular DOM Content
          </h2>
          <p className="text-gray-200 mb-4">
            This is normal HTML content that should always be visible.
          </p>
        </section>

        {/* Test 1: Simple Box */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Test 1: Simple WebGL Box
          </h2>
          <div 
            ref={boxRef} 
            className="h-64 bg-white/10 rounded-lg flex items-center justify-center"
          >
            <span className="text-white/50">
              DOM Placeholder - WebGL Box should appear here
            </span>
          </div>
          
          {boxRef.current && (
            <UseCanvas>
              <ScrollScene track={boxRef}>
                {({ scale }) => (
                  <Box scale={scale} rotation={[0.5, 0.5, 0]}>
                    <meshNormalMaterial />
                  </Box>
                )}
              </ScrollScene>
            </UseCanvas>
          )}
        </section>

        {/* Test 2: Animated Sphere */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Test 2: Animated Sphere
          </h2>
          <div 
            ref={sphereRef} 
            className="h-64 bg-white/10 rounded-lg flex items-center justify-center"
          >
            <span className="text-white/50">
              DOM Placeholder - WebGL Sphere should appear here
            </span>
          </div>
          
          {sphereRef.current && (
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

        {/* Test 3: No WebGL - Just DOM */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Test 3: Pure DOM Content (No WebGL)
          </h2>
          <div className="h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              This is just regular DOM content
            </span>
          </div>
        </section>

        <section className="glass-card p-8">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            Status Check
          </h2>
          <ul className="space-y-2 text-gray-200">
            <li>✓ DOM content should be visible</li>
            <li>✓ WebGL placeholders should show text</li>
            <li>✓ WebGL objects should render over placeholders</li>
            <li>✓ Page should be scrollable</li>
            <li>✓ No console errors</li>
          </ul>
        </section>
      </div>
    </main>
  )
}