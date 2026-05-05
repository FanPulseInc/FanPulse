import { NextResponse } from "next/server";
import { getDotaSeries } from "@/app/_lib/grid/dota";

function getDayRange(dateIso: string) {
  return {
    gte: `${dateIso}T00:00:00Z`,
    lte: `${dateIso}T23:59:59Z`,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Missing date" }, { status: 400 });
  }

  try {
    const { gte, lte } = getDayRange(date);
    const data = await getDotaSeries(gte, lte);

    console.log("DOTA GRID series:", data.series.length);

    return NextResponse.json(data);
  } catch (error) {
    console.error("DOTA GRID series error:", error);

    return NextResponse.json(
      { error: "Failed to load Dota series" },
      { status: 500 }
    );
  }
}