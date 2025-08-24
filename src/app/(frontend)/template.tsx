'use client'

import { usePathname } from 'next/navigation'

interface TemplateProps {
  children: React.ReactNode
}

export default function Template({ children }: TemplateProps) {
  const pathname = usePathname()

  return (
    <div
      id="page-content"
      key={pathname}
      className="min-h-screen"
    >
      {children}
    </div>
  )
}