import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { CalendarService } from '../services/calendar.js';
import { CalendarProvider } from '../types/calendar.js';
import { getAuthUserId } from '../lib/auth-user.js';
import { roomLookupFilter } from '../lib/room-code.js';
import { authenticate } from '../middleware/authenticate.js';

const eventBodySchema = z.object({
  roomId: z.string().trim().min(1).max(64),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  location: z.string().trim().max(500).optional(),
}).refine((value) => new Date(value.endTime).getTime() > new Date(value.startTime).getTime(), {
  message: 'endTime must be after startTime',
});

export async function calendarRoutes(fastify: FastifyInstance) {
  const calendarService = CalendarService.getInstance(fastify.prisma);

  // POST /connect - Connect user's calendar
  fastify.post('/connect', {
    preHandler: [authenticate],
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
      const userId = getAuthUserId(request.user);
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
      fastify.log.error(error as unknown, 'Failed to sync calendar:');
      return reply.code(500).send({ error: 'Failed to sync calendar' });
    }
  });

  // POST /disconnect - Disconnect user's calendar
  fastify.post('/disconnect', {
    preHandler: [authenticate],
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
      const userId = getAuthUserId(request.user);
      const { provider } = request.body as { provider: string };

      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      await calendarService.disconnectCalendar(userId, provider as CalendarProvider);

      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error as unknown, 'Failed to disconnect calendar:');
      return reply.code(500).send({ error: 'Failed to disconnect calendar' });
    }
  });

  // POST /events - Create dining event
  fastify.post('/events', {
    preHandler: [authenticate],
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
      const userId = getAuthUserId(request.user);
      const parsed = eventBodySchema.safeParse(request.body);
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }
      if (!parsed.success) {
        return reply.code(400).send({ error: 'Invalid event', errors: parsed.error.issues });
      }

      const room = await fastify.prisma.room.findFirst({
        where: roomLookupFilter(parsed.data.roomId),
      });
      if (!room) {
        return reply.code(404).send({ error: 'Room not found' });
      }

      const result = await calendarService.createCalendarEvent(
        userId,
        parsed.data.title,
        new Date(parsed.data.startTime),
        new Date(parsed.data.endTime),
        CalendarProvider.GOOGLE,
        {
          description: parsed.data.description,
          location: parsed.data.location,
          roomId: room.id,
        }
      );

      if (!result) {
        return reply.code(500).send({ error: 'Failed to create calendar event' });
      }

      return reply.send({ success: true, eventId: result.id });
    } catch (error) {
      fastify.log.error(error as unknown, 'Failed to create calendar event:');
      return reply.code(500).send({ error: 'Failed to create calendar event' });
    }
  });

  // GET /events - Get upcoming events
  fastify.get('/events', {
    preHandler: [authenticate],
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
      const userId = getAuthUserId(request.user);

      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const events = await calendarService.getUpcomingEvents(userId);

      return reply.send({ events });
    } catch (error) {
      fastify.log.error(error as unknown, 'Failed to list calendars:');
      return reply.code(500).send({ error: 'Failed to list calendars' });
    }
  });

  // GET /status - Get calendar integration status
  fastify.get('/status', {
    preHandler: [authenticate],
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
      const userId = getAuthUserId(request.user);

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
      fastify.log.error(error as unknown);
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
