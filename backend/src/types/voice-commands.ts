export interface VoiceCommand {
  id: string;
  command: string;
  intent: VoiceIntent;
  entities: VoiceEntity[];
  confidence: number;
  timestamp: Date;
}

export interface VoiceEntity {
  type: string;
  value: string;
  startIndex: number;
  endIndex: number;
}

export enum VoiceIntent {
  CREATE_ROOM = 'create_room',
  JOIN_ROOM = 'join_room',
  SEARCH_RESTAURANTS = 'search_restaurants',
  VOTE_RESTAURANT = 'vote_restaurant',
  ADD_RESTAURANT = 'add_restaurant',
  GET_RECOMMENDATIONS = 'get_recommendations',
  START_VOTING = 'start_voting',
  END_VOTING = 'end_voting',
  SHOW_RESULTS = 'show_results',
  HELP = 'help'
}

export interface VoiceResponse {
  text: string;
  action?: {
    type: string;
    data?: Record<string, unknown>;
  };
  followUp?: string;
}

export interface VoiceSettings {
  enabled: boolean;
  language: string;
  confidence: number;
  autoSubmit: boolean;
  wakeWord?: string;
}
