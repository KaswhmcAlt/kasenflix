import { Suspense } from "react";
import {
  getPopularTV,
  getTopRatedTV,
  getOnTheAirTV,
  getTrendingTV,
  getTVGenres,
} from "@/lib/tmdb";
import { TVContent } from "./tv-content";

async function getTVData() {
  const [popular, topRated, onTheAir, trending, genres] = await Promise.all([
    getPopularTV(),
    getTopRatedTV(),
    getOnTheAirTV(),
    getTrendingTV(),
    getTVGenres(),
  ]);

  return {
    popular,
    topRated,
    onTheAir,
    trending,
    genres,
  };
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-64 rounded bg-card" />
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-card" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <div key={i} className="aspect-[2/3] rounded-lg bg-card" />
        ))}
      </div>
    </div>
  );
}

export default async function TVShowsPage() {
  const data = await getTVData();

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TVContent data={data} />
    </Suspense>
  );
}
