import { gridGraphql, gridLiveGraphql } from "./client";

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
    }[];
  }[];
};

type SeriesDetailsResponse = {
  series: GridSeriesDetails | null;
};

type SeriesStateResponse = {
  seriesState: GridSeriesState | null;
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

  return {
    ...details,
    state,
  };
}