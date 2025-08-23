'use client'

import React from 'react'

export default function CursorTestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Mouse Follower Test Page</h1>
      
      {/* Sizes Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Cursor Sizes</h2>
        <div className="grid grid-cols-3 gap-4">
          <div 
            className="p-8 bg-gray-800 rounded-lg text-center hover:bg-gray-700 transition-colors"
            data-cursor="-sm"
            data-cursor-text="SMALL"
          >
            <h3 className="text-lg font-medium mb-2">Small (-sm)</h3>
            <p className="text-gray-400">0.75x scale</p>
          </div>
          
          <div 
            className="p-8 bg-gray-800 rounded-lg text-center hover:bg-gray-700 transition-colors"
            data-cursor="-md"
            data-cursor-text="MEDIUM"
          >
            <h3 className="text-lg font-medium mb-2">Medium (-md)</h3>
            <p className="text-gray-400">1.5x scale</p>
          </div>
          
          <div 
            className="p-8 bg-gray-800 rounded-lg text-center hover:bg-gray-700 transition-colors"
            data-cursor="-lg"
            data-cursor-text="LARGE"
          >
            <h3 className="text-lg font-medium mb-2">Large (-lg)</h3>
            <p className="text-gray-400">2x scale</p>
          </div>
          
          <div 
            className="p-8 bg-gray-800 rounded-lg text-center hover:bg-gray-700 transition-colors"
            data-cursor="-xl"
            data-cursor-text="XL"
          >
            <h3 className="text-lg font-medium mb-2">Extra Large (-xl)</h3>
            <p className="text-gray-400">4x scale</p>
          </div>
          
          <div 
            className="p-8 bg-gray-800 rounded-lg text-center hover:bg-gray-700 transition-colors"
            data-cursor="-xxl"
            data-cursor-text="XXL"
          >
            <h3 className="text-lg font-medium mb-2">Extra Extra Large (-xxl)</h3>
            <p className="text-gray-400">6.25x scale</p>
          </div>
          
          <div 
            className="p-8 bg-gray-800 rounded-lg text-center hover:bg-gray-700 transition-colors"
            data-cursor="-drag"
            data-cursor-text="DRAG"
          >
            <h3 className="text-lg font-medium mb-2">Drag Cursor</h3>
            <p className="text-gray-400">For carousels</p>
          </div>
        </div>
      </section>

      {/* Colors Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Cursor Colors</h2>
        <div className="grid grid-cols-3 gap-4">
          <div 
            className="p-8 bg-yellow-900/20 border-2 border-yellow-500 rounded-lg text-center"
            data-cursor="-lg -color-yellow"
            data-cursor-text="YELLOW"
          >
            <h3 className="text-lg font-medium text-yellow-400">Yellow</h3>
          </div>
          
          <div 
            className="p-8 bg-cyan-900/20 border-2 border-cyan-500 rounded-lg text-center"
            data-cursor="-lg -color-turquois"
            data-cursor-text="TURQUOISE"
          >
            <h3 className="text-lg font-medium text-cyan-400">Turquoise</h3>
          </div>
          
          <div 
            className="p-8 bg-green-900/20 border-2 border-green-500 rounded-lg text-center"
            data-cursor="-lg -color-green"
            data-cursor-text="GREEN"
          >
            <h3 className="text-lg font-medium text-green-400">Green</h3>
          </div>
          
          <div 
            className="p-8 bg-purple-900/20 border-2 border-purple-500 rounded-lg text-center"
            data-cursor="-lg -color-purple"
            data-cursor-text="PURPLE"
          >
            <h3 className="text-lg font-medium text-purple-400">Purple</h3>
          </div>
          
          <div 
            className="p-8 bg-white/10 border-2 border-white rounded-lg text-center"
            data-cursor="-lg -color-white"
            data-cursor-text="WHITE"
          >
            <h3 className="text-lg font-medium">White</h3>
          </div>
          
          <div 
            className="p-8 bg-black border-2 border-gray-600 rounded-lg text-center"
            data-cursor="-lg -color-black -opaque"
            data-cursor-text="BLACK"
          >
            <h3 className="text-lg font-medium text-gray-300">Black</h3>
          </div>
        </div>
      </section>

      {/* Blend Modes Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Blend Modes</h2>
        <div className="grid grid-cols-3 gap-4">
          <div 
            className="p-8 bg-gradient-to-br from-pink-500 to-blue-500 rounded-lg text-center"
            data-cursor="-lg -exclusion"
            data-cursor-text="EXCLUSION"
          >
            <h3 className="text-lg font-medium">Exclusion Mode</h3>
          </div>
          
          <div 
            className="p-8 bg-gradient-to-br from-green-500 to-yellow-500 rounded-lg text-center"
            data-cursor="-lg -difference"
            data-cursor-text="DIFFERENCE"
          >
            <h3 className="text-lg font-medium">Difference Mode</h3>
          </div>
          
          <div 
            className="p-8 bg-gradient-to-br from-purple-500 to-red-500 rounded-lg text-center"
            data-cursor="-lg -opaque"
            data-cursor-text="OPAQUE"
          >
            <h3 className="text-lg font-medium">Opaque Mode</h3>
          </div>
        </div>
      </section>

      {/* Interactive Elements */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Interactive Elements</h2>
        <div className="flex flex-wrap gap-4">
          <button 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            data-cursor="-pointer"
          >
            Pointer Cursor
          </button>
          
          <button 
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
            data-cursor="-md -color-green"
            data-cursor-text="CLICK"
          >
            Click Me
          </button>
          
          <a 
            href="#"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors inline-block"
            data-cursor="-sm -pointer"
          >
            Small Link
          </a>
          
          <div 
            className="px-6 py-3 bg-gray-700 rounded-lg font-medium"
            data-cursor-stick
          >
            Sticky Cursor
          </div>
        </div>
      </section>

      {/* Carousel Simulation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Carousel Simulation</h2>
        <div 
          className="h-64 bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600"
          data-cursor="-drag"
          data-cursor-text="DRAG"
        >
          <p className="text-gray-400">Hover here to see drag cursor (for carousels)</p>
        </div>
      </section>

      {/* Input Fields (Should hide cursor) */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Input Fields (Auto-hide cursor)</h2>
        <div className="space-y-4 max-w-md">
          <input 
            type="text" 
            placeholder="Cursor should hide here"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <textarea 
            placeholder="Cursor should also hide here"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none h-24"
          />
        </div>
      </section>

      {/* Combined States */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Combined States</h2>
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="p-8 bg-gradient-to-br from-yellow-500/20 to-purple-500/20 rounded-lg text-center border border-gray-600"
            data-cursor="-xl -color-yellow -exclusion"
            data-cursor-text="COMBO"
          >
            <h3 className="text-lg font-medium mb-2">XL + Yellow + Exclusion</h3>
          </div>
          
          <div 
            className="p-8 bg-gradient-to-br from-cyan-500/20 to-green-500/20 rounded-lg text-center border border-gray-600"
            data-cursor="-sm -color-turquois -difference"
            data-cursor-text="TINY"
          >
            <h3 className="text-lg font-medium mb-2">Small + Turquoise + Difference</h3>
          </div>
        </div>
      </section>
    </div>
  )
}
