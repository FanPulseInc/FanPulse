import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.SPORTSDB_BASE_URL ?? "https://www.thesportsdb.com/api/v2/json";
const KEY = process.env.SPORTSDB_API_KEY;

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ path: string[] }> }
) {
    if (!KEY) {
        return NextResponse.json(
            { error: "SPORTSDB_API_KEY is not configured on the server." },
            { status: 500 }
        );
    }

    const { path } = await context.params;
    const upstreamPath = path.join("/");
    const search = req.nextUrl.search; // forward query string verbatim
    const url = `${BASE}/${upstreamPath}${search}`;

    try {
        const upstream = await fetch(url, {
            method: "GET",
            headers: { "X-API-KEY": KEY },
            // Cache on the edge per Next's defaults; most endpoints don't need realtime
            // freshness except livescore which we override at the hook level.
            next: { revalidate: 30 },
        });

        if (upstream.status === 429) {
            return NextResponse.json(
                { error: "TheSportsDB rate limit hit (100 req/min). Try again shortly." },
                { status: 429 }
            );
        }

        const text = await upstream.text();
        // TheSportsDB occasionally returns empty bodies for unknown lookups.
        const data = text ? JSON.parse(text) : null;
        return NextResponse.json(data, { status: upstream.status });
    } catch (err) {
        console.error("[sports proxy] upstream error", url, err);
        return NextResponse.json(
            { error: "Upstream fetch failed", detail: String(err) },
            { status: 502 }
        );
    }
}
