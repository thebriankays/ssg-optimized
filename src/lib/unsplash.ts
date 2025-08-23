// lib/unsplash.ts

import { getLocalImages, saveImagesLocally } from './localImages'

// Special result type to handle 403 errors without breaking type safety
export type ImageFetchResult = UnsplashImage[] | { error: '403' }

// Define interfaces for Unsplash API response data
interface UnsplashPhotoUrls {
  raw: string
  full: string
  regular: string
  small: string
  thumb: string
}

interface UnsplashPhoto {
  id: string
  urls: UnsplashPhotoUrls
  width: number
  height: number
  blur_hash?: string
  // Add other properties you need from the Unsplash API
}

export interface UnsplashImage {
  url: string
  width: number
  height: number
  blurDataURL?: string
}

// Search for photos by category/query
export async function fetchUnsplashImagesByQuery(
  query: string,
  count: number = 30,
): Promise<ImageFetchResult> {
  // First check if we have local images for this query
  const localImages = await getLocalImages('unsplash', query, count)
  console.log(`Found ${localImages.length} local unsplash images for query: ${query}`)

  // If we have enough local images, return them
  if (localImages.length >= count) {
    return localImages.slice(0, count)
  }

  // If we don't have enough images, fetch from API
  const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

  if (!ACCESS_KEY) {
    console.warn('Missing Unsplash access key in environment variables')
    return generatePlaceholderImages(count) // Return placeholders if no API key
  }

  // Enforce the maximum count of 30 from Unsplash API
  const safeCount = Math.min(count, 30)
  // Calculate how many more images we need
  const remainingCount = Math.min(safeCount - localImages.length, safeCount)

  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&count=${remainingCount}`,
      {
        headers: {
          Authorization: `Client-ID ${ACCESS_KEY}`,
        },
        cache: 'no-store',
      },
    )

    // Log rate limit information
    const rateLimit = response.headers.get('X-Ratelimit-Limit')
    const rateLimitRemaining = response.headers.get('X-Ratelimit-Remaining')

    if (rateLimit && rateLimitRemaining) {
      console.log(`Unsplash API Rate Limit: ${rateLimitRemaining}/${rateLimit} remaining`)
    }

    if (!response.ok) {
      if (response.status === 403) {
        console.warn(
          'Unsplash API rate limit reached, switching to Pexels (50 requests/hour for demo apps)',
        )
        // Return error object to indicate 403 error for fallback to Pexels
        return { error: '403' }
      }
      console.warn(`Unsplash API responded with status: ${response.status}`)
      // Return local images plus placeholders for remaining
      if (localImages.length > 0) {
        const placeholders = generatePlaceholderImages(count - localImages.length)
        return [...localImages, ...placeholders]
      }
      return generatePlaceholderImages(count) // Return placeholders on other API errors
    }

    const data = (await response.json()) as UnsplashPhoto[]

    // Convert to our format - use FULL resolution for best quality
    const newImages = data.map((photo: UnsplashPhoto) => ({
      url: photo.urls.full || photo.urls.raw, // Use full resolution, fallback to raw
      width: photo.width,
      height: photo.height,
      blurDataURL: photo.blur_hash || undefined,
    }))

    // Save the new images locally for future use
    saveImagesLocally(newImages, 'unsplash', query)

    // Return a combination of local images and new images
    return [...localImages, ...newImages]
  } catch (error) {
    console.warn('Error fetching from Unsplash:', error)
    // Return local images if we have any, otherwise placeholders
    if (localImages.length > 0) {
      const placeholders = generatePlaceholderImages(count - localImages.length)
      return [...localImages, ...placeholders]
    }
    return generatePlaceholderImages(count) // Return placeholders on any error
  }
}

export async function fetchUnsplashImages(count: number = 30): Promise<ImageFetchResult> {
  // First check if we have local images in the root folder
  const localImages = await getLocalImages('unsplash', undefined, count)
  console.log(`Found ${localImages.length} local unsplash images from the root folder`)

  // If we have enough local images, return them
  if (localImages.length >= count) {
    return localImages.slice(0, count)
  }

  // If we don't have enough images, fetch from API
  const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

  if (!ACCESS_KEY) {
    console.error('Missing Unsplash access key in environment variables')
    return generatePlaceholderImages(count) // Return placeholders if no API key
  }

  // Enforce the maximum count of 30 from Unsplash API
  const safeCount = Math.min(count, 30)
  // Calculate how many more images we need
  const remainingCount = Math.min(safeCount - localImages.length, safeCount)

  try {
    const response = await fetch(`https://api.unsplash.com/photos/random?count=${remainingCount}`, {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
      cache: 'no-store',
    })

    // Log rate limit information
    const rateLimit = response.headers.get('X-Ratelimit-Limit')
    const rateLimitRemaining = response.headers.get('X-Ratelimit-Remaining')

    if (rateLimit && rateLimitRemaining) {
      console.log(`Unsplash API Rate Limit: ${rateLimitRemaining}/${rateLimit} remaining`)
    }

    if (!response.ok) {
      if (response.status === 403) {
        console.warn(
          'Unsplash API rate limit reached, switching to Pexels (50 requests/hour for demo apps)',
        )
        // Return error object to indicate 403 error for fallback to Pexels
        return { error: '403' }
      }
      console.warn(`Unsplash API responded with status: ${response.status}`)
      // Return local images plus placeholders for remaining
      if (localImages.length > 0) {
        const placeholders = generatePlaceholderImages(count - localImages.length)
        return [...localImages, ...placeholders]
      }
      return generatePlaceholderImages(count) // Return placeholders on other API errors
    }

    const data = (await response.json()) as UnsplashPhoto[]

    // Convert to our format - use FULL resolution for best quality
    const newImages = data.map((photo: UnsplashPhoto) => ({
      url: photo.urls.full || photo.urls.raw, // Use full resolution, fallback to raw
      width: photo.width,
      height: photo.height,
      blurDataURL: photo.blur_hash || undefined,
    }))

    // Save the new images locally for future use
    saveImagesLocally(newImages, 'unsplash')

    // Return a combination of local images and new images
    return [...localImages, ...newImages]
  } catch (error) {
    console.warn('Error fetching from Unsplash:', error)
    // Return local images if we have any, otherwise placeholders
    if (localImages.length > 0) {
      const placeholders = generatePlaceholderImages(count - localImages.length)
      return [...localImages, ...placeholders]
    }
    return generatePlaceholderImages(count) // Return placeholders on any error
  }
}

// You can add more Unsplash-related functions here as needed
export async function fetchUnsplashImagesByUsername(
  username: string,
  count: number = 30,
): Promise<ImageFetchResult> {
  // First check if we have local images for this username
  const localImages = await getLocalImages('unsplash', username, count)
  console.log(`Found ${localImages.length} local unsplash images for username: ${username}`)

  // If we have enough local images, return them
  if (localImages.length >= count) {
    return localImages.slice(0, count)
  }

  // If we don't have enough images, fetch from API
  const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

  if (!ACCESS_KEY) {
    console.error('Missing Unsplash access key in environment variables')
    return generatePlaceholderImages(count) // Return placeholders if no API key
  }

  // Enforce the maximum count of 30 from Unsplash API
  const safeCount = Math.min(count, 30)
  // Calculate how many more images we need
  const remainingCount = Math.min(safeCount - localImages.length, safeCount)

  try {
    const response = await fetch(
      `https://api.unsplash.com/users/${username}/photos?per_page=${remainingCount}`,
      {
        headers: {
          Authorization: `Client-ID ${ACCESS_KEY}`,
        },
        cache: 'no-store',
      },
    )

    // Log rate limit information
    const rateLimit = response.headers.get('X-Ratelimit-Limit')
    const rateLimitRemaining = response.headers.get('X-Ratelimit-Remaining')

    if (rateLimit && rateLimitRemaining) {
      console.log(`Unsplash API Rate Limit: ${rateLimitRemaining}/${rateLimit} remaining`)
    }

    if (!response.ok) {
      if (response.status === 403) {
        console.warn(
          'Unsplash API rate limit reached, switching to Pexels (50 requests/hour for demo apps)',
        )
        // Return error object to indicate 403 error for fallback to Pexels
        return { error: '403' }
      }
      console.warn(`Unsplash API responded with status: ${response.status}`)
      // Return local images plus placeholders for remaining
      if (localImages.length > 0) {
        const placeholders = generatePlaceholderImages(count - localImages.length)
        return [...localImages, ...placeholders]
      }
      return generatePlaceholderImages(count) // Return placeholders on other API errors
    }

    const data = (await response.json()) as UnsplashPhoto[]

    // Convert to our format - use FULL resolution for best quality
    const newImages = data.map((photo: UnsplashPhoto) => ({
      url: photo.urls.full || photo.urls.raw, // Use full resolution, fallback to raw
      width: photo.width,
      height: photo.height,
      blurDataURL: photo.blur_hash || undefined,
    }))

    // Save the new images locally for future use
    saveImagesLocally(newImages, 'unsplash', username)

    // Return a combination of local images and new images
    return [...localImages, ...newImages]
  } catch (error) {
    console.warn('Error fetching from Unsplash:', error)
    // Return local images if we have any, otherwise placeholders
    if (localImages.length > 0) {
      const placeholders = generatePlaceholderImages(count - localImages.length)
      return [...localImages, ...placeholders]
    }
    return generatePlaceholderImages(count) // Return placeholders on any error
  }
}

// Create placeholder images when Unsplash API fails
export function generatePlaceholderImages(count: number = 30): UnsplashImage[] {
  const placeholders: UnsplashImage[] = []
  const colors = [
    '#3498db',
    '#2ecc71',
    '#e74c3c',
    '#f39c12',
    '#9b59b6',
    '#1abc9c',
    '#d35400',
    '#c0392b',
    '#16a085',
    '#8e44ad',
    '#2980b9',
    '#27ae60',
    '#e67e22',
    '#f1c40f',
    '#34495e',
  ]

  for (let i = 0; i < count; i++) {
    const colorIndex = i % colors.length
    if (colors[colorIndex] === undefined) continue
    const width = Math.floor(Math.random() * 300) + 800 // Random width between 800-1100
    const height = Math.floor(Math.random() * 300) + 600 // Random height between 600-900

    // Create a data URL for a solid color placeholder
    const color = colors[colorIndex].replace('#', '')
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="#${color}"/>
      <text x="50%" y="50%" font-family="Arial" font-size="36" fill="white" text-anchor="middle" dominant-baseline="middle">Image ${i + 1}</text>
    </svg>`

    // Convert SVG to data URL
    const placeholderUrl = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`

    placeholders.push({
      url: placeholderUrl,
      width,
      height,
    })
  }

  return placeholders
}
