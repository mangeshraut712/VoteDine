"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, DollarSign } from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query) {
      const search = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(
            `/api/restaurants/search?term=${encodeURIComponent(query)}&location=Philadelphia`,
          );
          if (response.ok) {
            const data = await response.json();
            setResults(data.data || []);
          }
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      };
      search();
    }
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">
        {query ? `Search results for "${query}"` : "Search Restaurants"}
      </h1>

      {isLoading ? (
        <div className="text-center py-12">Searching...</div>
      ) : results.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((restaurant) => (
            <Card
              key={restaurant.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200 relative">
                {restaurant.image_url && (
                  <img
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-white/90 text-gray-900">
                    {restaurant.rating}{" "}
                    <Star className="inline w-3 h-3 fill-yellow-400 text-yellow-400 ml-1" />
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-1">{restaurant.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {restaurant.location?.address1}, {restaurant.location?.city}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-orange-600 font-medium">
                    {restaurant.categories?.[0]?.title}
                  </span>
                  <span className="text-gray-400">
                    {restaurant.price || "$$"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No restaurants found. Try a different search term.
        </div>
      )}
    </div>
  );
}
