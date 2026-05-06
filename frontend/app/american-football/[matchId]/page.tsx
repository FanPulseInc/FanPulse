"use client";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useT } from "@/services/i18n/context";
import { SportContainer } from "../../_components/_shared/SportContainer";
import ScheduleColumn, {
    type ScheduleGroup,
} from "../../_components/_shared/ScheduleColumn";
import FeaturedMatch from "../../_components/_shared/FeaturedMatch";
import StatsTable from "../../_components/_shared/StatsTable";
import LastFiveMatches from "../../_components/_shared/LastFiveMatches";
import MatchHighlights from "../../_components/_shared/MatchHighlights";
import VoteCard from "../../_components/_shared/VoteCard";
import ScoringTimeline, {
    type ScoringPlay,
} from "../../_components/_americanfootball/ScoringTimeline";
import {
    useLiveScores,
    useLeagueSeasons,
    useLeagueLookups,
    useEventLookup,
    useEventTimeline,
    useTeamPreviousEvents,
} from "@/services/sportsdb/hooks";
import {
    liveToScheduleRow,
    eventToScheduleRow,
    eventToFeatured,
    eventsToLastFive,
    localDateIsoOf,
    formatElapsed,
    timelineToScoringPlays,
} from "@/services/sportsdb/adapters";
import type { SDBEvent } from "@/services/sportsdb/types";
import { useFavorites } from "@/services/favorites";

const TOP_LEAGUES: { id: string; name: string }[] = [
    { id: "4391", name: "NFL" },
];

const NFL_OFFENSE_LABELS: readonly string[] = [
    "Тачдауни",
    "Голи з гри",
    "Всього ярдів",
    "Втрати",
    "Ефективність (червона зона)",
    "Час володіння",
    "Перші дауни",
    "Ефективність (третій даун)",
    "Панти",
    "Середня к-сть ярдів за пант",
    "Середня к-сть ярдів за гру",
];

const NFL_PASS_LABELS: readonly string[] = [
    "Паси в 1-ому дауні",
    "Ярди на пасі (чисті)",
    "Ярди на пасі (Всього)",
    "Паси в тачдауні",
    "Кидаючі перехвати",
    "Середня к-сть ярдів на пасі за спробу",
    "Спроби пасу в червону зону",
];

const NFL_RUSH_LABELS: readonly string[] = [
    "Паси в 1-ому дауні",
    "Ярди в прориві",
    "Середня к-сть ярдів на пасі за спробу",
    "Прорив в 1-ому дауні",
    "Спроби прориву в червону зону",
];

const NFL_OTHER_LABELS: readonly string[] = [
    "Пенальті",
    "Штрафні ярди",
    "Фамбли",
    "Втрати м'яча",
];

type StatRange = [number, number];

const NFL_OFFENSE_RANGES: Record<string, StatRange> = {
    "Тачдауни": [0, 6],
    "Голи з гри": [0, 4],
    "Всього ярдів": [200, 500],
    "Втрати": [0, 4],
    "Ефективність (червона зона)": [20, 90],
    "Перші дауни": [10, 28],
    "Ефективність (третій даун)": [20, 75],
    "Панти": [2, 8],
    "Середня к-сть ярдів за пант": [38, 52],
    "Середня к-сть ярдів за гру": [4, 7],
};

const NFL_PASS_RANGES: Record<string, StatRange> = {
    "Паси в 1-ому дауні": [4, 16],
    "Ярди на пасі (чисті)": [120, 360],
    "Ярди на пасі (Всього)": [140, 400],
    "Паси в тачдауні": [0, 4],
    "Кидаючі перехвати": [0, 3],
    "Середня к-сть ярдів на пасі за спробу": [4, 11],
    "Спроби пасу в червону зону": [0, 6],
};

const NFL_RUSH_RANGES: Record<string, StatRange> = {
    "Паси в 1-ому дауні": [3, 14],
    "Ярди в прориві": [60, 220],
    "Середня к-сть ярдів на пасі за спробу": [3, 6],
    "Прорив в 1-ому дауні": [4, 14],
    "Спроби прориву в червону зону": [0, 5],
};

const NFL_OTHER_RANGES: Record<string, StatRange> = {
    "Пенальті": [3, 14],
    "Штрафні ярди": [20, 110],
    "Фамбли": [0, 3],
    "Втрати м'яча": [0, 3],
};

function hash01(s: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 10000) / 10000;
}

function fmtMmSs(totalSec: number): string {
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function pseudoNflStats(
    matchId: string,
    section: string,
    labels: readonly string[],
    ranges: Record<string, StatRange>
): { label: string; home: number | string; away: number | string }[] {
    return labels.map(label => {
        if (label === "Час володіння") {
            const h = hash01(`${matchId}:${section}:h:${label}`);
            const a = hash01(`${matchId}:${section}:a:${label}`);
            const lo = 20 * 60;
            const span = 15 * 60;
            return {
                label,
                home: fmtMmSs(lo + Math.round(h * span)),
                away: fmtMmSs(lo + Math.round(a * span)),
            };
        }
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

function currentNflSeason(now = new Date()): string {
    const year = now.getFullYear();
    const startYear = now.getMonth() >= 7 ? year : year - 1;
    return String(startYear);
}

function shiftSeasonIso(iso: string, years: number): string {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y + years, m - 1, d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
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

export default function AmericanFootballMatchPage() {
    const { t } = useT();
    const params = useParams();
    const searchParams = useSearchParams();
    const matchId = params.matchId as string;

    const [dateIso, setDateIso] = useState<string>(
        searchParams.get("date") || todayIso()
    );
    const { isMatchFav, isTeamFav, toggleMatch, toggleTeam } = useFavorites();
    const season = currentNflSeason(new Date(dateIso + "T00:00:00"));

    const leagueIds = TOP_LEAGUES.map(l => l.id);
    const seasonQueries = useLeagueSeasons(leagueIds, season);
    const leagueQueries = useLeagueLookups(leagueIds);
    const { data: liveData } = useLiveScores("american_football");

    const { data: eventData, isLoading: eventLoading } = useEventLookup(matchId);
    const { data: timelineData } = useEventTimeline(matchId);

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

    const event = (eventData?.events ?? eventData?.lookup)?.[0];
    const liveForMatch = (liveData?.livescore ?? []).find(l => l.idEvent === matchId);
    const liveElapsed = formatElapsed(liveForMatch?.strProgress, liveForMatch?.strStatus);
    const featured = event ? eventToFeatured(event) : null;
    if (featured) {
        featured.stage = t("sport_american_football");
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

    const offenseStats = pseudoNflStats(matchId, "offense", NFL_OFFENSE_LABELS, NFL_OFFENSE_RANGES);
    const passStats = pseudoNflStats(matchId, "pass", NFL_PASS_LABELS, NFL_PASS_RANGES);
    const rushStats = pseudoNflStats(matchId, "rush", NFL_RUSH_LABELS, NFL_RUSH_RANGES);
    const otherStats = pseudoNflStats(matchId, "other", NFL_OTHER_LABELS, NFL_OTHER_RANGES);

    const finalHome = event?.intHomeScore != null && event.intHomeScore !== ""
        ? Number(event.intHomeScore)
        : undefined;
    const finalAway = event?.intAwayScore != null && event.intAwayScore !== ""
        ? Number(event.intAwayScore)
        : undefined;
    const scoringPlays: ScoringPlay[] = timelineToScoringPlays(
        timelineData?.timeline ?? timelineData?.lookup ?? null,
        finalHome,
        finalAway
    );

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
                <div className="flex flex-col gap-2 w-full lg:w-auto">
                    <div className="w-full lg:w-[560px] flex items-center justify-between gap-2 px-1">
                        <button
                            type="button"
                            onClick={() => setDateIso(d => shiftSeasonIso(d, -1))}
                            className="h-[30px] px-3 rounded-full bg-[#212121] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer whitespace-nowrap"
                        >
                            {t("prev_season")}
                        </button>
                        <span className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-[#212121]">
                            {t("season")} {season}
                        </span>
                        <button
                            type="button"
                            onClick={() => setDateIso(d => shiftSeasonIso(d, +1))}
                            className="h-[30px] px-3 rounded-full bg-[#212121] text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer whitespace-nowrap"
                        >
                            {t("next_season")}
                        </button>
                    </div>
                    <ScheduleColumn
                        groups={groups}
                        selectedMatchId={matchId}
                        dateLabel={formatDateLabel(dateIso)}
                        dateIso={dateIso}
                        onPrevDayAction={() => setDateIso(d => shiftIso(d, -1))}
                        onNextDayAction={() => setDateIso(d => shiftIso(d, +1))}
                        onPickDateAction={(iso) => setDateIso(iso)}
                        basePath="/american-football"
                        showCompetitionsTab={false}
                    />
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-4">
                    {eventLoading && (
                        <div className="text-center text-gray-500 text-sm py-10 bg-white rounded-[20px]">
                            {t("loading_match")}
                        </div>
                    )}

                    {!eventLoading && !event && (
                        <div className="text-center text-gray-500 text-sm py-10 bg-white rounded-[20px]">
                            {t("match_not_found")}
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

                    {event && (
                        <div className="w-full h-[42px] px-4 bg-white rounded-[14px] border border-gray-200 flex items-center justify-between shadow-sm">
                            <button
                                type="button"
                                onClick={() => toggleTeam(event.idHomeTeam ?? undefined)}
                                className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                                    isTeamFav(event.idHomeTeam ?? undefined)
                                        ? "text-[#af292a]"
                                        : "text-gray-400 hover:text-[#af292a]"
                                }`}
                                title={t("favourite_team")}
                            >
                                <span>{isTeamFav(event.idHomeTeam ?? undefined) ? "★" : "☆"}</span>
                                <span className="truncate max-w-[160px]">{event.strHomeTeam}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => toggleMatch(matchId)}
                                className={`text-[13px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                    isMatchFav(matchId) ? "text-[#af292a]" : "text-gray-400 hover:text-[#af292a]"
                                }`}
                                title={t("favourite_match")}
                            >
                                <span className="text-lg">{isMatchFav(matchId) ? "★" : "☆"}</span>
                                <span className="text-[11px] uppercase tracking-wider">{t("match_details")}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => toggleTeam(event.idAwayTeam ?? undefined)}
                                className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                                    isTeamFav(event.idAwayTeam ?? undefined)
                                        ? "text-[#af292a]"
                                        : "text-gray-400 hover:text-[#af292a]"
                                }`}
                                title={t("favourite_team")}
                            >
                                <span className="truncate max-w-[160px]">{event.strAwayTeam}</span>
                                <span>{isTeamFav(event.idAwayTeam ?? undefined) ? "★" : "☆"}</span>
                            </button>
                        </div>
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
                                title={isMatchFav(matchId) ? t("unfavourite_match") : t("favourite_match")}
                            >
                                {isMatchFav(matchId) ? "★" : "☆"}
                            </button>
                        </div>
                    )}

                    {event && (
                        <ScoringTimeline
                            plays={scoringPlays}
                            homeName={event.strHomeTeam ?? t("team_one")}
                            awayName={event.strAwayTeam ?? t("team_two")}
                        />
                    )}

                    {event && (
                        <>
                            <StatsTable rows={offenseStats} labels={NFL_OFFENSE_LABELS} title={t("attack")} />
                            <StatsTable rows={passStats} labels={NFL_PASS_LABELS} title={t("passing")} />
                            <StatsTable rows={rushStats} labels={NFL_RUSH_LABELS} title={t("rushing")} />
                            <StatsTable rows={otherStats} labels={NFL_OTHER_LABELS} title={t("other")} />
                        </>
                    )}

                    {event && (homeLastFive.length > 0 || awayLastFive.length > 0) && (
                        <LastFiveMatches
                            home={{
                                teamName: event.strHomeTeam ?? t("team_one"),
                                teamLogo: event.strHomeTeamBadge ?? undefined,
                                rows: homeLastFive,
                            }}
                            away={{
                                teamName: event.strAwayTeam ?? t("team_two"),
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
