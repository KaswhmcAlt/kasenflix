const TMDB_API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY || "70c6183515ac89cbab2dbdea3a6c6124";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  original_language: string;
  media_type?: "movie";
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  original_language: string;
  media_type?: "tv";
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export type MediaItem = (TMDBMovie | TMDBTVShow) & {
  media_type: "movie" | "tv";
};

// Normalized media type for our app
export interface NormalizedMedia {
  id: number;
  title: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  year: string;
  rating: number;
  language: string;
  mediaType: "movie" | "tv";
  genreIds: number[];
}

export function getImageUrl(
  path: string | null,
  size: "w185" | "w342" | "w500" | "w780" | "original" = "w500"
): string | null {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

export function normalizeMedia(
  item: TMDBMovie | TMDBTVShow,
  mediaType: "movie" | "tv"
): NormalizedMedia {
  const isMovie = mediaType === "movie";
  const movie = item as TMDBMovie;
  const tv = item as TMDBTVShow;

  return {
    id: item.id,
    title: isMovie ? movie.title : tv.name,
    overview: item.overview,
    posterUrl: getImageUrl(item.poster_path, "w342"),
    backdropUrl: getImageUrl(item.backdrop_path, "w780"),
    year: (isMovie ? movie.release_date : tv.first_air_date)?.split("-")[0] || "",
    rating: Math.round(item.vote_average * 10) / 10,
    language: item.original_language?.toUpperCase() || "EN",
    mediaType,
    genreIds: item.genre_ids || [],
  };
}

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const searchParams = new URLSearchParams({
    api_key: TMDB_API_KEY || "",
    ...params,
  });

  const response = await fetch(`${BASE_URL}${endpoint}?${searchParams}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
}

// Movie endpoints
export async function getTrendingMovies(): Promise<NormalizedMedia[]> {
  const data = await fetchTMDB<{ results: TMDBMovie[] }>("/trending/movie/week");
  return data.results.map((item) => normalizeMedia(item, "movie"));
}

export async function getPopularMovies(): Promise<NormalizedMedia[]> {
  const data = await fetchTMDB<{ results: TMDBMovie[] }>("/movie/popular");
  return data.results.map((item) => normalizeMedia(item, "movie"));
}

export async function getTopRatedMovies(): Promise<NormalizedMedia[]> {
  const data = await fetchTMDB<{ results: TMDBMovie[] }>("/movie/top_rated");
  return data.results.map((item) => normalizeMedia(item, "movie"));
}

export async function getUpcomingMovies(): Promise<NormalizedMedia[]> {
  const data = await fetchTMDB<{ results: TMDBMovie[] }>("/movie/upcoming");
  return data.results.map((item) => normalizeMedia(item, "movie"));
}

export async function getNowPlayingMovies(): Promise<NormalizedMedia[]> {
  const data = await fetchTMDB<{ results: TMDBMovie[] }>("/movie/now_playing");
  return data.results.map((item) => normalizeMedia(item, "movie"));
}

export async function getMoviesByGenre(genreId: number): Promise<NormalizedMedia[]> {
  const data = await fetchTMDB<{ results: TMDBMovie[] }>("/discover/movie", {
    with_genres: genreId.toString(),
    sort_by: "popularity.desc",
  });
  return data.results.map((item) => normalizeMedia(item, "movie"));
}

// TV endpoints
export async function getTrendingTV(): Promise<NormalizedMedia[]> {
  const data = await fetchTMDB<{ results: TMDBTVShow[] }>("/trending/tv/week");
  return data.results.map((item) => normalizeMedia(item, "tv"));
}

export async function getPopularTV(): Promise<NormalizedMedia[]> {
  const data = await fetchTMDB<{ results: TMDBTVShow[] }>("/tv/popular");
  return data.results.map((item) => normalizeMedia(item, "tv"));
}

export async function getTopRatedTV(): Promise<NormalizedMedia[]> {
  const data = await fetchTMDB<{ results: TMDBTVShow[] }>("/tv/top_rated");
  return data.results.map((item) => normalizeMedia(item, "tv"));
}

export async function getOnTheAirTV(): Promise<NormalizedMedia[]> {
  const data = await fetchTMDB<{ results: TMDBTVShow[] }>("/tv/on_the_air");
  return data.results.map((item) => normalizeMedia(item, "tv"));
}

export async function getTVByGenre(genreId: number): Promise<NormalizedMedia[]> {
  const data = await fetchTMDB<{ results: TMDBTVShow[] }>("/discover/tv", {
    with_genres: genreId.toString(),
    sort_by: "popularity.desc",
  });
  return data.results.map((item) => normalizeMedia(item, "tv"));
}

// Combined/Multi endpoints
export async function getTrendingAll(): Promise<NormalizedMedia[]> {
  const data = await fetchTMDB<{ results: (TMDBMovie | TMDBTVShow)[] }>("/trending/all/week");
  return data.results.map((item) => {
    const mediaType = "title" in item ? "movie" : "tv";
    return normalizeMedia(item, mediaType);
  });
}

export async function searchMulti(query: string): Promise<NormalizedMedia[]> {
  if (!query.trim()) return [];
  
  const data = await fetchTMDB<{ results: (TMDBMovie | TMDBTVShow & { media_type: string })[] }>(
    "/search/multi",
    { query }
  );

  return data.results
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map((item) => normalizeMedia(item, item.media_type as "movie" | "tv"));
}

// Genre endpoints
export async function getMovieGenres(): Promise<TMDBGenre[]> {
  const data = await fetchTMDB<{ genres: TMDBGenre[] }>("/genre/movie/list");
  return data.genres;
}

export async function getTVGenres(): Promise<TMDBGenre[]> {
  const data = await fetchTMDB<{ genres: TMDBGenre[] }>("/genre/tv/list");
  return data.genres;
}

// Get media details with videos (for trailers)
export async function getMovieDetails(movieId: number) {
  const data = await fetchTMDB<TMDBMovie & { videos: { results: { key: string; type: string; site: string }[] } }>(
    `/movie/${movieId}`,
    { append_to_response: "videos" }
  );
  return data;
}

export async function getTVDetails(tvId: number) {
  const data = await fetchTMDB<TMDBTVShow & { videos: { results: { key: string; type: string; site: string }[] } }>(
    `/tv/${tvId}`,
    { append_to_response: "videos" }
  );
  return data;
}

// Get random high-rated media for Finder feature
export async function getRandomHighRated(mediaType: "movie" | "tv" | "all"): Promise<NormalizedMedia | null> {
  let items: NormalizedMedia[] = [];

  if (mediaType === "movie" || mediaType === "all") {
    const movies = await getTopRatedMovies();
    items = [...items, ...movies];
  }

  if (mediaType === "tv" || mediaType === "all") {
    const tv = await getTopRatedTV();
    items = [...items, ...tv];
  }

  const highRated = items.filter((item) => item.rating >= 7.5);
  if (highRated.length === 0) return null;

  return highRated[Math.floor(Math.random() * highRated.length)];
}

// Movie Genre IDs for reference
export const MOVIE_GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

// TV Genre IDs for reference
export const TV_GENRES: Record<number, string> = {
  10759: "Action & Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  10762: "Kids",
  9648: "Mystery",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
  37: "Western",
};
