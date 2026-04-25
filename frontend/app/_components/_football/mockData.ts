import type { ScheduleMatch } from "./ScheduleColumn";
import type { FeaturedMatchData } from "./FeaturedMatch";
import type { FormationTeam } from "./FormationPitch";
import type { StatRow } from "./StatsTable";
import type { UpcomingTeam } from "./UpcomingGames";
import type { CarouselMatch } from "./MatchCarousel";

export const MOCK_MATCHES: ScheduleMatch[] = Array.from({ length: 14 }, (_, i) => ({
    id: `match-${i + 1}`,
    time: "12:00",
    homeTeam: `Команда1`,
    awayTeam: `Команда1`,
    homeScore: 0,
    awayScore: 0,
    favorite: i === 0,
    status: i < 3 ? "live" : i < 7 ? "past" : "upcoming",
}));

export const MOCK_CAROUSEL_MATCHES: CarouselMatch[] = [
    {
        id: "pop-1",
        league: "Premier League",
        kickoff: "2026-04-22T22:00:00",
        home: { name: "Burnley" },
        away: { name: "Man City" },
        odds: { home: 17.0, draw: 8.0, away: 1.14 },
        trend: { home: "up", draw: "up", away: "down" },
    },
    {
        id: "pop-2",
        league: "La Liga",
        kickoff: "2026-04-23T20:30:00",
        home: { name: "Real Madrid" },
        away: { name: "Barcelona" },
        odds: { home: 2.1, draw: 3.5, away: 3.2 },
        trend: { home: "flat", draw: "up", away: "down" },
    },
    {
        id: "pop-3",
        league: "Bundesliga",
        kickoff: "2026-04-24T18:30:00",
        home: { name: "Bayern" },
        away: { name: "Dortmund" },
        odds: { home: 1.45, draw: 4.8, away: 6.2 },
        trend: { home: "down", draw: "flat", away: "up" },
    },
    {
        id: "pop-4",
        league: "Serie A",
        kickoff: "2026-04-25T19:45:00",
        home: { name: "Inter" },
        away: { name: "Juventus" },
        odds: { home: 1.9, draw: 3.4, away: 4.1 },
        trend: { home: "up", draw: "flat", away: "down" },
    },
    {
        id: "pop-5",
        league: "Ligue 1",
        kickoff: "2026-04-26T21:00:00",
        home: { name: "PSG" },
        away: { name: "Marseille" },
        odds: { home: 1.35, draw: 5.2, away: 8.0 },
        trend: { home: "down", draw: "up", away: "up" },
    },
];

export function getMockMatchById(id: string): {
    featured: FeaturedMatchData;
    top: FormationTeam;
    bottom: FormationTeam;
    stats: StatRow[];
    upcomingLeft: UpcomingTeam;
    upcomingRight: UpcomingTeam;
} {
    const featured: FeaturedMatchData = {
        tournament: "UEFA",
        stage: "Футбол",
        kickoff: new Date().toISOString(),
        status: "live",
        venue: "23:48",
        home: { name: "Команда 1", score: 0, possession: 100, accuracy: 100 },
        away: { name: "Команда 2", score: 0, possession: 100, accuracy: 100 },
    };

    const mkPlayer = (n: number, role?: string) => ({ id: `${id}-p-${n}`, name: `Гравець ${n}`, role });

    const top: FormationTeam = {
        label: "Команда 1",
        coachName: "Тренер",
        goalkeeper: mkPlayer(1, "Голкіпер"),
        defense: [mkPlayer(2, "Захисник"), mkPlayer(3, "Захисник"), mkPlayer(4, "Захисник"), mkPlayer(5, "Захисник")],
        midfield: [mkPlayer(6, "Півзах."), mkPlayer(7, "Півзах."), mkPlayer(8, "Півзах."), mkPlayer(9, "Півзах.")],
        attack: [mkPlayer(10, "Нападник"), mkPlayer(11, "Нападник")],
    };
    const bottom: FormationTeam = {
        label: "Команда 2",
        coachName: "Тренер",
        goalkeeper: mkPlayer(12, "Голкіпер"),
        defense: [mkPlayer(13, "Захисник"), mkPlayer(14, "Захисник"), mkPlayer(15, "Захисник"), mkPlayer(16, "Захисник")],
        midfield: [mkPlayer(17, "Півзах."), mkPlayer(18, "Півзах."), mkPlayer(19, "Півзах."), mkPlayer(20, "Півзах.")],
        attack: [mkPlayer(21, "Нападник"), mkPlayer(22, "Нападник")],
    };

    const stats: StatRow[] = [
        { label: "Голи", home: 12, away: 12 },
        { label: "Удари по воротам", home: 12, away: 12 },
        { label: "Відбиті воротами", home: 12, away: 12 },
        { label: "Футбол", home: 12, away: 12 },
        { label: "Фоли", home: 12, away: 12 },
        { label: "Паси", home: 12, away: 12 },
        { label: "Відбір м'яча", home: 12, away: 12 },
        { label: "Вільні удари", home: 12, away: 12 },
        { label: "Жовті картки", home: 12, away: 12 },
    ];

    const mkUpcoming = (label: string): UpcomingTeam => ({
        label,
        coach: "Тренер",
        players: Array.from({ length: 6 }, (_, i) => ({
            id: `${id}-${label}-u-${i}`,
            name: `Команда${i + 1}`,
            number: 50,
        })),
    });

    return {
        featured,
        top,
        bottom,
        stats,
        upcomingLeft: mkUpcoming("Команда1"),
        upcomingRight: mkUpcoming("Команда2"),
    };
}
