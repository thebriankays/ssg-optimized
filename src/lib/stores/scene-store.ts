import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import * as THREE from 'three'

interface SceneState {
  // Camera
  cameraPosition: THREE.Vector3
  cameraTarget: THREE.Vector3
  setCameraPosition: (position: THREE.Vector3) => void
  setCameraTarget: (target: THREE.Vector3) => void
  
  // Background
  backgroundColor: string
  backgroundIntensity: number
  setBackground: (color: string, intensity?: number) => void
  
  // Effects
  postProcessing: {
    bloom: boolean
    chromatic: boolean
    vignette: boolean
  }
  toggleEffect: (effect: keyof SceneState['postProcessing']) => void
  
  // Time
  elapsed: number
  delta: number
  updateTime: (elapsed: number, delta: number) => void
}

export const useSceneStore = create<SceneState>()(
  subscribeWithSelector((set) => ({
    // State
    cameraPosition: new THREE.Vector3(0, 0, 5),
    cameraTarget: new THREE.Vector3(0, 0, 0),
    backgroundColor: '#000000',
    backgroundIntensity: 1,
    postProcessing: {
      bloom: true,
      chromatic: false,
      vignette: true,
    },
    elapsed: 0,
    delta: 0,

    // Actions
    setCameraPosition: (position) => set({ cameraPosition: position }),
    setCameraTarget: (target) => set({ cameraTarget: target }),
    
    setBackground: (color, intensity = 1) =>
      set({
        backgroundColor: color,
        backgroundIntensity: intensity,
      }),
      
    toggleEffect: (effect) =>
      set((state) => ({
        postProcessing: {
          ...state.postProcessing,
          [effect]: !state.postProcessing[effect],
        },
      })),
      
    updateTime: (elapsed, delta) => set({ elapsed, delta }),
  }))
)