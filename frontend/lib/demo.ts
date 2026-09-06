export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const DEMO_ROOM_ID = "demo";

export const demoRecommendations = [
  {
    restaurantId: 1,
    name: "Sunset Tacos",
    reason: "Crowd-pleaser tacos that fit a mixed spice-and-budget vote.",
    confidence: 0.92,
    matchScore: 92,
    factors: ["Group favorite", "Mid-range price", "Walkable"],
  },
  {
    restaurantId: 2,
    name: "Harbor Ramen",
    reason: "High-confidence pick when the group leans savory and quick.",
    confidence: 0.84,
    matchScore: 84,
    factors: ["Fast seating", "Comfort food", "Strong ratings"],
  },
  {
    restaurantId: 3,
    name: "Green Bowl Co.",
    reason: "Balanced option when some guests want a lighter meal.",
    confidence: 0.78,
    matchScore: 78,
    factors: ["Vegetarian-friendly", "Custom bowls", "Weeknight-friendly"],
  },
];

export const demoAnalytics = {
  totalRooms: 128,
  activeRooms: 14,
  totalVotes: 1842,
  topCuisine: "Thai",
  trends: {
    roomsChange: 8,
    votesChange: 12,
  },
  votingTrends: [
    { date: "2026-08-31", votes: 42 },
    { date: "2026-09-01", votes: 55 },
    { date: "2026-09-02", votes: 61 },
    { date: "2026-09-03", votes: 48 },
    { date: "2026-09-04", votes: 73 },
    { date: "2026-09-05", votes: 80 },
    { date: "2026-09-06", votes: 91 },
  ],
  topRestaurants: [
    { name: "Sunset Tacos", votes: 214, cuisine: "Mexican" },
    { name: "Harbor Ramen", votes: 187, cuisine: "Japanese" },
    { name: "Green Bowl Co.", votes: 156, cuisine: "Healthy" },
  ],
};

export const demoRoom = {
  name: "Friday Night Demo",
  code: DEMO_ROOM_ID,
  users: [
    { name: "Alex (you)", isHost: true },
    { name: "Sam", isHost: false },
    { name: "Riley", isHost: false },
  ],
  restaurants: [
    { id: 1, name: "Sunset Tacos", cuisine: "Mexican", votes: 5 },
    { id: 2, name: "Harbor Ramen", cuisine: "Japanese", votes: 3 },
    { id: 3, name: "Green Bowl Co.", cuisine: "Healthy", votes: 2 },
  ],
};

export const demoRestaurants = [
  {
    id: "1",
    name: "Sunset Tacos",
    image_url: "",
    rating: 4.6,
    location: { address1: "12 Market St", city: "Philadelphia" },
    categories: [{ title: "Mexican" }],
    price: "$$",
  },
  {
    id: "2",
    name: "Harbor Ramen",
    image_url: "",
    rating: 4.5,
    location: { address1: "88 Pine Ave", city: "Philadelphia" },
    categories: [{ title: "Ramen" }],
    price: "$$",
  },
  {
    id: "3",
    name: "Green Bowl Co.",
    image_url: "",
    rating: 4.4,
    location: { address1: "401 Walnut St", city: "Philadelphia" },
    categories: [{ title: "Salads" }],
    price: "$",
  },
];
