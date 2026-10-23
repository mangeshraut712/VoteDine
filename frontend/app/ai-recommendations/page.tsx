"use client";

import { useState, useEffect } from "react";
import AIRecommendations from "@/components/ai-recommendations";
import { demoRecommendations, isDemoMode } from "@/lib/demo";
import { apiUrl } from "@/lib/api";
import { toRecommendationId } from "@/lib/recommendations";

interface Recommendation {
  restaurantId: number;
  name: string;
  reason: string;
  confidence: number;
  matchScore: number;
  factors: string[];
}

export default function AIRecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      if (isDemoMode) {
        setRecommendations(demoRecommendations);
        return;
      }
      const response = await fetch(apiUrl("/api/recommendations"));
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.recommendations) {
          const mapped = data.data.recommendations.flatMap(
            (item: {
              id: string;
              name: string;
              description: string;
              confidence: number;
              score: number;
              insights: string[];
            }) => {
              const restaurantId = toRecommendationId(item.id);
              if (restaurantId === null) return [];
              return [{
                restaurantId,
                name: item.name,
                reason: item.description,
                confidence: item.confidence,
                matchScore: Math.min(100, Math.round(item.confidence * 100)),
                factors: item.insights?.slice(0, 3) || ["AI-powered pick", "Curated for you"],
              }];
            }
          );
          setRecommendations(mapped);
        }
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      setRecommendations(isDemoMode ? demoRecommendations : []);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleAccept = (restaurantId: number) => {
    console.log("Accepted recommendation:", restaurantId);
    // TODO: Add to room or navigate
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Recommendations</h1>
            <p className="text-gray-500">Smart picks based on your preferences</p>
          </div>

          {/* Recommendations */}
          <AIRecommendations
            recommendations={recommendations}
            onAcceptRecommendation={handleAccept}
            onRequestNew={fetchRecommendations}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
