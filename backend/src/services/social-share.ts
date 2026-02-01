import { ShareContent, SocialPlatform, ShareAnalytics } from '../types/social-share';

export class SocialShareService {
  private static instance: SocialShareService;

  static getInstance(): SocialShareService {
    if (!SocialShareService.instance) {
      SocialShareService.instance = new SocialShareService();
    }
    return SocialShareService.instance;
  }

  /**
   * Generate shareable content for different platforms
   */
  generateShareContent(content: ShareContent): ShareContent {
    const baseUrl = process.env.FRONTEND_URL || 'https://votedine.com';

    switch (content.type) {
      case 'room':
        return {
          ...content,
          title: `Join my VoteDine room!`,
          description: `Help us decide where to eat! Room code: ${content.roomCode}`,
          url: content.url || `${baseUrl}/room/${content.roomCode}`,
          imageUrl: content.imageUrl || `${baseUrl}/api/og/room/${content.roomCode}`
        };

      case 'restaurant':
        return {
          ...content,
          title: `Check out ${content.restaurantName}!`,
          description: `Found this great restaurant on VoteDine`,
          url: content.url || `${baseUrl}/restaurant/${content.restaurantId}`,
          imageUrl: content.imageUrl || `${baseUrl}/api/og/restaurant/${content.restaurantId}`
        };

      case 'vote_result':
        return {
          ...content,
          title: content.winner ?
            `We picked ${content.restaurantName}! 🎉` :
            `Voting complete for ${content.restaurantName}`,
          description: content.winner ?
            `${content.voteCount} votes decided our dining destination!` :
            `See the voting results for our group meal`,
          url: content.url || `${baseUrl}/room/${content.roomCode}/results`,
          imageUrl: content.imageUrl || `${baseUrl}/api/og/results/${content.roomCode}`
        };

      case 'achievement':
        return {
          ...content,
          title: content.title,
          description: content.description,
          url: content.url || baseUrl,
          imageUrl: content.imageUrl || `${baseUrl}/api/og/achievement`
        };

      default:
        return content;
    }
  }

  /**
   * Generate platform-specific share URLs
   */
  generateShareUrl(content: ShareContent, platform: SocialPlatform): string {
    const shareContent = this.generateShareContent(content);
    const encodedUrl = encodeURIComponent(shareContent.url || '');
    const encodedTitle = encodeURIComponent(shareContent.title);
    const encodedDescription = encodeURIComponent(shareContent.description);

    switch (platform) {
      case SocialPlatform.FACEBOOK:
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDescription}`;

      case SocialPlatform.TWITTER:
        return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=VoteDine,RestaurantVoting`;

      case SocialPlatform.WHATSAPP:
        return `https://wa.me/?text=${encodeURIComponent(`${shareContent.title}\n\n${shareContent.description}\n\n${shareContent.url}`)}`;

      case SocialPlatform.LINKEDIN:
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;

      case SocialPlatform.TELEGRAM:
        return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;

      case SocialPlatform.REDDIT:
        return `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;

      case SocialPlatform.EMAIL:
        return `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${shareContent.description}\n\n${shareContent.url}`)}`;

      default:
        return shareContent.url || '';
    }
  }

  /**
   * Track share analytics
   */
  async trackShare(shareId: string, platform: SocialPlatform, contentId: string): Promise<void> {
    try {
      // This would save to database
      console.log(`Tracking share: ${shareId} on ${platform} for content ${contentId}`);
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  }

  /**
   * Get share analytics
   */
  async getShareAnalytics(contentId?: string, _platform?: SocialPlatform): Promise<ShareAnalytics[]> {
    try {
      // This would fetch from database
      // For now, return mock data
      return [
        {
          shareId: 'share_1',
          platform: SocialPlatform.FACEBOOK,
          contentId: contentId || 'room_1',
          contentType: 'room',
          timestamp: new Date(),
          clicks: 15,
          shares: 8,
          conversions: 3
        },
        {
          shareId: 'share_2',
          platform: SocialPlatform.TWITTER,
          contentId: contentId || 'room_1',
          contentType: 'room',
          timestamp: new Date(),
          clicks: 22,
          shares: 12,
          conversions: 5
        }
      ];
    } catch (error) {
      console.error('Failed to get share analytics:', error);
      return [];
    }
  }

  /**
   * Generate QR code for sharing
   */
  async generateQRCode(url: string): Promise<string> {
    try {
      // This would integrate with QR code generation service
      // For now, return mock QR code URL
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      return '';
    }
  }

  /**
   * Create shareable short URL
   */
  async createShortUrl(url: string): Promise<string> {
    try {
      // This would integrate with URL shortening service
      // For now, return original URL
      return url;
    } catch (error) {
      console.error('Failed to create short URL:', error);
      return url;
    }
  }

  /**
   * Validate share content
   */
  validateShareContent(content: ShareContent): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!content.title || content.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!content.description || content.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (content.type === 'room' && !content.roomCode) {
      errors.push('Room code is required for room shares');
    }

    if (content.type === 'restaurant' && !content.restaurantName) {
      errors.push('Restaurant name is required for restaurant shares');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get platform-specific character limits
   */
  getPlatformLimits(platform: SocialPlatform): { title: number; description: number; url: number } {
    const limits = {
      [SocialPlatform.TWITTER]: { title: 280, description: 280, url: 223 },
      [SocialPlatform.FACEBOOK]: { title: 255, description: 1000, url: 2000 },
      [SocialPlatform.LINKEDIN]: { title: 200, description: 200, url: 2000 },
      [SocialPlatform.REDDIT]: { title: 300, description: 1000, url: 2000 },
      [SocialPlatform.TELEGRAM]: { title: 4096, description: 4096, url: 4096 },
      [SocialPlatform.WHATSAPP]: { title: 1000, description: 1000, url: 2000 },
      [SocialPlatform.EMAIL]: { title: 78, description: 1000, url: 2000 }
    };

    return limits[platform] || { title: 1000, description: 1000, url: 2000 };
  }

  /**
   * Truncate content to fit platform limits
   */
  truncateForPlatform(content: string, platform: SocialPlatform, type: 'title' | 'description' | 'url'): string {
    const limits = this.getPlatformLimits(platform);
    const limit = limits[type];

    if (content.length <= limit) {
      return content;
    }

    return content.substring(0, limit - 3) + '...';
  }

  /**
   * Generate share image
   */
  async generateShareImage(content: ShareContent): Promise<string> {
    try {
      // This would generate dynamic share images
      // For now, return default image URL
      const baseUrl = process.env.FRONTEND_URL || 'https://votedine.com';
      return `${baseUrl}/api/share/image/${content.type}/${content.type === 'room' ? content.roomCode : 'default'}`;
    } catch (error) {
      console.error('Failed to generate share image:', error);
      return '';
    }
  }

  /**
   * Get trending share content
   */
  async getTrendingContent(limit: number = 10): Promise<ShareContent[]> {
    try {
      // This would fetch trending content from database
      // For now, return mock data
      return ([
        {
          type: 'room',
          title: 'Friday Night Dinner Decision',
          description: 'Help us choose the perfect restaurant for our Friday night dinner!',
          roomCode: 'ABC123',
          voteCount: 25,
          winner: true
        },
        {
          type: 'restaurant',
          title: 'Amazing Italian Place',
          description: 'Found this incredible Italian restaurant with great reviews!',
          restaurantName: 'The Italian Place',
          voteCount: 15
        }
      ] as unknown as ShareContent[]).slice(0, limit);
    } catch (error) {
      console.error('Failed to get trending content:', error);
      return [];
    }
  }
}
