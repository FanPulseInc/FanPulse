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

// Lookup a single event (match) by id
export function useEventLookup(eventId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "event", eventId],
        queryFn: () => sdbGet<SDBEventsResponse>(`lookup/event/${eventId}`),
        enabled: !!eventId,
        staleTime: 60_000,
    });
}

// Lineups for an event
export function useEventLineup(eventId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "event-lineup", eventId],
        queryFn: () => sdbGet<SDBLineupResponse>(`lookup/event_lineup/${eventId}`),
        enabled: !!eventId,
        staleTime: 60_000,
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

// Parallel season-schedule fetches
export function useLeagueSeasons(leagueIds: string[], season: string | undefined) {
    return useQueries({
        queries: leagueIds.map(id => ({
            queryKey: ["sdb", "schedule-season", id, season],
            queryFn: () =>
                sdbGet<SDBScheduleResponse & SDBEventsResponse>(
                    `schedule/league/${id}/${season}`
                ),
            enabled: !!id && !!season,
            staleTime: 10 * 60_000,
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

// Team details (for logos, manager name, etc.)
export function useTeamLookup(teamId: string | undefined) {
    return useQuery({
        queryKey: ["sdb", "team", teamId],
        queryFn: () => sdbGet<SDBTeamsResponse>(`lookup/team/${teamId}`),
        enabled: !!teamId,
        staleTime: 30 * 60_000, // logos barely change
    });
}
