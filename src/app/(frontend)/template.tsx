'use client'

import { usePathname } from 'next/navigation'
import { usePageTransitionContext } from '@/lib/contexts/page-transition-context'

interface TemplateProps {
  children: React.ReactNode
}

export default function Template({ children }: TemplateProps) {
  const pathname = usePathname()
  const { pageContentRef } = usePageTransitionContext()

  return (
    <div
      ref={pageContentRef}
      className="min-h-screen"
      data-page-content
      style={{
        position: 'relative',
        zIndex: 1000,
        backgroundColor: 'transparent',
        pointerEvents: 'auto',
      }}
    >
      {children}
    </div>
  )
}