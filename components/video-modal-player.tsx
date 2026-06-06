"use client";

import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { getTVDetails, getTVSeasonDetails, getImageUrl } from "@/lib/tmdb";

interface Media {
  id: number;
  title?: string;
  name?: string;
  media_type?: string;
  first_air_date?: string;
  number_of_seasons?: number;
  seasons?: { season_number: number; episode_count: number; name: string }[];
}

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  runtime: number | null;
}

interface VideoPlayerState {
  activeMedia: Media | null;
  activeServer: number;
  activeSeason: number;
  activeEpisode: number;
  iframeKey: number;
}

interface VideoModalPlayerProps {
  state: VideoPlayerState;
  setState: (updates: Partial<VideoPlayerState>) => void;
}

// URL Constructor Function for multi-server streaming
function getPlayerUrl(
  media: Media,
  serverIndex: number,
  season = 1,
  episode = 1
): string {
  const id = media.id;
  const isTv =
    media.media_type === "tv" || media.first_air_date !== undefined;

  switch (serverIndex) {
    case 1:
      return isTv
        ? `https://vidlink.pro/tv/${id}/${season}/${episode}`
        : `https://vidlink.pro/movie/${id}`;
    case 2:
      return isTv
        ? `https://vidsrc.me/embed/tv?tmdb=${id}&sea=${season}&epi=${episode}`
        : `https://vidsrc.me/embed/movie?tmdb=${id}`;
    case 3:
      return isTv
        ? `https://embed.su/embed/tv/${id}/${season}/${episode}`
        : `https://embed.su/embed/movie/${id}`;
    default:
      return isTv
        ? `https://vidlink.pro/tv/${id}/${season}/${episode}`
        : `https://vidlink.pro/movie/${id}`;
  }
}

export function VideoModalPlayer({ state, setState }: VideoModalPlayerProps) {
  const [tvDetails, setTvDetails] = useState<{
    number_of_seasons: number;
    seasons: { season_number: number; episode_count: number; name: string }[];
  } | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const isTv = state.activeMedia
    ? state.activeMedia.media_type === "tv" || state.activeMedia.first_air_date !== undefined
    : false;

  // Fetch TV details when media changes
  useEffect(() => {
    if (state.activeMedia && isTv) {
      getTVDetails(state.activeMedia.id)
        .then((data) => {
          setTvDetails({
            number_of_seasons: data.number_of_seasons,
            seasons: data.seasons.filter((s) => s.season_number > 0), // Filter out specials
          });
        })
        .catch(console.error);
    } else {
      setTvDetails(null);
    }
  }, [state.activeMedia, isTv]);

  // Fetch episode details when season changes
  useEffect(() => {
    if (state.activeMedia && isTv && tvDetails) {
      setLoadingEpisodes(true);
      getTVSeasonDetails(state.activeMedia.id, state.activeSeason)
        .then((data) => {
          setEpisodes(data.episodes);
        })
        .catch(console.error)
        .finally(() => setLoadingEpisodes(false));
    }
  }, [state.activeMedia, state.activeSeason, isTv, tvDetails]);

  if (!state.activeMedia) return null;

  const currentSrc = getPlayerUrl(
    state.activeMedia,
    state.activeServer || 1,
    state.activeSeason || 1,
    state.activeEpisode || 1
  );

  const handleServerChange = (newServerIndex: number) => {
    setState({
      activeServer: newServerIndex,
      iframeKey: Date.now(),
    });
  };

  const handleClose = () => {
    setState({
      activeMedia: null,
      activeServer: 1,
      activeSeason: 1,
      activeEpisode: 1,
    });
    setTvDetails(null);
    setEpisodes([]);
  };

  const handleSeasonChange = (newSeason: number) => {
    setState({
      activeSeason: newSeason,
      activeEpisode: 1,
      iframeKey: Date.now(),
    });
  };

  const handleEpisodeChange = (newEpisode: number) => {
    setState({
      activeEpisode: newEpisode,
      iframeKey: Date.now(),
    });
  };

  // Get actual season count
  const seasonCount = tvDetails?.number_of_seasons || 1;
  const currentSeasonData = tvDetails?.seasons.find(
    (s) => s.season_number === state.activeSeason
  );
  const episodeCount = currentSeasonData?.episode_count || episodes.length || 10;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black z-50 flex flex-col">
      {/* Top control bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent z-50">
        <button
          onClick={handleClose}
          className="flex items-center gap-2 text-white bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-800 hover:bg-zinc-800 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="text-center text-white font-medium drop-shadow-md">
          {state.activeMedia.title || state.activeMedia.name}
          {isTv && ` - S${state.activeSeason}:E${state.activeEpisode}`}
        </div>

        <div className="w-[140px]" />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 pt-16 pb-16">
        {/* Video player */}
        <div className={`${isTv ? "flex-1" : "w-full"} h-full`}>
          <iframe
            key={state.iframeKey || "primary-frame"}
            src={currentSrc}
            className="w-full h-full border-0"
            allowFullScreen
            scrolling="no"
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        </div>

        {/* Episode list sidebar for TV shows */}
        {isTv && (
          <div className="w-80 bg-zinc-900/95 border-l border-zinc-800 flex flex-col">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold mb-3">Episodes</h3>
              <select
                value={state.activeSeason}
                onChange={(e) => handleSeasonChange(parseInt(e.target.value))}
                className="w-full bg-zinc-800 text-white text-sm px-3 py-2 rounded border border-zinc-700"
              >
                {Array.from({ length: seasonCount }, (_, i) => i + 1).map((s) => {
                  const seasonData = tvDetails?.seasons.find((sd) => sd.season_number === s);
                  return (
                    <option key={s} value={s}>
                      Season {s} {seasonData ? `(${seasonData.episode_count} Episodes)` : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingEpisodes ? (
                <div className="p-4 text-zinc-400 text-sm">Loading episodes...</div>
              ) : (
                <div className="p-2 space-y-2">
                  {episodes.length > 0
                    ? episodes.map((ep) => (
                        <button
                          key={ep.id}
                          onClick={() => handleEpisodeChange(ep.episode_number)}
                          className={`w-full text-left rounded-lg overflow-hidden transition ${
                            state.activeEpisode === ep.episode_number
                              ? "ring-2 ring-primary"
                              : "hover:bg-zinc-800"
                          }`}
                        >
                          {/* Episode thumbnail */}
                          <div className="relative aspect-video bg-zinc-800">
                            {ep.still_path ? (
                              <img
                                src={getImageUrl(ep.still_path, "w342") || ""}
                                alt={ep.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                No Preview
                              </div>
                            )}
                            <div className="absolute bottom-1 left-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                              E{ep.episode_number}
                            </div>
                            {ep.runtime && (
                              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                {ep.runtime}m
                              </div>
                            )}
                          </div>
                          {/* Episode info */}
                          <div className="p-2">
                            <p className="text-white text-sm font-medium line-clamp-1">
                              {ep.name}
                            </p>
                            {ep.overview && (
                              <p className="text-zinc-400 text-xs mt-1 line-clamp-2">
                                {ep.overview}
                              </p>
                            )}
                          </div>
                        </button>
                      ))
                    : Array.from({ length: episodeCount }, (_, i) => i + 1).map((epNum) => (
                        <button
                          key={epNum}
                          onClick={() => handleEpisodeChange(epNum)}
                          className={`w-full text-left p-3 rounded-lg transition ${
                            state.activeEpisode === epNum
                              ? "bg-primary text-white"
                              : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          }`}
                        >
                          Episode {epNum}
                        </button>
                      ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Server switch controller */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-full flex gap-1 z-50 shadow-2xl backdrop-blur-md">
        {[1, 2, 3].map((serverNum) => (
          <button
            key={serverNum}
            onClick={() => handleServerChange(serverNum)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              (state.activeServer || 1) === serverNum
                ? "bg-primary text-white shadow-md scale-105"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            Server {serverNum}
          </button>
        ))}
      </div>
    </div>
  );
}
