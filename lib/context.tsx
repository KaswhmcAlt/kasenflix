"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Profile, WatchlistItem, ContinueWatchingItem } from "./types";

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

interface AppContextType {
  // Profile
  profiles: Profile[];
  currentProfile: Profile | null;
  setCurrentProfile: (profile: Profile | null) => void;
  addProfile: (name: string) => void;
  removeProfile: (profileId: string) => void;
  isManagingProfiles: boolean;
  setIsManagingProfiles: (value: boolean) => void;

  // Auth
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithApple: () => Promise<boolean>;
  logout: () => void;

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
  playMedia: (media: VideoPlayerState["activeMedia"]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isManagingProfiles, setIsManagingProfiles] = useState(false);
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
    const savedAuth = localStorage.getItem("kasenflix_auth");
    const savedProfile = localStorage.getItem("kasenflix_profile");
    const savedProfiles = localStorage.getItem("kasenflix_profiles");
    const savedWatchlist = localStorage.getItem("kasenflix_watchlist");
    const savedContinueWatching = localStorage.getItem("kasenflix_continue_watching");

    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
    if (savedProfiles) {
      setProfiles(JSON.parse(savedProfiles));
    }
    if (savedProfile) {
      setCurrentProfile(JSON.parse(savedProfile));
    }
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
    if (savedContinueWatching) {
      setContinueWatching(JSON.parse(savedContinueWatching));
    }
  }, []);

  // Save profiles to localStorage
  useEffect(() => {
    localStorage.setItem("kasenflix_profiles", JSON.stringify(profiles));
  }, [profiles]);

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem("kasenflix_watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // Save continue watching to localStorage
  useEffect(() => {
    localStorage.setItem("kasenflix_continue_watching", JSON.stringify(continueWatching));
  }, [continueWatching]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - accept any non-empty credentials
    if (email && password) {
      setIsAuthenticated(true);
      localStorage.setItem("kasenflix_auth", "true");
      return true;
    }
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    // Mock Google login - would require Firebase configuration
    alert("Google Sign-In requires Firebase configuration. For now, please use email/password login.");
    return false;
  };

  const loginWithApple = async (): Promise<boolean> => {
    // Mock Apple login - would require Firebase configuration
    alert("Apple Sign-In requires Firebase configuration. For now, please use email/password login.");
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
      avatarUrl: `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(name)}&backgroundColor=7c3aed`,
    };
    setProfiles((prev) => [...prev, newProfile]);
  };

  const removeProfile = (profileId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    if (currentProfile?.id === profileId) {
      setCurrentProfile(null);
      localStorage.removeItem("kasenflix_profile");
    }
  };

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

  const playMedia = (media: VideoPlayerState["activeMedia"]) => {
    if (!media) return;
    
    // Add to continue watching when playing
    const isTv = media.media_type === "tv" || media.first_air_date !== undefined;
    addToContinueWatching({
      mediaId: media.id,
      mediaType: isTv ? "tv" : "movie",
      title: media.title || media.name || "Unknown",
      posterUrl: null, // Will be fetched separately
      backdropUrl: null,
      progress: 5, // Start at 5%
      season: isTv ? 1 : undefined,
      episode: isTv ? 1 : undefined,
    });

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
        removeProfile,
        isManagingProfiles,
        setIsManagingProfiles,
        isAuthenticated,
        login,
        loginWithGoogle,
        loginWithApple,
        logout,
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
