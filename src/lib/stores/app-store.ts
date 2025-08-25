import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface Location {
  id: string
  name: string
  coordinates: [number, number]
  description?: string
}

interface BackgroundSettings {
  type: 'none' | 'gradient' | 'particles' | 'fluid' | 'whatamesh'
  color1: string
  color2: string
  color3: string
  color4: string
  intensity: number
}

interface AppState {
  // Navigation
  isMenuOpen: boolean
  toggleMenu: () => void
  closeMenu: () => void
  
  // Loading
  isLoading: boolean
  loadingProgress: number
  setLoading: (loading: boolean, progress?: number) => void
  
  // Locations
  locations: Location[]
  selectedLocation: Location | null
  setLocations: (locations: Location[]) => void
  selectLocation: (location: Location | null) => void
  
  // WebGL
  webglEnabled: boolean
  setWebglEnabled: (enabled: boolean) => void
  backgroundSettings: BackgroundSettings | null
  setBackgroundSettings: (settings: BackgroundSettings) => void
  
  // Preferences
  preferences: {
    reducedMotion: boolean
    highContrast: boolean
    language: string
  }
  updatePreferences: (prefs: Partial<AppState['preferences']>) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set) => ({
        // State
        isMenuOpen: false,
        isLoading: false,
        loadingProgress: 0,
        locations: [],
        selectedLocation: null,
        webglEnabled: true,
        backgroundSettings: null,
        preferences: {
          reducedMotion: false,
          highContrast: false,
          language: 'en',
        },

        // Actions
        toggleMenu: () =>
          set((state) => {
            state.isMenuOpen = !state.isMenuOpen
          }),
          
        closeMenu: () =>
          set((state) => {
            state.isMenuOpen = false
          }),
          
        setLoading: (loading, progress = 0) =>
          set((state) => {
            state.isLoading = loading
            state.loadingProgress = progress
          }),
          
        setLocations: (locations) =>
          set((state) => {
            state.locations = locations
          }),
          
        selectLocation: (location) =>
          set((state) => {
            state.selectedLocation = location
          }),
          
        setWebglEnabled: (enabled) =>
          set((state) => {
            state.webglEnabled = enabled
          }),
          
        setBackgroundSettings: (settings) =>
          set((state) => {
            state.backgroundSettings = settings
          }),
          
        updatePreferences: (prefs) =>
          set((state) => {
            Object.assign(state.preferences, prefs)
          }),
      })),
      {
        name: 'app-storage',
        partialize: (state) => ({
          preferences: state.preferences,
        }),
      }
    )
  )
)