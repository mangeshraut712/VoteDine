"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RoomsPage() {
  const [roomName, setRoomName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const router = useRouter();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/rooms/${data.data.code}`);
      }
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    router.push(`/rooms/${joinCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Voting Rooms</h1>
            <p className="text-gray-500">Create or join a room to start voting</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === "create"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Create Room
            </button>
            <button
              onClick={() => setActiveTab("join")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === "join"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Join Room
            </button>
          </div>

          {/* Create Room Form */}
          {activeTab === "create" && (
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Name
                </label>
                <Input
                  id="roomName"
                  placeholder="e.g., Friday Night Dinner"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !roomName.trim()}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl"
              >
                {isLoading ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Room
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Join Room Form */}
          {activeTab === "join" && (
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label htmlFor="joinCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Room Code
                </label>
                <Input
                  id="joinCode"
                  placeholder="Enter 8-character code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={8}
                  className="h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 font-mono text-center text-lg tracking-wider"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={joinCode.length < 8}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                Join Room
              </Button>
            </form>
          )}

          {/* Help Text */}
          <p className="text-center text-sm text-gray-400 mt-6">
            {activeTab === "create"
              ? "You'll get a shareable code after creating the room."
              : "Ask the room creator for the 8-character code."}
          </p>
        </div>
      </div>
    </div>
  );
}
