import { NextRequest, NextResponse } from "next/server";
import { getRandomHighRated } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") as "movie" | "tv" | "all" || "all";

  try {
    const media = await getRandomHighRated(type);
    
    if (!media) {
      return NextResponse.json({ media: null, error: "No media found" }, { status: 404 });
    }

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Random API error:", error);
    return NextResponse.json({ media: null, error: "Failed to get random media" }, { status: 500 });
  }
}
