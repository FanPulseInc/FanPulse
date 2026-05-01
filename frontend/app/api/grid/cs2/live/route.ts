import { NextResponse } from "next/server";
import { getLiveCs2Series } from "@/app/_lib/grid/cs2";

export async function GET() {
  try {
    const now = new Date();

    const gte = new Date(now);
    gte.setUTCHours(0, 0, 0, 0);

    const lte = new Date(now);
    lte.setUTCHours(23, 59, 59, 999);

    const data = await getLiveCs2Series(
      gte.toISOString(),
      lte.toISOString()
    );
    console.log("LIVE SERIES DATA:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("LIVE ROUTE ERROR:", error);

    return NextResponse.json(
      { totalCount: 0, series: [] },
      { status: 500 }
    );
  }
}