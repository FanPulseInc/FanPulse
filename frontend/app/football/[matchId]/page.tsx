"use client";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { SportContainer } from "../../_components/_shared/SportContainer";
import ScheduleColumn, {
    type ScheduleGroup,
    type CompetitionOption,
} from "../../_components/_shared/ScheduleColumn";
import FeaturedMatch from "../../_components/_shared/FeaturedMatch";
import FormationPitch from "../../_components/_football/FormationPitch";
import StatsTable from "../../_components/_shared/StatsTable";
import LastFiveMatches from "../../_components/_shared/LastFiveMatches";
import MatchHighlights from "../../_components/_shared/MatchHighlights";
import VoteCard from "../../_components/_shared/VoteCard";
import {
    useLiveScores,
    useLeagueSeasons,
    useLeagueLookups,
    useEventLookup,
    useEventLineup,
    useEventLineups,
    useEventStats,
    useEventTimeline,
    useEventTimelines,
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
    lineupToBench,
    eventsToLastFive,
    timelineToPlayerEvents,
    enrichPitchPlayersWithEvents,
    teamsWithRedCards,
    localDateIsoOf,
    formatElapsed,
} from "@/services/sportsdb/adapters";
import type { SDBEvent } from "@/services/sportsdb/types";
import { useFavorites } from "@/services/favorites";

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
    const { isMatchFav, isTeamFav, toggleMatch, toggleTeam } = useFavorites();
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
    // Merge in live data — /lookup/event lags /livescore by a few minutes, so
    // without this merge the header sits on 0:0 while the sidebar (which
    // already consumes livescore) correctly shows 0:1. We merge:
    //   - elapsed  (minute counter)
    //   - scores   (the big numbers in the header)
    //   - status   (flip scheduled→live the instant livescore reports progress)
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
        // live → finished: livescore reports FT before /lookup/event catches up.
        // Without this, the red "Live" pill keeps showing while elapsed says "FT".
        const liveStatus = (liveForMatch.strStatus ?? "").toLowerCase();
        if (
            featured.status !== "finished" &&
            (liveStatus === "ft" ||
                liveStatus.includes("finish") ||
                liveStatus === "aet" ||
                liveStatus === "pen")
        ) {
            featured.status = "finished";
            featured.elapsed = "FT";
        }
    }

    // Real lineup (match has started / completed).
    const actualLineup = lineupData?.lineup ?? lineupData?.lookup ?? null;
    const formation = lineupsToFormation(
        actualLineup,
        event?.strHomeTeam ?? "Команда 1",
        event?.strAwayTeam ?? "Команда 2",
        event?.strHomeTeamBadge ?? undefined,
        event?.strAwayTeamBadge ?? undefined
    );

    // If no actual lineup yet, fall back to a prediction built from each
    // team's PREVIOUS match lineup. We allow this for FINISHED matches too —
    // some games (e.g. PSG–Nantes) never get an `event_lineup` row at all from
    // TheSportsDB, so showing the previous-match lineup is strictly better
    // than the "склад буде опубліковано" placeholder.
    const shouldPredict = !formation && !!event;
    // Always fetch each team's previous events — we need them both for the
    // predicted lineup fallback AND the "Останні 5 матчів" cards at the
    // bottom of the page, so gating the request on `shouldPredict` would
    // starve the form cards.
    const { data: homePrevEvents } = useTeamPreviousEvents(event?.idHomeTeam);
    const { data: awayPrevEvents } = useTeamPreviousEvents(event?.idAwayTeam);
    // Look back at the last N fixtures per team, not just the most recent one.
    // TheSportsDB doesn't publish lineups for every cup / European match, so
    // clubs whose latest game was a Conference-League tie (Shakhtar, often
    // Strasbourg) returned an empty response and fell through to the
    // "склад недоступний" fallback. Widening the search + picking the first
    // response that has players fixes the empty-pitch case.
    const PREV_LOOKBACK = 5;
    const homePrevEventIds = useMemo<(string | undefined)[]>(() => {
        if (!shouldPredict) return [];
        const list = homePrevEvents?.schedule ?? homePrevEvents?.events ?? [];
        return list.slice(0, PREV_LOOKBACK).map(e => e.idEvent ?? undefined);
    }, [shouldPredict, homePrevEvents]);
    const awayPrevEventIds = useMemo<(string | undefined)[]>(() => {
        if (!shouldPredict) return [];
        const list = awayPrevEvents?.schedule ?? awayPrevEvents?.events ?? [];
        return list.slice(0, PREV_LOOKBACK).map(e => e.idEvent ?? undefined);
    }, [shouldPredict, awayPrevEvents]);
    const homePrevLineupQueries = useEventLineups(homePrevEventIds);
    const awayPrevLineupQueries = useEventLineups(awayPrevEventIds);
    const firstNonEmpty = (
        queries: { data?: { lineup?: unknown[] | null; lookup?: unknown[] | null } | undefined }[],
        teamId: string | undefined
    ) => {
        if (!teamId) return undefined;
        // Prefer a COMPLETE lineup (≥ 11 starters) — some older TheSportsDB
        // records only list a handful of players, which caused the predicted
        // XI to render with 6 outfielders for clubs like Strasbourg. Fall back
        // to the best partial we saw if nothing complete turned up.
        const isSub = (r: { strSubstitute?: string }) =>
            r.strSubstitute === "1" || r.strSubstitute?.toLowerCase?.() === "yes";
        let bestPartial:
            | { rows: { idTeam?: string; strSubstitute?: string }[]; starters: number }
            | undefined;
        for (const q of queries) {
            const rows = (q.data?.lineup ?? q.data?.lookup) as
                | { idTeam?: string; strSubstitute?: string }[]
                | undefined;
            if (!rows || rows.length === 0) continue;
            const own = rows.filter(r => r.idTeam === teamId);
            if (own.length === 0) continue;
            const starters = own.filter(r => !isSub(r)).length;
            if (starters >= 11) return rows; // complete XI — take it.
            if (!bestPartial || starters > bestPartial.starters) {
                bestPartial = { rows, starters };
            }
        }
        return bestPartial?.rows;
    };
    const homePrevLineup = firstNonEmpty(homePrevLineupQueries, event?.idHomeTeam);
    const awayPrevLineup = firstNonEmpty(awayPrevLineupQueries, event?.idAwayTeam);

    const predictedFormation = shouldPredict
        ? predictedFormationFromPrevLineups(
              // `firstNonEmpty` already unwrapped the lineup/lookup envelope and
              // guaranteed the rows contain the team we care about. Cast back
              // to the shape predictedFormationFromPrevLineups expects.
              homePrevLineup as Parameters<typeof predictedFormationFromPrevLineups>[0],
              awayPrevLineup as Parameters<typeof predictedFormationFromPrevLineups>[1],
              event?.idHomeTeam,
              event?.idAwayTeam,
              event?.strHomeTeam ?? "Команда 1",
              event?.strAwayTeam ?? "Команда 2",
              event?.strHomeTeamBadge ?? undefined,
              event?.strAwayTeamBadge ?? undefined
          )
        : null;

    const stats = statsToRows(statsData?.statistics ?? statsData?.lookup);
    const timeline = timelineData?.timeline ?? timelineData?.lookup;
    const scorers = timelineToScorers(timeline);
    const bench = lineupToBench(actualLineup, timeline);

    // Per-player event map (goals, assists, cards, sub-offs) used to annotate
    // the pitch. Empty for future matches — `timeline` is undefined there, so
    // FormationPitch renders clean cards with no icons by default.
    const playerEvents = timelineToPlayerEvents(timeline);
    // Red-card summary for the currently-viewed match — injected into the
    // schedule list row below so the user sees a card icon next to the team.
    // Other matches in the list don't show a card because we'd need a
    // timeline fetch per match to know.
    const currentMatchRedCards = teamsWithRedCards(timeline);
    const decoratedFormation = formation
        ? {
              top: enrichPitchPlayersWithEvents(formation.top, playerEvents),
              bottom: enrichPitchPlayersWithEvents(formation.bottom, playerEvents),
          }
        : null;
    const decoratedPredicted = predictedFormation
        ? {
              top: enrichPitchPlayersWithEvents(predictedFormation.top, playerEvents),
              bottom: enrichPitchPlayersWithEvents(predictedFormation.bottom, playerEvents),
          }
        : null;
    // "Останні 5 матчів" — one row per team, each derived from that team's
    // previous fixtures endpoint. `eventsToLastFive` handles the home/away
    // perspective flip so result/W-L-D is always relative to the current team.
    const homeLastFive = eventsToLastFive(
        (homePrevEvents?.schedule ?? homePrevEvents?.events) ?? [],
        event?.idHomeTeam
    );
    const awayLastFive = eventsToLastFive(
        (awayPrevEvents?.schedule ?? awayPrevEvents?.events) ?? [],
        event?.idAwayTeam
    );

    // Competition picker data — badges come from the league lookup queries.
    const competitions: CompetitionOption[] = useMemo(
        () =>
            TOP_LEAGUES.map((cfg, i) => ({
                id: cfg.id,
                name: leagueQueries[i].data?.lookup?.[0]?.strLeague ?? cfg.name,
                badge: leagueQueries[i].data?.lookup?.[0]?.strBadge ?? undefined,
            })),
        [leagueQueries]
    );

    // Jump the calendar to the nearest date this league has a fixture — next
    // upcoming day preferred, else latest past day. Keeps the page useful even
    // when the chosen competition has no game on the currently-selected date.
    const onPickCompetition = (leagueId: string) => {
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

    // Batch-fetch timelines for every live/past match in the visible schedule
    // so red-card icons appear next to team names across the whole list, not
    // just the currently-selected match. Future fixtures are skipped (no
    // timeline to fetch). The hook gates each query on `!!id`, so passing
    // undefined for upcoming rows is safe.
    const timelineIds = useMemo(() => {
        const ids: (string | undefined)[] = [];
        for (const g of groups) {
            for (const m of g.matches) {
                if (m.status === "live" || m.status === "past") ids.push(m.id);
            }
        }
        return ids;
    }, [groups]);
    const timelineQueries = useEventTimelines(timelineIds);
    const redCardByMatch = useMemo(() => {
        const map = new Map<string, { home: boolean; away: boolean }>();
        timelineIds.forEach((id, i) => {
            if (!id) return;
            const tl = timelineQueries[i]?.data;
            const flags = teamsWithRedCards(tl?.timeline ?? tl?.lookup);
            if (flags.home || flags.away) map.set(id, flags);
        });
        return map;
    }, [timelineIds, timelineQueries]);

    // Annotate every live/past row in the schedule list with its red-card
    // flags. The currently-viewed match falls back to `currentMatchRedCards`
    // (from the single-event timeline we already fetch) if the batch query
    // hasn't resolved yet, so the icon never flickers for the selected row.
    const annotatedGroups = groups.map(g => ({
        ...g,
        matches: g.matches.map(m => {
            const batch = redCardByMatch.get(m.id);
            if (m.id === matchId) {
                return {
                    ...m,
                    homeRedCard: batch?.home ?? currentMatchRedCards.home,
                    awayRedCard: batch?.away ?? currentMatchRedCards.away,
                };
            }
            if (batch) {
                return { ...m, homeRedCard: batch.home, awayRedCard: batch.away };
            }
            return m;
        }),
    }));

    return (
        <SportContainer>
            <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start justify-start">
                {/* Left — grouped schedule with day nav */}
                <ScheduleColumn
                    groups={annotatedGroups}
                    selectedMatchId={matchId}
                    dateLabel={formatDateLabel(dateIso)}
                    dateIso={dateIso}
                    onPrevDay={() => setDateIso(d => shiftIso(d, -1))}
                    onNextDay={() => setDateIso(d => shiftIso(d, +1))}
                    onPickDate={(iso) => setDateIso(iso)}
                    competitions={competitions}
                    onPickCompetition={onPickCompetition}
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
                            /* Pre-match vote panel lives INSIDE the red hero
                               card, and only for upcoming fixtures — once
                               the match kicks off the poll is hidden. Vote
                               state is shared with the homepage carousel via
                               localStorage so an earlier vote stays selected
                               here. */
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

                    {/* Favourites bar — available regardless of status so users
                        can pin upcoming fixtures too. One star toggles the
                        match, a pin per team toggles the club (which in turn
                        surfaces every fixture of that club on the active
                        date under Улюблене). */}
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
                                title="Додати команду в улюблені"
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
                                title="Додати матч в улюблені"
                            >
                                <span className="text-lg">{isMatchFav(matchId) ? "★" : "☆"}</span>
                                <span className="text-[11px] uppercase tracking-wider">Матч</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => toggleTeam(event.idAwayTeam ?? undefined)}
                                className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors ${
                                    isTeamFav(event.idAwayTeam ?? undefined)
                                        ? "text-[#af292a]"
                                        : "text-gray-400 hover:text-[#af292a]"
                                }`}
                                title="Додати команду в улюблені"
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

                    {decoratedFormation && featured?.status === "finished" ? (
                        // Match over — the formation IS the final lineup, but
                        // the user already knows that. Drop any header label.
                        <FormationPitch top={decoratedFormation.top} bottom={decoratedFormation.bottom} />
                    ) : decoratedFormation ? (
                        // Real lineup published (≈30 min before kickoff or in-play).
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#af292a]">
                                    Підтверджений склад
                                </span>
                                <span className="text-[10px] text-gray-500">
                                    · опубліковано клубами
                                </span>
                            </div>
                            <FormationPitch top={decoratedFormation.top} bottom={decoratedFormation.bottom} />
                        </div>
                    ) : decoratedPredicted ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 px-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#af292a]">
                                    {featured?.status === "finished"
                                        ? "Орієнтовний склад"
                                        : "Прогноз складу"}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                    · на основі попереднього матчу
                                </span>
                            </div>
                            <FormationPitch
                                top={decoratedPredicted.top}
                                bottom={decoratedPredicted.bottom}
                            />
                        </div>
                    ) : event ? (
                        <div className="text-center text-gray-400 text-xs py-6 bg-white rounded-[20px]">
                            {featured?.status === "finished"
                                ? "Склад для цього матчу недоступний"
                                : "Склад буде опубліковано ближче до матчу"}
                        </div>
                    ) : null}
                    {stats.length > 0 && <StatsTable rows={stats} />}
                    {event && (homeLastFive.length > 0 || awayLastFive.length > 0) && (
                        <LastFiveMatches
                            home={{
                                teamName: event.strHomeTeam ?? "Команда 1",
                                teamLogo: event.strHomeTeamBadge ?? undefined,
                                rows: homeLastFive,
                            }}
                            away={{
                                teamName: event.strAwayTeam ?? "Команда 2",
                                teamLogo: event.strAwayTeamBadge ?? undefined,
                                rows: awayLastFive,
                            }}
                        />
                    )}
                </div>

                {/* Right — blank banner placeholder */}
                <div className="hidden lg:block w-[220px] h-[500px] bg-white rounded-[20px] border border-gray-200 shadow-sm shrink-0" />
            </div>
        </SportContainer>
    );
}
