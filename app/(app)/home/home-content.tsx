"use client";

import { useState } from "react";
import { HeroSection } from "@/components/hero-section";
import { MediaCarousel } from "@/components/media-carousel";
import { ContinueWatchingCard } from "@/components/continue-watching-card";
import { TrailerModal } from "@/components/trailer-modal";
import { useApp } from "@/lib/context";
import { getMovieDetails, getTVDetails } from "@/lib/tmdb";
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
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [trailerTitle, setTrailerTitle] = useState("");

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

  const handlePlayTrailer = async () => {
    if (!data.heroMedia) return;
    
    try {
      const details = data.heroMedia.mediaType === "tv"
        ? await getTVDetails(data.heroMedia.id)
        : await getMovieDetails(data.heroMedia.id);
      
      const trailer = details.videos?.results?.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
      ) || details.videos?.results?.find(
        (v) => v.site === "YouTube"
      );

      if (trailer) {
        setTrailerKey(trailer.key);
        setTrailerTitle(data.heroMedia.title);
      } else {
        alert("No trailer available for this title.");
      }
    } catch (error) {
      console.error("Failed to fetch trailer:", error);
      alert("Failed to load trailer. Please try again.");
    }
  };

  const handlePlayContinueWatching = (item: typeof continueWatching[0]) => {
    playMedia({
      id: item.mediaId,
      title: item.title,
      media_type: item.mediaType,
      first_air_date: item.mediaType === "tv" ? "tv" : undefined,
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      {data.heroMedia && (
        <HeroSection
          media={data.heroMedia}
          onWatch={handlePlayHero}
          onTrailer={handlePlayTrailer}
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
              <ContinueWatchingCard
                key={`${item.mediaId}-${item.mediaType}`}
                item={item}
                onClick={() => handlePlayContinueWatching(item)}
              />
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

      {/* Trailer Modal */}
      {trailerKey && (
        <TrailerModal
          videoKey={trailerKey}
          title={trailerTitle}
          onClose={() => setTrailerKey(null)}
        />
      )}
    </div>
  );
}
