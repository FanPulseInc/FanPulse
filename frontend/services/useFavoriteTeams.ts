"use client";

import { useQueries } from "@tanstack/react-query";
import { useFavorites } from "./favorites";
import type { SDBTeamsResponse, SDBLeagueResponse } from "./sportsdb/types";

const PROXY = "/api/sports";

async function fetchTeam(teamId: string): Promise<SDBTeamsResponse> {
    const res = await fetch(`${PROXY}/lookup/team/${teamId}`);
    if (!res.ok) throw new Error(`Team lookup ${teamId} → ${res.status}`);
    return res.json() as Promise<SDBTeamsResponse>;
}

async function fetchLeague(leagueId: string): Promise<SDBLeagueResponse> {
    const res = await fetch(`${PROXY}/lookup/league/${leagueId}`);
    if (!res.ok) throw new Error(`League lookup ${leagueId} → ${res.status}`);
    return res.json() as Promise<SDBLeagueResponse>;
}

export interface ResolvedFavTeam {
    id: string;
    name: string;
    badge?: string;
    leagueId?: string;
    league?: string;
}

export interface ResolvedFavCompetition {
    id: string;
    name: string;
    badge?: string;
}

export function useFavoriteTeamsResolved() {
    const { teamIds } = useFavorites();
    const ids = Array.from(teamIds);

    // Step 1: fetch all favorite teams
    const teamQueries = useQueries({
        queries: ids.map((id) => ({
            queryKey: ["sdb", "team", id],
            queryFn: () => fetchTeam(id),
            enabled: !!id,
            staleTime: 30 * 60_000,
        })),
    });

    // Collect teams and unique league IDs
    const teams: ResolvedFavTeam[] = [];
    const leagueIdSet = new Set<string>();

    teamQueries.forEach((q, i) => {
        const team = q.data?.teams?.[0] ?? q.data?.lookup?.[0];
        if (!team) return;

        const badge = team.strBadge ?? team.strTeamBadge ?? team.strLogo ?? team.strTeamLogo ?? undefined;

        teams.push({
            id: ids[i],
            name: team.strTeam ?? "Unknown",
            badge,
            leagueId: team.idLeague ?? undefined,
            league: team.strLeague ?? undefined,
        });

        if (team.idLeague) {
            leagueIdSet.add(team.idLeague);
        }
    });

    const leagueIds = Array.from(leagueIdSet);

    // Step 2: fetch league details to get badges
    const leagueQueries = useQueries({
        queries: leagueIds.map((id) => ({
            queryKey: ["sdb", "league", id],
            queryFn: () => fetchLeague(id),
            enabled: !!id,
            staleTime: 60 * 60_000,
        })),
    });

    const competitions: ResolvedFavCompetition[] = [];
    leagueQueries.forEach((q, i) => {
        const league = q.data?.lookup?.[0];
        if (!league) return;

        competitions.push({
            id: leagueIds[i],
            name: league.strLeague ?? "Unknown",
            badge: league.strBadge ?? league.strLogo ?? undefined,
        });
    });

    const isLoading = teamQueries.some((q) => q.isLoading) || leagueQueries.some((q) => q.isLoading);

    return { teams, competitions, isLoading };
}
