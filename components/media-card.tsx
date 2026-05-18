"use client";

import Image from "next/image";
import { Bookmark, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/context";
import type { NormalizedMedia } from "@/lib/tmdb";

interface MediaCardProps {
  media: NormalizedMedia;
  showRank?: number;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

function getRatingColor(rating: number): string {
  if (rating >= 7.5) return "bg-green-500";
  if (rating >= 6) return "bg-yellow-500";
  return "bg-red-500";
}

export function MediaCard({ media, showRank, size = "md", onClick }: MediaCardProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, playMedia } = useApp();
  const inWatchlist = isInWatchlist(media.id, media.mediaType);

  const sizeClasses = {
    sm: "w-[140px]",
    md: "w-[180px]",
    lg: "w-[220px]",
  };

  const aspectClasses = {
    sm: "aspect-[2/3] h-[210px]",
    md: "aspect-[2/3] h-[270px]",
    lg: "aspect-[2/3] h-[330px]",
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(media.id, media.mediaType);
    } else {
      addToWatchlist(media.id, media.mediaType);
    }
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playMedia({
      id: media.id,
      title: media.title,
      media_type: media.mediaType,
      first_air_date: media.mediaType === "tv" ? "tv" : undefined,
    });
  };

  return (
    <div
      className={cn(
        "group relative flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105",
        sizeClasses[size]
      )}
      onClick={onClick}
    >
      {/* Rank number for Top 10 */}
      {showRank && (
        <div className="absolute -left-6 bottom-0 z-10 text-[120px] font-black leading-none text-foreground/20 select-none">
          {showRank}
        </div>
      )}

      {/* Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-card",
          aspectClasses[size],
          showRank && "ml-8"
        )}
      >
        {/* Poster Image */}
        {media.posterUrl ? (
          <Image
            src={media.posterUrl}
            alt={media.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 140px, 220px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No Image</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Play button (centered on hover) */}
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label="Play"
        >
          <div className="rounded-full bg-primary p-3 shadow-lg hover:scale-110 transition-transform">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
        </button>

        {/* Bookmark button */}
        <button
          onClick={handleBookmark}
          className={cn(
            "absolute top-2 left-2 z-20 rounded-md p-1.5 transition-all",
            inWatchlist
              ? "bg-primary text-primary-foreground"
              : "bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70"
          )}
          aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Bookmark className={cn("h-4 w-4", inWatchlist && "fill-current")} />
        </button>

        {/* Rating badge */}
        <div
          className={cn(
            "absolute top-2 right-2 flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold text-white",
            getRatingColor(media.rating)
          )}
        >
          <span className="text-yellow-300">★</span>
          <span>{media.rating.toFixed(1)}</span>
        </div>

        {/* Title overlay on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <h3 className="text-sm font-semibold text-white line-clamp-2">{media.title}</h3>
          <p className="text-xs text-white/70">
            {media.mediaType === "movie" ? "Movie" : "TV Show"} / {media.year} / {media.language}
          </p>
        </div>
      </div>

      {/* Title below card (always visible) */}
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium text-foreground line-clamp-1">{media.title}</h3>
        <p className="text-xs text-muted-foreground">
          {media.mediaType === "movie" ? "Movie" : "TV Show"} / {media.year} / {media.language}
        </p>
      </div>
    </div>
  );
}
