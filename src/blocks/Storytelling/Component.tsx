import React from 'react'
import dynamic from 'next/dynamic'
import type { StorytellingBlock as StorytellingBlockType } from '../types'

// Dynamic import for client-side only rendering
const StorytellingClient = dynamic(
  () => import('./Component.client').then(mod => mod.StorytellingClient),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        width: '100%', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#000',
        color: '#fff'
      }}>
        <div>Loading story...</div>
      </div>
    )
  }
)

export const StorytellingBlock: React.FC<StorytellingBlockType> = ({ sections }) => {
  // Transform sections to match component interface
  const transformedSections = sections?.map((section: any, index: number) => {
    const baseSection: any = {
      id: `section-${index}`,
      type: section.type as any,
      title: section.title,
      subtitle: section.subtitle,
      layout: section.layout as any,
      animation: section.animation ? {
        type: section.animation.type as any,
        duration: section.animation.duration,
        delay: section.animation.delay,
      } : undefined,
      background: section.background ? {
        color: section.background.color,
        gradient: section.background.gradient,
        image: typeof section.background.image === 'object' 
          ? section.background.image?.url 
          : undefined,
        blur: section.background.blur,
        overlay: section.background.overlay,
      } : undefined,
    }
    
    // Handle content based on section type
    if (section.type === 'quote' && section.quote) {
      return {
        ...baseSection,
        content: section.quote,
      }
    }
    
    if (['intro', 'outro'].includes(section.type) && section.simpleContent) {
      return {
        ...baseSection,
        content: section.simpleContent,
      }
    }
    
    if (section.type === 'chapter' && section.content) {
      // Convert rich text to HTML string
      const contentHtml = section.content
        .map((block: any) => {
          if (block.type === 'paragraph') {
            return `<p>${block.children?.map((child: any) => child.text).join('') || ''}</p>`
          }
          if (block.type === 'heading') {
            const level = block.level || 3
            const text = block.children?.map((child: any) => child.text).join('') || ''
            return `<h${level}>${text}</h${level}>`
          }
          if (block.type === 'list') {
            const tag = block.listType === 'ordered' ? 'ol' : 'ul'
            const items = block.children?.map((item: any) => 
              `<li>${item.children?.map((child: any) => child.text).join('') || ''}</li>`
            ).join('') || ''
            return `<${tag}>${items}</${tag}>`
          }
          return ''
        })
        .join('')
      
      baseSection.content = contentHtml
    }
    
    // Handle media
    if (section.media && section.media.type !== 'none') {
      baseSection.media = {
        type: section.media.type as any,
        src: section.media.type === 'image' && typeof section.media.image === 'object'
          ? section.media.image?.url
          : section.media.type === 'video' && typeof section.media.video === 'object'
          ? section.media.video?.url
          : undefined,
        webglComponent: section.media.webglComponent,
        webglProps: section.media.webglProps 
          ? JSON.parse(section.media.webglProps as string)
          : undefined,
      }
    }
    
    return baseSection
  }) || []
  
  return <StorytellingClient sections={transformedSections} />
}