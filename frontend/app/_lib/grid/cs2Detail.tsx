import { gridGraphql, gridLiveGraphql } from "./client";

export type GridPlayer = {
  id?: string;
  handle?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  nationality?: string | null;
};

export type GridTeamDetails = {
  id: string;
  name: string;
  players?: GridPlayer[];
};

export type GridSeriesDetails = {
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
    players?: GridPlayer[];
  }[];
  tournament: {
    id: string;
    name: string;
  } | null;
};

export type GridSeriesState = {
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

type SeriesDetailsResponse = {
  series: Omit<GridSeriesDetails, "teams"> & {
    teams: {
      baseInfo: {
        id?: string;
        name: string;
      };
    }[];
  } | null;
};

type SeriesStateResponse = {
  seriesState: GridSeriesState | null;
};

type TeamDetailsResponse = {
  team: {
    id: string;
    name: string;
    players?: GridPlayer[];
  } | null;
};

const CS2_SERIES_DETAILS_QUERY = `
  query Cs2SeriesDetails($id: ID!) {
    series(id: $id) {
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
`;

const CS2_SERIES_STATE_QUERY = `
  query Cs2SeriesState($id: ID!) {
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

const CS2_TEAM_DETAILS_QUERY = `
  query Cs2TeamDetails($id: ID!) {
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

export async function getCs2SeriesDetails(id: string) {
  const [detailsResult, stateResult] = await Promise.allSettled([
    gridGraphql<SeriesDetailsResponse>(CS2_SERIES_DETAILS_QUERY, { id }),
    gridLiveGraphql<SeriesStateResponse>(CS2_SERIES_STATE_QUERY, { id }),
  ]);

  const details =
    detailsResult.status === "fulfilled" ? detailsResult.value.series : null;

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
        const teamResult = await gridGraphql<TeamDetailsResponse>(
          CS2_TEAM_DETAILS_QUERY,
          { id: teamId }
        );

        return {
          ...team,
          players: teamResult.team?.players ?? [],
        };
      } catch (error) {
        console.error("GRID team players error:", error);

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