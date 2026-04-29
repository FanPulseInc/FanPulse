import { NextRequest, NextResponse } from "next/server";
import { getCs2Series } from "@/app/_lib/grid/cs2"; 

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const gte =
      searchParams.get("gte") ?? new Date().toISOString();

    const lte =
      searchParams.get("lte") ??
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const data = await getCs2Series(gte, lte);

    return NextResponse.json(data);
  } catch (error) {
    console.error("GRID route error:", error);

    return NextResponse.json(
      { error: "Failed to fetch CS2 series" },
      { status: 500 }
    );
  }
}