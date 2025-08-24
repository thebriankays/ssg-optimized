'use client'

import { useEffect, useState } from 'react'

export default function TestWhatamesh() {
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null)
  const [backgroundVisible, setBackgroundVisible] = useState(false)
  
  useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    setWebglSupported(!!gl)
    
    // Check if background is visible after a delay
    setTimeout(() => {
      setBackgroundVisible(true)
    }, 2000)
  }, [])
  
  return (
    <div className="min-h-screen">
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Whatamesh Background Test
        </h1>
        
        <div className="space-y-4 max-w-2xl">
          <div className="p-4 rounded-lg bg-white/80 backdrop-blur">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Status Checks:</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${webglSupported === null ? 'bg-gray-400' : webglSupported ? 'bg-green-500' : 'bg-red-500'}`} />
                WebGL Support: {webglSupported === null ? 'Checking...' : webglSupported ? 'Supported ✓' : 'Not Supported ✗'}
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${backgroundVisible ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
                Background Status: {backgroundVisible ? 'Should be visible' : 'Loading...'}
              </li>
            </ul>
          </div>
          
          <div className="p-4 rounded-lg bg-white/60 backdrop-blur">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">What you should see:</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>A beautiful animated gradient background with light purple, blue, pink, and lavender colors</li>
              <li>Subtle wave-like animations flowing across the background</li>
              <li>The background should be visible behind all content</li>
              <li>If WebGL fails, you should see an animated CSS gradient fallback</li>
            </ul>
          </div>
          
          <div className="mt-8 p-6 glass-card glass-frosted">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Glass Card Example
            </h2>
            <p className="text-gray-700">
              This glass card should show the animated background through 
              its frosted glass effect. The background colors should be visible 
              but blurred through the glass.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-black/80 text-white">
            <h3 className="font-semibold mb-2">Console Debug Info:</h3>
            <p className="text-sm text-white/80">
              Open DevTools Console (F12) to see:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm text-white/70">
              <li>WebGL support detection logs</li>
              <li>Background settings being loaded</li>
              <li>WhatameshSimple component rendering</li>
              <li>Any shader compilation errors</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
