"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Play, Bookmark, Star } from "lucide-react";
import { useApp } from "@/lib/context";
import {
  getMovieDetails,
  getTVDetails,
  getTVSeasonDetails,
  getImageUrl,
} from "@/lib/tmdb";
import { cn } from "@/lib/utils";

interface Details {
  id: number;
  title: string;
  overview: string;
  backdropUrl: string | null;
  posterUrl: string | null;
  year: string;
  rating: number;
  genres: string[];
  seasons: { season_number: number; episode_count: number; name: string }[];
  numberOfSeasons: number;
}

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  runtime: number | null;
}

export function MediaDetailsModal() {
  const { detailsTarget, closeDetails, playMedia, addToWatchlist, removeFromWatchlist, isInWatchlist } = useApp();
  const [details, setDetails] = useState<Details | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSeason, setActiveSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const isTv = detailsTarget?.mediaType === "tv";

  // Lock body scroll while open
  useEffect(() => {
    if (detailsTarget) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [detailsTarget]);

  // Fetch details when target changes
  useEffect(() => {
    if (!detailsTarget) {
      setDetails(null);
      setEpisodes([]);
      setActiveSeason(1);
      return;
    }

    setLoading(true);
    const fetcher = isTv ? getTVDetails(detailsTarget.id) : getMovieDetails(detailsTarget.id);
    fetcher
      .then((data: any) => {
        setDetails({
          id: data.id,
          title: data.title || data.name,
          overview: data.overview,
          backdropUrl: getImageUrl(data.backdrop_path, "w780"),
          posterUrl: getImageUrl(data.poster_path, "w342"),
          year: (data.release_date || data.first_air_date || "").split("-")[0],
          rating: Math.round((data.vote_average || 0) * 10) / 10,
          genres: (data.genres || []).map((g: { name: string }) => g.name),
          seasons: (data.seasons || []).filter((s: { season_number: number }) => s.season_number > 0),
          numberOfSeasons: data.number_of_seasons || 0,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [detailsTarget, isTv]);

  // Fetch episodes for TV when season changes
  useEffect(() => {
    if (!detailsTarget || !isTv || !details) return;
    setLoadingEpisodes(true);
    getTVSeasonDetails(detailsTarget.id, activeSeason)
      .then((data) => setEpisodes(data.episodes))
      .catch(console.error)
      .finally(() => setLoadingEpisodes(false));
  }, [detailsTarget, isTv, activeSeason, details]);

  if (!detailsTarget) return null;

  const inWatchlist = isInWatchlist(detailsTarget.id, detailsTarget.mediaType);

  const handlePlay = (season?: number, episode?: number) => {
    if (!details) return;
    playMedia(
      {
        id: details.id,
        title: details.title,
        media_type: detailsTarget.mediaType,
        first_air_date: isTv ? "tv" : undefined,
      },
      isTv ? { season: season ?? activeSeason, episode: episode ?? 1 } : undefined
    );
    closeDetails();
  };

  const handleWatchlist = () => {
    if (inWatchlist) {
      removeFromWatchlist(detailsTarget.id, detailsTarget.mediaType);
    } else {
      addToWatchlist(detailsTarget.id, detailsTarget.mediaType);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 p-0 sm:p-4 sm:py-8"
      onClick={closeDetails}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden bg-card shadow-2xl sm:rounded-xl min-h-screen sm:min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeDetails}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
          aria-label="Close details"
        >
          <X className="h-5 w-5" />
        </button>

        {loading || !details ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Backdrop hero */}
            <div className="relative aspect-video w-full bg-muted">
              {details.backdropUrl ? (
                <Image
                  src={details.backdropUrl}
                  alt={details.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />

              {/* Title + actions */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <h2 className="text-2xl font-bold text-white text-balance sm:text-3xl">
                  {details.title}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handlePlay()}
                    className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {isTv ? "Play S1:E1" : "Watch Now"}
                  </button>
                  <button
                    onClick={handleWatchlist}
                    className={cn(
                      "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                      inWatchlist
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/15 text-white hover:bg-white/25"
                    )}
                  >
                    <Bookmark className={cn("h-4 w-4", inWatchlist && "fill-current")} />
                    {inWatchlist ? "Saved" : "Watchlist"}
                  </button>
                </div>
              </div>
            </div>

            {/* Meta + overview */}
            <div className="p-4 sm:p-6">
              <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {details.rating > 0 && (
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    {details.rating.toFixed(1)}
                  </span>
                )}
                {details.year && <span>{details.year}</span>}
                {details.genres.length > 0 && (
                  <span className="line-clamp-1">{details.genres.slice(0, 3).join(" • ")}</span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-foreground/80">
                {details.overview || "No description available."}
              </p>

              {/* Episodes for TV */}
              {isTv && details.numberOfSeasons > 0 && (
                <div className="mt-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold text-foreground">Episodes</h3>
                    <select
                      value={activeSeason}
                      onChange={(e) => setActiveSeason(Number(e.target.value))}
                      className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground"
                    >
                      {Array.from({ length: details.numberOfSeasons }, (_, i) => i + 1).map((s) => {
                        const sd = details.seasons.find((x) => x.season_number === s);
                        return (
                          <option key={s} value={s}>
                            Season {s}{sd ? ` (${sd.episode_count})` : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {loadingEpisodes ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Loading episodes...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {episodes.map((ep) => (
                        <button
                          key={ep.id}
                          onClick={() => handlePlay(activeSeason, ep.episode_number)}
                          className="flex w-full items-start gap-3 rounded-lg border border-border bg-secondary/40 p-2 text-left hover:bg-secondary transition"
                        >
                          <div className="relative aspect-video w-28 flex-shrink-0 overflow-hidden rounded-md bg-muted sm:w-32">
                            {ep.still_path ? (
                              <Image
                                src={getImageUrl(ep.still_path, "w342") || ""}
                                alt={ep.name}
                                fill
                                className="object-cover"
                                sizes="128px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                E{ep.episode_number}
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition">
                              <Play className="h-6 w-6 fill-white text-white" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 py-0.5">
                            <p className="text-sm font-medium text-foreground">
                              {ep.episode_number}. {ep.name}
                              {ep.runtime ? <span className="ml-2 text-xs text-muted-foreground">{ep.runtime}m</span> : null}
                            </p>
                            {ep.overview && (
                              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                {ep.overview}
                              </p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
