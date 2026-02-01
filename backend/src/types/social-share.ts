export interface ShareContent {
  type: 'room' | 'restaurant' | 'vote_result' | 'achievement';
  title: string;
  description: string;
  url?: string;
  imageUrl?: string;
  roomCode?: string;
  restaurantName?: string;
  voteCount?: number;
  winner?: boolean;
  restaurantId?: number | string;
}

export interface SocialShareOptions {
  platforms: SocialPlatform[];
  customMessage?: string;
  includeRoomCode?: boolean;
  includeResults?: boolean;
}

export enum SocialPlatform {
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  WHATSAPP = 'whatsapp',
  LINKEDIN = 'linkedin',
  EMAIL = 'email',
  TELEGRAM = 'telegram',
  REDDIT = 'reddit',
  COPY_LINK = 'copy_link'
}

export interface ShareResponse {
  success: boolean;
  platform?: SocialPlatform;
  url?: string;
  error?: string;
}

export interface ShareAnalytics {
  shareId: string;
  platform: SocialPlatform;
  contentId: string;
  contentType: string;
  timestamp: Date;
  clicks: number;
  shares: number;
  conversions: number;
}
