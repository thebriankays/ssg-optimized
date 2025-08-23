'use client'

export function AnimationControls() {
  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('robotStateChange', { detail: { state: 'idle' } }))}
        className="px-4 py-2 bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 shadow-lg"
      >
        Presentation
      </button>
      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('robotStateChange', { detail: { state: 'thinking' } }))}
        className="px-4 py-2 bg-purple-500/80 hover:bg-purple-600/80 text-white rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 shadow-lg"
      >
        Sit Sad
      </button>
      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('robotStateChange', { detail: { state: 'talking' } }))}
        className="px-4 py-2 bg-green-500/80 hover:bg-green-600/80 text-white rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 shadow-lg"
      >
        Hello
      </button>
      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('robotStateChange', { detail: { state: 'excited' } }))}
        className="px-4 py-2 bg-orange-500/80 hover:bg-orange-600/80 text-white rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 shadow-lg"
      >
        OMFG!
      </button>
      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('robotStateChange', { detail: { state: 'welcome' } }))}
        className="px-4 py-2 bg-pink-500/80 hover:bg-pink-600/80 text-white rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 shadow-lg"
      >
        Welcome
      </button>
      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('robotStateChange', { detail: { state: 'flipped' } }))}
        className="px-4 py-2 bg-cyan-500/80 hover:bg-cyan-600/80 text-white rounded-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 shadow-lg"
      >
        Flipped
      </button>
    </div>
  )
}