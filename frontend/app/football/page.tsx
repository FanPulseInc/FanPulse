"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FootballContainer } from "../_components/_football/FootballContainer";
import ScheduleColumn, {
    type ScheduleGroup,
} from "../_components/_football/ScheduleColumn";
import MatchCarousel from "../_components/_football/MatchCarousel";
import {
    useLiveScores,
    useLeagueSeasons,
    useLeagueLookups,
} from "@/services/sportsdb/hooks";
import {
    liveToScheduleRow,
    eventToScheduleRow,
    eventToCarousel,
    localDateIsoOf,
} from "@/services/sportsdb/adapters";
import type { SDBEvent } from "@/services/sportsdb/types";

// Top European leagues for the homepage list.
// Keep the list stable — order here is the render order.
const TOP_LEAGUES: { id: string; name: string }[] = [
    { id: "4328", name: "Premier League" },
    { id: "4335", name: "La Liga" },
    { id: "4331", name: "Bundesliga" },
    { id: "4332", name: "Serie A" },
    { id: "4334", name: "Ligue 1" },
    { id: "4480", name: "UEFA Champions League" },
    { id: "4481", name: "UEFA Europa League" },
];

// Soccer season format "YYYY-YYYY"; rolls over in August.
function currentSoccerSeason(now = new Date()): string {
    const year = now.getFullYear();
    const startYear = now.getMonth() >= 7 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
}

// Local-date helpers. We must NOT use toISOString() — it converts to UTC and
// silently rolls the date back for anyone east of Greenwich.
function formatLocalIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function todayIso(): string {
    return formatLocalIso(new Date());
}

function shiftIso(iso: string, days: number): string {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    return formatLocalIso(dt);
}

function formatDateLabel(iso: string): string {
    // "2026-04-21" → "21.04.26"
    const [y, m, d] = iso.split("-");
    return `${d}.${m}.${y.slice(2)}`;
}

export default function FootballPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialDate = searchParams.get("date") || todayIso();
    const [dateIso, setDateIso] = useState<string>(initialDate);

    // Keep ?date=... in the URL so navigating to a match and back preserves it.
    useEffect(() => {
        const current = searchParams.get("date");
        if (current !== dateIso) {
            router.replace(`/football?date=${dateIso}`, { scroll: false });
        }
    }, [dateIso, router, searchParams]);

    const season = currentSoccerSeason(new Date(dateIso + "T00:00:00"));

    const leagueIds = TOP_LEAGUES.map(l => l.id);
    const seasonQueries = useLeagueSeasons(leagueIds, season);
    const leagueQueries = useLeagueLookups(leagueIds);
    const { data: liveData } = useLiveScores("soccer");

    const anyLoading = seasonQueries.some(q => q.isLoading);

    // Group events by league, filter to selected date, overlay live scores.
    const groups: ScheduleGroup[] = useMemo(() => {
        const liveById = new Map(
            (liveData?.livescore ?? []).map(l => [l.idEvent ?? "", l])
        );

        return TOP_LEAGUES.map((cfg, i) => {
            const seasonResp = seasonQueries[i].data;
            const leagueResp = leagueQueries[i].data;
            const leagueMeta = leagueResp?.lookup?.[0];

            const events: SDBEvent[] =
                seasonResp?.schedule ?? seasonResp?.events ?? [];

            const forDay = events.filter(ev => localDateIsoOf(ev) === dateIso);

            const rows = forDay.map(ev => {
                const base = eventToScheduleRow(ev);
                const live = ev.idEvent ? liveById.get(ev.idEvent) : undefined;
                return live ? { ...base, ...liveToScheduleRow(live) } : base;
            });

            rows.sort((a, b) => {
                const order: Record<string, number> = { live: 0, upcoming: 1, past: 2 };
                const ra = order[a.status ?? "upcoming"] ?? 1;
                const rb = order[b.status ?? "upcoming"] ?? 1;
                if (ra !== rb) return ra - rb;
                return (a.time ?? "").localeCompare(b.time ?? "");
            });

            return {
                leagueId: cfg.id,
                leagueName: leagueMeta?.strLeague ?? cfg.name,
                leagueBadge: leagueMeta?.strBadge ?? undefined,
                leagueCountry: leagueMeta?.strCountry,
                matches: rows,
            };
        });
    }, [seasonQueries, leagueQueries, liveData, dateIso]);

    // Carousel: 5 earliest upcoming matches from ANY of the top leagues,
    // looking forward from today.
    const carouselMatches = useMemo(() => {
        const today = todayIso();
        const all: SDBEvent[] = seasonQueries.flatMap(
            q => q.data?.schedule ?? q.data?.events ?? []
        );
        const upcoming = all
            .filter(ev => {
                if (!ev.dateEvent) return false;
                if (ev.dateEvent < today) return false;
                const status = (ev.strStatus ?? "").toLowerCase();
                return !status.includes("finish") && !status.includes("ft");
            })
            .sort((a, b) => (a.strTimestamp ?? "").localeCompare(b.strTimestamp ?? ""))
            .slice(0, 5);
        return upcoming.map(eventToCarousel);
    }, [seasonQueries]);

    return (
        <FootballContainer>
            <div className="flex gap-6 items-start justify-start">
                {/* Left — schedule grouped by league, navigable by day */}
                <div className="flex flex-col gap-2">
                    {anyLoading && (
                        <div className="w-[560px] text-center text-gray-500 text-sm py-2">
                            Завантаження матчів ({season})...
                        </div>
                    )}
                    <ScheduleColumn
                        groups={groups}
                        dateLabel={formatDateLabel(dateIso)}
                        dateIso={dateIso}
                        onPrevDay={() => setDateIso(d => shiftIso(d, -1))}
                        onNextDay={() => setDateIso(d => shiftIso(d, +1))}
                        onPickDate={(iso) => setDateIso(iso)}
                    />
                </div>

                {/* Middle — carousel of upcoming matches */}
                <div className="flex-1 min-w-0">
                    {anyLoading ? (
                        <div className="text-center text-gray-500 text-sm py-10 bg-white rounded-[20px]">
                            Завантаження анонсів...
                        </div>
                    ) : carouselMatches.length > 0 ? (
                        <MatchCarousel matches={carouselMatches} />
                    ) : (
                        <div className="text-center text-gray-500 text-sm py-10 bg-white rounded-[20px]">
                            Немає найближчих матчів
                        </div>
                    )}
                </div>

                {/* Right — blank banner placeholder */}
                <div className="w-[220px] h-[500px] bg-white rounded-[20px] border border-gray-200 shadow-sm shrink-0" />
            </div>
        </FootballContainer>
    );
}
