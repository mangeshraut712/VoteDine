export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees: CalendarAttendee[];
  roomId?: string;
  restaurantId?: number;
  status: CalendarEventStatus;
  reminders: CalendarReminder[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarAttendee {
  id: string;
  userId?: number;
  email: string;
  name: string;
  status: AttendeeStatus;
  isOrganizer: boolean;
}

export interface CalendarReminder {
  id: string;
  type: ReminderType;
  minutesBefore: number;
  enabled: boolean;
}

export enum CalendarEventStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum AttendeeStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  TENTATIVE = 'tentative'
}

export enum ReminderType {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms'
}

export interface CalendarIntegration {
  id: string;
  userId: number;
  provider: CalendarProvider;
  accessToken: string;
  refreshToken?: string;
  calendarId: string;
  isActive: boolean;
  lastSyncAt?: Date;
  createdAt: Date;
}

export enum CalendarProvider {
  GOOGLE = 'google',
  OUTLOOK = 'outlook',
  APPLE = 'apple',
  CALDAV = 'caldav'
}

export interface CalendarSyncRequest {
  roomId: string;
  eventId?: string;
  startTime: Date;
  endTime: Date;
  title: string;
  description?: string;
  location?: string;
  attendeeEmails: string[];
  reminders: CalendarReminder[];
}

export interface CalendarSyncResponse {
  success: boolean;
  eventId?: string;
  calendarUrl?: string;
  error?: string;
}
