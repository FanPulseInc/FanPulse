"use client";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { FootballContainer } from "../../_components/_football/FootballContainer";
import ScheduleColumn, {
    type ScheduleGroup,
} from "../../_components/_football/ScheduleColumn";
import FeaturedMatch from "../../_components/_football/FeaturedMatch";
import FormationPitch from "../../_components/_football/FormationPitch";
import StatsTable from "../../_components/_football/StatsTable";
import MatchHighlights from "../../_components/_football/MatchHighlights";
import {
    useLiveScores,
    useLeagueSeasons,
    useLeagueLookups,
    useEventLookup,
    useEventLineup,
    useEventStats,
    useEventTimeline,
    useTeamPreviousEvents,
} from "@/services/sportsdb/hooks";
import {
    liveToScheduleRow,
    eventToScheduleRow,
    eventToFeatured,
    lineupsToFormation,
    predictedFormationFromPrevLineups,
    statsToRows,
    timelineToScorers,
    localDateIsoOf,
    formatElapsed,
} from "@/services/sportsdb/adapters";
import type { SDBEvent } from "@/services/sportsdb/types";

const TOP_LEAGUES: { id: string; name: string }[] = [
    { id: "4328", name: "Premier League" },
    { id: "4335", name: "La Liga" },
    { id: "4331", name: "Bundesliga" },
    { id: "4332", name: "Serie A" },
    { id: "4334", name: "Ligue 1" },
    { id: "4480", name: "UEFA Champions League" },
    { id: "4481", name: "UEFA Europa League" },
];

function currentSoccerSeason(now = new Date()): string {
    const year = now.getFullYear();
    const startYear = now.getMonth() >= 7 ? year : year - 1;
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

export default function FootballMatchPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const matchId = params.matchId as string;

    const [dateIso, setDateIso] = useState<string>(
        searchParams.get("date") || todayIso()
    );
    const season = currentSoccerSeason(new Date(dateIso + "T00:00:00"));

    const leagueIds = TOP_LEAGUES.map(l => l.id);
    const seasonQueries = useLeagueSeasons(leagueIds, season);
    const leagueQueries = useLeagueLookups(leagueIds);
    const { data: liveData } = useLiveScores("soccer");

    const { data: eventData, isLoading: eventLoading } = useEventLookup(matchId);
    const { data: lineupData } = useEventLineup(matchId);
    const { data: statsData } = useEventStats(matchId);
    const { data: timelineData } = useEventTimeline(matchId);

    // Build the same grouped list as the index page so the sidebar is
    // consistent and the active match is highlighted regardless of league.
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
    // Prefer live progress from /livescore (has the actual minute — "67") over
    // the event's strStatus (often just the phase — "1H").
    const liveForMatch = (liveData?.livescore ?? []).find(l => l.idEvent === matchId);
    const liveElapsed = formatElapsed(liveForMatch?.strProgress, liveForMatch?.strStatus);
    const featured = event ? eventToFeatured(event) : null;
    if (featured && liveElapsed) featured.elapsed = liveElapsed;

    // Real lineup (match has started / completed).
    const actualLineup = lineupData?.lineup ?? lineupData?.lookup ?? null;
    const formation = lineupsToFormation(
        actualLineup,
        event?.strHomeTeam ?? "Команда 1",
        event?.strAwayTeam ?? "Команда 2",
        event?.strHomeTeamBadge ?? undefined,
        event?.strAwayTeamBadge ?? undefined
    );

    // If no actual lineup yet AND the match is upcoming/scheduled,
    // predict it from each team's PREVIOUS match lineup.
    const shouldPredict = !formation && !!event && featured?.status !== "finished";
    const { data: homePrevEvents } = useTeamPreviousEvents(
        shouldPredict ? event?.idHomeTeam : undefined
    );
    const { data: awayPrevEvents } = useTeamPreviousEvents(
        shouldPredict ? event?.idAwayTeam : undefined
    );
    const homePrevEventId = (homePrevEvents?.schedule ?? homePrevEvents?.events)?.[0]?.idEvent;
    const awayPrevEventId = (awayPrevEvents?.schedule ?? awayPrevEvents?.events)?.[0]?.idEvent;
    const { data: homePrevLineup } = useEventLineup(
        shouldPredict ? homePrevEventId : undefined
    );
    const { data: awayPrevLineup } = useEventLineup(
        shouldPredict ? awayPrevEventId : undefined
    );

    const predictedFormation = shouldPredict
        ? predictedFormationFromPrevLineups(
              homePrevLineup?.lineup ?? homePrevLineup?.lookup,
              awayPrevLineup?.lineup ?? awayPrevLineup?.lookup,
              event?.idHomeTeam,
              event?.idAwayTeam,
              event?.strHomeTeam ?? "Команда 1",
              event?.strAwayTeam ?? "Команда 2",
              event?.strHomeTeamBadge ?? undefined,
              event?.strAwayTeamBadge ?? undefined
          )
        : null;

    const stats = statsToRows(statsData?.statistics ?? statsData?.lookup);
    const scorers = timelineToScorers(timelineData?.timeline ?? timelineData?.lookup);

    return (
        <FootballContainer>
            <div className="flex gap-6 items-start justify-start">
                {/* Left — grouped schedule with day nav */}
                <ScheduleColumn
                    groups={groups}
                    selectedMatchId={matchId}
                    dateLabel={formatDateLabel(dateIso)}
                    dateIso={dateIso}
                    onPrevDay={() => setDateIso(d => shiftIso(d, -1))}
                    onNextDay={() => setDateIso(d => shiftIso(d, +1))}
                    onPickDate={(iso) => setDateIso(iso)}
                />

                {/* Middle — match detail */}
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
                            homeScorers={scorers.home}
                            awayScorers={scorers.away}
                        />
                    )}

                    {event?.strVideo && (
                        <MatchHighlights
                            videoUrl={event.strVideo}
                            homeName={event.strHomeTeam ?? undefined}
                            awayName={event.strAwayTeam ?? undefined}
                        />
                    )}

                    {/* Live / finished timer bar — Figma: h-[78px] bg-[#212121] rounded-[20px]
                        with white pill (red text), clock + elapsed in the middle,
                        star on the right. Finished matches show "FT" in place of "Live"
                        and in place of the minute count. */}
                    {(featured?.status === "live" || featured?.status === "finished") && (
                        <div className="w-full h-[78px] p-[16px] bg-[#212121] rounded-[20px] flex items-center justify-between">
                            <span className="w-[65px] h-[35px] pt-[2px] pr-[7px] pb-[2px] pl-[8px] bg-[#f8f8f8] rounded-[8px] flex flex-row justify-center items-center gap-[10px]">
                                <span
                                    className="text-[16px] font-bold leading-[30px] tracking-normal text-center text-[#af292a]"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    {featured.status === "live" ? "Live" : "FT"}
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
                                    ? "FT"
                                    : liveElapsed ?? formatElapsed(undefined, event?.strStatus ?? undefined) ?? ""}
                            </span>
                            <span className="text-[#af292a] text-xl">★</span>
                        </div>
                    )}

                    {formation ? (
                        <FormationPitch top={formation.top} bottom={formation.bottom} />
                    ) : predictedFormation ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#af292a]">
                                    Прогноз складу
                                </span>
                                <span className="text-[10px] text-gray-500">
                                    · на основі попереднього матчу
                                </span>
                            </div>
                            <FormationPitch
                                top={predictedFormation.top}
                                bottom={predictedFormation.bottom}
                            />
                        </div>
                    ) : event ? (
                        <div className="text-center text-gray-400 text-xs py-6 bg-white rounded-[20px]">
                            Склад буде опубліковано ближче до матчу
                        </div>
                    ) : null}

                    {stats.length > 0 && <StatsTable rows={stats} />}
                </div>

                {/* Right — blank banner placeholder */}
                <div className="w-[220px] h-[500px] bg-white rounded-[20px] border border-gray-200 shadow-sm shrink-0" />
            </div>
        </FootballContainer>
    );
}
