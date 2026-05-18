"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NormalizedMedia } from "@/lib/tmdb";

type MediaType = "all" | "movie" | "tv";

export default function FinderPage() {
  const [mediaType, setMediaType] = useState<MediaType>("all");
  const [selectedMedia, setSelectedMedia] = useState<NormalizedMedia | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRandomize = async () => {
    setIsLoading(true);
    setSelectedMedia(null);

    try {
      const response = await fetch(`/api/random?type=${mediaType}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedMedia(data.media);
      }
    } catch (error) {
      console.error("Randomize error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const mediaTypes: { id: MediaType; label: string }[] = [
    { id: "all", label: "RANDOMIZE" },
    { id: "movie", label: "MOVIE" },
    { id: "tv", label: "TV" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center text-center">
      {/* Title */}
      <h1 className="text-5xl font-black italic text-foreground mb-4">Indecisive?</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Let Kasenflix select a high-rated title and <span className="font-semibold">instantly play the trailer</span> directly in front of you.
      </p>

      {/* Media type selector */}
      <div className="flex rounded-full bg-secondary p-1 mb-8">
        {mediaTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setMediaType(type.id)}
            className={cn(
              "rounded-full px-6 py-2 text-sm font-semibold transition-colors",
              mediaType === type.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Play button */}
      <Button
        size="lg"
        onClick={handleRandomize}
        disabled={isLoading}
        className="gap-3 bg-primary hover:bg-primary/90 text-lg px-12 py-6 rounded-xl"
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
        ) : (
          <Play className="h-5 w-5 fill-current" />
        )}
        Play Instantly
      </Button>

      {/* Selected media display */}
      {selectedMedia && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative mx-auto max-w-sm overflow-hidden rounded-xl bg-card shadow-2xl">
            {selectedMedia.posterUrl ? (
              <Image
                src={selectedMedia.posterUrl}
                alt={selectedMedia.title}
                width={400}
                height={600}
                className="w-full object-cover"
              />
            ) : (
              <div className="aspect-[2/3] w-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
            
            {/* Overlay info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                  {selectedMedia.mediaType === "movie" ? "Movie" : "TV Series"}
                </span>
                <span className="text-xs text-white/70">• {selectedMedia.year}</span>
                <span className="text-xs text-white/70">• {selectedMedia.language}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{selectedMedia.title}</h2>
              <p className="text-sm text-white/80 line-clamp-3">{selectedMedia.overview}</p>
              
              <div className="mt-4 flex gap-3">
                <Button size="sm" className="flex-1 gap-2">
                  <Play className="h-4 w-4 fill-current" />
                  WATCH NOW
                </Button>
                <Button size="sm" variant="outline" className="border-white/30 text-white hover:bg-white/20">
                  <span className="sr-only">More info</span>
                  i
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
