'use client'

import { createContext, useContext, useRef, MutableRefObject } from 'react'

interface PageTransitionContextType {
  pageContentRef: MutableRefObject<HTMLDivElement | null>
}

const PageTransitionContext = createContext<PageTransitionContextType | null>(null)

export function usePageTransitionContext() {
  const context = useContext(PageTransitionContext)
  if (!context) {
    throw new Error('usePageTransitionContext must be used within PageTransitionProvider')
  }
  return context
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pageContentRef = useRef<HTMLDivElement>(null)
  
  return (
    <PageTransitionContext.Provider value={{ pageContentRef }}>
      {children}
    </PageTransitionContext.Provider>
  )
}