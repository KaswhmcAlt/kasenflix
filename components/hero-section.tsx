"use client";

import Image from "next/image";
import { Play, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NormalizedMedia } from "@/lib/tmdb";

interface HeroSectionProps {
  media: NormalizedMedia;
  onWatch?: () => void;
  onDetails?: () => void;
}

export function HeroSection({ media, onWatch, onDetails }: HeroSectionProps) {
  return (
    <section className="relative h-[500px] w-full overflow-hidden rounded-lg">
      {/* Background image */}
      {media.backdropUrl ? (
        <Image
          src={media.backdropUrl}
          alt={media.title}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-primary/20 to-background" />
      )}

      {/* Gradient overlays */}
      <div className="hero-gradient absolute inset-0" />
      <div className="hero-gradient-bottom absolute inset-0" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-8">
        {/* Badge */}
        <span className="mb-4 inline-block rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          TRENDING WEEK
        </span>

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl text-balance">
          {media.title}
        </h1>

        {/* Description */}
        <p className="mb-6 max-w-xl text-sm text-white/80 line-clamp-3 md:text-base">
          {media.overview}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button
            size="lg"
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={onWatch}
          >
            <Play className="h-5 w-5 fill-current" />
            Watch Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            onClick={onDetails}
          >
            <Info className="h-5 w-5" />
            Details
          </Button>
        </div>
      </div>
    </section>
  );
}
