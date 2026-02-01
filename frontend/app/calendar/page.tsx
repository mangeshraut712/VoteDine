"use client";

import CalendarCard from "@/components/calendar-card";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Calendar Integration</h1>
            <p className="text-gray-500">Manage your dining events and schedules</p>
          </div>

          {/* Calendar Card */}
          <CalendarCard />

          {/* Calendar Export Options */}
          <div className="mt-6 p-6 bg-white border border-gray-100 rounded-2xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Export to Calendar</h2>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="flex flex-col items-center py-4 h-auto rounded-xl">
                <span className="text-2xl mb-1">📅</span>
                <span className="text-sm">Google</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center py-4 h-auto rounded-xl">
                <span className="text-2xl mb-1">🍎</span>
                <span className="text-sm">Apple</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center py-4 h-auto rounded-xl">
                <span className="text-2xl mb-1">📨</span>
                <span className="text-sm">Outlook</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
