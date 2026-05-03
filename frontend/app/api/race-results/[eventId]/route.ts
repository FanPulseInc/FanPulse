import { NextRequest, NextResponse } from "next/server";

interface ScrapedRow {
    position: number;
    name: string;
    team?: string;
    teamBadge?: string;
    photoUrl?: string;
    equipmentUrl?: string;
    country?: string;
    interval?: string;
}

function decode(s: string): string {
    return s
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .trim();
}

function parseResults(html: string): ScrapedRow[] {
    const tableMatch = html.match(/<table[^>]*id=['"]event-results-table['"][^>]*>([\s\S]*?)<\/table>/i);
    if (!tableMatch) return [];
    const tbody = tableMatch[1];
    const rows: ScrapedRow[] = [];
    const trRe = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch: RegExpExecArray | null;
    while ((trMatch = trRe.exec(tbody)) !== null) {
        const tr = trMatch[1];
        const tds = [...tr.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m => m[1]);
        if (tds.length < 5) continue;
        const posStr = decode(tds[0].replace(/<[^>]*>/g, ""));
        const position = Number(posStr.replace(/\D/g, ""));
        if (!Number.isFinite(position) || position < 1) continue;

        const photoMatch = tds[1].match(/src=['"]([^'"]*\/cutout\/[^'"]*)['"]/);
        const teamBadgeMatch = tds[2].match(/src=['"]([^'"]*\/team\/badge\/[^'"]*)['"]/);
        const teamHref = tds[2].match(/\/team\/[0-9]+-([a-z0-9-]+)/i);
        const equipMatch = tds[3] ? tds[3].match(/src=['"]([^'"]*\/equipment\/[^'"]*)['"]/) : null;
        const flagMatch = tds[4].match(/\/flags\/[^/]*\/[0-9]+\/([^.'"]+)\.png/);
        const nameMatch = tds[4].match(/<a[^>]*\/player\/[^>]*>([^<]+)<\/a>/);
        const intervalRaw = tds.length > 5 ? decode(tds[5].replace(/<[^>]*>/g, "")) : "";

        const stripImageSize = (url: string | undefined) => url ? url.replace(/\/(tiny|small|medium)$/i, "") : url;

        rows.push({
            position,
            name: nameMatch ? decode(nameMatch[1]) : "",
            team: teamHref ? decode(teamHref[1].replace(/-/g, " ")).replace(/\b\w/g, c => c.toUpperCase()) : undefined,
            teamBadge: stripImageSize(teamBadgeMatch?.[1]),
            photoUrl: stripImageSize(photoMatch?.[1]),
            equipmentUrl: stripImageSize(equipMatch?.[1] ?? undefined),
            country: flagMatch ? decode(flagMatch[1]) : undefined,
            interval: intervalRaw || undefined,
        });
    }
    return rows;
}

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await context.params;
    if (!/^\d+$/.test(eventId)) {
        return NextResponse.json({ error: "Invalid eventId" }, { status: 400 });
    }
    try {
        const upstream = await fetch(`https://www.thesportsdb.com/event/${eventId}-Race`, {
            headers: { "User-Agent": "Mozilla/5.0 FanPulse/1.0" },
            next: { revalidate: 300 },
        });
        const html = await upstream.text();
        const results = parseResults(html);
        return NextResponse.json({ results });
    } catch (err) {
        return NextResponse.json({ error: "Scrape failed", detail: String(err) }, { status: 502 });
    }
}
