import { FastifyInstance } from 'fastify';
import { SocialShareService } from '../services/social-share';
import { SocialPlatform, ShareContent } from '../types/social-share';

export async function socialShareRoutes(fastify: FastifyInstance) {
  const socialShareService = SocialShareService.getInstance();

  // POST /api/social/share - Generate share content
  fastify.post('/api/social/share', {
    schema: {
      description: 'Generate shareable content for social platforms',
      tags: ['Social Share'],
      body: {
        type: 'object',
        required: ['type', 'title', 'description'],
        properties: {
          type: {
            type: 'string',
            enum: ['room', 'restaurant', 'vote_result', 'achievement'],
            description: 'Type of content to share'
          },
          title: {
            type: 'string',
            description: 'Share title'
          },
          description: {
            type: 'string',
            description: 'Share description'
          },
          url: {
            type: 'string',
            description: 'Share URL (optional)'
          },
          imageUrl: {
            type: 'string',
            description: 'Share image URL (optional)'
          },
          roomCode: {
            type: 'string',
            description: 'Room code (for room shares)'
          },
          restaurantName: {
            type: 'string',
            description: 'Restaurant name (for restaurant shares)'
          },
          voteCount: {
            type: 'number',
            description: 'Number of votes (for vote results)'
          },
          winner: {
            type: 'boolean',
            description: 'Whether this is the winning choice'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            content: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' },
                url: { type: 'string' },
                imageUrl: { type: 'string' }
              }
            },
            platforms: {
              type: 'object',
              properties: {
                facebook: { type: 'string' },
                twitter: { type: 'string' },
                whatsapp: { type: 'string' },
                linkedin: { type: 'string' },
                email: { type: 'string' },
                telegram: { type: 'string' },
                reddit: { type: 'string' },
                copy_link: { type: 'string' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            errors: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const content = request.body as ShareContent;

      // Validate content
      const validation = socialShareService.validateShareContent(content);
      if (!validation.isValid) {
        return reply.code(400).send({
          error: 'Invalid share content',
          errors: validation.errors
        });
      }

      // Generate share content
      const shareContent = socialShareService.generateShareContent(content);

      // Generate platform URLs
      const platforms = {
        facebook: socialShareService.generateShareUrl(shareContent, SocialPlatform.FACEBOOK),
        twitter: socialShareService.generateShareUrl(shareContent, SocialPlatform.TWITTER),
        whatsapp: socialShareService.generateShareUrl(shareContent, SocialPlatform.WHATSAPP),
        linkedin: socialShareService.generateShareUrl(shareContent, SocialPlatform.LINKEDIN),
        email: socialShareService.generateShareUrl(shareContent, SocialPlatform.EMAIL),
        telegram: socialShareService.generateShareUrl(shareContent, SocialPlatform.TELEGRAM),
        reddit: socialShareService.generateShareUrl(shareContent, SocialPlatform.REDDIT),
        copy_link: shareContent.url || ''
      };

      return reply.send({
        success: true,
        content: shareContent,
        platforms
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to generate share content' });
    }
  });

  // POST /api/social/track - Track share analytics
  fastify.post('/api/social/track', {
    schema: {
      description: 'Track social share analytics',
      tags: ['Social Share'],
      body: {
        type: 'object',
        required: ['shareId', 'platform', 'contentId'],
        properties: {
          shareId: { type: 'string', description: 'Unique share identifier' },
          platform: {
            type: 'string',
            enum: ['facebook', 'twitter', 'whatsapp', 'linkedin', 'email', 'telegram', 'reddit', 'copy_link'],
            description: 'Social platform'
          },
          contentId: { type: 'string', description: 'Content identifier' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { shareId, platform, contentId } = request.body as {
        shareId: string;
        platform: SocialPlatform;
        contentId: string;
      };

      await socialShareService.trackShare(shareId, platform, contentId);

      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to track share' });
    }
  });

  // GET /api/social/analytics - Get share analytics
  fastify.get('/api/social/analytics', {
    schema: {
      description: 'Get social sharing analytics',
      tags: ['Social Share'],
      querystring: {
        type: 'object',
        properties: {
          contentId: { type: 'string', description: 'Filter by content ID' },
          platform: {
            type: 'string',
            enum: ['facebook', 'twitter', 'whatsapp', 'linkedin', 'email', 'telegram', 'reddit', 'copy_link'],
            description: 'Filter by platform'
          },
          limit: { type: 'number', default: 50, description: 'Number of results' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            analytics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  shareId: { type: 'string' },
                  platform: { type: 'string' },
                  contentId: { type: 'string' },
                  contentType: { type: 'string' },
                  timestamp: { type: 'string', format: 'date-time' },
                  clicks: { type: 'number' },
                  shares: { type: 'number' },
                  conversions: { type: 'number' }
                }
              }
            }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { contentId, platform, limit } = request.query as {
        contentId?: string;
        platform?: SocialPlatform;
        limit?: number;
      };

      const analytics = await socialShareService.getShareAnalytics(contentId, platform);

      return reply.send({
        analytics: analytics.slice(0, limit || 50)
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get analytics' });
    }
  });

  // GET /api/social/trending - Get trending share content
  fastify.get('/api/social/trending', {
    schema: {
      description: 'Get trending shareable content',
      tags: ['Social Share'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 10, description: 'Number of results' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            trending: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  roomCode: { type: 'string' },
                  restaurantName: { type: 'string' },
                  voteCount: { type: 'number' },
                  winner: { type: 'boolean' }
                }
              }
            }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { limit } = request.query as { limit?: number };

      const trending = await socialShareService.getTrendingContent(limit || 10);

      return reply.send({ trending });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get trending content' });
    }
  });

  // GET /api/social/qr/:url - Generate QR code
  fastify.get('/api/social/qr/:url', {
    schema: {
      description: 'Generate QR code for sharing',
      tags: ['Social Share'],
      params: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to encode in QR code' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            qrCodeUrl: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { url } = request.params as { url: string };

      const qrCodeUrl = await socialShareService.generateQRCode(decodeURIComponent(url));

      return reply.send({ qrCodeUrl });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to generate QR code' });
    }
  });

  // GET /api/social/shorten/:url - Create short URL
  fastify.get('/api/social/shorten/:url', {
    schema: {
      description: 'Create short URL for sharing',
      tags: ['Social Share'],
      params: {
        type: 'object',
        properties: {
          url: { type: 'string', description: 'URL to shorten' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            shortUrl: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { url } = request.params as { url: string };

      const shortUrl = await socialShareService.createShortUrl(decodeURIComponent(url));

      return reply.send({ shortUrl });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create short URL' });
    }
  });

  // GET /api/social/platforms - Get supported platforms
  fastify.get('/api/social/platforms', {
    schema: {
      description: 'Get list of supported social platforms',
      tags: ['Social Share'],
      response: {
        200: {
          type: 'object',
          properties: {
            platforms: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  icon: { type: 'string' },
                  color: { type: 'string' },
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const platforms = [
        {
          id: 'facebook',
          name: 'Facebook',
          icon: '📘',
          color: '#1877F2',
          description: 'Share with Facebook friends'
        },
        {
          id: 'twitter',
          name: 'Twitter',
          icon: '🐦',
          color: '#1DA1F2',
          description: 'Share on Twitter/X'
        },
        {
          id: 'whatsapp',
          name: 'WhatsApp',
          icon: '💬',
          color: '#25D366',
          description: 'Share via WhatsApp'
        },
        {
          id: 'linkedin',
          name: 'LinkedIn',
          icon: '💼',
          color: '#0077B5',
          description: 'Share on LinkedIn'
        },
        {
          id: 'telegram',
          name: 'Telegram',
          icon: '✈️',
          color: '#0088CC',
          description: 'Share on Telegram'
        },
        {
          id: 'reddit',
          name: 'Reddit',
          icon: '🤖',
          color: '#FF4500',
          description: 'Share on Reddit'
        },
        {
          id: 'email',
          name: 'Email',
          icon: '✉️',
          color: '#EA4335',
          description: 'Share via email'
        },
        {
          id: 'copy_link',
          name: 'Copy Link',
          icon: '🔗',
          color: '#6B7280',
          description: 'Copy shareable link'
        }
      ];

      return reply.send({ platforms });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get platforms' });
    }
  });
}
