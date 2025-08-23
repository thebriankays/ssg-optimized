import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto relative">
      <GlassContainer preset="frosted" className="border-t border-white/10">
        <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
          <Link className="flex items-center group" href="/">
            <div className="transition-transform group-hover:scale-105">
              <Logo />
            </div>
          </Link>

          <nav className="flex flex-col md:flex-row gap-4 md:items-center">
            {navItems.map(({ link }, i) => {
              return (
                <CMSLink 
                  className="text-white/90 hover:text-white transition-colors duration-200" 
                  key={i} 
                  {...link} 
                />
              )
            })}
          </nav>
        </div>
      </GlassContainer>
    </footer>
  )
}
