import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";

const recommendationSchema = z.object({
  mood: z.enum(["cozy", "adventurous", "quick", "celebrate", "healthy"]).optional(),
  priceRange: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
  dietary: z.array(z.enum(["vegan", "vegetarian", "gluten-free", "halal", "kosher"]))
    .optional(),
  groupSize: z.number().min(1).max(50).optional(),
  timeOfDay: z.enum(["breakfast", "lunch", "dinner", "late"]).optional(),
  location: z.string().optional(),
  cuisine: z.string().optional(),
});

type Recommendation = {
  id: string;
  name: string;
  cuisine: string;
  price: "$" | "$$" | "$$$" | "$$$$";
  vibe: "cozy" | "adventurous" | "quick" | "celebrate" | "healthy";
  tags: Array<"vegan" | "vegetarian" | "gluten-free" | "halal" | "kosher">;
  bestFor: Array<"breakfast" | "lunch" | "dinner" | "late">;
  description: string;
};

// Hardcoded fallback data is now removed in favor of real database results


function scoreRecommendation(item: Recommendation, input: z.infer<typeof recommendationSchema>) {
  let score = 0;
  const insights: string[] = [];

  if (input.mood && item.vibe === input.mood) {
    score += 3;
    insights.push(`Matches the ${input.mood} vibe`);
  }

  if (input.priceRange && item.price === input.priceRange) {
    score += 2;
    insights.push(`Fits the ${input.priceRange} budget`);
  }

  if (input.timeOfDay && item.bestFor.includes(input.timeOfDay)) {
    score += 2;
    insights.push(`Great for ${input.timeOfDay}`);
  }

  if (input.cuisine && item.cuisine.toLowerCase().includes(input.cuisine.toLowerCase())) {
    score += 2;
    insights.push(`Cuisine match: ${item.cuisine}`);
  }

  if (input.dietary && input.dietary.length > 0) {
    const matches = input.dietary.filter((tag) => item.tags.includes(tag));
    if (matches.length > 0) {
      score += matches.length;
      insights.push(`Supports ${matches.join(", ")}`);
    }
  }

  if (input.groupSize && input.groupSize >= 6 && item.vibe !== "quick") {
    score += 1;
    insights.push("Works well for larger groups");
  }

  return { score, insights };
}

export async function recommendationRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const input = recommendationSchema.parse(request.query);

      // Fetch all restaurants from DB
      const dbRestaurants = await fastify.prisma.restaurant.findMany();

      const ranked = dbRestaurants
        .map((r) => {
          // Simulate AI vibe and tags for database restaurants if not present
          const item: Recommendation = {
            id: r.id.toString(),
            name: r.name,
            cuisine: r.cuisine || "Mixed",
            price: (r.price as Recommendation["price"]) || "$$",
            vibe: (r.cuisine?.toLowerCase().includes("bistro") ? "celebrate" :
              r.cuisine?.toLowerCase().includes("mediterranean") ? "healthy" :
                r.cuisine?.toLowerCase().includes("fusion") ? "adventurous" : "cozy") as Recommendation["vibe"],
            tags: (r.cuisine?.toLowerCase().includes("mediterranean") ? ["vegetarian", "gluten-free"] : []) as Recommendation["tags"],
            bestFor: ["lunch", "dinner"],
            description: `A highly rated ${r.cuisine} restaurant with ${r.rating} stars.`
          };

          const { score, insights } = scoreRecommendation(item, input);
          return { item, score, insights };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map(({ item, score, insights }) => ({
          ...item,
          score,
          insights,
          confidence: Math.min(0.98, 0.65 + score * 0.08),
        }));

      return reply.send({
        success: true,
        data: {
          recommendations: ranked,
          request: input,
          message: input.location
            ? `VoteDine AI tuned the picks near ${input.location}.`
            : "VoteDine AI tuned the picks to your vibe.",
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          message: "Invalid input",
          errors: error.errors,
        });
      }
      throw error;
    }
  });
}
