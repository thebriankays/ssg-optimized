# Glass Design System Documentation

## Overview

The glass design system in this project combines CSS glass morphism effects with WebGL liquid glass overlays to create a sophisticated, layered visual experience. This document explains the architecture and how to use it.

## Why the WebGL Glass Wasn't Initially Working

The `LiquidGlassEffect.tsx` component was created but not integrated because:

1. **Missing Integration Layer**: The component existed but wasn't connected to the shared canvas system
2. **No CMS Configuration**: There was no way to control the glass settings from the Payload CMS
3. **Missing Global Application**: The effect needed to be applied as a global overlay in the canvas provider
4. **Incomplete Documentation**: The glass system documentation mentioned in the architecture overview wasn't created

## Architecture

### 1. CSS Glass Effects (`glass-styles.scss`)
- **Purpose**: Provides glass morphism effects for UI elements
- **Features**:
  - Multiple variants (frosted, clear, refractive, holographic, liquid)
  - Interactive mouse tracking
  - Performance-optimized with CSS transforms
  - Accessibility support (reduced motion)

### 2. WebGL Glass Overlay (`GlassOverlay.tsx`)
- **Purpose**: Adds a global liquid glass distortion effect over the entire canvas
- **Features**:
  - Real-time liquid distortion
  - Mouse-responsive effects
  - Configurable intensity, speed, and distortion
  - Performance-aware (disables on low-quality settings)

### 3. Glass Panels 3D (`LiquidGlassEffect.tsx`)
- **Purpose**: Creates 3D glass panels that can be placed in scenes
- **Features**:
  - Multiple glass presets
  - Animated shader effects
  - Fresnel and chromatic aberration
  - Customizable dimensions and positions

## How It Works

### Layer Stack (bottom to top):
1. **Background**: Whatamesh or other WebGL backgrounds
2. **Content**: Your page content and blocks
3. **Glass Overlay**: Global WebGL distortion effect (subtle)
4. **CSS Glass**: UI elements with glass morphism

### Integration Points:

#### 1. Global Canvas Provider
```tsx
// src/providers/Canvas/CanvasProviderClient.tsx
<GlobalCanvas>
  {/* ... other elements ... */}
  <GlobalGlassOverlay settings={glassSettings} />
</GlobalCanvas>
```

#### 2. CMS Configuration
```tsx
// src/globals/SiteSettings.ts
glass: {
  webglOverlay: {
    enabled: true,
    intensity: 0.3,
    speed: 0.2,
    // ... other settings
  }
}
```

#### 3. Block-Level Usage
```tsx
// In any block component
import { GlassPanel3D } from '@/components/canvas/LiquidGlassEffect'

// Use within a ViewportScrollScene
<GlassPanel3D
  position={[0, 0, -5]}
  preset="liquid"
/>
```

## Usage Guide

### 1. Enable/Disable Global Glass Effect
Go to Payload Admin → Site Settings → Glass Design Settings → WebGL Glass Overlay

### 2. Use CSS Glass in Components
```tsx
<div className="glass-card glass-frosted glass-interactive">
  <h3>Your Content</h3>
</div>
```

### 3. Add 3D Glass Panels to Blocks
```tsx
import { UseCanvas, ViewportScrollScene } from '@14islands/r3f-scroll-rig'
import { GlassPanel3D } from '@/components/canvas/LiquidGlassEffect'

// In your component
<UseCanvas>
  <ViewportScrollScene track={ref}>
    {() => <GlassPanel3D preset="liquid" />}
  </ViewportScrollScene>
</UseCanvas>
```

### 4. Create Custom Glass Effects
Extend the `liquidDistortionShader` in `src/lib/glass/materials.ts`

## Performance Considerations

1. **Quality Levels**: Glass effects automatically disable on low-quality settings
2. **Mobile**: Reduced blur radius for better performance
3. **Reduced Motion**: Respects user preferences
4. **GPU Optimization**: Uses additive blending and minimal overdraw

## Glass Variants

### CSS Variants:
- **Frosted**: High blur, subtle opacity
- **Clear**: Minimal blur, high transparency
- **Refractive**: Light-bending shimmer effects
- **Holographic**: Animated color shifts
- **Liquid**: Dynamic mouse-following distortion

### WebGL Presets:
- Same variants but rendered in 3D with shader effects
- Additional properties: IOR, chromatic aberration, thickness

## Troubleshooting

### Glass effects not visible:
1. Check if WebGL is enabled in Site Settings
2. Verify quality setting is not "low"
3. Ensure the canvas provider is properly wrapped
4. Check browser supports backdrop-filter

### Performance issues:
1. Reduce intensity in Site Settings
2. Disable followMouse option
3. Use fewer 3D glass panels
4. Switch to CSS-only glass for UI elements

## Best Practices

1. **Subtlety is Key**: Keep intensity low (0.2-0.3) for the global overlay
2. **Layer Wisely**: Don't stack too many glass effects
3. **Test Performance**: Monitor FPS with different settings
4. **Accessibility**: Always provide non-glass fallbacks
5. **Progressive Enhancement**: CSS glass should work without WebGL

## Future Enhancements

1. **Post-processing Pipeline**: Integrate with @react-three/postprocessing
2. **Dynamic Presets**: Allow custom presets from CMS
3. **Texture Support**: Add normal maps for realistic glass
4. **Refraction Maps**: Use environment maps for realistic refraction
5. **Performance Metrics**: Add FPS counter to admin panel
