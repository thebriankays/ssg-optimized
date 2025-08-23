# Mouse Follower Complete Guide

The website uses Cuberto Mouse Follower for custom cursor effects. You can control the cursor behavior using data attributes on any HTML element.

## Available Cursor States

### Sizes
- `-sm` - Small (0.75x scale)
- `-md` - Medium (1.5x scale)
- `-lg` - Large (2x scale)
- `-xl` - Extra Large (4x scale)
- `-xxl` - Extra Extra Large (6.25x scale)

### Colors
- `-color-yellow` - Yellow (#ffd074)
- `-color-turquois` - Turquoise (#15f0d1)
- `-color-green` - Green (#83B002)
- `-color-purple` - Purple (#a374ff)
- `-color-white` - White (#ffffff)
- `-color-black` - Black (#000000)

### Blend Modes
- `-exclusion` - Exclusion blend mode (default)
- `-difference` - Difference blend mode
- `-opaque` - Normal blend mode

### Special States
- `-hidden` - Hide cursor
- `-pointer` - Pointer cursor (smaller)
- `-active` - Active state (on click)
- `-drag` - Drag cursor for carousels (shows "DRAG" text)

## Basic Usage

```html
<!-- Simple size change -->
<div data-cursor="-lg">Large cursor</div>

<!-- With text -->
<div data-cursor="-lg" data-cursor-text="HELLO">Large cursor with text</div>

<!-- Drag cursor for carousels -->
<div data-cursor="-drag" data-cursor-text="DRAG">Draggable carousel</div>

<!-- Combined states -->
<div data-cursor="-xl -color-yellow -exclusion" data-cursor-text="CLICK">
  Extra large yellow cursor with text
</div>
```

## Component Examples

### WebGL Carousel
```jsx
<div 
  className="webgl-carousel"
  data-cursor="-drag"
  data-cursor-text="DRAG"
>
  {/* Carousel content */}
</div>
```

### 3D Carousel
```jsx
<div 
  className="threed-carousel"
  data-cursor="-drag"
  data-cursor-text="DRAG"
>
  {/* 3D carousel content */}
</div>
```

### Call to Action Button
```jsx
<button 
  data-cursor="-md -color-yellow"
  data-cursor-text="CLICK"
>
  Click Me
</button>
```

### Interactive Globe
```jsx
<div 
  className="globe-container"
  data-cursor="-lg"
  data-cursor-text="EXPLORE"
>
  {/* Globe content */}
</div>
```

### Navigation Links
```jsx
<nav>
  <a href="#" data-cursor="-sm -pointer">Home</a>
  <a href="#" data-cursor="-sm -pointer">About</a>
  <a href="#" data-cursor="-sm -pointer">Contact</a>
</nav>
```

### Hero Section
```jsx
<section 
  className="hero"
  data-cursor="-xl -color-purple"
  data-cursor-text="SCROLL"
>
  {/* Hero content */}
</section>
```

## Interactive Elements

### Text Cursor
```html
<!-- Shows text in cursor -->
<div data-cursor-text="HELLO">Hover for text</div>
```

### Icon Cursor
```html
<!-- Shows icon in cursor (requires SVG sprite setup) -->
<div data-cursor-icon="arrow-left">Show arrow icon</div>
```

### Image/Video Cursor
```html
<!-- Shows image in cursor -->
<div data-cursor-img="/path/to/image.jpg">Hover for image</div>

<!-- Shows video in cursor -->
<div data-cursor-video="/path/to/video.mp4">Hover for video</div>
```

### Sticky Cursor
```html
<!-- Makes cursor stick to element -->
<div data-cursor-stick>Sticky cursor</div>

<!-- Stick to specific element -->
<div data-cursor-stick="#target-element">
  <div id="target-element">Stick here</div>
</div>
```

## Size & Text Reference

| Size | Scale | Text Size | Use Case |
|------|-------|-----------|----------|
| `-sm` | 0.75x | 10px | Small buttons, links |
| Default | 1x | 12px | Normal navigation |
| `-md` | 1.5x | 12px | Important elements |
| `-lg` | 2x | 14px | CTAs, hero elements |
| `-xl` | 4x | 18px | Major interactions |
| `-xxl` | 6.25x | 28px | Full-screen elements |

## Drag Cursor Details

The drag cursor is specially designed for carousel components:
- Automatically shows at 2x scale (like `-lg`)
- Displays "DRAG" text
- Shows three horizontal lines icon below text
- Uses exclusion blend mode
- Perfect for draggable/swipeable components

## Automatic Detection

The following elements automatically get cursor states:
- All `<a>` tags and `.clickable` elements: `-pointer` state
- All `<iframe>`, `<input>`, `<textarea>`, `<select>` elements: `-hidden` state
- Elements with `data-cursor-pointer`: `-pointer` state
- Elements with `data-cursor-hidden`: `-hidden` state

## Custom Brackets Animation

The cursor includes animated colored brackets that rotate continuously:
- Top-left: Yellow (#fedc5d)
- Top-right: Red (#fd6a6b)
- Bottom-left: Blue (#5d62fb)
- Bottom-right: Yellow (#fedc5d)
- Center dot: White

## Testing

Create a test page at `/cursor-test` with this component:

```jsx
'use client'

export default function CursorTestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Cursor Test</h1>
      
      <div className="grid grid-cols-3 gap-4">
        <div 
          className="p-8 bg-gray-800 rounded"
          data-cursor="-sm"
          data-cursor-text="SMALL"
        >
          Small Cursor
        </div>
        
        <div 
          className="p-8 bg-gray-800 rounded"
          data-cursor="-lg -color-yellow"
          data-cursor-text="LARGE"
        >
          Large Yellow
        </div>
        
        <div 
          className="p-8 bg-gray-800 rounded"
          data-cursor="-drag"
          data-cursor-text="DRAG"
        >
          Drag Cursor
        </div>
      </div>
    </div>
  )
}
```

## Notes

1. **Performance**: The cursor uses GSAP for smooth 60fps animations
2. **Accessibility**: System cursor automatically shows for input fields
3. **Mobile**: The cursor is automatically disabled on touch devices
4. **Z-index**: Cursor has z-index of 9999 to stay on top
5. **Blend modes**: Work best on contrasting backgrounds
