"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UpcomingEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
}

export default function CalendarCard() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/calendar/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(data.events || []);
        }
      } catch (error) {
        console.error("Failed to fetch calendar events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const formatEventTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
            <p className="text-sm text-gray-500">Upcoming dining events</p>
          </div>
        </div>
        <Link href="/calendar">
          <Button variant="outline" size="sm" className="rounded-lg">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </Link>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-50 rounded-xl" />
            ))}
          </div>
        ) : events.length > 0 ? (
          events.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <h4 className="font-medium text-gray-900 mb-2">{event.title}</h4>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatEventDate(event.startTime)}, {formatEventTime(event.startTime)}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 text-sm">
            No upcoming events found
          </div>
        )}
      </div>

      {/* View All Link */}
      <Link href="/calendar" className="block mt-4">
        <Button variant="ghost" className="w-full text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
          View All Events
        </Button>
      </Link>
    </div>
  );
}
