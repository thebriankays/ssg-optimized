# CMS Integration Guide

## Overview

This guide covers how to integrate WebGL components with Payload CMS 3, including block creation, field configuration, and data flow patterns.

## Block Architecture

### WebGL Block Structure

Every WebGL-enabled block consists of four main files:

```
blocks/webgl/MyBlock/
├── Component.tsx       # Server component (data fetching)
├── Component.client.tsx # Client component (DOM + WebGL portal)
├── Scene.tsx          # WebGL scene component
└── config.ts          # Payload block configuration
```

### Basic Block Configuration

Create `blocks/webgl/Hero3D/config.ts`:

```typescript
import type { Block } from 'payload'

export const Hero3DBlock: Block = {
  slug: 'hero-3d',
  interfaceName: 'Hero3DBlock',
  labels: {
    singular: '3D Hero',
    plural: '3D Heroes',
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'subheadline',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'model',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: {
        mimeType: { contains: 'model/gltf' },
      },
      admin: {
        description: 'Upload a .glb or .gltf 3D model',
      },
    },
    {
      name: 'animation',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Float', value: 'float' },
            { label: 'Rotate', value: 'rotate' },
            { label: 'Bounce', value: 'bounce' },
            { label: 'Custom', value: 'custom' },
          ],
          defaultValue: 'float',
        },
        {
          name: 'speed',
          type: 'number',
          min: 0.1,
          max: 5,
          defaultValue: 1,
          admin: {
            step: 0.1,
          },
        },
      ],
    },
    {
      name: 'camera',
      type: 'group',
      fields: [
        {
          name: 'position',
          type: 'point',
          fields: [
            { name: 'x', type: 'number', defaultValue: 0 },
            { name: 'y', type: 'number', defaultValue: 0 },
            { name: 'z', type: 'number', defaultValue: 5 },
          ],
        },
        {
          name: 'fov',
          type: 'number',
          min: 20,
          max: 120,
          defaultValue: 50,
        },
      ],
    },
    {
      name: 'style',
      type: 'group',
      fields: [
        {
          name: 'background',
          type: 'radio',
          options: [
            { label: 'Transparent', value: 'transparent' },
            { label: 'Gradient', value: 'gradient' },
            { label: 'Environment', value: 'environment' },
          ],
          defaultValue: 'transparent',
        },
        {
          name: 'glassEffect',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
}
```

## Advanced Field Types

### Color Picker Field

Install a color picker plugin:

```bash
pnpm install @payloadcms/plugin-color-picker
```

Use in block config:

```typescript
import { colorPickerField } from '@payloadcms/plugin-color-picker'

{
  fields: [
    colorPickerField({
      name: 'primaryColor',
      label: 'Primary Color',
      defaultValue: '#3B82F6',
      admin: {
        position: 'sidebar',
      },
    }),
  ]
}
```

### WebGL-Specific Fields

Create custom field components for WebGL properties:

```typescript
// fields/Vector3Field.tsx
import { Field } from 'payload'

export const vector3Field = (
  name: string,
  label?: string,
  defaultValue = { x: 0, y: 0, z: 0 }
): Field => ({
  name,
  label: label || name,
  type: 'group',
  fields: [
    {
      name: 'x',
      type: 'number',
      defaultValue: defaultValue.x,
      admin: { width: '33%' },
    },
    {
      name: 'y',
      type: 'number',
      defaultValue: defaultValue.y,
      admin: { width: '33%' },
    },
    {
      name: 'z',
      type: 'number',
      defaultValue: defaultValue.z,
      admin: { width: '33%' },
    },
  ],
})

// Usage
{
  fields: [
    vector3Field('position', 'Position', { x: 0, y: 0, z: 5 }),
    vector3Field('rotation', 'Rotation'),
    vector3Field('scale', 'Scale', { x: 1, y: 1, z: 1 }),
  ]
}
```

## Data Flow Patterns

### Server Component (Data Fetching)

Create `blocks/webgl/Hero3D/Component.tsx`:

```typescript
import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@/payload.config'
import { Hero3DClient } from './Component.client'
import type { Hero3DBlock as Hero3DBlockType } from '@/payload-types'

export async function Hero3DBlock(props: Hero3DBlockType) {
  const payload = await getPayloadHMR({ config: configPromise })
  
  // Fetch related media
  let modelData = null
  if (props.model && typeof props.model === 'string') {
    const { docs } = await payload.find({
      collection: 'media',
      where: { id: { equals: props.model } },
      depth: 0,
    })
    modelData = docs[0]
  } else {
    modelData = props.model
  }
  
  // Fetch any additional data
  const settings = await payload.findGlobal({
    slug: 'site-settings',
  })
  
  return (
    <Hero3DClient 
      {...props} 
      model={modelData}
      siteSettings={settings}
    />
  )
}
```

### Client Component

Create `blocks/webgl/Hero3D/Component.client.tsx`:

```typescript
'use client'

import { useRef, useState } from 'react'
import { WebGLView } from '@/components/canvas/WebGLView'
import { Hero3DScene } from './Scene'
import { GlassCard } from '@/components/ui/glass/GlassCard'
import { useGSAPAnimation } from '@/hooks/animation/useGSAPAnimation'
import type { Media } from '@/payload-types'

interface Hero3DClientProps {
  headline: string
  subheadline?: string
  model: Media
  animation: {
    enabled: boolean
    type: string
    speed: number
  }
  camera: {
    position: { x: number; y: number; z: number }
    fov: number
  }
  style: {
    background: string
    glassEffect: boolean
  }
}

export function Hero3DClient({
  headline,
  subheadline,
  model,
  animation,
  camera,
  style,
}: Hero3DClientProps) {
  const containerRef = useRef<HTMLDivElement>(null!)
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Animate text on mount
  useGSAPAnimation(() => {
    if (!isLoaded) return
    
    const tl = gsap.timeline()
    
    tl.from('.hero-headline', {
      y: 100,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out',
    })
    .from('.hero-subheadline', {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    }, '-=0.8')
  }, [isLoaded])
  
  return (
    <section ref={containerRef} className="hero-3d">
      {/* WebGL Background */}
      <WebGLView
        track={containerRef}
        className="hero-3d__canvas"
        viewport={style.background === 'environment'}
      >
        <Hero3DScene
          modelUrl={model.url}
          animation={animation}
          camera={camera}
          onLoad={() => setIsLoaded(true)}
        />
      </WebGLView>
      
      {/* Content Overlay */}
      <div className="hero-3d__content">
        <GlassCard variant={style.glassEffect ? 'frosted' : 'clear'}>
          <h1 className="hero-headline">{headline}</h1>
          {subheadline && (
            <p className="hero-subheadline">{subheadline}</p>
          )}
        </GlassCard>
      </div>
    </section>
  )
}
```

## Global Configuration

### Site Settings Global

Create `globals/SiteSettings.ts`:

```typescript
import type { GlobalConfig } from 'payload'
import { colorPickerField } from '@payloadcms/plugin-color-picker'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  fields: [
    {
      name: 'webgl',
      type: 'group',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Enable WebGL features globally',
          },
        },
        {
          name: 'quality',
          type: 'select',
          options: [
            { label: 'Auto', value: 'auto' },
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
          ],
          defaultValue: 'auto',
        },
        {
          name: 'background',
          type: 'group',
          fields: [
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Gradient', value: 'gradient' },
                { label: 'Particles', value: 'particles' },
                { label: 'Fluid', value: 'fluid' },
              ],
              defaultValue: 'gradient',
            },
            colorPickerField({ name: 'color1', defaultValue: '#000000' }),
            colorPickerField({ name: 'color2', defaultValue: '#1a1a1a' }),
            colorPickerField({ name: 'color3', defaultValue: '#2a2a2a' }),
            {
              name: 'intensity',
              type: 'number',
              min: 0,
              max: 1,
              defaultValue: 0.5,
              admin: { step: 0.1 },
            },
          ],
        },
      ],
    },
    {
      name: 'animations',
      type: 'group',
      fields: [
        {
          name: 'smoothScroll',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'pageTransitions',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'reducedMotion',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Respect prefers-reduced-motion',
          },
        },
      ],
    },
  ],
}
```

### Using Global Settings

```typescript
// In layout or provider
import { getPayloadHMR } from '@payloadcms/next/utilities'

export async function RootLayout({ children }) {
  const payload = await getPayloadHMR({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  
  return (
    <html>
      <body>
        <Providers settings={settings}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

## Custom Admin UI

### Block Preview Component

Create `admin/components/BlockPreview.tsx`:

```typescript
import { useFormFields } from 'payload/components/forms'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export function Hero3DPreview() {
  const { headline, model } = useFormFields(([fields]) => ({
    headline: fields.headline?.value,
    model: fields.model?.value,
  }))
  
  if (!model?.url) {
    return (
      <div className="block-preview block-preview--empty">
        <p>Upload a model to see preview</p>
      </div>
    )
  }
  
  return (
    <div className="block-preview">
      <div className="block-preview__canvas">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls />
          <Suspense fallback={null}>
            <Model url={model.url} />
          </Suspense>
        </Canvas>
      </div>
      <div className="block-preview__content">
        <h3>{headline || 'Headline'}</h3>
      </div>
    </div>
  )
}
```

### Custom Field Component

```typescript
// admin/fields/ModelSelector.tsx
import { useField } from 'payload/components/forms'
import { useEffect, useState } from 'react'

export function ModelSelector({ path, label }) {
  const { value, setValue } = useField<string>({ path })
  const [preview, setPreview] = useState<string>()
  
  useEffect(() => {
    if (value) {
      // Generate preview thumbnail
      generateModelThumbnail(value).then(setPreview)
    }
  }, [value])
  
  return (
    <div className="model-selector">
      <label>{label}</label>
      {preview && (
        <img 
          src={preview} 
          alt="Model preview" 
          className="model-selector__preview"
        />
      )}
      <button
        onClick={() => {
          // Open model browser
          openModelBrowser((modelId) => setValue(modelId))
        }}
      >
        Select Model
      </button>
    </div>
  )
}
```

## Hooks and Validation

### Before Change Hook

```typescript
// collections/Pages.ts
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Validate WebGL blocks
        if (data.blocks) {
          for (const block of data.blocks) {
            if (block.blockType === 'hero-3d') {
              // Ensure model is optimized
              if (block.model) {
                const isOptimized = await checkModelOptimization(block.model)
                if (!isOptimized) {
                  throw new Error('Model must be optimized before use')
                }
              }
            }
          }
        }
        
        return data
      },
    ],
  },
}
```

### After Read Hook

```typescript
// Transform data after reading from database
afterRead: [
  async ({ doc, req }) => {
    // Add computed properties
    if (doc.blocks) {
      doc.blocks = doc.blocks.map(block => {
        if (block.blockType === 'hero-3d') {
          return {
            ...block,
            _computed: {
              estimatedLoadTime: calculateLoadTime(block.model),
              performanceImpact: assessPerformanceImpact(block),
            },
          }
        }
        return block
      })
    }
    
    return doc
  },
]
```

## Best Practices

### 1. Data Structure
- Keep WebGL configuration separate from content
- Use groups to organize related fields
- Provide sensible defaults for all values

### 2. Performance
- Lazy load block components
- Validate asset sizes in hooks
- Cache computed values

### 3. User Experience
- Provide visual previews in admin
- Add helpful descriptions
- Validate inputs to prevent errors

### 4. Type Safety
- Generate types with `payload generate:types`
- Use generated types in components
- Validate data at runtime

### 5. Extensibility
- Use consistent naming conventions
- Document custom fields
- Create reusable field configurations