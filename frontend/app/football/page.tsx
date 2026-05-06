"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SportContainer } from "../_components/_shared/SportContainer";
import ScheduleColumn, {
    type ScheduleGroup,
    type CompetitionOption,
} from "../_components/_shared/ScheduleColumn";
import MatchCarousel from "../_components/_shared/MatchCarousel";
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
    formatElapsed,
} from "@/services/sportsdb/adapters";
import type { SDBEvent } from "@/services/sportsdb/types";
import { useT } from "@/services/i18n/context";

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
    { id: "5071", name: "UEFA Conference League" },
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
    const { t } = useT();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialDate = searchParams.get("date") || todayIso();
    const [dateIso, setDateIso] = useState<string>(initialDate);

    // Keep ?date=... in the URL so navigating to a match and back preserves
    // it. CRITICAL: preserve every other query param. The carousel's vote
    // flow opens the login modal by pushing `?auth=login` — if we naively
    // replace the URL with just `?date=...` we strip `auth=login` on the
    // very next render and the modal flashes then disappears.
    useEffect(() => {
        const current = searchParams.get("date");
        if (current === dateIso) return;
        const next = new URLSearchParams(searchParams.toString());
        next.set("date", dateIso);
        router.replace(`/football?${next.toString()}`, { scroll: false });
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

    // Competition picker: list of top leagues enriched with their badges
    // (pulled from the league lookup). Feeds ScheduleColumn's "Змагання" tab.
    const competitions: CompetitionOption[] = useMemo(
        () =>
            TOP_LEAGUES.map((cfg, i) => ({
                id: cfg.id,
                name: leagueQueries[i].data?.lookup?.[0]?.strLeague ?? cfg.name,
                badge: leagueQueries[i].data?.lookup?.[0]?.strBadge ?? undefined,
            })),
        [leagueQueries]
    );

    // When the user taps a competition icon: find the nearest date that league
    // has a fixture (≥ today first, else the latest past date) and jump the
    // calendar there, so they see something instead of an empty page.
    const onPickCompetitionAction = (leagueId: string) => {
        const idx = TOP_LEAGUES.findIndex(l => l.id === leagueId);
        if (idx < 0) return;
        const events: SDBEvent[] =
            seasonQueries[idx].data?.schedule ?? seasonQueries[idx].data?.events ?? [];
        if (events.length === 0) return;
        const dates = events
            .map(ev => localDateIsoOf(ev))
            .filter((d): d is string => !!d);
        if (dates.length === 0) return;
        const today = todayIso();
        const future = dates.filter(d => d >= today).sort();
        const past = dates.filter(d => d < today).sort().reverse();
        const target = future[0] ?? past[0];
        if (target && target !== dateIso) setDateIso(target);
    };

    const leagueParam = searchParams.get("league");
    useEffect(() => {
        if (!leagueParam) return;
        const idx = TOP_LEAGUES.findIndex(l => l.id === leagueParam);
        if (idx < 0) return;
        const events: SDBEvent[] =
            seasonQueries[idx].data?.schedule ?? seasonQueries[idx].data?.events ?? [];
        if (events.length === 0) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        onPickCompetitionAction(leagueParam);
    }, [leagueParam, seasonQueries]);

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
        // Map idLeague → strBadge via the already-fetched league lookups so the
        // carousel header shows the real UCL/EPL/Bundesliga crest instead of
        // the old emoji placeholder.
        const badgeByLeague = new Map<string, string>();
        leagueQueries.forEach((q, i) => {
            const b = q.data?.lookup?.[0]?.strBadge;
            if (b) badgeByLeague.set(leagueIds[i], b);
        });
        // Merge /livescore data so a match that has just kicked off switches
        // to score display + LIVE pill in the carousel without a hard refresh.
        const liveById = new Map(
            (liveData?.livescore ?? []).map(l => [l.idEvent ?? "", l])
        );
        return upcoming.map(ev => {
            const base = eventToCarousel(ev);
            const badge = base.idLeague ? badgeByLeague.get(base.idLeague) : undefined;
            const live = ev.idEvent ? liveById.get(ev.idEvent) : undefined;
            const statusStr = (live?.strStatus ?? ev.strStatus ?? "").toLowerCase();
            const progressN = Number(live?.strProgress ?? NaN);
            const finished =
                statusStr === "ft" ||
                statusStr.includes("finish") ||
                statusStr === "aet" ||
                statusStr === "pen";
            const liveNow =
                !finished &&
                (!!(live?.strProgress && live.strProgress !== "0") ||
                    (Number.isFinite(progressN) && progressN > 0));
            return {
                ...base,
                leagueBadge: badge ?? base.leagueBadge,
                status: (finished ? "finished" : liveNow ? "live" : "scheduled") as "scheduled" | "live" | "finished",
                elapsed: liveNow
                    ? formatElapsed(live?.strProgress, live?.strStatus)
                    : undefined,
                home: {
                    ...base.home,
                    score:
                        (liveNow || finished) && live?.intHomeScore != null
                            ? Number(live.intHomeScore)
                            : undefined,
                },
                away: {
                    ...base.away,
                    score:
                        (liveNow || finished) && live?.intAwayScore != null
                            ? Number(live.intAwayScore)
                            : undefined,
                },
            };
        });
    }, [seasonQueries, leagueQueries, leagueIds, liveData]);

    return (
        <SportContainer>
            <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start justify-start">
                {/* Left — schedule grouped by league, navigable by day */}
                <div className="flex flex-col gap-2 w-full lg:w-auto">
                    {anyLoading && (
                        <div className="w-full lg:w-[560px] text-center text-gray-500 text-sm py-2">
                            {t("loading_matches")} ({season})...
                        </div>
                    )}
                    <ScheduleColumn
                        groups={groups}
                        dateLabel={formatDateLabel(dateIso)}
                        dateIso={dateIso}
                        onPrevDayAction={() => setDateIso(d => shiftIso(d, -1))}
                        onNextDayAction={() => setDateIso(d => shiftIso(d, +1))}
                        onPickDateAction={(iso) => setDateIso(iso)}
                        competitions={competitions}
                        onPickCompetitionAction={onPickCompetitionAction}
                    />
                </div>

                {/* Middle — carousel of upcoming matches */}
                <div className="flex-1 min-w-0">
                    {anyLoading ? (
                        <div className="text-center text-gray-500 text-sm py-10 bg-white rounded-[20px]">
                            {t("loading_announcements")}
                        </div>
                    ) : carouselMatches.length > 0 ? (
                        <MatchCarousel matches={carouselMatches} />
                    ) : (
                        <div className="text-center text-gray-500 text-sm py-10 bg-white rounded-[20px]">
                            {t("no_upcoming_matches")}
                        </div>
                    )}
                </div>

                {/* Right — blank banner placeholder */}
                <div className="hidden lg:block w-[220px] h-[500px] bg-white rounded-[20px] border border-gray-200 shadow-sm shrink-0" />
            </div>
        </SportContainer>
    );
}
