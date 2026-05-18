"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import type { ContinueWatchingItem } from "@/lib/types";

interface ContinueWatchingCardProps {
  item: ContinueWatchingItem;
  onClick?: () => void;
}

export function ContinueWatchingCard({ item, onClick }: ContinueWatchingCardProps) {
  return (
    <div
      className="group relative w-[300px] flex-shrink-0 cursor-pointer overflow-hidden rounded-lg bg-card"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video">
        {item.posterUrl ? (
          <Image
            src={item.posterUrl}
            alt={item.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-muted-foreground">No Preview</span>
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Play className="h-6 w-6 fill-current" />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-14 left-0 right-0 h-1 bg-white/30">
        <div
          className="h-full bg-primary"
          style={{ width: `${item.progress}%` }}
        />
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
        {item.season && item.episode && (
          <p className="text-xs text-muted-foreground">
            Season {item.season} • Episode {item.episode}
          </p>
        )}
      </div>
    </div>
  );
}
