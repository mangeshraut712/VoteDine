// Mock implementation for development
// import { PrismaClient } from '@prisma/client';
import {
  VoiceCommand,
  VoiceIntent,
  VoiceResponse,
  VoiceSettings
} from '../types/voice-commands.js';

/* const prisma = {
  room: {
    findUnique: async () => ({
      id: 'mock-room-id',
      code: 'ABC123',
      name: 'Test Room',
      members: [],
      roomRestaurants: [],
      votes: []
    }),
    findMany: async () => []
  }
}; */

export class VoiceCommandService {
  private static instance: VoiceCommandService;

  static getInstance(): VoiceCommandService {
    if (!VoiceCommandService.instance) {
      VoiceCommandService.instance = new VoiceCommandService();
    }
    return VoiceCommandService.instance;
  }

  /**
   * Process voice command and return response
   */
  async processVoiceCommand(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    audioData: any,
    settings: VoiceSettings,
    roomId?: string
  ): Promise<VoiceResponse> {
    try {
      // Convert speech to text
      const transcript = await this.speechToText(audioData, settings.language);

      // Parse intent and entities
      const command = await this.parseIntent(transcript, roomId);

      // Execute command
      const response = await this.executeCommand(command, roomId);

      return response;
    } catch {
      return {
        text: "Sorry, I didn't understand that. Could you please repeat?",
        followUp: "Try saying 'create a room' or 'search for Italian restaurants'"
      };
    }
  }

  /**
   * Get available voice commands
   */
  getAvailableCommands(): { intent: VoiceIntent; examples: string[]; description: string }[] {
    return [
      {
        intent: VoiceIntent.CREATE_ROOM,
        examples: [
          "Create a new room",
          "Start a voting session",
          "Make a new room for dinner"
        ],
        description: "Create a new voting room"
      },
      {
        intent: VoiceIntent.JOIN_ROOM,
        examples: [
          "Join room ABC123",
          "Enter room code XYZ",
          "Connect to room"
        ],
        description: "Join an existing room using room code"
      },
      {
        intent: VoiceIntent.SEARCH_RESTAURANTS,
        examples: [
          "Search for Italian restaurants",
          "Find cheap sushi nearby",
          "Look for restaurants with 4+ stars"
        ],
        description: "Search for restaurants based on criteria"
      },
      {
        intent: VoiceIntent.VOTE_RESTAURANT,
        examples: [
          "Vote for The Italian Place",
          "I like this restaurant",
          "Vote yes for sushi"
        ],
        description: "Vote for a restaurant"
      },
      {
        intent: VoiceIntent.ADD_RESTAURANT,
        examples: [
          "Add McDonald's to the list",
          "Include this restaurant",
          "Add this option"
        ],
        description: "Add a restaurant to the voting list"
      },
      {
        intent: VoiceIntent.GET_RECOMMENDATIONS,
        examples: [
          "Get AI recommendations",
          "Show me suggestions",
          "What do you recommend?"
        ],
        description: "Get AI-powered restaurant recommendations"
      },
      {
        intent: VoiceIntent.START_VOTING,
        examples: [
          "Start voting",
          "Begin the vote",
          "Let's vote now"
        ],
        description: "Start the voting session"
      },
      {
        intent: VoiceIntent.SHOW_RESULTS,
        examples: [
          "Show results",
          "What's the current vote count?",
          "Display the leaderboard"
        ],
        description: "Show current voting results"
      }
    ];
  }

  /**
   * Convert speech to text
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async speechToText(_audioData: any, _language: string): Promise<string> {
    // Mock implementation for development
    return "search for italian restaurants nearby";
  }

  /**
   * Parse intent and entities from transcript
   */
  private async parseIntent(transcript: string, _roomId?: string): Promise<VoiceCommand> {
    // Mock implementation for development
    return {
      id: `cmd_${Date.now()}`,
      command: transcript,
      intent: VoiceIntent.SEARCH_RESTAURANTS,
      entities: [
        {
          type: 'cuisine',
          value: 'italian',
          startIndex: 12,
          endIndex: 19
        },
        {
          type: 'location',
          value: 'nearby',
          startIndex: 30,
          endIndex: 36
        }
      ],
      confidence: 0.95,
      timestamp: new Date()
    };
  }

  /**
   * Execute voice command
   */
  private async executeCommand(command: VoiceCommand, roomId?: string): Promise<VoiceResponse> {
    switch (command.intent) {
      case VoiceIntent.CREATE_ROOM:
        return this.handleCreateRoom(command);

      case VoiceIntent.JOIN_ROOM:
        return this.handleJoinRoom(command);

      case VoiceIntent.SEARCH_RESTAURANTS:
        return this.handleSearchRestaurants(command);

      case VoiceIntent.VOTE_RESTAURANT:
        return this.handleVoteRestaurant(command, roomId);

      case VoiceIntent.ADD_RESTAURANT:
        return this.handleAddRestaurant(command, roomId);

      case VoiceIntent.GET_RECOMMENDATIONS:
        return this.handleGetRecommendations(roomId);

      case VoiceIntent.START_VOTING:
        return this.handleStartVoting(roomId);

      case VoiceIntent.SHOW_RESULTS:
        return this.handleShowResults(roomId);

      case VoiceIntent.HELP:
        return this.handleHelp();

      default:
        return {
          text: "I'm not sure how to help with that. Try asking for help.",
          followUp: "Say 'help' to see available commands"
        };
    }
  }

  private async handleCreateRoom(_command: VoiceCommand): Promise<VoiceResponse> {
    // Mock implementation
    return {
      text: "I've created a new room for you. The room code is ABC123.",
      action: {
        type: 'create_room',
        data: { roomCode: 'ABC123' }
      },
      followUp: "Share this code with your friends so they can join."
    };
  }

  private async handleJoinRoom(command: VoiceCommand): Promise<VoiceResponse> {
    const roomCode = command.entities.find(e => e.type === 'room_code')?.value;
    if (!roomCode) {
      return {
        text: "I need a room code to join. What's the room code?",
        followUp: "Say 'join room' followed by the code"
      };
    }

    return {
      text: `Joining room ${roomCode}...`,
      action: {
        type: 'join_room',
        data: { roomCode }
      }
    };
  }

  private async handleSearchRestaurants(command: VoiceCommand): Promise<VoiceResponse> {
    const cuisine = command.entities.find(e => e.type === 'cuisine')?.value;
    const location = command.entities.find(e => e.type === 'location')?.value;

    return {
      text: `Searching for ${cuisine || 'restaurants'} ${location || ''}...`,
      action: {
        type: 'search_restaurants',
        data: { cuisine, location }
      },
      followUp: "I found several options. Would you like to see them?"
    };
  }

  private async handleVoteRestaurant(command: VoiceCommand, roomId?: string): Promise<VoiceResponse> {
    const restaurant = command.entities.find(e => e.type === 'restaurant')?.value;

    return {
      text: `Voting for ${restaurant || 'the restaurant'}...`,
      action: {
        type: 'vote_restaurant',
        data: { restaurant, roomId }
      }
    };
  }

  private async handleAddRestaurant(command: VoiceCommand, roomId?: string): Promise<VoiceResponse> {
    const restaurant = command.entities.find(e => e.type === 'restaurant')?.value;

    return {
      text: `Adding ${restaurant || 'restaurant'} to the list...`,
      action: {
        type: 'add_restaurant',
        data: { restaurant, roomId }
      }
    };
  }

  private async handleGetRecommendations(roomId?: string): Promise<VoiceResponse> {
    return {
      text: "Getting AI recommendations for your group...",
      action: {
        type: 'get_recommendations',
        data: { roomId }
      },
      followUp: "Based on your group's preferences, I recommend trying The Italian Place."
    };
  }

  private async handleStartVoting(roomId?: string): Promise<VoiceResponse> {
    return {
      text: "Starting the voting session...",
      action: {
        type: 'start_voting',
        data: { roomId }
      },
      followUp: "Everyone can now vote for their preferred restaurant."
    };
  }

  private async handleShowResults(roomId?: string): Promise<VoiceResponse> {
    return {
      text: "Here are the current voting results...",
      action: {
        type: 'show_results',
        data: { roomId }
      },
      followUp: "The Italian Place is currently leading with 5 votes."
    };
  }

  private async handleHelp(): Promise<VoiceResponse> {
    const commands = this.getAvailableCommands();
    const commandList = commands.map(cmd => `- ${cmd.description}: ${cmd.examples[0]}`).join('\n');

    return {
      text: "Here are the voice commands you can use:",
      followUp: commandList
    };
  }
}
