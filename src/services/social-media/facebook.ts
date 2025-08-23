import { 
  SocialMediaService, 
  OAuthTokens, 
  SocialMediaPost, 
  PublishResult, 
  PostAnalytics,
  SocialMediaError 
} from './types'

const FACEBOOK_API_VERSION = 'v18.0'
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID!
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET!

export class FacebookService implements SocialMediaService {
  getAuthUrl(redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: FACEBOOK_APP_ID,
      redirect_uri: redirectUri,
      scope: 'pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content',
      response_type: 'code',
      auth_type: 'rerequest',
    })
    
    return `https://www.facebook.com/${FACEBOOK_API_VERSION}/dialog/oauth?${params.toString()}`
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<OAuthTokens> {
    try {
      // Exchange code for user access token
      const tokenResponse = await fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/oauth/access_token?` +
        `client_id=${FACEBOOK_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `client_secret=${FACEBOOK_APP_SECRET}&` +
        `code=${code}`
      )

      if (!tokenResponse.ok) {
        const error = await tokenResponse.json()
        throw new SocialMediaError(
          'Failed to exchange code for token',
          'facebook',
          error.error?.code,
          error
        )
      }

      const { access_token, expires_in } = await tokenResponse.json()

      // Get user's pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/me/accounts?access_token=${access_token}`
      )

      if (!pagesResponse.ok) {
        throw new SocialMediaError('Failed to get user pages', 'facebook')
      }

      const pagesData = await pagesResponse.json()
      
      if (!pagesData.data || pagesData.data.length === 0) {
        throw new SocialMediaError('No Facebook pages found', 'facebook')
      }

      // Use the first page (in production, you might want to let user choose)
      const page = pagesData.data[0]

      // Get long-lived page access token
      const longLivedResponse = await fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${FACEBOOK_APP_ID}&` +
        `client_secret=${FACEBOOK_APP_SECRET}&` +
        `fb_exchange_token=${page.access_token}`
      )

      if (!longLivedResponse.ok) {
        throw new SocialMediaError('Failed to get long-lived token', 'facebook')
      }

      const { access_token: longLivedToken } = await longLivedResponse.json()

      return {
        accessToken: longLivedToken,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        pageId: page.id,
        pageName: page.name,
      }
    } catch (error) {
      if (error instanceof SocialMediaError) throw error
      throw new SocialMediaError('Facebook OAuth failed', 'facebook', undefined, error)
    }
  }

  async refreshToken(refreshToken: string): Promise<OAuthTokens> {
    // Facebook page tokens don't need refreshing if they're long-lived
    throw new SocialMediaError('Facebook tokens do not support refresh', 'facebook')
  }

  async createPost(tokens: OAuthTokens, post: SocialMediaPost): Promise<PublishResult> {
    try {
      const formData = new FormData()
      formData.append('message', this.formatContent(post.content))
      formData.append('access_token', tokens.accessToken)

      // Handle media
      if (post.media && post.media.length > 0) {
        const media = post.media[0] // Facebook supports one media item per post
        
        if (media && media.type === 'image') {
        formData.append('url', media.url)
          const endpoint = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${tokens.pageId}/photos`
          
          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json()
            throw new SocialMediaError(
              'Failed to create Facebook post',
              'facebook',
              error.error?.code,
              error
            )
          }

          const result = await response.json()
          
          return {
            postId: result.post_id || result.id,
            url: `https://www.facebook.com/${result.post_id || result.id}`,
            publishedAt: new Date(),
          }
        } else if (media && media.type === 'video') {
          // Video upload is more complex, would need multipart upload
          throw new SocialMediaError('Video upload not yet implemented', 'facebook')
        }
      }

      // Text-only post
      const endpoint = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${tokens.pageId}/feed`
      
      if (post.platformSpecific?.facebook?.link) {
        formData.append('link', post.platformSpecific.facebook.link)
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new SocialMediaError(
          'Failed to create Facebook post',
          'facebook',
          error.error?.code,
          error
        )
      }

      const result = await response.json()
      
      return {
        postId: result.id,
        url: `https://www.facebook.com/${result.id}`,
        publishedAt: new Date(),
      }
    } catch (error) {
      if (error instanceof SocialMediaError) throw error
      throw new SocialMediaError('Failed to create Facebook post', 'facebook', undefined, error)
    }
  }

  async deletePost(tokens: OAuthTokens, postId: string): Promise<void> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${postId}?access_token=${tokens.accessToken}`,
        { method: 'DELETE' }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new SocialMediaError(
          'Failed to delete Facebook post',
          'facebook',
          error.error?.code,
          error
        )
      }
    } catch (error) {
      if (error instanceof SocialMediaError) throw error
      throw new SocialMediaError('Failed to delete Facebook post', 'facebook', undefined, error)
    }
  }

  async getPostAnalytics(tokens: OAuthTokens, postId: string): Promise<PostAnalytics> {
    try {
      const fields = 'impressions,reach,engaged_users,clicks,shares,likes,comments'
      const response = await fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${postId}/insights?` +
        `metric=${fields}&access_token=${tokens.accessToken}`
      )

      if (!response.ok) {
        const error = await response.json()
        throw new SocialMediaError(
          'Failed to get Facebook analytics',
          'facebook',
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
            case 'post_impressions':
              metrics.impressions = value
              break
            case 'post_impressions_unique':
              metrics.reach = value
              break
            case 'post_engaged_users':
              metrics.engagements = value
              break
            case 'post_clicks':
              metrics.clicks = value
              break
          }
        })
      }

      // Get likes, comments, shares count
      const countsResponse = await fetch(
        `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${postId}?` +
        `fields=likes.summary(true),comments.summary(true),shares&` +
        `access_token=${tokens.accessToken}`
      )

      if (countsResponse.ok) {
        const countsData = await countsResponse.json()
        metrics.likes = countsData.likes?.summary?.total_count || 0
        metrics.comments = countsData.comments?.summary?.total_count || 0
        metrics.shares = countsData.shares?.count || 0
      }

      return metrics
    } catch (error) {
      if (error instanceof SocialMediaError) throw error
      throw new SocialMediaError('Failed to get Facebook analytics', 'facebook', undefined, error)
    }
  }

  private formatContent(content: string): string {
    // Facebook has a 63,206 character limit
    if (content.length > 63206) {
      content = content.substring(0, 63203) + '...'
    }
    return content
  }
}
