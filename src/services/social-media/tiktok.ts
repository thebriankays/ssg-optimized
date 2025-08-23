import { 
  SocialMediaService, 
  OAuthTokens, 
  SocialMediaPost, 
  PublishResult, 
  PostAnalytics,
  SocialMediaError 
} from './types'

const TIKTOK_API_URL = 'https://open.tiktokapis.com/v2'
const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY!
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET!

export class TikTokService implements SocialMediaService {
  getAuthUrl(redirectUri: string): string {
    const params = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'user.info.basic,video.publish,video.upload',
    })
    
    return `https://www.tiktok.com/v2/auth/authorize?${params.toString()}`
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<OAuthTokens> {
    try {
      const response = await fetch(`${TIKTOK_API_URL}/oauth/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: TIKTOK_CLIENT_KEY,
          client_secret: TIKTOK_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new SocialMediaError(
          'Failed to exchange code for token',
          'tiktok',
          error.error?.code,
          error
        )
      }

      const data = await response.json()

      // Get user info
      const userResponse = await fetch(`${TIKTOK_API_URL}/user/info/`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
        },
      })

      if (!userResponse.ok) {
        throw new SocialMediaError('Failed to get user info', 'tiktok')
      }

      const userData = await userResponse.json()

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
        userId: userData.data?.user?.open_id,
        userName: userData.data?.user?.display_name,
      }
    } catch (error) {
      if (error instanceof SocialMediaError) throw error
      throw new SocialMediaError('TikTok OAuth failed', 'tiktok', undefined, error)
    }
  }

  async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    try {
      const response = await fetch(`${TIKTOK_API_URL}/oauth/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: TIKTOK_CLIENT_KEY,
          client_secret: TIKTOK_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new SocialMediaError(
          'Failed to refresh token',
          'tiktok',
          error.error?.code,
          error
        )
      }

      const data = await response.json()

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      }
    } catch (error) {
      if (error instanceof SocialMediaError) throw error
      throw new SocialMediaError('TikTok token refresh failed', 'tiktok', undefined, error)
    }
  }

  async createPost(tokens: OAuthTokens, post: SocialMediaPost): Promise<PublishResult> {
    try {
      if (!post.media || post.media.length === 0 || !post.media[0] || post.media[0].type !== 'video') {
        throw new SocialMediaError('TikTok requires a video', 'tiktok')
      }

      const video = post.media![0]

      // For TikTok video uploads, we have two options:
      // 1. Direct upload via API (requires video file handling)
      // 2. URL-based sharing (for videos already hosted online)
      
      // Option 1: If the video is hosted online, use URL sharing
      if (video.url && video.url.startsWith('http')) {
        // Initialize sharing with URL
        const shareResponse = await fetch(`${TIKTOK_API_URL}/share/video/upload/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            post_info: {
              title: this.formatCaption(post.content),
              privacy_level: post.platformSpecific?.tiktok?.privacy || 'MUTUAL_FOLLOW_FRIENDS',
              disable_duet: false,
              disable_comment: false,
              disable_stitch: false,
            },
            source_info: {
              source: 'PULL_FROM_URL',
              video_url: video.url,
            },
          }),
        })

        if (!shareResponse.ok) {
          const error = await shareResponse.json()
          throw new SocialMediaError(
            'Failed to share video on TikTok',
            'tiktok',
            error.error?.code,
            error
          )
        }

        const shareData = await shareResponse.json()
        
        // Poll for status
        const status = await this.pollUploadStatus(tokens.accessToken, shareData.publish_id)
        
        if (status === 'PUBLISH_COMPLETE') {
          return {
            postId: shareData.publish_id,
            url: `https://www.tiktok.com/@${tokens.userName}/video/${shareData.publish_id}`,
            publishedAt: new Date(),
          }
        } else {
          throw new SocialMediaError(`TikTok upload failed with status: ${status}`, 'tiktok')
        }
      }
      
      // Option 2: Direct file upload (requires implementation)
      throw new SocialMediaError(
        'Direct video file upload to TikTok requires additional implementation. Please ensure your video is hosted online with a public URL.',
        'tiktok'
      )
    } catch (error) {
      if (error instanceof SocialMediaError) throw error
      throw new SocialMediaError('Failed to create TikTok post', 'tiktok', undefined, error)
    }
  }

  private async pollUploadStatus(accessToken: string, publishId: string, maxAttempts = 30): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(
        `${TIKTOK_API_URL}/share/video/upload/status/?publish_id=${publishId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        const status = data.status?.publish_status
        
        if (status === 'PUBLISH_COMPLETE' || status === 'FAILED') {
          return status
        }
      }
      
      // Wait 2 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    return 'TIMEOUT'
  }

  async deletePost(tokens: OAuthTokens, postId: string): Promise<void> {
    // TikTok API doesn't support deleting posts programmatically
    throw new SocialMediaError('TikTok does not support post deletion via API', 'tiktok')
  }

  async getPostAnalytics(tokens: OAuthTokens, postId: string): Promise<PostAnalytics> {
    try {
      const response = await fetch(
        `${TIKTOK_API_URL}/video/query/?video_ids=${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
          },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new SocialMediaError(
          'Failed to get TikTok analytics',
          'tiktok',
          error.error?.code,
          error
        )
      }

      const data = await response.json()
      const video = data.videos?.[0]

      if (!video) {
        throw new SocialMediaError('Video not found', 'tiktok')
      }

      return {
        views: video.view_count,
        likes: video.like_count,
        comments: video.comment_count,
        shares: video.share_count,
        lastUpdated: new Date(),
      }
    } catch (error) {
      if (error instanceof SocialMediaError) throw error
      throw new SocialMediaError('Failed to get TikTok analytics', 'tiktok', undefined, error)
    }
  }

  private formatCaption(content: string): string {
    // TikTok caption limit is 2200 characters
    if (content.length > 2200) {
      content = content.substring(0, 2197) + '...'
    }
    return content
  }
}
