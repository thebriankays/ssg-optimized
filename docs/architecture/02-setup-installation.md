# Setup & Installation Guide

## Prerequisites

- Node.js 18.20.2+ or 20.9.0+
- pnpm 9+ or 10+
- PostgreSQL database (or MongoDB)
- Google Maps API key (for map features)
- Basic knowledge of React, TypeScript, and Three.js

## Complete Package Installation

Run the following command to install all required packages:

```bash
pnpm install @react-three/fiber @react-three/drei @react-three/postprocessing three @types/three \
  @14islands/r3f-scroll-rig @studio-freight/lenis @studio-freight/tempus \
  gsap @gsap/react @types/gsap mouse-follower \
  zustand immer \
  troika-three-text @react-three/flex r3f-perf \
  three-stdlib maath tunnel-rat valtio \
  @googlemaps/js-api-loader @vis.gl/react-google-maps \
  react-intersection-observer react-use-measure \
  @react-spring/three leva \
  glsl-noise simplex-noise \
  postprocessing \
  react-colorful @payloadcms/plugin-lexical-playground
```

### Package Breakdown

#### Core 3D Libraries
- `@react-three/fiber`: React renderer for Three.js
- `@react-three/drei`: Useful helpers and abstractions
- `three`: The WebGL library
- `@types/three`: TypeScript definitions

#### Scroll & Animation
- `@14islands/r3f-scroll-rig`: DOM-WebGL scroll synchronization
- `@studio-freight/lenis`: Smooth scroll library
- `gsap`: Industry-standard animation library
- `mouse-follower`: Cuberto mouse follower

#### State Management
- `zustand`: Lightweight state management
- `valtio`: Proxy-based state for Three.js
- `immer`: Immutable state updates

#### Utilities
- `troika-three-text`: High-quality 3D text
- `three-stdlib`: Standard Three.js utilities
- `tunnel-rat`: React portal for canvas
- `react-intersection-observer`: Viewport detection
- `react-use-measure`: Element measurement

#### Maps
- `@googlemaps/js-api-loader`: Google Maps loader
- `@vis.gl/react-google-maps`: React Google Maps

## Environment Configuration

Create or update `.env.local`:

```bash
# Database
DATABASE_URI=postgresql://user:password@localhost:5432/your-db
# Or for MongoDB:
# DATABASE_URI=mongodb://localhost:27017/your-db

# Payload
PAYLOAD_SECRET=your-secret-key-here-min-32-chars
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Optional: GSAP Premium (if you have access)
GSAP_AUTH_TOKEN=your-gsap-token

# Development
NEXT_PUBLIC_IS_LIVE=false
NEXT_PUBLIC_DRAFT_SECRET=your-draft-secret

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Project Configuration

### 1. Update `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/postprocessing'],
  webpack: (config, { isServer }) => {
    // Handle GLSL/shader files
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ['raw-loader', 'glslify-loader'],
    })

    // Handle .gltf/.glb files
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    })

    // Fix for canvas in SSR
    if (isServer) {
      config.externals.push({
        canvas: 'commonjs canvas',
      })
    }

    return config
  },
  images: {
    domains: ['localhost', 'your-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
```

### 2. Update `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/ui/*": ["./src/components/ui/*"],
      "@/canvas/*": ["./src/components/canvas/*"],
      "@/blocks/*": ["./src/blocks/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/styles/*": ["./src/styles/*"]
    },
    "types": ["@react-three/fiber"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. Install Additional Dev Dependencies

```bash
pnpm install -D @types/node @types/react @types/react-dom \
  raw-loader glslify-loader glslify \
  sass
```

## Initial Project Setup

### 1. Create Core Directories

```bash
mkdir -p src/components/{canvas,providers,ui/glass}
mkdir -p src/hooks/{webgl,animation}
mkdir -p src/lib/{stores,utils,animations}
mkdir -p src/blocks/webgl
mkdir -p src/styles/{glass,animations}
mkdir -p public/{models,textures,fonts}
```

### 2. GSAP Registration

If using GSAP premium plugins, create `src/lib/gsap-registration.ts`:

```typescript
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin'
import { CustomEase } from 'gsap/CustomEase'

// Register plugins
gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
  DrawSVGPlugin,
  MorphSVGPlugin,
  CustomEase
)

// Configure defaults
gsap.config({
  nullTargetWarn: false,
  force3D: true,
})

// Default ease
gsap.defaults({
  ease: 'power3.out',
  duration: 1,
})

export { gsap, ScrollTrigger, SplitText }
```

### 3. TypeScript Type Extensions

Create `src/types/three.d.ts`:

```typescript
import { Object3DNode } from '@react-three/fiber'
import { Mesh } from 'three'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      scrollScene: Object3DNode<any, any>
      viewportScrollScene: Object3DNode<any, any>
    }
  }
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    mesh: Object3DNode<Mesh, typeof Mesh>
  }
}
```

## Verification Steps

### 1. Test Three.js Setup

Create `src/app/(frontend)/test-three/page.tsx`:

```typescript
'use client'

import { Canvas } from '@react-three/fiber'
import { Box } from '@react-three/drei'

export default function TestThree() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box>
          <meshStandardMaterial color="orange" />
        </Box>
      </Canvas>
    </div>
  )
}
```

### 2. Run Development Server

```bash
pnpm dev
```

Navigate to `http://localhost:3000/test-three` to verify the setup.

## Common Issues & Solutions

### Issue: Module not found errors
**Solution**: Clear cache and reinstall
```bash
rm -rf .next node_modules pnpm-lock.yaml
pnpm install
```

### Issue: WebGL context errors
**Solution**: Ensure only one Canvas is mounted
- Use the shared canvas pattern
- Check for duplicate Canvas components

### Issue: GSAP import errors
**Solution**: Use dynamic imports for client-only code
```typescript
const { gsap } = await import('gsap')
```

### Issue: Type errors with Three.js
**Solution**: Ensure @types/three version matches three version
```bash
pnpm list three @types/three
```

## Next Steps

1. Set up the [Shared Canvas System](./03-shared-canvas-system.md)
2. Configure [Providers & State Management](./04-providers-state.md)
3. Implement the [Animation System](./05-animation-system.md)
4. Create your first [WebGL Component](./06-webgl-components.md)