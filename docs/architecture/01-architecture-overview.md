# Architecture Overview

## System Design

This architecture implements a sophisticated web application that seamlessly blends traditional web content with immersive 3D experiences. The design prioritizes performance, maintainability, and user experience.

### Core Architecture Principles

#### 1. Persistent Global Canvas
Instead of creating multiple canvases (which leads to WebGL context limits), we maintain a single persistent `<Canvas>` that survives route changes. This approach:
- Reduces memory overhead
- Enables resource sharing between scenes
- Provides smoother transitions
- Maintains state between pages

#### 2. DOM-WebGL Synchronization
Using @14islands/r3f-scroll-rig, we synchronize WebGL objects with DOM elements:
- WebGL elements track their DOM counterparts
- Positions update in real-time during scroll
- Maintains pixel-perfect alignment
- Respects document flow and layout

#### 3. Progressive Enhancement
The application is built in layers:
1. **Base Layer**: Semantic HTML with full content
2. **Enhancement Layer**: CSS animations and effects
3. **Experience Layer**: WebGL and advanced interactions

### Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   DOM Content   │  │  WebGL Canvas   │              │
│  │  (Next.js SSR)  │  │    (R3F)        │              │
│  └────────┬────────┘  └────────┬────────┘              │
│           │                     │                        │
│  ┌────────┴─────────────────────┴────────┐              │
│  │        Scroll Synchronization         │              │
│  │      (@14islands/r3f-scroll-rig)     │              │
│  └───────────────────────────────────────┘              │
│           │                                              │
│  ┌────────┴────────────────────────────┐                │
│  │         State Management            │                │
│  │          (Zustand)                  │                │
│  └─────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Server (Next.js)                      │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Payload CMS   │  │   API Routes    │              │
│  │   Local API     │  │                 │              │
│  └────────┬────────┘  └────────┬────────┘              │
│           │                     │                        │
│  ┌────────┴─────────────────────┴────────┐              │
│  │          PostgreSQL Database          │              │
│  └───────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Layout Components

```typescript
// Root Layout (Persistent)
<RootLayout>
  <GlobalCanvas />          // Persistent WebGL context
  <SmoothScrollbar />       // Lenis smooth scroll
  <MouseFollower />         // Cursor effects
  <AnimationProvider />     // GSAP context
  {children}               // Page content
</RootLayout>
```

### 2. Page Components

```typescript
// Dynamic Page Component
<Page>
  <BlockRenderer blocks={blocks}>
    <Hero3DBlock />         // WebGL-enhanced hero
    <ContentBlock />        // Standard content
    <GlobeBlock />         // Interactive globe
    <GalleryBlock />       // WebGL image gallery
  </BlockRenderer>
</Page>
```

### 3. WebGL Block Pattern

Each WebGL-enabled block follows this pattern:

```typescript
// Block Component Structure
<BlockWrapper>
  <DOMContent />           // SEO-friendly HTML
  <UseCanvas>              // Portal to global canvas
    <ScrollScene>          // Tracks DOM element
      <WebGLContent />     // 3D content
    </ScrollScene>
  </UseCanvas>
</BlockWrapper>
```

## Data Flow

### 1. CMS → Component Flow
```
Payload CMS → Local API → getDocument() → Page Props → Block Renderer → Components
```

### 2. Scroll Event Flow
```
User Scroll → Lenis → ScrollTrigger → RAF Loop → Update Positions → Render
```

### 3. State Management Flow
```
User Interaction → Zustand Store → React Components → WebGL Scene
```

## Performance Strategy

### Rendering Optimization
- **Demand-driven rendering**: Only render when needed
- **Viewport culling**: Hide offscreen objects
- **LOD system**: Reduce complexity for distant objects
- **Instancing**: Batch similar geometries

### Asset Optimization
- **Progressive loading**: Load assets as needed
- **Texture compression**: Use basis/KTX2 formats
- **Model optimization**: Draco compression for geometry
- **Code splitting**: Lazy load heavy components

### Memory Management
- **Resource pooling**: Reuse geometries and materials
- **Disposal patterns**: Clean up on unmount
- **Texture atlasing**: Combine small textures
- **Geometry merging**: Reduce draw calls

## Security Considerations

### API Security
- Environment variable protection
- API key restrictions
- CORS configuration
- Rate limiting

### Content Security
- CSP headers for WebGL
- Sanitized user inputs
- Secure asset loading
- XSS prevention

## Scalability Patterns

### Horizontal Scaling
- Static generation for most pages
- CDN distribution
- Edge caching
- Incremental Static Regeneration

### Vertical Scaling
- Optimized database queries
- Efficient caching strategies
- Background job processing
- Resource prioritization

## Development Workflow

### Component Development
1. Create semantic HTML structure
2. Add responsive CSS styling
3. Implement WebGL enhancement
4. Test across devices
5. Optimize performance

### Integration Process
1. Define CMS schema
2. Create server component
3. Implement client features
4. Add animations
5. Test and deploy

## Monitoring & Analytics

### Performance Monitoring
- Core Web Vitals tracking
- WebGL performance metrics
- Error tracking
- User analytics

### Debug Tools
- React DevTools
- R3F DevTools
- Performance profiler
- Network inspector