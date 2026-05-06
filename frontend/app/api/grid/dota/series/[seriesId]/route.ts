import { NextResponse } from "next/server";
import { getDotaSeriesDetails } from "@/app/_lib/grid/dotaDetail";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  const { seriesId } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? undefined;


  console.log("DOTA GRID series details request:", { seriesId, date });

  try {
    const data = await getDotaSeriesDetails(seriesId, date);

    if (!data) {
      return NextResponse.json(
        { error: "Dota series not found", seriesId, date },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("DOTA GRID series details route error:", error);

    return NextResponse.json(
      { error: "Failed to load Dota series details", seriesId, date },
      { status: 500 }
    );
  }
}