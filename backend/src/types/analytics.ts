export interface VotingAnalytics {
  roomId: string;
  totalVotes: number;
  uniqueVoters: number;
  votingDuration: number; // in minutes
  topRestaurants: RestaurantVoteCount[];
  votingTrends: VotingTrend[];
  participantEngagement: ParticipantEngagement;
  timeToDecision: number; // in minutes
  consensusScore: number; // 0-100
}

export interface RestaurantVoteCount {
  restaurantId: number;
  restaurantName: string;
  votes: number;
  percentage: number;
  averageRating?: number;
}

export interface VotingTrend {
  timestamp: Date;
  cumulativeVotes: number;
  activeVoters: number;
  leadingRestaurant: string;
}

export interface ParticipantEngagement {
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
}

export interface GlobalAnalytics {
  totalRooms: number;
  totalVotes: number;
  totalUsers: number;
  averageRoomSize: number;
  averageVotingTime: number;
  popularCuisines: CuisinePopularity[];
  peakVotingHours: number[];
  userRetentionRate: number;
  conversionRate: number; // votes to decisions
}

export interface CuisinePopularity {
  cuisine: string;
  voteCount: number;
  roomCount: number;
  averageRating: number;
}

export interface UserAnalytics {
  userId: number;
  totalVotesCast: number;
  roomsParticipated: number;
  roomsCreated: number;
  favoriteCuisines: string[];
  votingPattern: {
    earlyVoter: boolean; // votes in first 25% of time
    decisive: boolean; // votes for winning restaurant
    explorer: boolean; // votes for diverse restaurants
  };
  influenceScore: number; // 0-100
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
  votingEfficiency: number; // votes per minute
  satisfactionScore?: number; // 1-5 from user feedback
}

export interface AnalyticsFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  roomIds?: string[];
  userIds?: number[];
  cuisines?: string[];
  minParticipants?: number;
  maxParticipants?: number;
}
