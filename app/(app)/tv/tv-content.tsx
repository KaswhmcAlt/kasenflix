"use client";

import { useState, useEffect } from "react";
import { MediaCard } from "@/components/media-card";
import { cn } from "@/lib/utils";
import type { NormalizedMedia, TMDBGenre } from "@/lib/tmdb";

interface TVContentProps {
  data: {
    popular: NormalizedMedia[];
    topRated: NormalizedMedia[];
    onTheAir: NormalizedMedia[];
    trending: NormalizedMedia[];
    genres: TMDBGenre[];
  };
}

type Category = "all" | "popular" | "top_rated" | "on_the_air" | "trending";

export function TVContent({ data }: TVContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [filteredShows, setFilteredShows] = useState<NormalizedMedia[]>([]);

  const categories: { id: Category; label: string }[] = [
    { id: "all", label: "All" },
    { id: "popular", label: "Popular" },
    { id: "top_rated", label: "Top Rated" },
    { id: "on_the_air", label: "On The Air" },
    { id: "trending", label: "Trending" },
  ];

  useEffect(() => {
    let shows: NormalizedMedia[] = [];

    switch (selectedCategory) {
      case "popular":
        shows = data.popular;
        break;
      case "top_rated":
        shows = data.topRated;
        break;
      case "on_the_air":
        shows = data.onTheAir;
        break;
      case "trending":
        shows = data.trending;
        break;
      default:
        // Combine all and remove duplicates
        const allShows = [...data.popular, ...data.topRated, ...data.onTheAir, ...data.trending];
        const seen = new Set<number>();
        shows = allShows.filter((show) => {
          if (seen.has(show.id)) return false;
          seen.add(show.id);
          return true;
        });
    }

    // Filter by genre if selected
    if (selectedGenre) {
      shows = shows.filter((show) => show.genreIds.includes(selectedGenre));
    }

    setFilteredShows(shows);
  }, [selectedCategory, selectedGenre, data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">TV Shows</h1>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Genre filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGenre(null)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            selectedGenre === null
              ? "bg-primary/20 text-primary border border-primary"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          All Genres
        </button>
        {data.genres.slice(0, 12).map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(genre.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              selectedGenre === genre.id
                ? "bg-primary/20 text-primary border border-primary"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* TV Shows grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredShows.map((show) => (
          <MediaCard key={show.id} media={show} size="md" />
        ))}
      </div>

      {/* Empty state */}
      {filteredShows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg text-muted-foreground">No TV shows found</p>
          <p className="text-sm text-muted-foreground/70">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
