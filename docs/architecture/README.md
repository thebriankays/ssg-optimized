# Payload CMS 3 + React Three Fiber Architecture

## 🚀 Overview

This is a comprehensive, production-ready architecture for building immersive web experiences using Payload CMS 3, Next.js 15, and React Three Fiber with a shared canvas approach. The architecture emphasizes performance, maintainability, and a seamless integration between 2D DOM content and 3D WebGL experiences.

### Core Philosophy: Progressive Enhancement

- Start with semantic HTML and robust server-rendered content
- Layer WebGL experiences on top without compromising accessibility
- Maintain SEO-friendly, performant base functionality
- Gracefully degrade on less capable devices

## 📚 Table of Contents

1. [Architecture Overview](./01-architecture-overview.md)
2. [Setup & Installation](./02-setup-installation.md)
3. [Shared Canvas System](./03-shared-canvas-system.md)
4. [Providers & State Management](./04-providers-state.md)
5. [Animation System](./05-animation-system.md)
6. [WebGL Components Guide](./06-webgl-components.md)
7. [Glass Design System](./07-glass-design-system.md)
8. [Performance Optimization](./08-performance.md)
9. [CMS Integration](./09-cms-integration.md)
10. [Deployment Guide](./10-deployment.md)

## 🏗️ Architecture Stack

### Core Technologies
- **CMS**: Payload CMS 3
- **Framework**: Next.js 15 (App Router)
- **3D Engine**: React Three Fiber + Drei
- **Scroll System**: @14islands/r3f-scroll-rig
- **Animation**: GSAP + ScrollTrigger
- **State**: Zustand
- **Styling**: Tailwind CSS + SCSS
- **Mouse Effects**: Cuberto Mouse Follower

### Key Features
- ✅ Single persistent WebGL canvas
- ✅ DOM-synchronized 3D elements
- ✅ Smooth scroll with Lenis
- ✅ Advanced glass morphism design
- ✅ CMS-driven 3D content blocks
- ✅ Performance-optimized rendering
- ✅ SEO-friendly with SSR/SSG
- ✅ Responsive and accessible

## 🎯 Design Principles

1. **Single Canvas Architecture**: One persistent WebGL context that survives route changes
2. **View-Based Rendering**: Each CMS block can render into the shared canvas
3. **Hybrid Glass System**: CSS for UI elements, WebGL for 3D effects
4. **CMS-First**: All content manageable through Payload admin
5. **Performance First**: Target 60fps on mid-range devices
6. **Progressive Enhancement**: Core functionality works without JavaScript

## 📁 Project Structure

```
ssg-optimized/
├── src/
│   ├── app/
│   │   ├── (frontend)/
│   │   │   ├── layout.tsx          # Main layout with providers
│   │   │   └── [slug]/page.tsx    # Dynamic pages
│   │   └── (payload)/              # Admin routes
│   ├── blocks/
│   │   ├── webgl/                  # WebGL-enabled blocks
│   │   │   ├── Hero3D/
│   │   │   ├── TravelGlobe/
│   │   │   ├── AreaExplorer/
│   │   │   └── ...
│   │   └── standard/               # Regular blocks
│   ├── components/
│   │   ├── canvas/                 # R3F components
│   │   │   ├── Background/
│   │   │   ├── scenes/
│   │   │   └── materials/
│   │   ├── ui/
│   │   │   └── glass/              # Glass UI components
│   │   └── providers/              # Context providers
│   ├── hooks/
│   │   ├── webgl/                  # WebGL-specific hooks
│   │   └── animation/              # Animation hooks
│   ├── lib/
│   │   ├── stores/                 # Zustand stores
│   │   ├── utils/                  # Utilities
│   │   └── animations/             # GSAP configurations
│   └── styles/
│       ├── glass/                  # Glass system styles
│       └── globals.scss            # Global styles
├── public/
│   ├── models/                     # 3D models
│   ├── textures/                   # Textures
│   └── fonts/                      # Fonts
└── docs/                           # This documentation
```

## 🚦 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
```

## 📖 Next Steps

- Read the [Architecture Overview](./01-architecture-overview.md) for detailed system design
- Follow the [Setup & Installation Guide](./02-setup-installation.md) to get started
- Learn about the [Shared Canvas System](./03-shared-canvas-system.md) for WebGL integration
- Explore [WebGL Components Guide](./06-webgl-components.md) for building 3D blocks

## 🤝 Contributing

When adding new features:
1. Follow the established patterns in this documentation
2. Ensure components work with the shared canvas
3. Test performance impact
4. Update relevant documentation
5. Add TypeScript types

## 📝 License

This architecture is designed for the Payload CMS 3 website template and follows its licensing terms.