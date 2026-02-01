import { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import axios from "axios";

interface YelpBusiness {
  id: string;
  name: string;
  image_url: string;
  url: string;
  review_count: number;
  rating: number;
  phone: string;
  price: string;
  location: {
    display_address: string[];
  };
  categories: Array<{
    title: string;
  }>;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface YelpResponse {
  businesses: YelpBusiness[];
  total: number;
}

const searchSchema = z.object({
  term: z.string().optional(),
  location: z.string().optional(),
  latitude: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
  longitude: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
  radius: z.preprocess((val) => (val ? Number(val) : undefined), z.number().min(100).max(40000).optional()),
  categories: z.string().optional(),
  price: z.string().optional(),
  limit: z.preprocess((val) => (val ? Number(val) : undefined), z.number().min(1).max(50).optional()),
  offset: z.preprocess((val) => (val ? Number(val) : undefined), z.number().optional()),
});

const YELP_API_URL = "https://api.yelp.com/v3/businesses/search";

export async function restaurantRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
) {
  // Search restaurants - try Yelp first, then fall back to DB
  fastify.get("/search", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const params = searchSchema.parse(request.query);
      const yelpKey = process.env.YELP_API_KEY;

      if (yelpKey && yelpKey !== "your-yelp-api-key") {
        try {
          const response = await axios.get<YelpResponse>(YELP_API_URL, {
            headers: {
              Authorization: `Bearer ${yelpKey}`,
            },
            params: {
              term: params.term || "restaurants",
              location: params.location || "Philadelphia",
              latitude: params.latitude,
              longitude: params.longitude,
              radius: params.radius,
              categories: params.categories,
              price: params.price,
              limit: params.limit || 20,
              offset: params.offset || 0,
              sort_by: "best_match",
            },
          });

          const restaurants = response.data.businesses.map((business: YelpBusiness) => ({
            id: business.id,
            yelpId: business.id,
            name: business.name,
            image_url: business.image_url,
            url: business.url,
            review_count: business.review_count,
            rating: business.rating,
            phone: business.phone,
            price: business.price,
            location: {
              address1: business.location?.display_address?.[0],
              city: business.location?.display_address?.[1] || 'Philadelphia',
            },
            categories: business.categories,
            coordinates: business.coordinates,
          }));

          return reply.send({
            success: true,
            data: restaurants,
            source: "yelp",
            total: response.data.total,
          });
        } catch (yelpError) {
          console.error("Yelp API error, falling back to database:", yelpError);
        }
      }

      // Fallback search from local database
      const searchTerm = params.term || "";
      const dbRestaurants = await fastify.prisma.restaurant.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { cuisine: { contains: searchTerm, mode: "insensitive" } },
            { address: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: params.limit || 20,
      });

      return reply.send({
        success: true,
        data: dbRestaurants.map(r => ({
          id: r.id.toString(),
          name: r.name,
          image_url: r.imageUrl, // Map to Yelp field name
          rating: r.rating,
          review_count: r.reviewCount,
          price: r.price,
          location: {
            address1: r.address?.split(',')[0],
            city: r.address?.split(',')[1]?.trim() || 'Philadelphia',
          },
          categories: r.cuisine ? [{ title: r.cuisine }] : [],
          phone: r.phone,
          coordinates: {
            latitude: r.latitude,
            longitude: r.longitude,
          }
        })),
        source: "database",
        total: dbRestaurants.length,
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

  // Get restaurant details
  fastify.get("/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    const restaurant = await fastify.prisma.restaurant.findUnique({
      where: { id: parseInt(id) },
      include: {
        votes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!restaurant) {
      return reply.status(404).send({
        success: false,
        message: "Restaurant not found",
      });
    }

    return reply.send({
      success: true,
      data: restaurant,
    });
  });
}
