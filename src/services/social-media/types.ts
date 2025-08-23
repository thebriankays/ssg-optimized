export interface SocialMediaService {
  // OAuth methods
  getAuthUrl(redirectUri: string): string
  exchangeCodeForToken(code: string, redirectUri: string): Promise<OAuthTokens>
  refreshToken(refreshToken: string): Promise<OAuthTokens>
  
  // Publishing methods
  createPost(tokens: OAuthTokens, post: SocialMediaPost): Promise<PublishResult>
  deletePost(tokens: OAuthTokens, postId: string): Promise<void>
  
  // Analytics methods
  getPostAnalytics(tokens: OAuthTokens, postId: string): Promise<PostAnalytics>
}

export interface OAuthTokens {
  accessToken: string
  refreshToken?: string
  expiresAt: Date
  userId?: string
  userName?: string
  pageId?: string
  pageName?: string
}

export interface SocialMediaPost {
  content: string
  media?: Array<{
    url: string
    type: 'image' | 'video'
  }>
  platformSpecific?: any
}

export interface PublishResult {
  postId: string
  url: string
  publishedAt: Date
}

export interface PostAnalytics {
  impressions?: number
  reach?: number
  engagements?: number
  clicks?: number
  shares?: number
  likes?: number
  comments?: number
  views?: number
  lastUpdated: Date
}

export class SocialMediaError extends Error {
  constructor(
    message: string,
    public platform: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'SocialMediaError'
  }
}
