# WebGL Page Transitions

A sophisticated page transition system that combines WebGL shader effects with smooth DOM animations for seamless navigation experiences.

## Features

- 🎨 **WebGL Shader Effects**: Beautiful curved mask transitions using custom fragment shaders
- 🔄 **Smooth DOM Animations**: GSAP-powered page content transitions
- 🏃‍♂️ **Performance Optimized**: Persistent WebGL canvas across routes
- 🎯 **Type Safe**: Full TypeScript support
- 🚀 **Next.js App Router**: Built for modern Next.js architecture
- 📱 **Responsive**: Works seamlessly on all devices

## How It Works

The system uses a persistent WebGL canvas that survives route changes, combined with template.tsx for DOM-level transitions:

1. **WebGL Layer**: Shader-based transition masks (persistent across routes)
2. **DOM Layer**: Page content animations using GSAP
3. **Navigation**: Smart link handling with transition triggers

## Basic Usage

### 1. HTML Links with Transitions

Add `data-transition` attribute to any internal link:

```tsx
import Link from 'next/link'

export function NavLink() {
  return (
    <Link href="/about" data-transition>
      About Us
    </Link>
  )
}
```

### 2. Programmatic Navigation

Use the `usePageTransition` hook for programmatic navigation:

```tsx
import { usePageTransition } from '@/components/transitions'

export function MyComponent() {
  const { navigateTo, createTransitionLink } = usePageTransition()

  const handleClick = () => {
    navigateTo('/contact', {
      delay: 500 // Optional delay in ms
    })
  }

  // Or create link props
  const linkProps = createTransitionLink('/services')

  return (
    <div>
      <button onClick={handleClick}>
        Contact Us
      </button>
      
      <a {...linkProps}>
        Our Services
      </a>
    </div>
  )
}
```

### 3. Skip Transitions

Disable transitions for specific links:

```tsx
// Via data attribute
<Link href="/admin" data-transition={false}>
  Admin (No Transition)
</Link>

// Via hook
const { navigateTo } = usePageTransition()
navigateTo('/admin', { skipTransition: true })
```

## Configuration

### Transition Timing

Modify transition timing in `PageTransitionManager.tsx`:

```tsx
// WebGL transition duration
duration: 1.25,
ease: 'power3.inOut'

// DOM animation timing
.to('#page-content', { 
  opacity: 1, 
  y: 0, 
  duration: 0.6,  // Adjust this
  ease: 'power2.out'
})
```

### Shader Customization

Modify the fragment shader in `PageTransition.tsx`:

```glsl
// Current curve intensity
uv.y -= ((sin(uv.x * M_PI) * uPower) * 0.25);

// For different effects:
// Straight line: Remove the sin calculation
// Different curve: Modify the sin function or use cos
// Multiple waves: Add multiple sin waves
```

## Loading States

### Route-Level Loading

Each route segment can have its own loading component:

```tsx
// app/[slug]/loading.tsx
export default function Loading() {
  return (
    <div className="loading-spinner">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  )
}
```

### Custom Loading States

Show loading during transitions:

```tsx
import { useState, useEffect } from 'react'

export function MyPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { navigateTo } = usePageTransition()

  const handleNavigation = async (href: string) => {
    setIsLoading(true)
    
    // Optional: Wait for async operations
    await someAsyncOperation()
    
    navigateTo(href)
    setIsLoading(false)
  }

  return (
    <div>
      {isLoading && <LoadingOverlay />}
      {/* Your content */}
    </div>
  )
}
```

## Architecture Details

### File Structure

```
src/
├── components/transitions/
│   ├── PageTransition.tsx          # WebGL shader transition
│   ├── PageTransitionManager.tsx   # Navigation orchestrator
│   └── index.ts                    # Exports
├── hooks/
│   └── usePageTransition.ts        # Transition utilities
├── app/
│   ├── template.tsx                # DOM transition wrapper
│   ├── loading.tsx                 # Global loading component
│   └── (frontend)/
│       └── layout.tsx              # Includes PageTransitionManager
```

### WebGL Canvas Persistence

The WebGL context is created once and persists across all route changes, ensuring:
- No expensive context recreation
- Smooth 60fps transitions
- Minimal memory usage
- No texture/geometry reloading

### Template vs Layout

- **layout.tsx**: Contains persistent elements (header, footer, canvas)
- **template.tsx**: Creates new instances for each route (enables transitions)

## Performance Considerations

### Optimizations Applied

1. **Persistent Canvas**: WebGL context survives route changes
2. **Efficient Shaders**: Minimal fragment shader operations
3. **GSAP Cleanup**: Proper animation cleanup with useGSAPAnimation hook
4. **Scroll Freezing**: Prevents scroll during transitions
5. **Event Delegation**: Single click handler for all transition links

### Mobile Optimization

The system automatically handles:
- Touch events
- Viewport meta tags
- Reduced motion preferences
- Performance scaling on lower-end devices

### Browser Support

- **Modern Browsers**: Full WebGL transition support
- **Fallback**: Graceful degradation to CSS transitions
- **IE/Legacy**: Basic page navigation without transitions

## Troubleshooting

### Common Issues

**Transitions not triggering:**
- Ensure `data-transition` attribute is present
- Check that links are internal (`href` starts with `/`)
- Verify PageTransitionManager is in layout.tsx

**Performance issues:**
- Monitor GPU usage in DevTools
- Consider reducing transition duration
- Check for memory leaks in cleanup functions

**Hydration errors:**
- Ensure template.tsx key is using pathname
- Check for server/client rendering mismatches

### Debug Mode

Enable debug logging:

```tsx
// In PageTransitionManager.tsx
console.log('Transition state:', transitionState)
console.log('Navigating to:', href)
```

## Examples

### Basic Navigation Menu

```tsx
import Link from 'next/link'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' }
]

export function Navigation() {
  return (
    <nav>
      {navItems.map(item => (
        <Link 
          key={item.href}
          href={item.href} 
          data-transition
          className="nav-link"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
```

### Advanced Button with Loading

```tsx
import { useState } from 'react'
import { usePageTransition } from '@/components/transitions'

export function CTAButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { navigateTo } = usePageTransition()

  const handleClick = async () => {
    setIsLoading(true)
    
    // Simulate API call or data loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    navigateTo('/signup', { delay: 200 })
    setIsLoading(false)
  }

  return (
    <button 
      onClick={handleClick}
      disabled={isLoading}
      className="cta-button"
    >
      {isLoading ? (
        <span className="flex items-center">
          <Spinner className="mr-2" />
          Getting Ready...
        </span>
      ) : (
        'Sign Up Now'
      )}
    </button>
  )
}
```

## Best Practices

1. **Always use data-transition**: For consistent UX across the app
2. **Handle loading states**: Provide feedback during longer operations
3. **Test on mobile**: Ensure transitions work smoothly on touch devices
4. **Consider accessibility**: Respect prefers-reduced-motion settings
5. **Monitor performance**: Use Chrome DevTools to track WebGL usage
6. **Graceful degradation**: Ensure basic navigation works without WebGL

## Browser Dev Tools

Monitor transition performance:

1. **Performance Tab**: Record during transitions to see frame rates
2. **Memory Tab**: Check for WebGL memory leaks
3. **Rendering Tab**: Enable "Paint flashing" to see repaint areas
4. **Console**: Look for WebGL warnings or errors

## Related Documentation

- [GSAP Best Practices](./gsap/best-practices.md)
- [React Three Fiber Performance](./react-three-fiber/performance-scaling.md)
- [Animation System](../src/providers/Animation/README.md)
- [Shared Canvas Architecture](./architecture/03-shared-canvas-system.md)