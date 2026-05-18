import { NextRequest, NextResponse } from "next/server";
import { normalizeMedia } from "@/lib/tmdb";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;

  if (!["movie", "tv"].includes(type)) {
    return NextResponse.json({ error: "Invalid media type" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const data = await response.json();
    
    // Convert TMDB response to our normalized format
    const normalizedData = normalizeMedia(
      {
        ...data,
        genre_ids: data.genres?.map((g: { id: number }) => g.id) || [],
      },
      type as "movie" | "tv"
    );

    return NextResponse.json(normalizedData);
  } catch (error) {
    console.error("Media API error:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}
