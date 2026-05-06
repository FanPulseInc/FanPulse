import { gridGraphql, gridLiveGraphql } from "./client";

export type GridDotaPlayer = {
    id?: string;
    handle?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    nationality?: string | null;
};

export type GridDotaSeriesDetails = {
    id: string;
    startTimeScheduled: string;
    title?: {
        id: string;
        name: string;
    } | null;
    format?: {
        id?: string;
        name?: string;
        nameShortened?: string;
    } | null;
    teams: {
        baseInfo: {
            id?: string;
            name: string;
        };
        players?: GridDotaPlayer[];
    }[];
    tournament: {
        id: string;
        name: string;
    } | null;
};

export type GridDotaSeriesState = {
    startedAt: string | null;
    started: boolean;
    finished: boolean;
    teams: {
        won: boolean;
        score: number;
        kills: number;
        deaths: number;
        players: {
            kills: number;
            deaths: number;
            assists?: number;
        }[];
    }[];
};

type DotaSeriesDetailsResponse = {
  allSeries: {
    edges: {
      node: Omit<GridDotaSeriesDetails, "teams"> & {
        teams: {
          baseInfo: {
            id?: string;
            name: string;
          };
        }[];
      };
    }[];
  };
};

type DotaSeriesStateResponse = {
    seriesState: GridDotaSeriesState | null;
};

type DotaTeamDetailsResponse = {
    team: {
        id: string;
        name: string;
        players?: GridDotaPlayer[];
    } | null;
};

const DOTA_SERIES_DETAILS_QUERY = `
  query DotaSeriesDetails($gte: String!, $lte: String!) {
    allSeries(
      first: 50
      filter: {
        startTimeScheduled: {
          gte: $gte
          lte: $lte
        }
      }
    ) {
      edges {
        node {
          id
          startTimeScheduled

          title {
            id
            name
          }

          format {
            id
            name
            nameShortened
          }

          teams {
            baseInfo {
              id
              name
            }
          }

          tournament {
            id
            name
          }
        }
      }
    }
  }
`;

const DOTA_SERIES_STATE_QUERY = `
  query DotaSeriesState($id: ID!) {
    seriesState(id: $id) {
      startedAt
      started
      finished

      teams {
        won
        score
        kills
        deaths

        players {
          kills
          deaths
        }
      }
    }
  }
`;

const DOTA_TEAM_DETAILS_QUERY = `
  query DotaTeamDetails($id: ID!) {
    team(id: $id) {
      id
      name

      players {
        id
        handle
        firstName
        lastName
        nationality
      }
    }
  }
`;

export async function getDotaSeriesDetails(id: string, dateIso?: string) {
  const date = dateIso ?? new Date().toISOString().slice(0, 10);

  const gte = `${date}T00:00:00Z`;
  const lte = `${date}T23:59:59Z`;

  const [detailsResult, stateResult] = await Promise.allSettled([
    gridGraphql<DotaSeriesDetailsResponse>(DOTA_SERIES_DETAILS_QUERY, {
      gte,
      lte,
    }),
    gridLiveGraphql<DotaSeriesStateResponse>(DOTA_SERIES_STATE_QUERY, { id }),
  ]);

  const details =
    detailsResult.status === "fulfilled"
      ? detailsResult.value.allSeries.edges
          .map((edge) => edge.node)
          .find((series) => series.id === id) ?? null
      : null;

  const state =
    stateResult.status === "fulfilled" ? stateResult.value.seriesState : null;

  if (!details) return null;

  const teamsWithPlayers = await Promise.all(
    details.teams.map(async (team) => {
      const teamId = team.baseInfo.id;

      if (!teamId) {
        return {
          ...team,
          players: [],
        };
      }

      try {
        const teamResult = await gridGraphql<DotaTeamDetailsResponse>(
          DOTA_TEAM_DETAILS_QUERY,
          { id: teamId }
        );

        return {
          ...team,
          players: teamResult.team?.players ?? [],
        };
      } catch (error) {
        console.error("GRID Dota team players error:", error);

        return {
          ...team,
          players: [],
        };
      }
    })
  );

  return {
    ...details,
    teams: teamsWithPlayers,
    state,
  };
}