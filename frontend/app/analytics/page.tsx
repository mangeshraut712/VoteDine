"use client";

import AnalyticsDashboard from "@/components/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-500">Track voting trends and group preferences</p>
          </div>

          {/* Dashboard */}
          <AnalyticsDashboard globalView={true} />
        </div>
      </div>
    </div>
  );
}
