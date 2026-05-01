import { NextRequest, NextResponse } from "next/server";
import { getCs2Series } from "@/app/_lib/grid/cs2";

function getDateRange(dateParam: string | null) {
  const now = new Date();

  const baseDate = dateParam
    ? new Date(`${dateParam}T12:00:00.000Z`)
    : now;

  const gte = new Date(baseDate);
  gte.setUTCHours(0, 0, 0, 0);

  const lte = new Date(baseDate);
  lte.setUTCHours(23, 59, 59, 999);

  return {
    gte: gte.toISOString(),
    lte: lte.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const dateParam = request.nextUrl.searchParams.get("date");
    const { gte, lte } = getDateRange(dateParam);

    const data = await getCs2Series(gte, lte);

    return NextResponse.json(data);
  } catch (error) {
    console.error("CS2 series route error:", error);

    return NextResponse.json(
      { totalCount: 0, series: [] },
      { status: 500 }
    );
  }
}