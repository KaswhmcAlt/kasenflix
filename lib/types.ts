export interface Profile {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface WatchlistItem {
  mediaId: number;
  mediaType: "movie" | "tv";
  addedAt: Date;
}

export interface ContinueWatchingItem {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterUrl: string | null;
  progress: number; // 0-100
  season?: number;
  episode?: number;
}

export interface WatchPartyRoom {
  code: string;
  hostName: string;
  mediaId: number;
  mediaType: "movie" | "tv";
  mediaTitle: string;
  participants: number;
  isActive: boolean;
}
