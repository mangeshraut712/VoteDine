"use client";

import VoiceAssistant from "@/components/voice-assistant";

export default function VoiceCommandsPage() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Voice Commands</h1>
            <p className="text-gray-500">Control VoteDine with your voice</p>
          </div>

          {/* Voice Assistant */}
          <VoiceAssistant />
        </div>
      </div>
    </div>
  );
}
