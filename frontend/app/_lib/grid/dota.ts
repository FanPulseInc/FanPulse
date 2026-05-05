import { gridGraphql, gridLiveGraphql } from "./client";

export type GridDotaSeries = {
    id: string;
    startTimeScheduled: string;
    title: {
        id: string;
        name: string;
    } | null;
    teams: {
        baseInfo: {
            id: string;
            name: string;
        };
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
        }[];
    }[];
};

export type GridLiveDotaSeries = GridDotaSeries & {
    liveState: GridDotaSeriesState;
};

type AllDotaSeriesResponse = {
    allSeries: {
        totalCount: number;
        edges: {
            node: GridDotaSeries;
        }[];
        pageInfo: {
            endCursor: string | null;
            hasNextPage: boolean;
        };
    };
};

type DotaSeriesStateResponse = {
    seriesState: GridDotaSeriesState | null;
};

const TEST_TOURNAMENT_KEYWORDS = ["GRID-TEST", "GRID TEST", "TEST"];

function isDotaSeries(series: GridDotaSeries) {
  const titleId = String(series.title?.id ?? "").toLowerCase();
  const titleName = series.title?.name?.toLowerCase() ?? "";
  const tournamentName = series.tournament?.name?.toLowerCase() ?? "";

  return (
    titleId === "2" ||
    titleName.includes("dota") ||
    titleName.includes("defense of the ancients") ||
    tournamentName.includes("dota")
  );
}

function isTestSeries(series: GridDotaSeries) {
    const tournamentName = series.tournament?.name?.toLowerCase() ?? "";

    return TEST_TOURNAMENT_KEYWORDS.some((keyword) =>
        tournamentName.includes(keyword.toLowerCase())
    );
}

function filterRealDotaSeries(series: GridDotaSeries[]) {
    return series.filter((item) => isDotaSeries(item) && !isTestSeries(item));
}

const ALL_DOTA_SERIES_QUERY = `
  query AllDotaSeries($gte: String!, $lte: String!) {
    allSeries(
      first: 50
      filter: {
        startTimeScheduled: {
          gte: $gte
          lte: $lte
        }
      }
    ) {
      totalCount
      edges {
        node {
          id
          startTimeScheduled
          title {
            id
            name
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
      pageInfo {
        endCursor
        hasNextPage
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

export async function getDotaSeries(gte: string, lte: string) {
    const data = await gridGraphql<AllDotaSeriesResponse>(
        ALL_DOTA_SERIES_QUERY,
        { gte, lte }
    );

    console.log(
        "DOTA RAW SERIES:",
        data.allSeries.edges.map((edge) => ({
            id: edge.node.id,
            titleId: edge.node.title?.id,
            titleName: edge.node.title?.name,
            tournament: edge.node.tournament?.name,
        }))
    );

    const series = filterRealDotaSeries(
        data.allSeries.edges.map((edge) => edge.node)
    );

    return {
        totalCount: series.length,
        series,
        pageInfo: data.allSeries.pageInfo,
    };
}

export async function getDotaSeriesState(seriesId: string) {
    const data = await gridLiveGraphql<DotaSeriesStateResponse>(
        DOTA_SERIES_STATE_QUERY,
        { id: seriesId }
    );

    return data.seriesState;
}

export async function getLiveDotaSeries(gte: string, lte: string) {
    const data = await getDotaSeries(gte, lte);

    const checked = await Promise.allSettled(
        data.series.map(async (series) => {
            const state = await getDotaSeriesState(series.id);

            return {
                series,
                state,
            };
        })
    );

    const liveSeries = checked
        .filter(
            (
                item
            ): item is PromiseFulfilledResult<{
                series: GridDotaSeries;
                state: GridDotaSeriesState | null;
            }> => item.status === "fulfilled"
        )
        .map((item) => item.value)
        .filter(({ state }) => state?.started === true && state.finished === false)
        .map(({ series, state }) => ({
            ...series,
            liveState: state,
        }));

    return {
        totalCount: liveSeries.length,
        series: liveSeries,
    };
}