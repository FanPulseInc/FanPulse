"use client";
import { useQueries, useQuery } from "@tanstack/react-query";
import type {
    SDBLiveScoreResponse,
    SDBEventsResponse,
    SDBScheduleResponse,
    SDBTeamsResponse,
    SDBLineupResponse,
    SDBStatsResponse,
    SDBLeagueResponse,
    SDBTimelineResponse,
    SDBTeamPlayersResponse,
} from "./types";
const PROXY = "/api/sports";

async function sdbGet<T>(path: string, search?: Record<string, string | number>): Promise<T> {
    const qs = search
        ? "?" + new URLSearchParams(Object.entries(search).map(([k, v]) => [k, String(v)])).toString()
        : "";
    const res = await fetch(`${PROXY}/${path}${qs}`);
    if (!res.ok) throw new Error(`SportsDB ${path} → ${res.status}`);
    return res.json() as Promise<T>;
}

// -------- Hooks --------

// Live scores for a sport ("soccer", "basketball", etc.)
export function useLiveScores(sport = "soccer") {
    return useQuery({
        queryKey: ["sdb", "livescore", sport],
        queryFn: () => sdbGet<SDBLiveScoreResponse>(`livescore/${sport}`),
        refetchInterval: 30_000, // livescores: poll every 30s
        staleTime: 15_000,
    });
}

// Next 10 events for a league (e.g. 4328 = English Premier League)
export function useNextLeagueEvents(leagueId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "next-league", leagueId],
        queryFn: () => sdbGet<SDBEventsResponse>(`schedule/next/league/${leagueId}`),
        enabled: !!leagueId,
        staleTime: 5 * 60_000,
    });
}

// Previous 10 events for a league
export function usePreviousLeagueEvents(leagueId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "previous-league", leagueId],
        queryFn: () => sdbGet<SDBEventsResponse>(`schedule/previous/league/${leagueId}`),
        enabled: !!leagueId,
        staleTime: 5 * 60_000,
    });
}

// Full season schedule for a league.
// TheSportsDB returns the schedule under either `schedule` or `events` depending
// on endpoint version — we normalise in the adapter layer.
export function useLeagueSeason(leagueId: string | undefined, season: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "schedule-season", leagueId, season],
        queryFn: () => sdbGet<SDBScheduleResponse & SDBEventsResponse>(
            `schedule/league/${leagueId}/${season}`
        ),
        enabled: !!leagueId && !!season,
        staleTime: 10 * 60_000,
    });
}

// Lookup a single event (match) by id. Polled so scores / status flip from
// "scheduled" → "live" → "finished" without a hard refresh, and so the
// strVideo (highlights) URL appears as soon as the API publishes it.
export function useEventLookup(eventId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "event", eventId],
        queryFn: () => sdbGet<SDBEventsResponse>(`lookup/event/${eventId}`),
        enabled: !!eventId,
        refetchInterval: 30_000,
        refetchOnWindowFocus: true,
        staleTime: 15_000,
    });
}

// Lineups for an event. Subs come in during the second half — refresh roughly
// once a minute so a substitution shows up without reload.
export function useEventLineup(eventId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "event-lineup", eventId],
        queryFn: () => sdbGet<SDBLineupResponse>(`lookup/event_lineup/${eventId}`),
        enabled: !!eventId,
        refetchInterval: 60_000,
        refetchOnWindowFocus: true,
        staleTime: 30_000,
    });
}

// Parallel lineup fetches — used by the predicted-lineup fallback. Not every
// past match has a published lineup (cup/European games in TheSportsDB often
// don't), so we request several of the team's most recent fixtures in one
// shot and the caller picks the first non-empty response. Without this,
// clubs like Shakhtar or Strasbourg — whose most recent match is a cup tie
// with no lineup data — end up with no predicted XI at all.
export function useEventLineups(eventIds: (string | undefined)[]) {
    return useQueries({
        queries: eventIds.map(id => ({
            queryKey: ["sdb", "event-lineup", id],
            queryFn: () => sdbGet<SDBLineupResponse>(`lookup/event_lineup/${id}`),
            enabled: !!id,
            staleTime: 10 * 60_000,
        })),
    });
}

// Stats for an event
export function useEventStats(eventId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "event-stats", eventId],
        queryFn: () => sdbGet<SDBStatsResponse>(`lookup/event_stats/${eventId}`),
        enabled: !!eventId,
        refetchInterval: 60_000,
        staleTime: 30_000,
    });
}

// Parallel timeline fetches for a batch of events. Used by the schedule
// list to detect red cards per match so the list can paint the card icon
// next to the team. Each query is gated individually — pass undefined for
// matches we don't want to fetch (e.g. future fixtures).
export function useEventTimelines(eventIds: (string | undefined)[]) {
    return useQueries({
        queries: eventIds.map(id => ({
            queryKey: ["sdb", "event-timeline", id],
            queryFn: () => sdbGet<SDBTimelineResponse>(`lookup/event_timeline/${id}`),
            enabled: !!id,
            // Same cadence as the single-event version — goals/cards can land
            // during a live match, stale data would paint stale icons.
            refetchInterval: 60_000,
            refetchOnWindowFocus: true,
            staleTime: 60_000,
        })),
    });
}

// Timeline (goals, cards, subs) for an event — drives the scorers panel.
export function useEventTimeline(eventId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "event-timeline", eventId],
        queryFn: () => sdbGet<SDBTimelineResponse>(`lookup/event_timeline/${eventId}`),
        enabled: !!eventId,
        refetchInterval: 60_000, // goals can come in while we watch
        staleTime: 30_000,
    });
}

// League details (badge, country, etc.)
export function useLeagueLookup(leagueId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "league", leagueId],
        queryFn: () => sdbGet<SDBLeagueResponse>(`lookup/league/${leagueId}`),
        enabled: !!leagueId,
        staleTime: 60 * 60_000, // league metadata rarely changes
    });
}

// Parallel league lookups (for a fixed list of top leagues)
export function useLeagueLookups(leagueIds: string[]) {
    return useQueries({
        queries: leagueIds.map(id => ({
            queryKey: ["sdb", "league", id],
            queryFn: () => sdbGet<SDBLeagueResponse>(`lookup/league/${id}`),
            enabled: !!id,
            staleTime: 60 * 60_000,
        })),
    });
}

// Parallel season-schedule fetches. We don't poll the full season every minute
// — that would be wasteful — but we do drop the stale window short and refetch
// on focus, so coming back to the tab pulls fresh statuses/scores. The
// `useLiveScores` 30 s tick covers the in-progress match cells via merge.
export function useLeagueSeasons(leagueIds: string[], season: string | undefined) {
    return useQueries({
        queries: leagueIds.map(id => ({
            queryKey: ["sdb", "schedule-season", id, season],
            queryFn: () =>
                sdbGet<SDBScheduleResponse & SDBEventsResponse>(
                    `schedule/league/${id}/${season}`
                ),
            enabled: !!id && !!season,
            refetchInterval: 5 * 60_000, // 5 min — scores roll in via livescore
            refetchOnWindowFocus: true,
            staleTime: 60_000,
        })),
    });
}

// Last 10 events for a team — used to predict a lineup before kickoff.
export function useTeamPreviousEvents(teamId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "previous-team", teamId],
        queryFn: () => sdbGet<SDBScheduleResponse & SDBEventsResponse>(
            `schedule/previous/team/${teamId}`
        ),
        enabled: !!teamId,
        staleTime: 10 * 60_000,
    });
}

export interface SDBEventResult {
    idResult?: string;
    idEvent?: string;
    intRank?: string;
    intPosition?: string;
    strResult?: string;
    strPlayer?: string;
    idPlayer?: string;
    strTeam?: string;
    idTeam?: string;
    strTime?: string;
    strInterval?: string;
    intLap?: string;
    intLaps?: string;
    intPoints?: string;
    strStatus?: string;
    strCountry?: string;
    strNationality?: string;
    strThumb?: string | null;
    strCutout?: string | null;
    strTeamBadge?: string | null;
}

export interface ScrapedRaceRow {
    position: number;
    name: string;
    team?: string;
    teamBadge?: string;
    photoUrl?: string;
    equipmentUrl?: string;
    country?: string;
    interval?: string;
}

export function useScrapedRaceResults(eventId: string | undefined) {
    return useQuery({
        queryKey: ["race-results-scrape", eventId],
        queryFn: async () => {
            const res = await fetch(`/api/race-results/${eventId}`);
            if (!res.ok) return { results: [] as ScrapedRaceRow[] };
            return (await res.json()) as { results: ScrapedRaceRow[] };
        },
        enabled: !!eventId && /^\d+$/.test(eventId),
        staleTime: 5 * 60_000,
        refetchInterval: 60_000,
    });
}

export function useEventResults(eventId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "event-results", eventId],
        queryFn: () => sdbGet<{ results?: SDBEventResult[] | null; lookup?: SDBEventResult[] | null }>(`lookup/event_results/${eventId}`),
        enabled: !!eventId,
        refetchInterval: 60_000,
        staleTime: 30_000,
    });
}

export function useLeagueTeams(leagueId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "league-teams", leagueId],
        queryFn: () => sdbGet<SDBTeamsResponse>(`list/teams/${leagueId}`),
        enabled: !!leagueId,
        staleTime: 60 * 60_000,
    });
}

export function useLeagueDrivers(leagueId: string | undefined): { name: string; team: string; photoUrl?: string; nationality?: string }[] {
    const { data: teamsData } = useLeagueTeams(leagueId);
    const teams = teamsData?.teams ?? teamsData?.lookup ?? [];
    const teamIds = teams.map(t => t.idTeam).filter((id): id is string => !!id);
    const rosterQueries = useQueries({
        queries: teamIds.map(id => ({
            queryKey: ["sdb", "team-players", id],
            queryFn: () => sdbGet<SDBTeamPlayersResponse>(`list/players/${id}`),
            enabled: !!id,
            staleTime: 60 * 60_000,
        })),
    });
    const drivers: { name: string; team: string; photoUrl?: string; nationality?: string }[] = [];
    rosterQueries.forEach((q, i) => {
        const list = q.data?.player ?? q.data?.list ?? [];
        const teamName = teams[i]?.strTeam ?? "";
        list.forEach(p => {
            const pos = (p.strPosition ?? "").toLowerCase();
            if (pos.includes("manager") || pos.includes("coach") || pos.includes("director") || pos.includes("president") || pos.includes("staff") || pos.includes("engineer") || pos.includes("trainer") || pos.includes("owner")) return;
            const name = (p.strPlayer ?? "").trim();
            if (!name) return;
            drivers.push({
                name,
                team: teamName,
                photoUrl: p.strCutout ?? p.strThumb ?? undefined,
                nationality: p.strNationality ?? undefined,
            });
        });
    });
    return drivers;
}

export function useTeamPlayers(teamId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "team-players", teamId],
        queryFn: () => sdbGet<SDBTeamPlayersResponse>(`list/players/${teamId}`),
        enabled: !!teamId,
        staleTime: 60 * 60_000,
    });
}

export interface SDBSearchedPlayer {
    idPlayer?: string;
    strPlayer?: string;
    strSport?: string;
    strThumb?: string | null;
    strCutout?: string | null;
    strRender?: string | null;
    strNationality?: string | null;
}

async function searchPlayersV1(name: string): Promise<SDBSearchedPlayer[]> {
    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(name)}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { player?: SDBSearchedPlayer[] | null };
    return data.player ?? [];
}

export function usePlayerSearch(name: string | undefined, sport?: string) {
    return useQuery({
        queryKey: ["sdb", "player-search", name, sport],
        queryFn: async () => {
            const all = await searchPlayersV1(name ?? "");
            if (!sport) return all;
            return all.filter(p => (p.strSport ?? "").toLowerCase() === sport.toLowerCase());
        },
        enabled: !!name && name.length >= 2,
        staleTime: 60 * 60_000,
    });
}

export function usePlayerPhotos(names: (string | undefined)[], sport?: string): Record<string, string | undefined> {
    const unique = Array.from(new Set(names.filter((n): n is string => !!n && n.length >= 2)));
    const queries = useQueries({
        queries: unique.map(name => ({
            queryKey: ["sdb", "player-search", name, sport],
            queryFn: async () => {
                const all = await searchPlayersV1(name);
                return sport ? all.filter(p => (p.strSport ?? "").toLowerCase() === sport.toLowerCase()) : all;
            },
            enabled: name.length >= 2,
            staleTime: 60 * 60_000,
        })),
    });
    const map: Record<string, string | undefined> = {};
    queries.forEach((q, i) => {
        const first = q.data?.[0];
        map[unique[i]] = first?.strCutout ?? first?.strThumb ?? undefined;
    });
    return map;
}

// Team details (for logos, manager name, etc.)
export function useTeamLookup(teamId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "team", teamId],
        queryFn: () => sdbGet<SDBTeamsResponse>(`lookup/team/${teamId}`),
        enabled: !!teamId,
        staleTime: 30 * 60_000, // logos barely change
    });
}
