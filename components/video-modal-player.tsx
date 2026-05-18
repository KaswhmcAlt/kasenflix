"use client";

import { ChevronLeft } from "lucide-react";

interface Media {
  id: number;
  title?: string;
  name?: string;
  media_type?: string;
  first_air_date?: string;
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
    case 1: // Server 1 (VidPlus Base Route)
      return isTv
        ? `https://vidlink.pro/tv/${id}/${season}/${episode}`
        : `https://vidlink.pro/movie/${id}`;

    case 2: // Server 2 (EmbedMaster Base Route)
      return isTv
        ? `https://vidsrc.me/embed/tv?tmdb=${id}&sea=${season}&epi=${episode}`
        : `https://vidsrc.me/embed/movie?tmdb=${id}`;

    case 3: // Server 3 (VidLink Base Route)
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
      iframeKey: Date.now(), // Forces a complete unmount/remount of the iframe
    });
  };

  const handleClose = () => {
    setState({
      activeMedia: null,
      activeServer: 1,
      activeSeason: 1,
      activeEpisode: 1,
    });
  };

  const isTv =
    state.activeMedia.media_type === "tv" ||
    state.activeMedia.first_air_date !== undefined;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black z-50 flex flex-col justify-center items-center">
      {/* FLOAT-CONTROL HUD OVERLAY */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent z-50">
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

        <div className="w-[140px]" /> {/* Spacer for centering */}
      </div>

      {/* THE MEDIA ENGINE IFRAME CONTAINER */}
      <div className="w-full h-full pt-16 pb-20">
        <iframe
          key={state.iframeKey || "primary-frame"} // Prevents freezing when swapping mirrors
          src={currentSrc}
          className="w-full h-full border-0"
          allowFullScreen
          scrolling="no"
          allow="autoplay; encrypted-media; picture-in-picture"
        />
      </div>

      {/* MULTI-SERVER QUICK SWITCH CONTROLLER HUD */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-full flex gap-1 z-50 shadow-2xl backdrop-blur-md">
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

      {/* Season/Episode selector for TV shows */}
      {isTv && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-zinc-900/90 border border-zinc-800 p-2 rounded-lg flex gap-4 z-50 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Season:</span>
            <select
              value={state.activeSeason}
              onChange={(e) =>
                setState({
                  activeSeason: parseInt(e.target.value),
                  iframeKey: Date.now(),
                })
              }
              className="bg-zinc-800 text-white text-sm px-2 py-1 rounded border border-zinc-700"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Episode:</span>
            <select
              value={state.activeEpisode}
              onChange={(e) =>
                setState({
                  activeEpisode: parseInt(e.target.value),
                  iframeKey: Date.now(),
                })
              }
              className="bg-zinc-800 text-white text-sm px-2 py-1 rounded border border-zinc-700"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
