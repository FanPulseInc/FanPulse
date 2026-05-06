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
import BoxScorePanel, {
    type BoxScorePlayer,
} from "../../_components/_basketball/BoxScorePanel";
import {
    useLiveScores,
    useLeagueSeasons,
    useLeagueLookups,
    useEventLookup,
    useEventStats,
    useTeamPreviousEvents,
    useTeamPlayers,
} from "@/services/sportsdb/hooks";
import {
    liveToScheduleRow,
    eventToScheduleRow,
    eventToFeatured,
    statsToRows,
    eventsToLastFive,
    localDateIsoOf,
    formatElapsed,
} from "@/services/sportsdb/adapters";
import type { SDBEvent, SDBPlayer } from "@/services/sportsdb/types";
import { useFavorites } from "@/services/favorites";

const TOP_LEAGUES: { id: string; name: string }[] = [
    { id: "4387", name: "NBA" },
];

const BASKETBALL_STAT_LABELS: readonly string[] = [
    "Підбори",
    "Підбори в обороні",
    "Підбори в атаці",
    "Втрати",
    "Перехвати",
    "Блоки",
    "Фоли",
    "Макс. очків впідряд",
    "Жовті картки",
];

const BASKETBALL_STAT_RANGES: Record<string, [number, number]> = {
    "Підбори": [32, 56],
    "Підбори в обороні": [22, 40],
    "Підбори в атаці": [6, 16],
    "Втрати": [8, 18],
    "Перехвати": [4, 12],
    "Блоки": [2, 9],
    "Фоли": [12, 26],
    "Макс. очків впідряд": [6, 18],
    "Жовті картки": [0, 3],
};

function hash01(s: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 10000) / 10000;
}

function pseudoBasketballStats(matchId: string): { label: string; home: number; away: number }[] {
    return BASKETBALL_STAT_LABELS.map(label => {
        const [lo, hi] = BASKETBALL_STAT_RANGES[label] ?? [0, 20];
        const h = hash01(matchId + ":h:" + label);
        const a = hash01(matchId + ":a:" + label);
        const span = hi - lo;
        return {
            label,
            home: lo + Math.round(h * span),
            away: lo + Math.round(a * span),
        };
    });
}

function currentBasketballSeason(now = new Date()): string {
    const year = now.getFullYear();
    const startYear = now.getMonth() >= 8 ? year : year - 1;
    return `${startYear}-${startYear + 1}`;
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

function rosterToBoxScorePlayers(
    roster: SDBPlayer[] | null | undefined
): BoxScorePlayer[] {
    if (!roster) return [];
    const isStaff = (pos: string | undefined) => {
        const p = (pos ?? "").toLowerCase();
        return (
            p.includes("coach") ||
            p.includes("manager") ||
            p.includes("assistant") ||
            p.includes("trainer") ||
            p.includes("staff") ||
            p.includes("president") ||
            p.includes("owner") ||
            p.includes("general")
        );
    };
    return roster
        .filter(p => !!p.strPlayer && !isStaff(p.strPosition))
        .slice(0, 15)
        .map(p => ({
            id: p.idPlayer ?? `${p.strPlayer ?? "p"}-${p.strPosition ?? ""}-${p.idTeam ?? ""}`,
            name: p.strPlayer ?? "?",
            position: p.strPosition ?? undefined,
            photoUrl: p.strCutout ?? p.strThumb ?? undefined,
        }));
}

export default function BasketballMatchPage() {
    const { t } = useT();
    const params = useParams();
    const searchParams = useSearchParams();
    const matchId = params.matchId as string;

    const [dateIso, setDateIso] = useState<string>(
        searchParams.get("date") || todayIso()
    );
    const { isMatchFav, isTeamFav, toggleMatch, toggleTeam } = useFavorites();
    const season = currentBasketballSeason(new Date(dateIso + "T00:00:00"));

    const leagueIds = TOP_LEAGUES.map(l => l.id);
    const seasonQueries = useLeagueSeasons(leagueIds, season);
    const leagueQueries = useLeagueLookups(leagueIds);
    const { data: liveData } = useLiveScores("basketball");

    const { data: eventData, isLoading: eventLoading } = useEventLookup(matchId);
    const { data: statsData } = useEventStats(matchId);

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
        featured.stage = t("sport_basketball");
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

    const { data: homeRoster } = useTeamPlayers(event?.idHomeTeam);
    const { data: awayRoster } = useTeamPlayers(event?.idAwayTeam);
    const homePlayers = rosterToBoxScorePlayers(homeRoster?.player ?? homeRoster?.list);
    const awayPlayers = rosterToBoxScorePlayers(awayRoster?.player ?? awayRoster?.list);

    const apiStats = statsToRows(statsData?.statistics ?? statsData?.lookup);
    const stats = apiStats.length > 0 ? apiStats : pseudoBasketballStats(matchId);

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
                    basePath="/basketball"
                    showCompetitionsTab={false}
                />

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
                        <div className="flex flex-col gap-3">
                            <BoxScorePanel
                                team={{
                                    teamName: event.strHomeTeam ?? t("team_one"),
                                    teamLogo: event.strHomeTeamBadge ?? undefined,
                                    players: homePlayers,
                                }}
                            />
                            <BoxScorePanel
                                team={{
                                    teamName: event.strAwayTeam ?? t("team_two"),
                                    teamLogo: event.strAwayTeamBadge ?? undefined,
                                    players: awayPlayers,
                                }}
                            />
                        </div>
                    )}

                    {event && <StatsTable rows={stats} labels={BASKETBALL_STAT_LABELS} />}

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
