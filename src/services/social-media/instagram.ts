import { 
  SocialMediaService, 
  OAuthTokens, 
  SocialMediaPost, 
  PublishResult, 
  PostAnalytics,
  SocialMediaError 
} from './types'

const INSTAGRAM_API_VERSION = 'v18.0'
// Instagram uses the same app as Facebook
const INSTAGRAM_APP_ID = process.env.FACEBOOK_APP_ID!
const INSTAGRAM_APP_SECRET = process.env.FACEBOOK_APP_SECRET!

export class InstagramService implements SocialMediaService {
  getAuthUrl(redirectUri: string): string {
    // Instagram Business accounts are managed through Facebook
    const params = new URLSearchParams({
      client_id: INSTAGRAM_APP_ID,
      redirect_uri: redirectUri,
      scope: 'instagram_basic,instagram_content_publish,instagram_manage_insights,pages_show_list',
      response_type: 'code',
      auth_type: 'rerequest',
    })
    
    return `https://www.facebook.com/${INSTAGRAM_API_VERSION}/dialog/oauth?${params.toString()}`
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<OAuthTokens> {
    try {
      // Exchange code for user access token
      const tokenResponse = await fetch(
        `https://graph.facebook.com/${INSTAGRAM_API_VERSION}/oauth/access_token?` +
        `client_id=${INSTAGRAM_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `client_secret=${INSTAGRAM_APP_SECRET}&` +
        `code=${code}`
      )

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json()
        throw new SocialMediaError(
          'Failed to exchange code for token',
          'instagram',
          error.error?.code,
          error
        )
      }

      const { access_token } = await tokenResponse.json()

      // Get user's Instagram Business accounts
      const pagesResponse = await fetch(
        `https://graph.facebook.com/${INSTAGRAM_API_VERSION}/me/accounts?fields=instagram_business_account,name&access_token=${access_token}`
      )

      if (!pagesResponse.ok) {
        throw new SocialMediaError('Failed to get Instagram accounts', 'instagram')
      }

      const pagesData = await pagesResponse.json()
      
      // Find first page with Instagram Business account
      const pageWithInstagram = pagesData.data?.find((page: any) => page.instagram_business_account)
      
      if (!pageWithInstagram) {
        throw new SocialMediaError('No Instagram Business account found', 'instagram')
      }

      // Get Instagram account details
      const igAccountResponse = await fetch(
        `https://graph.facebook.com/${INSTAGRAM_API_VERSION}/${pageWithInstagram.instagram_business_account.id}?` +
        `fields=username,name&access_token=${access_token}`
      )

      if (!igAccountResponse.ok) {
        throw new SocialMediaError('Failed to get Instagram account details', 'instagram')
      }

      const igAccount = await igAccountResponse.json()

      // Get long-lived token
      const longLivedResponse = await fetch(
        `https://graph.facebook.com/${INSTAGRAM_API_VERSION}/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${INSTAGRAM_APP_ID}&` +
        `client_secret=${INSTAGRAM_APP_SECRET}&` +
        `fb_exchange_token=${access_token}`
      )

      if (!longLivedResponse.ok) {
        throw new SocialMediaError('Failed to get long-lived token', 'instagram')
      }

      const { access_token: longLivedToken } = await longLivedResponse.json()

      return {
        accessToken: longLivedToken,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        userId: pageWithInstagram.instagram_business_account.id,
        userName: igAccount.username,
      }
    } catch (error) {
      if (error instanceof SocialMediaError) throw error
      throw new SocialMediaError('Instagram OAuth failed', 'instagram', undefined, error)
    }
  }

  async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    // Instagram tokens don't need refreshing if they're long-lived
    throw new SocialMediaError('Instagram tokens do not support refresh', 'instagram')
  }

  async createPost(tokens: OAuthTokens, post: SocialMediaPost): Promise<PublishResult> {
    try {
      if (!post.media || post.media.length === 0) {
        throw new SocialMediaError('Instagram requires at least one media item', 'instagram')
      }

      const igUserId = tokens.userId!
      const media = post.media![0] // Use first media for single post

      // Step 1: Create media container
      const containerParams = new URLSearchParams({
        access_token: tokens.accessToken,
      })

      if (media && media.type === 'image') {
        containerParams.append('image_url', media.url)
      } else if (media && media.type === 'video') {
        containerParams.append('video_url', media.url)
        containerParams.append('media_type', 'REELS')
      }

      // Add caption with hashtags
      const caption = this.formatCaption(post.content, post.platformSpecific?.instagram?.hashtags)
      containerParams.append('caption', caption)

      const containerResponse = await fetch(
        `https://graph.facebook.com/${INSTAGRAM_API_VERSION}/${igUserId}/media`,
        {
          method: 'POST',
          body: containerParams,
        }
      )

      if (!containerResponse.ok) {
        const error = await containerResponse.json()
        throw new SocialMediaError(
          'Failed to create media container',
          'instagram',
          error.error?.code,
          error
        )
      }

      const { id: containerId } = await containerResponse.json()

      // Step 2: Wait for media to be ready (especially for videos)
      await this.waitForMediaReady(tokens.accessToken, containerId)

      // Step 3: Publish the media
      const publishParams = new URLSearchParams({
        creation_id: containerId,
        access_token: tokens.accessToken,
      })

      const publishResponse = await fetch(
        `https://graph.facebook.com/${INSTAGRAM_API_VERSION}/${igUserId}/media_publish`,
        {
          method: 'POST',
          body: publishParams,
        }
      )

      if (!publishResponse.ok) {
        const error = await publishResponse.json()
        throw new SocialMediaError(
          'Failed to publish Instagram post',
          'instagram',
          error.error?.code,
          error
        )
      }

      const { id: postId } = await publishResponse.json()

      return {
        postId,
        url: `https://www.instagram.com/p/${postId}/`,
        publishedAt: new Date(),
      }
    } catch (error) {
      if (error instanceof SocialMediaError) throw error
      throw new SocialMediaError('Failed to create Instagram post', 'instagram', undefined, error)
    }
  }

  async deletePost(tokens: OAuthTokens, postId: string): Promise<void> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${INSTAGRAM_API_VERSION}/${postId}?access_token=${tokens.accessToken}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new SocialMediaError(
          'Failed to delete Instagram post',
          'instagram',
          error.error?.code,
          error
        )
      }
    } catch (error) {
      if (error instanceof SocialMediaError) throw error
      throw new SocialMediaError('Failed to delete Instagram post', 'instagram', undefined, error)
    }
  }

  async getPostAnalytics(tokens: OAuthTokens, postId: string): Promise<PostAnalytics> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${INSTAGRAM_API_VERSION}/${postId}/insights?` +
        `metric=impressions,reach,likes,comments,saves&` +
        `access_token=${tokens.accessToken}`
      )

      if (!response.ok) {
        const error = await response.json()
        throw new SocialMediaError(
          'Failed to get Instagram analytics',
          'instagram',
          error.error?.code,
          error
        )
      }

      const data = await response.json()
      const metrics: PostAnalytics = {
        lastUpdated: new Date(),
      }

      // Parse insights data
      if (data.data) {
        data.data.forEach((metric: any) => {
          const value = metric.values?.[0]?.value || 0
          switch (metric.name) {
            case 'impressions':
              metrics.impressions = value
              break
            case 'reach':
              metrics.reach = value
              break
            case 'likes':
              metrics.likes = value
              break
            case 'comments':
              metrics.comments = value
              break
            case 'saves':
              metrics.engagements = value // Using engagements for saves
              break
          }
        })
      }

      return metrics
    } catch (error) {
      if (error instanceof SocialMediaError) throw error
      throw new SocialMediaError('Failed to get Instagram analytics', 'instagram', undefined, error)
    }
  }

  private async waitForMediaReady(accessToken: string, containerId: string, maxAttempts = 10): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const statusResponse = await fetch(
        `https://graph.facebook.com/${INSTAGRAM_API_VERSION}/${containerId}?` +
        `fields=status_code&access_token=${accessToken}`
      )

      if (!statusResponse.ok) {
        throw new SocialMediaError('Failed to check media status', 'instagram')
      }

      const { status_code } = await statusResponse.json()

      if (status_code === 'FINISHED') {
        return
      } else if (status_code === 'ERROR') {
        throw new SocialMediaError('Media processing failed', 'instagram')
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    throw new SocialMediaError('Media processing timeout', 'instagram')
  }

  private formatCaption(content: string, hashtags?: string[]): string {
    let caption = content

    // Instagram caption limit is 2200 characters
    const hashtagsText = hashtags ? '\n\n' + hashtags.map(tag => `#${tag}`).join(' ') : ''
    const maxContentLength = 2200 - hashtagsText.length

    if (caption.length > maxContentLength) {
      caption = caption.substring(0, maxContentLength - 3) + '...'
    }

    return caption + hashtagsText
  }
}
