import { FacebookService } from './facebook'
import { InstagramService } from './instagram'
import { TikTokService } from './tiktok'
import { SocialMediaService } from './types'

export * from './types'

export const socialMediaServices: Record<string, SocialMediaService> = {
  facebook: new FacebookService(),
  instagram: new InstagramService(),
  tiktok: new TikTokService(),
}

export function getService(platform: string): SocialMediaService {
  const service = socialMediaServices[platform]
  if (!service) {
    throw new Error(`Unsupported platform: ${platform}`)
  }
  return service
}
