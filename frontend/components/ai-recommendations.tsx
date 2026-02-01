"use client";

import { Sparkles, ThumbsUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIRecommendation {
  restaurantId: number;
  name: string;
  reason: string;
  confidence: number;
  matchScore: number;
  factors: string[];
}

interface AIRecommendationsProps {
  recommendations: AIRecommendation[];
  onAcceptRecommendation: (restaurantId: number) => void;
  onRequestNew: () => void;
  isLoading?: boolean;
}

export default function AIRecommendations({
  recommendations,
  onAcceptRecommendation,
  onRequestNew,
  isLoading = false,
}: AIRecommendationsProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
            <p className="text-sm text-gray-500">Smart picks for your group</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRequestNew}
          disabled={isLoading}
          className="rounded-lg"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-xl">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No recommendations yet. Click refresh to get AI picks!</p>
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.restaurantId}
              className="p-4 border border-gray-100 rounded-xl hover:border-purple-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{rec.name}</h4>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs font-medium rounded-full">
                      {rec.matchScore}% match
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{rec.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.factors.map((factor) => (
                      <span
                        key={factor}
                        className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md"
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onAcceptRecommendation(rec.restaurantId)}
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Pick
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
