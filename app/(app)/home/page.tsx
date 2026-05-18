import { Suspense } from "react";
import {
  getTrendingAll,
  getTrendingTV,
  getPopularMovies,
  getMoviesByGenre,
  getTVByGenre,
} from "@/lib/tmdb";
import { HomeContent } from "./home-content";

// Genre IDs for specific rows
const SCI_FI_MOVIE_GENRE = 878;
const ACTION_MOVIE_GENRE = 28;

async function getHomeData() {
  const [trending, trendingTV, popular, sciFi, action] = await Promise.all([
    getTrendingAll(),
    getTrendingTV(),
    getPopularMovies(),
    getMoviesByGenre(SCI_FI_MOVIE_GENRE),
    getMoviesByGenre(ACTION_MOVIE_GENRE),
  ]);

  return {
    heroMedia: trending[0],
    top10TV: trendingTV.slice(0, 10),
    popularMovies: popular,
    sciFiMovies: sciFi,
    actionMovies: action,
  };
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-[500px] w-full rounded-lg bg-card" />
      
      {/* Carousel skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-6 w-48 rounded bg-card" />
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="h-[270px] w-[180px] rounded-lg bg-card" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <HomeContent data={data} />
    </Suspense>
  );
}
