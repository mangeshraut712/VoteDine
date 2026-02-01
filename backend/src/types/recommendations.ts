import { z } from 'zod';

// AI recommendation schema
export const AIRecommendationSchema = z.object({
  restaurantId: z.number(),
  name: z.string(),
  reason: z.string(),
  confidence: z.number().min(0).max(1),
  matchScore: z.number().min(0).max(100),
  factors: z.array(z.string()),
});

export type AIRecommendation = z.infer<typeof AIRecommendationSchema>;

// AI recommendation request schema
export const AIRecommendationRequestSchema = z.object({
  roomId: z.string(),
  userPreferences: z.object({
    cuisine: z.string().optional(),
    priceRange: z.string().optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    location: z.object({
      latitude: z.number(),
      longitude: z.number(),
      radius: z.number().default(5), // miles
    }).optional(),
    previousVotes: z.array(z.object({
      restaurantId: z.number(),
      vote: z.enum(['up', 'down']),
    })).optional(),
  }),
  groupPreferences: z.object({
    averageRating: z.number().min(0).max(5).optional(),
    popularCuisines: z.array(z.string()).optional(),
    pricePreference: z.string().optional(),
  }).optional(),
});

export type AIRecommendationRequest = z.infer<typeof AIRecommendationRequestSchema>;

// AI recommendation response schema
export const AIRecommendationResponseSchema = z.object({
  recommendations: z.array(AIRecommendationSchema),
  totalResults: z.number(),
  searchRadius: z.number(),
  processingTime: z.number(),
  algorithm: z.string(),
});

export type AIRecommendationResponse = z.infer<typeof AIRecommendationResponseSchema>;
