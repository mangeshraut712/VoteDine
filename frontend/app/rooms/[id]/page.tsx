"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import {
  Users,
  Crown,
  Copy,
  Check,
  Plus,
  Loader2,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RoomPageProps {
  params: Promise<{ id: string }>;
}

interface RoomState {
  name: string;
  code: string;
  users: Array<{ name: string; isHost: boolean }>;
  restaurants: Array<{
    id: number;
    name: string;
    cuisine: string;
    votes: number;
  }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState("");

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const newSocket = io(socketUrl);

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("join-room", {
        roomId: id,
        guestName: "Guest-" + Math.floor(Math.random() * 1000),
      });
    });

    newSocket.on("vote-updated", (data) => {
      setRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          restaurants: prev.restaurants.map((r) =>
            r.id === data.restaurantId ? { ...r, votes: data.votes } : r
          ),
        };
      });
    });

    newSocket.on("restaurant-added", (data) => {
      setRoomState((prev) => {
        if (!prev) return prev;
        // Avoid duplicates
        if (prev.restaurants.some(r => r.id === data.restaurant.id)) return prev;
        return {
          ...prev,
          restaurants: [...prev.restaurants, {
            id: data.restaurant.id,
            name: data.restaurant.name,
            cuisine: data.restaurant.cuisine || "Various",
            votes: 0
          }],
        };
      });
    });

    newSocket.on("user-joined", (data) => {
      setRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: [...prev.users, { name: data.guestName || "Anonymous", isHost: false }]
        };
      });
    });

    newSocket.on("error", (err) => {
      setError(err.message || "An error occurred");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Also fetch room data from API
    fetch(`/api/rooms/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRoomState({
            name: data.data.name,
            code: data.data.code,
            users: data.data.members?.map((m: { guestName?: string; user?: { username?: string }; isHost: boolean }) => ({
              name: m.guestName || m.user?.username || "Anonymous",
              isHost: m.isHost || false,
            })) || [],
            restaurants: data.data.roomRestaurants?.map((rr: { restaurant: { id: number; name: string; cuisine?: string; votes?: any[] } }) => ({
              id: rr.restaurant.id,
              name: rr.restaurant.name,
              cuisine: rr.restaurant.cuisine || "Various",
              votes: rr.restaurant.votes?.length || 0,
            })) || [],
          });
        }
      })
      .catch(console.error);

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomState?.code || id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVote = (restaurantId: number, isUpvote: boolean) => {
    if (!socket || !isConnected) return;
    socket.emit("vote", {
      roomId: id,
      restaurantId,
      // In a real app we'd have a user ID, using fallback 0 if guest
      userId: undefined,
      guestName: "Guest"
    });
  };

  const addRestaurant = () => {
    if (!newRestaurant.trim() || !socket || !isConnected) return;
    // For demo: adding by name would require a search first, but here we'll just emit
    // In real app, we'd pick from search results
    socket.emit("add-restaurant", {
      roomId: id,
      restaurantId: Math.floor(Math.random() * 5) + 1, // Pick a random seeded restaurant
    });
    setNewRestaurant("");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button
              onClick={() => router.push("/rooms")}
              variant="outline"
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rooms
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!roomState) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/rooms")}
                  className="p-0 h-auto text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Rooms
                </Button>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {roomState.name || `Room ${id}`}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-500">Code:</span>
                <span className="font-mono font-bold text-gray-900">{id}</span>
                <button onClick={copyCode} className="text-gray-400 hover:text-gray-600">
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  {isConnected ? "Live" : "Connecting..."}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Restaurants Section */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Restaurants</h2>

              {/* Add Restaurant */}
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Add a restaurant..."
                  value={newRestaurant}
                  onChange={(e) => setNewRestaurant(e.target.value)}
                  className="flex-1 h-12 rounded-xl border-gray-200"
                />
                <Button
                  onClick={addRestaurant}
                  className="h-12 px-6 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {/* Restaurant List */}
              {roomState.restaurants.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p>No restaurants yet. Add one to start voting!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {roomState.restaurants.map((restaurant) => (
                    <div
                      key={restaurant.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{restaurant.name}</h3>
                        <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVote(restaurant.id, true)}
                          className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                        <span className="px-3 py-1 bg-white rounded-lg font-semibold text-gray-900 min-w-[40px] text-center">
                          {restaurant.votes}
                        </span>
                        <button
                          onClick={() => handleVote(restaurant.id, false)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <ThumbsDown className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Participants Section */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">Participants</h2>
                <span className="text-sm text-gray-400">
                  ({roomState.users.length || 1})
                </span>
              </div>

              <div className="space-y-3">
                {roomState.users.length > 0 ? (
                  roomState.users.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-semibold">
                          {user.name[0]?.toUpperCase() || "U"}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                      {user.isHost && <Crown className="w-4 h-4 text-yellow-500" />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <p className="text-sm">Just you for now...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
