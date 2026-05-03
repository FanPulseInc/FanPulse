import { gridGraphql } from "./client";

export type GridSeries = {
    id: string;
    startTimeScheduled: string;
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

export async function getCs2Series(gte: string, lte: string) {
    const data = await gridGraphql<AllSeriesResponse>(ALL_CS2_SERIES_QUERY, {
        gte,
        lte,
    });

    return {
        totalCount: data.allSeries.totalCount,
        series: data.allSeries.edges.map((edge: any) => edge.node),
        pageInfo: data.allSeries.pageInfo,
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