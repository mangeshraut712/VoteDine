import { FastifyInstance } from 'fastify';
import { CalendarService } from '../services/calendar.js';
import { CalendarProvider } from '../types/calendar';

export async function calendarRoutes(fastify: FastifyInstance) {
  const calendarService = CalendarService.getInstance(fastify.prisma);

  // POST /connect - Connect user's calendar
  fastify.post('/connect', {
    schema: {
      description: 'Connect user\'s calendar account',
      tags: ['Calendar'],
      body: {
        type: 'object',
        required: ['provider', 'accessToken'],
        properties: {
          provider: {
            type: 'string',
            enum: ['google', 'outlook', 'apple', 'caldav'],
            description: 'Calendar provider'
          },
          accessToken: {
            type: 'string',
            description: 'OAuth access token'
          },
          refreshToken: {
            type: 'string',
            description: 'OAuth refresh token (optional)'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id; // Get from JWT token
      const { provider, accessToken, refreshToken } = request.body as {
        provider: string;
        accessToken: string;
        refreshToken?: string;
      };

      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const result = await calendarService.connectCalendar(
        userId,
        provider as CalendarProvider,
        accessToken,
        refreshToken
      );

      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to connect calendar' });
    }
  });

  // POST /disconnect - Disconnect user's calendar
  fastify.post('/disconnect', {
    schema: {
      description: 'Disconnect user\'s calendar account',
      tags: ['Calendar'],
      body: {
        type: 'object',
        required: ['provider'],
        properties: {
          provider: {
            type: 'string',
            enum: ['google', 'outlook', 'apple', 'caldav'],
            description: 'Calendar provider to disconnect'
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      const { provider } = request.body as { provider: string };

      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      await calendarService.disconnectCalendar(userId, provider as CalendarProvider);

      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to disconnect calendar' });
    }
  });

  // POST /events - Create dining event
  fastify.post('/events', {
    schema: {
      description: 'Create calendar event for dining session',
      tags: ['Calendar'],
      body: {
        type: 'object',
        required: ['roomId', 'startTime', 'endTime', 'title'],
        properties: {
          roomId: { type: 'string', description: 'VoteDine room ID' },
          startTime: { type: 'string', format: 'date-time' },
          endTime: { type: 'string', format: 'date-time' },
          title: { type: 'string', description: 'Event title' },
          description: { type: 'string', description: 'Event description' },
          location: { type: 'string', description: 'Event location' },
          reminders: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['email', 'push', 'sms'] },
                minutesBefore: { type: 'number' },
                enabled: { type: 'boolean' }
              }
            }
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            eventId: { type: 'string' },
            calendarUrl: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;
      const eventData = request.body as {
        roomId: string;
        restaurantName: string;
        diningTime: string;
        provider: CalendarProvider;
      };

      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const result = await calendarService.createDiningEvent(
        userId,
        eventData.roomId,
        eventData.restaurantName,
        new Date(eventData.diningTime),
        eventData.provider
      );

      return reply.send(result);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create calendar event' });
    }
  });

  // GET /events - Get upcoming events
  fastify.get('/events', {
    schema: {
      description: 'Get user\'s upcoming dining events',
      tags: ['Calendar'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 10 },
          offset: { type: 'number', default: 0 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  startTime: { type: 'string', format: 'date-time' },
                  endTime: { type: 'string', format: 'date-time' },
                  location: { type: 'string' },
                  status: { type: 'string' },
                  calendarUrl: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // For demo/development purposes, fall back to user 1 if not authenticated
      const userId = request.user?.id || 1;

      if (!userId && process.env.NODE_ENV === 'production') {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const events = await calendarService.getUpcomingEvents(userId);

      return reply.send({ events });
    } catch (error) {
      fastify.log.error('Failed to get calendar events:', error);
      return reply.code(500).send({ error: 'Failed to get calendar events' });
    }
  });

  // GET /status - Get calendar integration status
  fastify.get('/status', {
    schema: {
      description: 'Get user\'s calendar integration status',
      tags: ['Calendar'],
      response: {
        200: {
          type: 'object',
          properties: {
            connected: { type: 'boolean' },
            provider: { type: 'string' },
            lastSync: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user?.id;

      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const integration = await calendarService.getUserCalendarIntegration(userId, CalendarProvider.GOOGLE);

      return reply.send({
        connected: !!integration,
        provider: integration?.provider,
        lastSync: integration?.lastSyncAt
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get calendar status' });
    }
  });

  // GET /providers - Get supported calendar providers
  fastify.get('/providers', {
    schema: {
      description: 'Get list of supported calendar providers',
      tags: ['Calendar'],
      response: {
        200: {
          type: 'object',
          properties: {
            providers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  description: { type: 'string' },
                  authUrl: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const providers = [
        {
          id: 'google',
          name: 'Google Calendar',
          description: 'Connect your Google Calendar account',
          authUrl: '/api/calendar/auth/google'
        },
        {
          id: 'outlook',
          name: 'Outlook Calendar',
          description: 'Connect your Microsoft Outlook Calendar',
          authUrl: '/api/calendar/auth/outlook'
        },
        {
          id: 'apple',
          name: 'Apple Calendar',
          description: 'Connect your Apple Calendar (iCloud)',
          authUrl: '/api/calendar/auth/apple'
        }
      ];

      return reply.send({ providers });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get calendar providers' });
    }
  });
}
