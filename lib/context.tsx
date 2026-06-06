"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { WatchlistItem, ContinueWatchingItem } from "./types";

// Video player state
export interface VideoPlayerState {
  activeMedia: {
    id: number;
    title?: string;
    name?: string;
    media_type?: string;
    first_air_date?: string;
    number_of_seasons?: number;
    seasons?: { season_number: number; episode_count: number }[];
  } | null;
  activeServer: number;
  activeSeason: number;
  activeEpisode: number;
  iframeKey: number;
}

export interface DetailsTarget {
  id: number;
  mediaType: "movie" | "tv";
}

interface AppContextType {
  // Details modal
  detailsTarget: DetailsTarget | null;
  openDetails: (target: DetailsTarget) => void;
  closeDetails: () => void;

  // Watchlist
  watchlist: WatchlistItem[];
  addToWatchlist: (mediaId: number, mediaType: "movie" | "tv") => void;
  removeFromWatchlist: (mediaId: number, mediaType: "movie" | "tv") => void;
  isInWatchlist: (mediaId: number, mediaType: "movie" | "tv") => boolean;

  // Continue Watching
  continueWatching: ContinueWatchingItem[];
  addToContinueWatching: (item: ContinueWatchingItem) => void;
  updateContinueWatching: (mediaId: number, mediaType: "movie" | "tv", progress: number, season?: number, episode?: number) => void;

  // Video Player
  videoPlayerState: VideoPlayerState;
  setVideoPlayerState: (updates: Partial<VideoPlayerState>) => void;
  playMedia: (media: VideoPlayerState["activeMedia"], options?: { season?: number; episode?: number }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [detailsTarget, setDetailsTarget] = useState<DetailsTarget | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [videoPlayerState, setVideoPlayerStateInternal] = useState<VideoPlayerState>({
    activeMedia: null,
    activeServer: 1,
    activeSeason: 1,
    activeEpisode: 1,
    iframeKey: Date.now(),
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem("kasenflix_watchlist");
    const savedContinueWatching = localStorage.getItem("kasenflix_continue_watching");

    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
    if (savedContinueWatching) {
      setContinueWatching(JSON.parse(savedContinueWatching));
    }
  }, []);

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem("kasenflix_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Save continue watching to localStorage
  useEffect(() => {
    localStorage.setItem("kasenflix_continue_watching", JSON.stringify(continueWatching));
  }, [continueWatching]);

  const openDetails = (target: DetailsTarget) => setDetailsTarget(target);
  const closeDetails = () => setDetailsTarget(null);

  const addToWatchlist = (mediaId: number, mediaType: "movie" | "tv") => {
    if (!isInWatchlist(mediaId, mediaType)) {
      setWatchlist((prev) => [...prev, { mediaId, mediaType, addedAt: new Date() }]);
    }
  };

  const removeFromWatchlist = (mediaId: number, mediaType: "movie" | "tv") => {
    setWatchlist((prev) =>
      prev.filter((item) => !(item.mediaId === mediaId && item.mediaType === mediaType))
    );
  };

  const isInWatchlist = (mediaId: number, mediaType: "movie" | "tv") => {
    return watchlist.some((item) => item.mediaId === mediaId && item.mediaType === mediaType);
  };

  const addToContinueWatching = (item: ContinueWatchingItem) => {
    setContinueWatching((prev) => {
      const existing = prev.findIndex(
        (i) => i.mediaId === item.mediaId && i.mediaType === item.mediaType
      );
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = item;
        return updated;
      }
      return [item, ...prev];
    });
  };

  const updateContinueWatching = (
    mediaId: number,
    mediaType: "movie" | "tv",
    progress: number,
    season?: number,
    episode?: number
  ) => {
    setContinueWatching((prev) =>
      prev.map((item) =>
        item.mediaId === mediaId && item.mediaType === mediaType
          ? { ...item, progress, ...(season && { season }), ...(episode && { episode }) }
          : item
      )
    );
  };

  const setVideoPlayerState = (updates: Partial<VideoPlayerState>) => {
    setVideoPlayerStateInternal((prev) => ({ ...prev, ...updates }));
  };

  const playMedia = (
    media: VideoPlayerState["activeMedia"],
    options?: { season?: number; episode?: number }
  ) => {
    if (!media) return;

    const season = options?.season ?? 1;
    const episode = options?.episode ?? 1;

    // Add to continue watching when playing
    const isTv = media.media_type === "tv" || media.first_air_date !== undefined;
    addToContinueWatching({
      mediaId: media.id,
      mediaType: isTv ? "tv" : "movie",
      title: media.title || media.name || "Unknown",
      posterUrl: null, // Will be fetched separately
      backdropUrl: null,
      progress: 5, // Start at 5%
      season: isTv ? season : undefined,
      episode: isTv ? episode : undefined,
    });

    setVideoPlayerStateInternal({
      activeMedia: media,
      activeServer: 1,
      activeSeason: season,
      activeEpisode: episode,
      iframeKey: Date.now(),
    });
  };

  return (
    <AppContext.Provider
      value={{
        detailsTarget,
        openDetails,
        closeDetails,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        continueWatching,
        addToContinueWatching,
        updateContinueWatching,
        videoPlayerState,
        setVideoPlayerState,
        playMedia,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
