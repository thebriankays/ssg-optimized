import { create } from 'zustand'

interface TransitionStore {
  isTransitioning: boolean
  direction: 'forward' | 'backward' | null
  onComplete: (() => void) | null
  startTransition: (direction: 'forward' | 'backward', onComplete?: () => void) => void
  endTransition: () => void
}

export const useTransitionStore = create<TransitionStore>((set) => ({
  isTransitioning: false,
  direction: null,
  onComplete: null,
  
  startTransition: (direction, onComplete) => {
    set({
      isTransitioning: true,
      direction,
      onComplete: onComplete || null
    })
  },
  
  endTransition: () => {
    set({
      isTransitioning: false,
      direction: null,
      onComplete: null
    })
  }
}))