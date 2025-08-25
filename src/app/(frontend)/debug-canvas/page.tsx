'use client'

import { useEffect, useState } from 'react'

export default function DebugCanvasPage() {
  const [info, setInfo] = useState<any>({})
  
  useEffect(() => {
    const checkDOM = () => {
      const canvas = document.querySelector('canvas')
      const pageContent = document.querySelector('[data-page-content]')
      const main = document.querySelector('main')
      
      const canvasInfo = canvas ? {
        exists: true,
        zIndex: getComputedStyle(canvas).zIndex,
        position: getComputedStyle(canvas).position,
        parent: canvas.parentElement?.tagName,
        parentZIndex: canvas.parentElement ? getComputedStyle(canvas.parentElement).zIndex : null,
      } : { exists: false }
      
      const contentInfo = pageContent ? {
        exists: true,
        zIndex: getComputedStyle(pageContent).zIndex,
        position: getComputedStyle(pageContent).position,
        display: getComputedStyle(pageContent).display,
        visibility: getComputedStyle(pageContent).visibility,
      } : { exists: false }
      
      const mainInfo = main ? {
        exists: true,
        zIndex: getComputedStyle(main).zIndex,
        position: getComputedStyle(main).position,
        display: getComputedStyle(main).display,
        visibility: getComputedStyle(main).visibility,
      } : { exists: false }
      
      setInfo({
        canvas: canvasInfo,
        pageContent: contentInfo,
        main: mainInfo,
        timestamp: new Date().toISOString(),
      })
    }
    
    // Check immediately
    checkDOM()
    
    // Check again after a delay
    const timer = setTimeout(checkDOM, 1000)
    
    // Add click handler to re-check
    const handleClick = () => checkDOM()
    document.addEventListener('click', handleClick)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClick)
    }
  }, [])
  
  return (
    <main 
      className="min-h-screen p-8" 
      style={{
        position: 'relative',
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Canvas Debug Info</h1>
        
        <div className="bg-white/10 p-4 rounded mb-4">
          <h2 className="text-xl font-semibold mb-2">Click anywhere to refresh info</h2>
        </div>
        
        <pre className="bg-black/50 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(info, null, 2)}
        </pre>
        
        <div className="mt-8 space-y-4">
          <div className="bg-red-500 p-4 rounded">
            <p>This red box should be visible</p>
          </div>
          
          <div className="bg-green-500 p-4 rounded">
            <p>This green box should be visible</p>
          </div>
          
          <div className="bg-blue-500 p-4 rounded">
            <p>This blue box should be visible</p>
          </div>
        </div>
        
        <div className="mt-8 bg-yellow-500/20 p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Quick Fix Buttons</h2>
          
          <button
            onClick={() => {
              const canvas = document.querySelector('canvas')
              if (canvas && canvas.parentElement) {
                canvas.parentElement.style.zIndex = '-1000'
                canvas.parentElement.style.position = 'fixed'
                canvas.style.zIndex = '-1000'
              }
              alert('Applied z-index fix to canvas')
            }}
            className="bg-blue-500 px-4 py-2 rounded mr-2"
          >
            Force Canvas Behind
          </button>
          
          <button
            onClick={() => {
              const content = document.querySelector('[data-page-content]')
              if (content) {
                (content as HTMLElement).style.zIndex = '10000'
                ;(content as HTMLElement).style.position = 'relative'
              }
              alert('Applied z-index fix to content')
            }}
            className="bg-green-500 px-4 py-2 rounded"
          >
            Force Content Above
          </button>
        </div>
      </div>
    </main>
  )
}