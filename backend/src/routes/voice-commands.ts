import { FastifyInstance } from 'fastify';
import { VoiceCommandService } from '../services/voice-commands.js';
import { VoiceSettings } from '../types/voice-commands';

export async function voiceCommandsRoutes(fastify: FastifyInstance) {
  const voiceService = VoiceCommandService.getInstance();

  // POST /process - Process voice command
  fastify.post('/process', {
    schema: {
      description: 'Process voice command and return response',
      tags: ['Voice Commands'],
      body: {
        type: 'object',
        required: ['audio'],
        properties: {
          audio: {
            type: 'string',
            description: 'Base64 encoded audio data'
          },
          settings: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean', default: true },
              language: { type: 'string', default: 'en-US' },
              confidence: { type: 'number', minimum: 0, maximum: 1, default: 0.7 },
              autoSubmit: { type: 'boolean', default: false },
              wakeWord: { type: 'string' }
            }
          },
          roomId: { type: 'string', description: 'Room ID for context' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            action: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                data: { type: 'object' }
              }
            },
            followUp: { type: 'string' }
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' }
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
      const body = request.body as { audio?: string; settings?: VoiceSettings; roomId?: string };
      const audioData = body.audio || '';
      const settings: VoiceSettings = body.settings || { enabled: true, language: 'en-US', confidence: 0.7, autoSubmit: false };
      const roomId = body.roomId;

      const response = await voiceService.processVoiceCommand(audioData, settings, roomId);
      return reply.send(response);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to process voice command' });
    }
  });

  // GET /commands - Get available voice commands
  fastify.get('/commands', {
    schema: {
      description: 'Get list of available voice commands',
      tags: ['Voice Commands'],
      response: {
        200: {
          type: 'object',
          properties: {
            commands: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  intent: { type: 'string' },
                  examples: { type: 'array', items: { type: 'string' } },
                  description: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const commands = voiceService.getAvailableCommands();
      return reply.send({ commands });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to get voice commands' });
    }
  });

  // POST /text-to-speech - Convert text to speech
  fastify.post('/text-to-speech', {
    schema: {
      description: 'Convert text response to speech',
      tags: ['Voice Commands'],
      body: {
        type: 'object',
        required: ['text'],
        properties: {
          text: { type: 'string', description: 'Text to convert to speech' },
          voice: {
            type: 'string',
            enum: ['female', 'male', 'neutral'],
            default: 'female'
          },
          language: { type: 'string', default: 'en-US' },
          speed: { type: 'number', minimum: 0.5, maximum: 2.0, default: 1.0 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            audioUrl: { type: 'string' },
            duration: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
      const { text: _text, voice: _voice, language: _language, speed: _speed } = request.body as any;

      // This would integrate with text-to-speech service
      // For now, return mock response
      const audioUrl = `/api/voice/audio/${Date.now()}.wav`;

      return reply.send({
        audioUrl,
        duration: 2.5 // seconds
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to convert text to speech' });
    }
  });

  // GET /audio/:filename - Serve generated audio files
  fastify.get('/audio/:filename', {
    schema: {
      description: 'Serve generated audio files',
      tags: ['Voice Commands'],
      params: {
        type: 'object',
        properties: {
          filename: { type: 'string' }
        }
      }
    }
  }, async (_request, reply) => {
    try {
      // Logic for serving audio files would go here using request.params.filename

      // This would serve actual audio files
      // For now, return empty response
      reply.type('audio/wav');
      return reply.send(Buffer.from(''));
    } catch (error) {
      fastify.log.error(error);
      return reply.code(404).send({ error: 'Audio file not found' });
    }
  });

  // POST /settings - Update voice settings
  fastify.post('/settings', {
    schema: {
      description: 'Update voice command settings',
      tags: ['Voice Commands'],
      body: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          language: { type: 'string' },
          confidence: { type: 'number', minimum: 0, maximum: 1 },
          autoSubmit: { type: 'boolean' },
          wakeWord: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            settings: { type: 'object' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const settings = request.body as VoiceSettings;

      // This would save settings to database
      // For now, just return success
      return reply.send({
        success: true,
        settings
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update voice settings' });
    }
  });
}
