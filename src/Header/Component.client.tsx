'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { GlassNav, GlassContainer } from '@/components/ui/glass/GlassComponents'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  // Handle scroll state for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <GlassNav fixed transparent={!scrolled} className="header-glass">
      <div className="container relative z-20" {...(theme ? { 'data-theme': theme } : {})}>
        <div className="py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <GlassContainer 
              preset="clear" 
              className="p-2 hover:scale-105 transition-transform"
              interactive
              glowOnHover
            >
              <Logo loading="eager" priority="high" className="invert dark:invert-0" />
            </GlassContainer>
          </Link>
          <HeaderNav data={data} />
        </div>
      </div>
    </GlassNav>
  )
}
