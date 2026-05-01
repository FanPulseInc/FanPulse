import { NextResponse } from "next/server";
import { getCs2SeriesDetails } from "@/app/_lib/grid/cs2Detail";

export async function GET(
  _: Request,
  context: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await context.params;
    const data = await getCs2SeriesDetails(seriesId);

    console.log("Data:",data)

    if (!data) {
      return NextResponse.json(
        { error: "Series not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GRID series details route error:", error);

    return NextResponse.json(
      { error: "Failed to fetch CS2 series details" },
      { status: 500 }
    );
  }
}