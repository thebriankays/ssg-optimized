import { create } from 'zustand'

interface TransitionState {
  isTransitioning: boolean
  direction: 'out' | 'in'
  pendingHref: string | null
  onComplete: (() => void) | null
  
  startTransition: (direction: 'out' | 'in', pendingHref?: string | null, onComplete?: () => void) => void
  endTransition: () => void
}

export const useTransitionStore = create<TransitionState>((set) => ({
  isTransitioning: false,
  direction: 'out',
  pendingHref: null,
  onComplete: null,
  
  startTransition: (direction, pendingHref = null, onComplete) => set({
    isTransitioning: true,
    direction,
    pendingHref,
    onComplete: onComplete || null
  }),
  
  endTransition: () => set({
    isTransitioning: false,
    pendingHref: null,
    onComplete: null
  })
}))