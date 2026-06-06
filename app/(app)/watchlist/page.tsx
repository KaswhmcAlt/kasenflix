"use client";

import { useEffect, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { MediaCard } from "@/components/media-card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context";
import type { NormalizedMedia } from "@/lib/tmdb";

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useApp();
  const [mediaItems, setMediaItems] = useState<NormalizedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchWatchlistMedia() {
      if (watchlist.length === 0) {
        setMediaItems([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch details for each watchlist item
        const items = await Promise.all(
          watchlist.map(async (item) => {
            const response = await fetch(
              `/api/media/${item.mediaType}/${item.mediaId}`
            );
            if (response.ok) {
              return response.json();
            }
            return null;
          })
        );

        setMediaItems(items.filter((item): item is NormalizedMedia => item !== null));
      } catch (error) {
        console.error("Failed to fetch watchlist:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWatchlistMedia();
  }, [watchlist]);

  const handleClearAll = () => {
    watchlist.forEach((item) => {
      removeFromWatchlist(item.mediaId, item.mediaType);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Watchlist</h1>
          <p className="text-muted-foreground mt-1">
            Your saved titles ({watchlist.length} items)
          </p>
        </div>

        {watchlist.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-card animate-pulse" />
          ))}
        </div>
      ) : watchlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {mediaItems.map((media) => (
            <MediaCard key={`${media.id}-${media.mediaType}`} media={media} size="md" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Bookmark className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Your watchlist is empty</h2>
          <p className="text-muted-foreground max-w-sm">
            Start adding movies and TV shows to your watchlist by clicking the bookmark icon on any title.
          </p>
        </div>
      )}
    </div>
  );
}
