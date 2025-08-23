import type { TaskHandler } from 'payload'
import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

/**
 * Media optimization handler for images and videos
 * For travel sites, we prioritize quality over file size
 */
export const optimizeMediaHandler: TaskHandler<'optimize-media'> = async (args) => {
  const { job, req } = args
  const { mediaId, type, filePath } = job.input as { mediaId?: string; type?: string; filePath?: string }
  
  try {
    if (!mediaId) {
      throw new Error('No mediaId provided')
    }

    const media = await req.payload.findByID({
      collection: 'media',
      id: mediaId,
      depth: 0,
    })

    if (!media) {
      throw new Error('Media not found')
    }

    // Skip optimization status update for now
    // await req.payload.update({
    //   collection: 'media',
    //   id: mediaId,
    //   data: {
    //     optimizationStatus: 'processing'
    //   }
    // })

    const ext = path.extname(media.filename || '').toLowerCase()
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'].includes(ext)
    const isVideo = ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)

    if (isImage) {
      const imagePath = filePath || (media.filename ? path.join(process.cwd(), 'public', 'media', media.filename) : '')
      if (!imagePath) throw new Error('No valid image path')
      return await optimizeImage(media, imagePath, req)
    } else if (isVideo) {
      const videoPath = filePath || (media.filename ? path.join(process.cwd(), 'public', 'media', media.filename) : '')
      if (!videoPath) throw new Error('No valid video path')
      return await optimizeVideo(media, videoPath, req)
    } else {
      // Skip optimization status update for now
      // await req.payload.update({
      //   collection: 'media',
      //   id: mediaId,
      //   data: {
      //     optimizationStatus: 'skipped',
      //     optimizationData: { 
      //       error: 'Not an image or video file' 
      //     }
      //   }
      // })
      return { 
        output: {
          success: true, 
          message: 'File type not supported for optimization' 
        }
      }
    }

  } catch (error) {
    console.error('Media optimization error:', error)
    
    if (mediaId) {
      // Skip optimization status update for now
      // await req.payload.update({
      //   collection: 'media',
      //   id: mediaId,
      //   data: {
      //     optimizationStatus: 'failed',
      //     optimizationData: {
      //       error: error instanceof Error ? error.message : 'Unknown error'
      //     }
      //   }
      // }).catch(console.error)
    }
    
    throw error
  }
}

async function optimizeImage(media: any, inputPath: string, req: any) {
  const outputDir = path.dirname(inputPath)
  const baseName = path.basename(media.filename, path.extname(media.filename))
  const ext = path.extname(media.filename).toLowerCase()
  
  console.log(`Optimizing image: ${media.filename}`)
  
  // For travel sites, we DON'T want to degrade quality
  // Instead, we just ensure images are web-ready
  let outputPath: string
  
  const sharpInstance = sharp(inputPath)
  const metadata = await sharpInstance.metadata()
  
  // Only resize if REALLY large
  const maxWidth = 3840 // 4K width
  const maxHeight = 2160 // 4K height
  
  if ((metadata.width || 0) > maxWidth || (metadata.height || 0) > maxHeight) {
    sharpInstance.resize(maxWidth, maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
  }
  
  // Keep original format with high quality
  if (ext === '.jpg' || ext === '.jpeg') {
    outputPath = path.join(outputDir, `${baseName}-opt.jpg`)
    await sharpInstance
      .jpeg({
        quality: 95, // Very high quality
        mozjpeg: true, // Better compression algorithm
        progressive: true,
      })
      .toFile(outputPath)
  } else if (ext === '.png') {
    // PNG files stay as PNG for transparency
    outputPath = path.join(outputDir, `${baseName}-opt.png`)
    await sharpInstance
      .png({
        compressionLevel: 6,
        progressive: true,
      })
      .toFile(outputPath)
  } else if (ext === '.webp') {
    outputPath = path.join(outputDir, `${baseName}-opt.webp`)
    await sharpInstance
      .webp({
        quality: 95,
        effort: 6,
      })
      .toFile(outputPath)
  } else {
    // Skip optimization for other formats
    console.log('Unsupported image format for optimization, skipping')
    await req.payload.update({
      collection: 'media',
      id: media.id,
      data: {
        optimizationStatus: 'skipped',
        optimizationData: {
          error: 'Unsupported format'
        }
      }
    })
    return {
      output: {
        success: true,
        message: 'Format not supported for optimization'
      }
    }
  }
  
  // Check if optimization actually helped
  const [originalStats, optimizedStats] = await Promise.all([
    fs.stat(inputPath),
    fs.stat(outputPath)
  ])
  
  // If "optimized" is larger or barely smaller, skip it
  if (optimizedStats.size >= originalStats.size * 0.95) {
    console.log('Optimization provides minimal benefit, using original')
    
    // Try to delete with retry for Windows file locking
    let deleted = false
    for (let i = 0; i < 3; i++) {
      try {
        await fs.unlink(outputPath)
        deleted = true
        break
      } catch (err) {
        if (i === 2) {
          console.error('Could not delete optimized file:', err)
        } else {
          // Wait a bit and retry
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      }
    }
    
    await req.payload.update({
      collection: 'media',
      id: media.id,
      data: {
        optimizationStatus: 'skipped',
        optimizationData: {
          originalSize: originalStats.size,
          error: 'Minimal optimization benefit'
        }
      }
    })
    
    return {
      output: {
        success: true,
        message: 'Original image is already optimized'
      }
    }
  }
  
  const savedPercentage = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(2)
  const savedMB = ((originalStats.size - optimizedStats.size) / 1024 / 1024).toFixed(2)
  
  console.log(`Image optimization: ${(originalStats.size / 1024 / 1024).toFixed(2)}MB → ${(optimizedStats.size / 1024 / 1024).toFixed(2)}MB (${savedPercentage}% saved)`)
  
  await req.payload.update({
    collection: 'media',
    id: media.id,
    data: {
      optimizationStatus: 'completed' as const,
      optimizedPath: `/media/${path.basename(outputPath)}`,
      optimizationData: {
        originalSize: originalStats.size,
        optimizedSize: optimizedStats.size,
        savedPercentage: parseFloat(savedPercentage),
        savedMB: parseFloat(savedMB),
        error: null
      }
    }
  })
  
  return {
    output: {
      success: true,
      message: `Image optimized: saved ${savedPercentage}%`,
      originalSize: originalStats.size,
      optimizedSize: optimizedStats.size
    }
  }
}

async function optimizeVideo(media: any, inputPath: string, req: any) {
  const outputFilename = `${path.basename(media.filename, path.extname(media.filename))}-opt.mp4`
  const outputPath = path.join(path.dirname(inputPath), outputFilename)

  console.log('Starting video optimization...')
  console.log('Input:', inputPath)
  console.log('Output:', outputPath)

  const { exec } = await import('child_process')
  const { promisify } = await import('util')
  const execAsync = promisify(exec)
  
  try {
    await execAsync('ffmpeg -version')
  } catch (err) {
    throw new Error('System ffmpeg is not available. Please install ffmpeg on your system.')
  }

  // Simple optimization: just remove audio and ensure web compatibility
  const command = `ffmpeg -i "${inputPath}" -c:v copy -an -movflags +faststart -y "${outputPath}"`
  
  console.log('Running ffmpeg (stream copy, remove audio)...')
  
  try {
    await execAsync(command, { maxBuffer: 1024 * 1024 * 10 })
    console.log('Video optimization completed')
  } catch (error) {
    console.log('Stream copy failed, trying re-encode...')
    const fallbackCommand = `ffmpeg -i "${inputPath}" -c:v libx264 -preset fast -crf 20 -pix_fmt yuv420p -an -movflags +faststart -y "${outputPath}"`
    await execAsync(fallbackCommand, { maxBuffer: 1024 * 1024 * 10 })
  }

  const outputStats = await fs.stat(outputPath)
  if (outputStats.size === 0) {
    throw new Error('Output video file is empty')
  }

  const [originalStats, optimizedStats] = await Promise.all([
    fs.stat(inputPath),
    fs.stat(outputPath)
  ])

  const savedPercentage = ((originalStats.size - optimizedStats.size) / originalStats.size * 100).toFixed(2)
  const savedMB = ((originalStats.size - optimizedStats.size) / 1024 / 1024).toFixed(2)

  console.log(`Video optimization: ${(originalStats.size / 1024 / 1024).toFixed(2)}MB → ${(optimizedStats.size / 1024 / 1024).toFixed(2)}MB (${savedPercentage}% saved)`)

  await req.payload.update({
    collection: 'media',
    id: media.id,
    data: {
      optimizationStatus: 'completed' as const,
      optimizedPath: `/media/${outputFilename}`,
      optimizationData: {
        originalSize: originalStats.size,
        optimizedSize: optimizedStats.size,
        savedPercentage: parseFloat(savedPercentage),
        savedMB: parseFloat(savedMB),
        error: null
      }
    }
  })

  return {
    output: {
      success: true,
      message: `Video optimized: saved ${savedPercentage}%`,
      originalSize: originalStats.size,
      optimizedSize: optimizedStats.size,
    }
  }
}

export async function testFFmpeg() {
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)
    
    const { stdout } = await execAsync('ffmpeg -version')
    const version = stdout.split('\n')[0]
    
    return { 
      available: true, 
      version,
      path: 'System PATH' 
    }
  } catch (error) {
    return { 
      available: false, 
      error: 'FFmpeg not found in system PATH. Please install ffmpeg.' 
    }
  }
}