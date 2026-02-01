"use client";

import ShareActions from "@/components/share-actions";

export default function SharePage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Share & Invite</h1>
            <p className="text-gray-500">Invite friends to your voting rooms</p>
          </div>

          {/* Share Actions */}
          <ShareActions />
        </div>
      </div>
    </div>
  );
}
