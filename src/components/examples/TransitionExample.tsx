'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePageTransition } from '@/hooks/usePageTransition'

export function TransitionExample() {
  const [isLoading, setIsLoading] = useState(false)
  const { navigateTo, createTransitionLink } = usePageTransition()

  const handleProgrammaticNavigation = async () => {
    setIsLoading(true)
    
    // Simulate some async operation
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Navigate with transition after async operation
    navigateTo('/about', { delay: 100 })
    setIsLoading(false)
  }

  const handleSkipTransition = () => {
    navigateTo('/contact', { skipTransition: true })
  }

  // Create link props with transition
  const servicesLinkProps = createTransitionLink('/services')

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h2 className="text-3xl font-bold text-center mb-8">
        Page Transition Examples
      </h2>

      {/* Basic transition links */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Basic Transition Links</h3>
        <div className="flex flex-wrap gap-4">
          <Link 
            href="/" 
            data-transition 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Home (With Transition)
          </Link>
          
          <Link 
            href="/about" 
            data-transition
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            About (With Transition)
          </Link>
          
          <Link 
            href="/contact" 
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Contact (No Transition)
          </Link>
        </div>
      </div>

      {/* Programmatic navigation */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Programmatic Navigation</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleProgrammaticNavigation}
            disabled={isLoading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Loading...
              </>
            ) : (
              'About (After Async)'
            )}
          </button>
          
          <button
            onClick={handleSkipTransition}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Contact (Skip Transition)
          </button>
        </div>
      </div>

      {/* Using createTransitionLink helper */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Helper Function Links</h3>
        <div className="flex flex-wrap gap-4">
          <a 
            {...servicesLinkProps}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Services (Helper)
          </a>
        </div>
      </div>

      {/* Code examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Usage Examples</h3>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Basic Link with Transition:</h4>
          <code className="text-sm">
            {`<Link href="/about" data-transition>About</Link>`}
          </code>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Programmatic Navigation:</h4>
          <code className="text-sm">
            {`const { navigateTo } = usePageTransition()
navigateTo('/about', { delay: 500 })`}
          </code>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Skip Transition:</h4>
          <code className="text-sm">
            {`navigateTo('/admin', { skipTransition: true })`}
          </code>
        </div>
      </div>

      {/* Performance note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Performance Note:</h4>
        <p className="text-blue-700 text-sm">
          The WebGL canvas persists across all route changes, ensuring smooth 60fps transitions 
          without expensive context recreation. The shader-based mask creates the curved transition effect.
        </p>
      </div>
    </div>
  )
}