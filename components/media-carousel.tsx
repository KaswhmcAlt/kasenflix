"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaCard } from "./media-card";
import type { NormalizedMedia } from "@/lib/tmdb";

interface MediaCarouselProps {
  title: string;
  items: NormalizedMedia[];
  showRank?: boolean;
  size?: "sm" | "md" | "lg";
  onItemClick?: (media: NormalizedMedia) => void;
}

export function MediaCarousel({
  title,
  items,
  showRank = false,
  size = "md",
  onItemClick,
}: MediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (items.length === 0) return null;

  return (
    <section className="relative py-4">
      <h2 className="mb-4 text-xl font-bold text-foreground">{title}</h2>

      <div className="group relative">
        {/* Left scroll button */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white opacity-0 transition-opacity hover:bg-black/90 group-hover:opacity-100"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Carousel container */}
        <div
          ref={scrollRef}
          className={cn(
            "flex gap-4 overflow-x-auto pb-4 hide-scrollbar",
            showRank && "pl-8"
          )}
        >
          {items.slice(0, 20).map((item, index) => (
            <MediaCard
              key={`${item.id}-${item.mediaType}`}
              media={item}
              showRank={showRank ? index + 1 : undefined}
              size={size}
              onClick={() => onItemClick?.(item)}
            />
          ))}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 z-30 -translate-y-1/2 rounded-full bg-black/70 p-2 text-white opacity-0 transition-opacity hover:bg-black/90 group-hover:opacity-100"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
}
