"use client";

import { useState, useEffect } from "react";
import { MediaCard } from "@/components/media-card";
import { cn } from "@/lib/utils";
import type { NormalizedMedia, TMDBGenre } from "@/lib/tmdb";

interface MoviesContentProps {
  data: {
    popular: NormalizedMedia[];
    topRated: NormalizedMedia[];
    nowPlaying: NormalizedMedia[];
    upcoming: NormalizedMedia[];
    genres: TMDBGenre[];
  };
}

type Category = "all" | "popular" | "top_rated" | "now_playing" | "upcoming";

export function MoviesContent({ data }: MoviesContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [filteredMovies, setFilteredMovies] = useState<NormalizedMedia[]>([]);

  const categories: { id: Category; label: string }[] = [
    { id: "all", label: "All" },
    { id: "popular", label: "Popular" },
    { id: "top_rated", label: "Top Rated" },
    { id: "now_playing", label: "Now Playing" },
    { id: "upcoming", label: "Upcoming" },
  ];

  useEffect(() => {
    let movies: NormalizedMedia[] = [];

    switch (selectedCategory) {
      case "popular":
        movies = data.popular;
        break;
      case "top_rated":
        movies = data.topRated;
        break;
      case "now_playing":
        movies = data.nowPlaying;
        break;
      case "upcoming":
        movies = data.upcoming;
        break;
      default:
        // Combine all and remove duplicates
        const allMovies = [...data.popular, ...data.topRated, ...data.nowPlaying, ...data.upcoming];
        const seen = new Set<number>();
        movies = allMovies.filter((movie) => {
          if (seen.has(movie.id)) return false;
          seen.add(movie.id);
          return true;
        });
    }

    // Filter by genre if selected
    if (selectedGenre) {
      movies = movies.filter((movie) => movie.genreIds.includes(selectedGenre));
    }

    setFilteredMovies(movies);
  }, [selectedCategory, selectedGenre, data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Movies</h1>
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

      {/* Movies grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredMovies.map((movie) => (
          <MediaCard key={movie.id} media={movie} size="md" />
        ))}
      </div>

      {/* Empty state */}
      {filteredMovies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg text-muted-foreground">No movies found</p>
          <p className="text-sm text-muted-foreground/70">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
