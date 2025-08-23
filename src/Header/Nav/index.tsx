'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
        return (
          <div key={i} className="text-white/90 hover:text-white transition-colors">
            <CMSLink {...link} appearance="inline" />
          </div>
        )
      })}
      <Link href="/search">
        <GlassContainer 
          preset="clear" 
          className="p-2 hover:scale-110 transition-transform"
          interactive
        >
          <span className="sr-only">Search</span>
          <SearchIcon className="w-5 text-white" />
        </GlassContainer>
      </Link>
    </nav>
  )
}
