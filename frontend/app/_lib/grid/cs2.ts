import { gridGraphql, gridLiveGraphql } from "./client";

export type GridSeries = {
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

export type GridLiveSeries = GridSeries & {
  liveState: GridSeriesState;
};

type AllSeriesResponse = {
  allSeries: {
    totalCount: number;
    edges: {
      node: GridSeries;
    }[];
    pageInfo: {
      endCursor: string | null;
      hasNextPage: boolean;
    };
  };
};

type SeriesStateResponse = {
  seriesState: GridSeriesState | null;
};

const POPULAR_TOURNAMENT_KEYWORDS = [
  "IEM",
  "Intel Extreme Masters",
  "ESL",
  "ESL Pro League",
  "BLAST",
  "PGL",
  "Major",
  "StarLadder",
  "Esports World Cup",
  "Perfect World",
  "DreamHack",
];

const LOW_TIER_KEYWORDS = [
  "ESEA",
  "Rushzone",
  "CCT",
  "United21",
  "European Pro League",
  "Thunderpick",
  "YaLLa",
  "Fragster",
];

const TEST_TOURNAMENT_KEYWORDS = [
  "GRID-TEST",
  "GRID TEST",
  "TEST",
];

function isPopularTournament(name: string) {
  const normalized = name.toLowerCase();

  const isLowTier = LOW_TIER_KEYWORDS.some((keyword) =>
    normalized.includes(keyword.toLowerCase())
  );

  if (isLowTier) return false;

  return POPULAR_TOURNAMENT_KEYWORDS.some((keyword) =>
    normalized.includes(keyword.toLowerCase())
  );
}

function isCs2Series(series: GridSeries) {
  const titleName = series.title?.name?.toLowerCase() ?? "";

  return (
    titleName.includes("counter-strike") ||
    titleName.includes("counter strike") ||
    titleName.includes("counterstrike") ||
    titleName.includes("cs-2") ||
    titleName.includes("cs 2") ||
    titleName.includes("cs:2") ||
    titleName.includes("cs2")
  );
}

function isTestSeries(series: GridSeries) {
  const tournamentName = series.tournament?.name?.toLowerCase() ?? "";

  return TEST_TOURNAMENT_KEYWORDS.some((keyword) =>
    tournamentName.includes(keyword.toLowerCase())
  );
}

function filterRealCs2Series(series: GridSeries[]) {
  return series.filter((item) => isCs2Series(item) && !isTestSeries(item));
}

const ALL_CS2_SERIES_QUERY = `
  query AllCs2Series($gte: String!, $lte: String!) {
    allSeries(
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

const SERIES_STATE_QUERY = `
  query SeriesState($id: ID!) {
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

export async function getCs2Series(gte: string, lte: string) {
  const data = await gridGraphql<AllSeriesResponse>(ALL_CS2_SERIES_QUERY, {
    gte,
    lte,
  });

  const series = filterRealCs2Series(
    data.allSeries.edges.map((edge) => edge.node)
  );

  return {
    totalCount: series.length,
    series,
    pageInfo: data.allSeries.pageInfo,
  };
}

export async function getSeriesState(seriesId: string) {
  const data = await gridLiveGraphql<SeriesStateResponse>(SERIES_STATE_QUERY, {
    id: seriesId,
  });

  return data.seriesState;
}

export async function getLiveCs2Series(gte: string, lte: string) {
  const data = await getCs2Series(gte, lte);

  console.log("SERIES TO CHECK:", data.series.length);

  const checked = await Promise.allSettled(
    data.series.map(async (series) => {
      const state = await getSeriesState(series.id);

      console.log("STATE:", {
        id: series.id,
        teams: series.teams.map((t) => t.baseInfo.name),
        tournament: series.tournament?.name,
        state,
      });

      return {
        series,
        state,
      };
    })
  );

  console.log("CHECKED:", checked);

  const liveSeries = checked
    .filter(
      (
        item
      ): item is PromiseFulfilledResult<{
        series: GridSeries;
        state: GridSeriesState | null;
      }> => item.status === "fulfilled"
    )
    .map((item) => item.value)
    .filter(({ state }) => {
      console.log("LIVE FILTER:", {
        started: state?.started,
        finished: state?.finished,
      });

      return state?.started === true && state.finished === false;
    })
    .map(({ series, state }) => ({
      ...series,
      liveState: state,
    }));

  console.log("LIVE SERIES:", liveSeries.length);

  return {
    totalCount: liveSeries.length,
    series: liveSeries,
  };
}

export async function getCs2Tournaments(gte: string, lte: string) {
  const data = await getCs2Series(gte, lte);

  const tournamentsMap = new Map<
    string,
    {
      id: string;
      name: string;
      seriesCount: number;
    }
  >();

  for (const series of data.series) {
    const tournament = series.tournament;

    if (!tournament?.id || !tournament?.name) continue;

    const existing = tournamentsMap.get(tournament.id);

    if (existing) {
      existing.seriesCount += 1;
    } else {
      tournamentsMap.set(tournament.id, {
        id: tournament.id,
        name: tournament.name,
        seriesCount: 1,
      });
    }
  }

  return Array.from(tournamentsMap.values());
}

export async function getPopularCs2Series(gte: string, lte: string) {
  const data = await getCs2Series(gte, lte);

  const series = data.series.filter((series) =>
    series.tournament?.name
      ? isPopularTournament(series.tournament.name)
      : false
  );

  return {
    ...data,
    totalCount: series.length,
    series,
  };
}