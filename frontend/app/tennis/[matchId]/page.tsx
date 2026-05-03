"use client";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { SportContainer } from "../../_components/_shared/SportContainer";
import ScheduleColumn, {
    type ScheduleGroup,
    type CompetitionOption,
} from "../../_components/_shared/ScheduleColumn";
import FeaturedMatch from "../../_components/_shared/FeaturedMatch";
import StatsTable from "../../_components/_shared/StatsTable";
import LastFiveMatches from "../../_components/_shared/LastFiveMatches";
import MatchHighlights from "../../_components/_shared/MatchHighlights";
import VoteCard from "../../_components/_shared/VoteCard";
import {
    useLiveScores,
    useLeagueSeasons,
    useLeagueLookups,
    useEventLookup,
    useTeamPreviousEvents,
    usePlayerSearch,
    usePlayerPhotos,
} from "@/services/sportsdb/hooks";
import {
    liveToScheduleRow,
    eventToScheduleRow,
    eventToFeatured,
    eventsToLastFive,
    localDateIsoOf,
    formatElapsed,
    extractTennisPlayers,
} from "@/services/sportsdb/adapters";
import type { SDBEvent } from "@/services/sportsdb/types";
import { useFavorites } from "@/services/favorites";

const TOP_LEAGUES: { id: string; name: string }[] = [
    { id: "4464", name: "ATP World Tour" },
    { id: "4517", name: "WTA Tour" },
    { id: "4581", name: "Laver Cup" },
];

const TENNIS_SERVE_LABELS: readonly string[] = [
    "Ейси",
    "Подвійні помилки",
    "Перша подача",
    "Друга подача",
    "Поінти першої подачі",
    "Поінти другої подачі",
    "Зіграні подачі",
    "Захищені брейк-поінти",
];

const TENNIS_POINTS_LABELS: readonly string[] = [
    "Всього",
    "Очки (за свою подачу)",
    "Очки (за подачу суперника)",
    "Максимум очків впідряд",
];

const TENNIS_GAMES_LABELS: readonly string[] = [
    "Всього",
    "Очки (за свою подачу)",
    "Очки (за подачу суперника)",
];

type StatRange = [number, number];

const TENNIS_SERVE_RANGES: Record<string, StatRange> = {
    "Ейси": [3, 18],
    "Подвійні помилки": [0, 8],
    "Перша подача": [50, 80],
    "Друга подача": [50, 80],
    "Поінти першої подачі": [30, 80],
    "Поінти другої подачі": [10, 40],
    "Зіграні подачі": [4, 18],
    "Захищені брейк-поінти": [0, 6],
};

const TENNIS_POINTS_RANGES: Record<string, StatRange> = {
    "Всього": [30, 120],
    "Очки (за свою подачу)": [20, 80],
    "Очки (за подачу суперника)": [5, 40],
    "Максимум очків впідряд": [3, 14],
};

const TENNIS_GAMES_RANGES: Record<string, StatRange> = {
    "Всього": [12, 40],
    "Очки (за свою подачу)": [5, 20],
    "Очки (за подачу суперника)": [3, 18],
};

function hash01(s: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 10000) / 10000;
}

function pseudoTennisStats(
    matchId: string,
    section: string,
    labels: readonly string[],
    ranges: Record<string, StatRange>
): { label: string; home: number; away: number }[] {
    return labels.map(label => {
        const [lo, hi] = ranges[label] ?? [0, 20];
        const h = hash01(`${matchId}:${section}:h:${label}`);
        const a = hash01(`${matchId}:${section}:a:${label}`);
        const span = hi - lo;
        return {
            label,
            home: lo + Math.round(h * span),
            away: lo + Math.round(a * span),
        };
    });
}

function currentTennisSeason(now = new Date()): string {
    return String(now.getFullYear());
}

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
    const [y, m, d] = iso.split("-");
    return `${d}.${m}.${y.slice(2)}`;
}

export default function TennisMatchPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const matchId = params.matchId as string;

    const [dateIso, setDateIso] = useState<string>(
        searchParams.get("date") || todayIso()
    );
    const { isMatchFav, toggleMatch } = useFavorites();
    const season = currentTennisSeason(new Date(dateIso + "T00:00:00"));

    const leagueIds = TOP_LEAGUES.map(l => l.id);
    const seasonQueries = useLeagueSeasons(leagueIds, season);
    const leagueQueries = useLeagueLookups(leagueIds);
    const { data: liveData } = useLiveScores("tennis");

    const { data: eventData, isLoading: eventLoading } = useEventLookup(matchId);

    const baseGroups: ScheduleGroup[] = useMemo(() => {
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

    const sidebarPlayerNames = useMemo(() => {
        const names: string[] = [];
        baseGroups.forEach(g => g.matches.forEach(m => {
            if (m.homeTeam) names.push(m.homeTeam);
            if (m.awayTeam) names.push(m.awayTeam);
        }));
        return names;
    }, [baseGroups]);

    const sidebarPhotos = usePlayerPhotos(sidebarPlayerNames, "Tennis");

    const groups: ScheduleGroup[] = useMemo(
        () => baseGroups.map(g => ({
            ...g,
            matches: g.matches.map(m => ({
                ...m,
                homeLogo: m.homeLogo ?? (m.homeTeam ? sidebarPhotos[m.homeTeam] : undefined),
                awayLogo: m.awayLogo ?? (m.awayTeam ? sidebarPhotos[m.awayTeam] : undefined),
            })),
        })),
        [baseGroups, sidebarPhotos]
    );

    const competitions: CompetitionOption[] = useMemo(
        () =>
            TOP_LEAGUES.map((cfg, i) => ({
                id: cfg.id,
                name: leagueQueries[i].data?.lookup?.[0]?.strLeague ?? cfg.name,
                badge: leagueQueries[i].data?.lookup?.[0]?.strBadge ?? undefined,
            })),
        [leagueQueries]
    );

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

    const event = (eventData?.events ?? eventData?.lookup)?.[0];
    const players = extractTennisPlayers(event?.strEvent, event?.strLeague);
    const homeName = event?.strHomeTeam ?? players.home;
    const awayName = event?.strAwayTeam ?? players.away;
    const { data: homePlayers } = usePlayerSearch(homeName, "Tennis");
    const { data: awayPlayers } = usePlayerSearch(awayName, "Tennis");
    const homePhoto = (homePlayers ?? [])[0]?.strCutout ?? (homePlayers ?? [])[0]?.strThumb ?? undefined;
    const awayPhoto = (awayPlayers ?? [])[0]?.strCutout ?? (awayPlayers ?? [])[0]?.strThumb ?? undefined;

    const liveForMatch = (liveData?.livescore ?? []).find(l => l.idEvent === matchId);
    const liveElapsed = formatElapsed(liveForMatch?.strProgress, liveForMatch?.strStatus);
    const featured = event ? eventToFeatured(event) : null;
    if (featured) {
        featured.stage = "Теніс";
        if (homePhoto && !featured.home.logoUrl) featured.home.logoUrl = homePhoto;
        if (awayPhoto && !featured.away.logoUrl) featured.away.logoUrl = awayPhoto;
    }
    if (featured && liveForMatch) {
        if (liveElapsed) featured.elapsed = liveElapsed;
        const liveHome = Number(liveForMatch.intHomeScore ?? NaN);
        const liveAway = Number(liveForMatch.intAwayScore ?? NaN);
        if (Number.isFinite(liveHome)) featured.home.score = liveHome;
        if (Number.isFinite(liveAway)) featured.away.score = liveAway;
        if (
            featured.status === "scheduled" &&
            liveForMatch.strProgress &&
            liveForMatch.strProgress !== "0"
        ) {
            featured.status = "live";
        }
        const liveStatus = (liveForMatch.strStatus ?? "").toLowerCase();
        if (
            featured.status !== "finished" &&
            (liveStatus === "ft" ||
                liveStatus.includes("finish") ||
                liveStatus === "final")
        ) {
            featured.status = "finished";
            featured.elapsed = "Final";
        }
    }

    const serveStats = pseudoTennisStats(matchId, "serve", TENNIS_SERVE_LABELS, TENNIS_SERVE_RANGES);
    const pointsStats = pseudoTennisStats(matchId, "points", TENNIS_POINTS_LABELS, TENNIS_POINTS_RANGES);
    const gamesStats = pseudoTennisStats(matchId, "games", TENNIS_GAMES_LABELS, TENNIS_GAMES_RANGES);

    const { data: homePrevEvents } = useTeamPreviousEvents(event?.idHomeTeam);
    const { data: awayPrevEvents } = useTeamPreviousEvents(event?.idAwayTeam);
    const homeLastFive = eventsToLastFive(
        (homePrevEvents?.schedule ?? homePrevEvents?.events) ?? [],
        event?.idHomeTeam
    );
    const awayLastFive = eventsToLastFive(
        (awayPrevEvents?.schedule ?? awayPrevEvents?.events) ?? [],
        event?.idAwayTeam
    );

    return (
        <SportContainer>
            <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start justify-start">
                <ScheduleColumn
                    groups={groups}
                    selectedMatchId={matchId}
                    dateLabel={formatDateLabel(dateIso)}
                    dateIso={dateIso}
                    onPrevDayAction={() => setDateIso(d => shiftIso(d, -1))}
                    onNextDayAction={() => setDateIso(d => shiftIso(d, +1))}
                    onPickDateAction={(iso) => setDateIso(iso)}
                    competitions={competitions}
                    onPickCompetitionAction={onPickCompetitionAction}
                    basePath="/tennis"
                />

                <div className="flex-1 min-w-0 flex flex-col gap-4">
                    {eventLoading && (
                        <div className="text-center text-gray-500 text-sm py-10 bg-white rounded-[20px]">
                            Завантаження матчу...
                        </div>
                    )}

                    {!eventLoading && !event && (
                        <div className="text-center text-gray-500 text-sm py-10 bg-white rounded-[20px]">
                            Матч не знайдено
                        </div>
                    )}

                    {featured && (
                        <FeaturedMatch
                            match={featured}
                            footerSlot={
                                featured.status === "scheduled" && event
                                    ? (
                                        <VoteCard
                                            matchId={matchId}
                                            homeInitial={(event.strHomeTeam ?? "H").slice(0, 1)}
                                            awayInitial={(event.strAwayTeam ?? "A").slice(0, 1)}
                                        />
                                    )
                                    : undefined
                            }
                        />
                    )}

                    {event?.strVideo && (
                        <MatchHighlights
                            videoUrl={event.strVideo}
                            homeName={event.strHomeTeam ?? undefined}
                            awayName={event.strAwayTeam ?? undefined}
                        />
                    )}

                    {(featured?.status === "live" || featured?.status === "finished") && (
                        <div className="w-full h-[78px] p-[16px] bg-[#212121] rounded-[20px] flex items-center justify-between">
                            <span className="w-[65px] h-[35px] pt-[2px] pr-[7px] pb-[2px] pl-[8px] bg-[#f8f8f8] rounded-[8px] flex flex-row justify-center items-center gap-[10px]">
                                <span
                                    className="text-[16px] font-bold leading-[30px] tracking-normal text-center text-[#af292a]"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    {featured.status === "live" ? "Live" : "Final"}
                                </span>
                            </span>
                            <span className="flex items-center gap-2 text-white font-data font-bold text-base pr-8">
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="9" />
                                    <polyline points="12 7 12 12 15 14" />
                                </svg>
                                {featured.status === "finished"
                                    ? "Final"
                                    : liveElapsed ?? formatElapsed(undefined, event?.strStatus ?? undefined) ?? ""}
                            </span>
                            <button
                                type="button"
                                onClick={() => toggleMatch(matchId)}
                                className={`text-xl leading-none transition-colors cursor-pointer ${
                                    isMatchFav(matchId) ? "text-[#af292a]" : "text-white/40 hover:text-[#af292a]"
                                }`}
                                aria-label="Favourite match"
                                title={isMatchFav(matchId) ? "Прибрати з улюблених" : "Додати матч в улюблені"}
                            >
                                {isMatchFav(matchId) ? "★" : "☆"}
                            </button>
                        </div>
                    )}

                    {event && (
                        <>
                            <StatsTable rows={serveStats} labels={TENNIS_SERVE_LABELS} title="Подача" />
                            <StatsTable rows={pointsStats} labels={TENNIS_POINTS_LABELS} title="Очки" />
                            <StatsTable rows={gamesStats} labels={TENNIS_GAMES_LABELS} title="Ігри" />
                        </>
                    )}

                    {event && (homeLastFive.length > 0 || awayLastFive.length > 0) && (
                        <LastFiveMatches
                            home={{
                                teamName: event.strHomeTeam ?? "Гравець 1",
                                teamLogo: event.strHomeTeamBadge ?? undefined,
                                rows: homeLastFive,
                            }}
                            away={{
                                teamName: event.strAwayTeam ?? "Гравець 2",
                                teamLogo: event.strAwayTeamBadge ?? undefined,
                                rows: awayLastFive,
                            }}
                        />
                    )}
                </div>

                <div className="hidden lg:block w-[220px] h-[500px] bg-white rounded-[20px] border border-gray-200 shadow-sm shrink-0" />
            </div>
        </SportContainer>
    );
}
