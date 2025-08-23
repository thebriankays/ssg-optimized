import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'
import { GlassButton } from '@/components/ui/glass/GlassComponents'

import type { Page, Post } from '@/payload-types'

type CMSLinkType = {
  appearance?: 'inline' | 'default' | 'outline' | 'secondary' | 'ghost'
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages' | 'posts'
    value: Page | Post | string | number
  } | null
  size?: 'sm' | 'md' | 'lg' | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps = 'md',
    url,
  } = props

  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
          reference.value.slug
        }`
      : url

  if (!href) return null

  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link 
        className={cn('hover:text-white/80 transition-colors', className)} 
        href={href || url || ''} 
        {...newTabProps}
      >
        {label && label}
        {children && children}
      </Link>
    )
  }

  const variant = appearance === 'ghost' ? 'ghost' : 
                  appearance === 'secondary' ? 'secondary' : 'primary'

  return (
    <GlassButton
      preset="frosted"
      size={sizeFromProps || 'md'}
      variant={variant}
      href={href || url || ''}
      className={className}
    >
      {label && label}
      {children && children}
    </GlassButton>
  )
}
