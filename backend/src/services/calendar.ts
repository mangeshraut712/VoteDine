import { PrismaClient } from '@prisma/client';
import {
  CalendarEvent,
  CalendarProvider,
  CalendarSyncRequest,
  CalendarSyncResponse,
  CalendarEventStatus,
  CalendarReminder
} from '../types/calendar.js';

export class CalendarService {
  private static instance: CalendarService;
  private prisma: PrismaClient;

  private constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  static getInstance(prisma?: PrismaClient): CalendarService {
    if (!CalendarService.instance) {
      if (!prisma) {
        throw new Error('PrismaClient is required for global CalendarService initialization');
      }
      CalendarService.instance = new CalendarService(prisma);
    }
    return CalendarService.instance;
  }

  async syncVoteToCalendar(_request: CalendarSyncRequest): Promise<CalendarSyncResponse> {
    try {
      const eventId = `event_${Date.now()}`;
      return {
        success: true,
        eventId,
        calendarUrl: `https://calendar.google.com/event/${eventId}`
      };
    } catch (error) {
      console.error('Error syncing to calendar:', error);
      return { success: false, error: 'Failed to sync to calendar' };
    }
  }

  async createCalendarEvent(
    userId: number,
    title: string,
    startTime: Date,
    endTime: Date,
    _provider: CalendarProvider,
    options?: {
      description?: string;
      location?: string;
      roomId?: string;
      restaurantId?: number;
      attendeeEmails?: string[];
      reminders?: CalendarReminder[];
    }
  ): Promise<CalendarEvent | null> {
    try {
      const dbEvent = await this.prisma.calendarEvent.create({
        data: {
          userId,
          title,
          description: options?.description,
          startTime,
          endTime,
          location: options?.location,
          roomId: options?.roomId,
          status: 'SCHEDULED'
        }
      });

      return {
        id: dbEvent.id,
        title: dbEvent.title,
        description: dbEvent.description || undefined,
        startTime: dbEvent.startTime,
        endTime: dbEvent.endTime,
        location: dbEvent.location || undefined,
        attendees: [],
        roomId: dbEvent.roomId || undefined,
        status: CalendarEventStatus.SCHEDULED,
        reminders: [],
        createdAt: dbEvent.createdAt,
        updatedAt: dbEvent.updatedAt
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  }

  async getCalendarEvents(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    try {
      const dbEvents = await this.prisma.calendarEvent.findMany({
        where: {
          userId,
          startTime: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          startTime: 'asc'
        }
      });

      return dbEvents.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description || undefined,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location || undefined,
        attendees: [],
        status: CalendarEventStatus.SCHEDULED,
        reminders: [],
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      }));
    } catch (error) {
      console.error('Error getting calendar events:', error);
      return [];
    }
  }

  async deleteCalendarEvent(eventId: string): Promise<boolean> {
    try {
      await this.prisma.calendarEvent.delete({ where: { id: eventId } });
      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return false;
    }
  }

  async updateCalendarEvent(
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent | null> {
    try {
      const dbEvent = await this.prisma.calendarEvent.update({
        where: { id: eventId },
        data: {
          title: updates.title,
          description: updates.description,
          startTime: updates.startTime,
          endTime: updates.endTime,
          location: updates.location,
          status: updates.status
        }
      });

      return {
        id: dbEvent.id,
        title: dbEvent.title,
        description: dbEvent.description || undefined,
        startTime: dbEvent.startTime,
        endTime: dbEvent.endTime,
        location: dbEvent.location || undefined,
        attendees: [],
        status: CalendarEventStatus.SCHEDULED,
        reminders: [],
        createdAt: dbEvent.createdAt,
        updatedAt: dbEvent.updatedAt
      };
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return null;
    }
  }

  async connectCalendar(
    userId: number,
    _provider: CalendarProvider,
    _accessToken: string,
    _refreshToken: string
  ): Promise<{ success: boolean; integrationId?: string }> {
    // This would still need real OAuth, but we can store status in the future
    return { success: true, integrationId: `integration_${userId}` };
  }

  async disconnectCalendar(_userId: number, _provider: CalendarProvider): Promise<void> {
    // Logic to disconnect
  }

  async createDiningEvent(
    userId: number,
    roomCode: string,
    restaurantName: string,
    diningTime: Date,
    provider: CalendarProvider
  ): Promise<CalendarEvent | null> {
    return this.createCalendarEvent(
      userId,
      `Dining at ${restaurantName}`,
      diningTime,
      new Date(diningTime.getTime() + 3600000),
      provider,
      {
        description: `VoteDine dining event for room ${roomCode}`,
        roomId: roomCode
      }
    );
  }

  async getUpcomingEvents(userId: number): Promise<CalendarEvent[]> {
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 3600000); // 30 days
    return this.getCalendarEvents(userId, now, endDate);
  }

  async getUserCalendarIntegration(_userId: number, _provider: CalendarProvider) {
    return null; // For now
  }
}
