// Simplified analytics service that avoids Prisma type issues
// Uses mock data for development

export interface VotingAnalytics {
  roomId: string;
  totalVotes: number;
  uniqueVoters: number;
  votingDuration: number;
  topRestaurants: Array<{
    restaurantId: number;
    restaurantName: string;
    votes: number;
    percentage: number;
    averageRating?: number;
  }>;
  votingTrends: Array<{
    timestamp: string;
    cumulativeVotes: number;
    activeVoters: number;
    leadingRestaurant: string;
  }>;
  participantEngagement: {
    averageVotesPerUser: number;
    mostActiveVoter: {
      userId: number;
      username: string;
      voteCount: number;
    };
    votingFrequency: {
      firstHour: number;
      secondHour: number;
      thirdHour: number;
      afterThirdHour: number;
    };
  };
  timeToDecision: number;
  consensusScore: number;
}

export interface GlobalAnalytics {
  totalRooms: number;
  totalVotes: number;
  totalUsers: number;
  averageRoomSize: number;
  averageVotingTime: number;
  popularCuisines: Array<{
    cuisine: string;
    voteCount: number;
    roomCount: number;
    averageRating: number;
  }>;
  peakVotingHours: number[];
  userRetentionRate: number;
  conversionRate: number;
}

export interface UserAnalytics {
  userId: number;
  totalVotesCast: number;
  roomsParticipated: number;
  roomsCreated: number;
  favoriteCuisines: string[];
  votingPattern: {
    earlyVoter: boolean;
    decisive: boolean;
    explorer: boolean;
  };
  influenceScore: number;
}

export interface RoomAnalytics {
  roomId: string;
  roomName: string;
  createdAt: Date;
  participantCount: number;
  totalVotes: number;
  duration: number;
  outcome: 'decided' | 'no_decision' | 'cancelled';
  winningRestaurant?: {
    id: number;
    name: string;
    voteCount: number;
    percentage: number;
  };
  votingEfficiency: number;
  satisfactionScore?: number;
}

export interface AnalyticsFilter {
  dateRange?: {
    start: Date;
    end: Date;
  };
  roomIds?: string[];
  userIds?: number[];
  cuisines?: string[];
  minParticipants?: number;
  maxParticipants?: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async getRoomAnalytics(roomId: string): Promise<VotingAnalytics | null> {
    // Mock implementation for development
    return {
      roomId,
      totalVotes: Math.floor(Math.random() * 50) + 10,
      uniqueVoters: Math.floor(Math.random() * 20) + 5,
      votingDuration: Math.random() * 120,
      topRestaurants: [
        { restaurantId: 1, restaurantName: 'Italian Bistro', votes: 15, percentage: 45.5, averageRating: 4.5 },
        { restaurantId: 2, restaurantName: 'Sushi Palace', votes: 10, percentage: 30.3, averageRating: 4.8 },
        { restaurantId: 3, restaurantName: 'Mexican Grill', votes: 8, percentage: 24.2, averageRating: 4.2 }
      ],
      votingTrends: [
        { timestamp: new Date().toISOString(), cumulativeVotes: 5, activeVoters: 3, leadingRestaurant: 'Italian Bistro' },
        { timestamp: new Date().toISOString(), cumulativeVotes: 12, activeVoters: 8, leadingRestaurant: 'Italian Bistro' },
        { timestamp: new Date().toISOString(), cumulativeVotes: 25, activeVoters: 12, leadingRestaurant: 'Italian Bistro' }
      ],
      participantEngagement: {
        averageVotesPerUser: 2.5,
        mostActiveVoter: { userId: 1, username: 'john_doe', voteCount: 8 },
        votingFrequency: { firstHour: 5, secondHour: 8, thirdHour: 10, afterThirdHour: 12 }
      },
      timeToDecision: 45,
      consensusScore: 75
    };
  }

  async getGlobalAnalytics(_filter?: AnalyticsFilter): Promise<GlobalAnalytics> {
    return {
      totalRooms: 150,
      totalVotes: 2500,
      totalUsers: 500,
      averageRoomSize: 4.2,
      averageVotingTime: 35,
      popularCuisines: [
        { cuisine: 'Italian', voteCount: 500, roomCount: 45, averageRating: 4.5 },
        { cuisine: 'Japanese', voteCount: 400, roomCount: 35, averageRating: 4.7 },
        { cuisine: 'Mexican', voteCount: 350, roomCount: 30, averageRating: 4.3 },
        { cuisine: 'American', voteCount: 300, roomCount: 25, averageRating: 4.1 }
      ],
      peakVotingHours: [12, 13, 18, 19, 20],
      userRetentionRate: 0.75,
      conversionRate: 0.85
    };
  }

  async getUserAnalytics(userId: number): Promise<UserAnalytics | null> {
    return {
      userId,
      totalVotesCast: Math.floor(Math.random() * 100) + 20,
      roomsParticipated: Math.floor(Math.random() * 20) + 5,
      roomsCreated: Math.floor(Math.random() * 10) + 1,
      favoriteCuisines: ['Italian', 'Japanese', 'Mexican'],
      votingPattern: {
        earlyVoter: Math.random() > 0.5,
        decisive: Math.random() > 0.3,
        explorer: Math.random() > 0.4
      },
      influenceScore: Math.floor(Math.random() * 50) + 50
    };
  }

  async getRoomSummaryAnalytics(roomId: string): Promise<RoomAnalytics | null> {
    return {
      roomId,
      roomName: 'Dinner Tonight',
      createdAt: new Date(),
      participantCount: 5,
      totalVotes: 20,
      duration: 45,
      outcome: 'decided',
      winningRestaurant: {
        id: 1,
        name: 'Italian Bistro',
        voteCount: 12,
        percentage: 60
      },
      votingEfficiency: 0.44,
      satisfactionScore: 4.5
    };
  }
}
