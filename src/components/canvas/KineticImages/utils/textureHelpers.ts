import * as THREE from 'three'

export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function createCollageTexture({
  images,
  gap = 10,
  canvasHeight = 512,
  canvasWidth = 512,
  axis = 'x',
}: {
  images: string[]
  gap?: number
  canvasHeight?: number
  canvasWidth?: number
  axis?: 'x' | 'y'
}): Promise<THREE.Texture> {
  // Load all images
  const imageElements = await Promise.all(images.map(src => loadImage(src)))
  
  // Calculate total dimensions
  const totalImages = imageElements.length
  const isHorizontal = axis === 'x'
  
  // Calculate dimensions for each image
  let imageWidth: number, imageHeight: number
  if (isHorizontal) {
    imageWidth = (canvasWidth - gap * (totalImages - 1)) / totalImages
    imageHeight = canvasHeight
  } else {
    imageWidth = canvasWidth
    imageHeight = (canvasHeight - gap * (totalImages - 1)) / totalImages
  }
  
  // Create canvas
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext('2d')!
  
  // Fill background
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  
  // Draw images
  imageElements.forEach((img, index) => {
    let x: number, y: number
    if (isHorizontal) {
      x = index * (imageWidth + gap)
      y = 0
    } else {
      x = 0
      y = index * (imageHeight + gap)
    }
    
    ctx.drawImage(img, x, y, imageWidth, imageHeight)
  })
  
  // Create texture
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  
  return texture
}

export function createGradientTexture(
  colors: string[] = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
  width = 512,
  height = 64
): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, width, 0)
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color)
  })
  
  // Fill canvas
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  // Create texture
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  
  return texture
}