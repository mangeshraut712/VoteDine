"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Users,
  Vote,
  Utensils,
  Calendar,
  Clock,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AnalyticsData {
  totalRooms: number;
  activeRooms: number;
  totalVotes: number;
  topCuisine: string;
  trends?: {
    roomsChange: number;
    votesChange: number;
  };
  votingTrends?: Array<{
    date: string;
    votes: number;
  }>;
  topRestaurants?: Array<{
    name: string;
    votes: number;
    cuisine: string;
  }>;
}

const fetchAnalytics = async (): Promise<AnalyticsData> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/overview`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Failed to fetch analytics");

  // Transform API response to match interface if needed
  return {
    ...json.data,
    totalRooms: json.data.rooms, // Map 'rooms' from API to 'totalRooms'
  };
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  color,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  change?: number;
  color: string;
  trend?: "up" | "down" | "neutral";
}) => {
  const getTrendIcon = () => {
    if (!trend || trend === "neutral") return <Minus className="w-3 h-3" />;
    return trend === "up" ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    );
  };

  const getTrendColor = () => {
    if (!trend || trend === "neutral") return "text-gray-500";
    return trend === "up" ? "text-green-600" : "text-red-600";
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 card-hover border-0 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1 font-display">
          {value.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500 font-medium">{label}</div>
      </CardContent>
    </Card>
  );
};

export default function AnalyticsDashboard() {
  const [mounted, setMounted] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl skeleton" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 rounded-2xl skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-red-800 font-medium">Failed to load analytics</p>
          <p className="text-red-600 text-sm mt-1">Please try again later</p>
        </CardContent>
      </Card>
    );
  }

  const stats: Array<{
    icon: any;
    label: string;
    value: string | number;
    change?: number;
    color: string;
    trend?: "up" | "down" | "neutral";
  }> = [
      {
        icon: Users,
        label: "Total Rooms",
        value: data?.totalRooms || 0,
        change: data?.trends?.roomsChange,
        color: "from-blue-500 to-cyan-500",
        trend: (data?.trends?.roomsChange
          ? data.trends.roomsChange > 0
            ? "up"
            : data.trends.roomsChange < 0
              ? "down"
              : "neutral"
          : undefined) as any,
      },
      {
        icon: TrendingUp,
        label: "Active Rooms",
        value: data?.activeRooms || 0,
        color: "from-green-500 to-emerald-500",
        trend: "up" as const,
      },
      {
        icon: Vote,
        label: "Total Votes",
        value: data?.totalVotes || 0,
        change: data?.trends?.votesChange,
        color: "from-orange-500 to-red-500",
        trend: (data?.trends?.votesChange
          ? data.trends.votesChange > 0
            ? "up"
            : data.trends.votesChange < 0
              ? "down"
              : "neutral"
          : undefined) as any,
      },
      {
        icon: Utensils,
        label: "Top Cuisine",
        value: data?.topCuisine || "Mixed",
        color: "from-purple-500 to-pink-500",
      },
    ];


  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-display mb-1">
            Analytics Overview
          </h2>
          <p className="text-gray-600">
            Real-time insights into your voting activity
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Updated just now</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="observe-fade"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Voting Trends Chart */}
      {data?.votingTrends && data.votingTrends.length > 0 && (
        <Card className="border-0 shadow-lg observe-fade">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Voting Trends
                </h3>
                <p className="text-sm text-gray-500">
                  Daily voting activity over the past week
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>+12% this week</span>
              </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-2">
              {data.votingTrends.map((trend, index) => {
                const maxVotes = Math.max(...data.votingTrends!.map((t) => t.votes));
                const height = (trend.votes / maxVotes) * 100;
                return (
                  <div key={trend.date} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-orange-500 to-pink-500 rounded-t-lg hover:from-orange-600 hover:to-pink-600 transition-all cursor-pointer group relative"
                      style={{
                        height: `${height}%`,
                        minHeight: "20px",
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {trend.votes} votes
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(trend.date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Restaurants */}
      {data?.topRestaurants && data.topRestaurants.length > 0 && (
        <Card className="border-0 shadow-lg observe-fade">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Restaurants
                </h3>
                <p className="text-sm text-gray-500">
                  Most voted restaurants this month
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {data.topRestaurants.map((restaurant, index) => {
                const maxVotes = Math.max(...data.topRestaurants!.map((r) => r.votes));
                const percentage = (restaurant.votes / maxVotes) * 100;
                return (
                  <div
                    key={restaurant.name}
                    className="group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                            {restaurant.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {restaurant.cuisine}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-700">
                        {restaurant.votes} votes
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6 observe-fade">
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {data?.activeRooms || 0}
                </div>
                <div className="text-sm text-blue-700">Active Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-900">
                  {((data?.totalVotes || 0) / (data?.totalRooms || 1)).toFixed(1)}
                </div>
                <div className="text-sm text-purple-700">Avg Votes/Room</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-900">
                  +{data?.trends?.votesChange || 0}%
                </div>
                <div className="text-sm text-orange-700">Growth This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
