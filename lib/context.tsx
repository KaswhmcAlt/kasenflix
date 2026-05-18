"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Profile, WatchlistItem, ContinueWatchingItem } from "./types";

// Default profiles
const DEFAULT_PROFILES: Profile[] = [
  {
    id: "1",
    name: "gg",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=gg&backgroundColor=7c3aed",
  },
];

// Mock continue watching data
const MOCK_CONTINUE_WATCHING: ContinueWatchingItem[] = [
  {
    mediaId: 76479,
    mediaType: "tv",
    title: "The Boys",
    posterUrl: null, // Will be fetched
    progress: 35,
    season: 1,
    episode: 1,
  },
];

// Video player state
export interface VideoPlayerState {
  activeMedia: {
    id: number;
    title?: string;
    name?: string;
    media_type?: string;
    first_air_date?: string;
  } | null;
  activeServer: number;
  activeSeason: number;
  activeEpisode: number;
  iframeKey: number;
}

interface AppContextType {
  // Profile
  profiles: Profile[];
  currentProfile: Profile | null;
  setCurrentProfile: (profile: Profile | null) => void;
  addProfile: (name: string) => void;

  // Auth
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Watchlist
  watchlist: WatchlistItem[];
  addToWatchlist: (mediaId: number, mediaType: "movie" | "tv") => void;
  removeFromWatchlist: (mediaId: number, mediaType: "movie" | "tv") => void;
  isInWatchlist: (mediaId: number, mediaType: "movie" | "tv") => boolean;

  // Continue Watching
  continueWatching: ContinueWatchingItem[];

  // Video Player
  videoPlayerState: VideoPlayerState;
  setVideoPlayerState: (updates: Partial<VideoPlayerState>) => void;
  playMedia: (media: VideoPlayerState["activeMedia"]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(DEFAULT_PROFILES);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [continueWatching] = useState<ContinueWatchingItem[]>(MOCK_CONTINUE_WATCHING);
  const [videoPlayerState, setVideoPlayerStateInternal] = useState<VideoPlayerState>({
    activeMedia: null,
    activeServer: 1,
    activeSeason: 1,
    activeEpisode: 1,
    iframeKey: Date.now(),
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem("kasenflix_auth");
    const savedProfile = localStorage.getItem("kasenflix_profile");
    const savedWatchlist = localStorage.getItem("kasenflix_watchlist");

    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
    if (savedProfile) {
      setCurrentProfile(JSON.parse(savedProfile));
    }
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Save watchlist to localStorage
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem("kasenflix_watchlist", JSON.stringify(watchlist));
    }
  }, [watchlist]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - accept any non-empty credentials
    if (email && password) {
      setIsAuthenticated(true);
      localStorage.setItem("kasenflix_auth", "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentProfile(null);
    localStorage.removeItem("kasenflix_auth");
    localStorage.removeItem("kasenflix_profile");
  };

  const handleSetCurrentProfile = (profile: Profile | null) => {
    setCurrentProfile(profile);
    if (profile) {
      localStorage.setItem("kasenflix_profile", JSON.stringify(profile));
    } else {
      localStorage.removeItem("kasenflix_profile");
    }
  };

  const addProfile = (name: string) => {
    const newProfile: Profile = {
      id: Date.now().toString(),
      name,
      avatarUrl: `https://api.dicebear.com/7.x/personas/svg?seed=${name}&backgroundColor=7c3aed`,
    };
    setProfiles([...profiles, newProfile]);
  };

  const addToWatchlist = (mediaId: number, mediaType: "movie" | "tv") => {
    if (!isInWatchlist(mediaId, mediaType)) {
      setWatchlist([...watchlist, { mediaId, mediaType, addedAt: new Date() }]);
    }
  };

  const removeFromWatchlist = (mediaId: number, mediaType: "movie" | "tv") => {
    setWatchlist(
      watchlist.filter((item) => !(item.mediaId === mediaId && item.mediaType === mediaType))
    );
  };

  const isInWatchlist = (mediaId: number, mediaType: "movie" | "tv") => {
    return watchlist.some((item) => item.mediaId === mediaId && item.mediaType === mediaType);
  };

  const setVideoPlayerState = (updates: Partial<VideoPlayerState>) => {
    setVideoPlayerStateInternal((prev) => ({ ...prev, ...updates }));
  };

  const playMedia = (media: VideoPlayerState["activeMedia"]) => {
    setVideoPlayerStateInternal({
      activeMedia: media,
      activeServer: 1,
      activeSeason: 1,
      activeEpisode: 1,
      iframeKey: Date.now(),
    });
  };

  return (
    <AppContext.Provider
      value={{
        profiles,
        currentProfile,
        setCurrentProfile: handleSetCurrentProfile,
        addProfile,
        isAuthenticated,
        login,
        logout,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        continueWatching,
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
