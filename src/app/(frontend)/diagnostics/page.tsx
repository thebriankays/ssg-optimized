'use client'

import { useEffect, useState } from 'react'
import { UseCanvas, ScrollScene, useScrollRig } from '@14islands/r3f-scroll-rig'
import { useRef } from 'react'

export default function DiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<any>({})
  const testRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Run diagnostics after mount
    const runDiagnostics = () => {
      const results: any = {
        timestamp: new Date().toISOString(),
        dom: {},
        canvas: {},
        scrollRig: {},
        visibility: {},
      }
      
      // Check DOM elements
      results.dom.pageContent = !!document.getElementById('page-content')
      results.dom.main = !!document.querySelector('main')
      results.dom.canvas = !!document.querySelector('canvas')
      results.dom.globalCanvas = !!document.querySelector('[style*="position: fixed"]')
      
      // Check visibility
      const main = document.querySelector('main')
      if (main) {
        const computed = getComputedStyle(main)
        results.visibility.mainDisplay = computed.display
        results.visibility.mainVisibility = computed.visibility
        results.visibility.mainOpacity = computed.opacity
      }
      
      // Check for hidden elements
      const hiddenElements = document.querySelectorAll('[style*="display: none"]')
      results.visibility.hiddenCount = hiddenElements.length
      results.visibility.hiddenElements = Array.from(hiddenElements).slice(0, 5).map(el => ({
        tag: el.tagName,
        class: el.className,
        id: el.id,
      }))
      
      // Check for proxy elements
      const proxyElements = document.querySelectorAll('[data-scrollrig-proxy]')
      results.scrollRig.proxyCount = proxyElements.length
      results.scrollRig.proxyElements = Array.from(proxyElements).slice(0, 5).map(el => ({
        tag: el.tagName,
        class: el.className,
        display: getComputedStyle(el).display,
        visibility: getComputedStyle(el).visibility,
      }))
      
      // Check classes
      results.dom.hasLenisSmooth = document.documentElement.classList.contains('lenis-smooth')
      results.dom.hasLenis = document.documentElement.classList.contains('lenis')
      
      // Check for common issues
      results.issues = []
      
      if (!results.dom.pageContent) {
        results.issues.push('Missing #page-content wrapper')
      }
      
      if (!results.dom.canvas) {
        results.issues.push('No canvas element found')
      }
      
      if (results.visibility.mainDisplay === 'none') {
        results.issues.push('Main element is hidden (display: none)')
      }
      
      if (results.visibility.hiddenCount > 10) {
        results.issues.push(`Many hidden elements found: ${results.visibility.hiddenCount}`)
      }
      
      setDiagnostics(results)
    }
    
    // Run diagnostics after a delay to ensure everything is mounted
    const timer = setTimeout(runDiagnostics, 1000)
    
    // Also run on visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        runDiagnostics()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
  
  // Test scroll rig hook
  let scrollRigInfo: any = {}
  try {
    const rig = useScrollRig()
    scrollRigInfo = {
      isCanvasAvailable: rig.isCanvasAvailable,
      hasSmoothScrollbar: rig.hasSmoothScrollbar,
    }
  } catch (e) {
    scrollRigInfo = { error: 'useScrollRig hook failed' }
  }

  return (
    <main className="min-h-screen p-8 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">R3F Scroll-Rig Diagnostics</h1>
        
        {/* Status Overview */}
        <section className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Status Overview</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">DOM Elements</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  Page Content: {diagnostics.dom?.pageContent ? '✅' : '❌'}
                </li>
                <li>
                  Main Element: {diagnostics.dom?.main ? '✅' : '❌'}
                </li>
                <li>
                  Canvas: {diagnostics.dom?.canvas ? '✅' : '❌'}
                </li>
                <li>
                  Global Canvas: {diagnostics.dom?.globalCanvas ? '✅' : '❌'}
                </li>
                <li>
                  Lenis Smooth: {diagnostics.dom?.hasLenisSmooth ? '✅' : '❌'}
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Visibility</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  Main Display: {diagnostics.visibility?.mainDisplay || 'N/A'}
                </li>
                <li>
                  Main Visibility: {diagnostics.visibility?.mainVisibility || 'N/A'}
                </li>
                <li>
                  Main Opacity: {diagnostics.visibility?.mainOpacity || 'N/A'}
                </li>
                <li>
                  Hidden Elements: {diagnostics.visibility?.hiddenCount || 0}
                </li>
                <li>
                  Proxy Elements: {diagnostics.scrollRig?.proxyCount || 0}
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Scroll Rig Hook</h3>
            <pre className="text-xs bg-black/50 p-2 rounded">
              {JSON.stringify(scrollRigInfo, null, 2)}
            </pre>
          </div>
        </section>
        
        {/* Issues */}
        {diagnostics.issues?.length > 0 && (
          <section className="glass-card p-6 mb-8 border-red-500 border">
            <h2 className="text-2xl font-semibold mb-4 text-red-400">Issues Detected</h2>
            <ul className="space-y-2">
              {diagnostics.issues.map((issue: string, i: number) => (
                <li key={i} className="flex items-start">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        
        {/* Hidden Elements Details */}
        {diagnostics.visibility?.hiddenElements?.length > 0 && (
          <section className="glass-card p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Hidden Elements</h2>
            <div className="space-y-2 text-sm">
              {diagnostics.visibility.hiddenElements.map((el: any, i: number) => (
                <div key={i} className="bg-black/30 p-2 rounded">
                  <code>
                    &lt;{el.tag}{el.id ? ` id="${el.id}"` : ''}{el.class ? ` class="${el.class}"` : ''}&gt;
                  </code>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Proxy Elements Details */}
        {diagnostics.scrollRig?.proxyElements?.length > 0 && (
          <section className="glass-card p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Scroll-Rig Proxy Elements</h2>
            <div className="space-y-2 text-sm">
              {diagnostics.scrollRig.proxyElements.map((el: any, i: number) => (
                <div key={i} className="bg-black/30 p-2 rounded">
                  <div>Tag: {el.tag}</div>
                  <div>Class: {el.class || 'none'}</div>
                  <div>Display: {el.display}</div>
                  <div>Visibility: {el.visibility}</div>
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* Test WebGL Component */}
        <section className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Test WebGL Component</h2>
          <p className="mb-4">
            This section tests a simple ScrollScene with UseCanvas wrapper:
          </p>
          
          <div ref={testRef} className="h-32 bg-white/10 rounded flex items-center justify-center">
            <span>DOM Content (should stay visible)</span>
          </div>
          
          {testRef.current && (
            <UseCanvas>
              <ScrollScene track={testRef}>
                {({ scale }) => (
                  <mesh scale={scale}>
                    <boxGeometry />
                    <meshNormalMaterial />
                  </mesh>
                )}
              </ScrollScene>
            </UseCanvas>
          )}
        </section>
        
        {/* Raw Diagnostics */}
        <section className="glass-card p-6">
          <h2 className="text-2xl font-semibold mb-4">Raw Diagnostics</h2>
          <pre className="text-xs bg-black/50 p-4 rounded overflow-auto">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  )
}