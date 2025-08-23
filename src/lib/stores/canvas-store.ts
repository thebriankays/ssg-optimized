import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

type Quality = 'low' | 'medium' | 'high'

interface CanvasStore {
  // Quality settings
  quality: Quality
  setQuality: (quality: Quality) => void
  
  // Performance
  fps: number
  setFps: (fps: number) => void
  showPerf: boolean
  togglePerf: () => void
  
  // Rendering
  needsRender: boolean
  requestRender: () => void
  renderComplete: () => void
  
  // Scene management
  activeScenes: Set<string>
  registerScene: (id: string) => void
  unregisterScene: (id: string) => void
  
  // Settings based on quality
  getQualitySettings: () => {
    pixelRatio: number
    shadows: boolean
    antialias: boolean
    postprocessing: boolean
    reflections: boolean
  }
}

export const useCanvasStore = create<CanvasStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    quality: 'medium',
    fps: 60,
    showPerf: false,
    needsRender: false,
    activeScenes: new Set(),

    // Actions
    setQuality: (quality) => set({ quality }),
    setFps: (fps) => set({ fps }),
    togglePerf: () => set((state) => ({ showPerf: !state.showPerf })),
    
    requestRender: () => set({ needsRender: true }),
    renderComplete: () => set({ needsRender: false }),
    
    registerScene: (id) => {
      set((state) => ({
        activeScenes: new Set(state.activeScenes).add(id),
      }))
    },
    
    unregisterScene: (id) => {
      set((state) => {
        const scenes = new Set(state.activeScenes)
        scenes.delete(id)
        return { activeScenes: scenes }
      })
    },

    // Computed
    getQualitySettings: () => {
      const quality = get().quality
      
      switch (quality) {
        case 'low':
          return {
            pixelRatio: 1,
            shadows: false,
            antialias: false,
            postprocessing: false,
            reflections: false,
          }
        case 'medium':
          return {
            pixelRatio: 1.5,
            shadows: true,
            antialias: true,
            postprocessing: true,
            reflections: false,
          }
        case 'high':
          return {
            pixelRatio: 2,
            shadows: true,
            antialias: true,
            postprocessing: true,
            reflections: true,
          }
      }
    },
  }))
)