"use client";

import { HeroSection } from "@/components/hero-section";
import { MediaCarousel } from "@/components/media-carousel";
import { ContinueWatchingCard } from "@/components/continue-watching-card";
import { useApp } from "@/lib/context";
import type { NormalizedMedia } from "@/lib/tmdb";

interface HomeContentProps {
  data: {
    heroMedia: NormalizedMedia;
    top10TV: NormalizedMedia[];
    popularMovies: NormalizedMedia[];
    sciFiMovies: NormalizedMedia[];
    actionMovies: NormalizedMedia[];
  };
}

export function HomeContent({ data }: HomeContentProps) {
  const { currentProfile, continueWatching, playMedia } = useApp();

  const handlePlayHero = () => {
    if (data.heroMedia) {
      playMedia({
        id: data.heroMedia.id,
        title: data.heroMedia.title,
        media_type: data.heroMedia.mediaType,
        first_air_date: data.heroMedia.mediaType === "tv" ? "tv" : undefined,
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      {data.heroMedia && (
        <HeroSection
          media={data.heroMedia}
          onWatch={handlePlayHero}
          onDetails={() => {
            // TODO: Open details modal
          }}
        />
      )}

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section className="py-4">
          <h2 className="mb-4 text-xl font-bold text-foreground">
            Continue Watching ({currentProfile?.name})
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {continueWatching.map((item) => (
              <ContinueWatchingCard key={`${item.mediaId}-${item.mediaType}`} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Top 10 TV Shows */}
      <MediaCarousel
        title="Top 10 Today's Movies"
        items={data.popularMovies}
        showRank
        size="lg"
      />

      {/* Trending TV with large cards */}
      <MediaCarousel
        title="Trending TV Shows"
        items={data.top10TV}
        size="md"
      />

      {/* Futuristic Sci-Fi */}
      <MediaCarousel
        title="Futuristic Sci-Fi"
        items={data.sciFiMovies}
        size="md"
      />

      {/* Pulse-Pounding Action */}
      <MediaCarousel
        title="Pulse-Pounding Action"
        items={data.actionMovies}
        size="md"
      />
    </div>
  );
}
