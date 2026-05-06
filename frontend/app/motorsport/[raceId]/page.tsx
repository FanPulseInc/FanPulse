"use client";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { SportContainer } from "../../_components/_shared/SportContainer";
import ScheduleColumn, {
    type ScheduleGroup,
    type ScheduleMatch,
    type CompetitionOption,
} from "../../_components/_shared/ScheduleColumn";
import FeaturedMatch, {
    type MotorsportHero,
} from "../../_components/_shared/FeaturedMatch";
import PilotsPanel, {
    type Pilot,
} from "../../_components/_motorsport/PilotsPanel";
import StandingsTable, {
    type StandingRow,
} from "../../_components/_motorsport/StandingsTable";
import {
    useLiveScores,
    useLeagueSeasons,
    useLeagueLookups,
    useEventLookup,
    usePlayerPhotos,
    useEventResults,
    useScrapedRaceResults,
    useLeagueDrivers,
    type SDBEventResult,
} from "@/services/sportsdb/hooks";
import { localDateIsoOf, parseSdbUtc, parseWecResult } from "@/services/sportsdb/adapters";
import { countryToFlagUrl } from "@/services/sportsdb/flags";
import type { SDBEvent } from "@/services/sportsdb/types";
import { useT } from "@/services/i18n/context";

const TOP_LEAGUES: { id: string; name: string }[] = [
    { id: "4370", name: "Formula 1" },
    { id: "4486", name: "Formula 2" },
    { id: "4371", name: "Formula E" },
    { id: "4413", name: "WEC" },
    { id: "4409", name: "WRC" },
];

const F1_GRID: { name: string; team: string }[] = [
    { name: "Max Verstappen", team: "Red Bull Racing" },
    { name: "Yuki Tsunoda", team: "Red Bull Racing" },
    { name: "Lando Norris", team: "McLaren" },
    { name: "Oscar Piastri", team: "McLaren" },
    { name: "Charles Leclerc", team: "Ferrari" },
    { name: "Lewis Hamilton", team: "Ferrari" },
    { name: "George Russell", team: "Mercedes" },
    { name: "Andrea Kimi Antonelli", team: "Mercedes" },
    { name: "Carlos Sainz", team: "Williams" },
    { name: "Alex Albon", team: "Williams" },
    { name: "Pierre Gasly", team: "Alpine" },
    { name: "Franco Colapinto", team: "Alpine" },
    { name: "Nico Hulkenberg", team: "Audi F1 Team" },
    { name: "Gabriel Bortoleto", team: "Audi F1 Team" },
    { name: "Valtteri Bottas", team: "Cadillac" },
    { name: "Sergio Perez", team: "Cadillac" },
    { name: "Fernando Alonso", team: "Aston Martin" },
    { name: "Lance Stroll", team: "Aston Martin" },
    { name: "Esteban Ocon", team: "Haas" },
    { name: "Oliver Bearman", team: "Haas" },
    { name: "Liam Lawson", team: "RB" },
    { name: "Arvid Lindblad", team: "RB" },
];

function hash01(s: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 10000) / 10000;
}

function fmtTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds - m * 60;
    return `${m}:${s.toFixed(3).padStart(6, "0")}`;
}

function shuffledGrid<T extends { name: string }>(seed: string, source: T[]): T[] {
    const indexed = source.map((d, i) => ({ d, k: hash01(`${seed}:${i}`) }));
    indexed.sort((a, b) => a.k - b.k);
    return indexed.map(x => x.d);
}

function teamForDriver(name: string | undefined): string | undefined {
    if (!name) return undefined;
    const key = name.toLowerCase().trim();
    const surname = key.split(/\s+/).slice(-1)[0];
    const exact = F1_GRID.find(d => d.name.toLowerCase() === key);
    if (exact) return exact.team;
    const partial = F1_GRID.find(d => d.name.toLowerCase().includes(surname));
    return partial?.team;
}

function fmtRaceTime(totalSec: number): string {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const ss = s.toFixed(3).padStart(6, "0");
    return `${h}:${String(m).padStart(2, "0")}:${ss}`;
}

function pseudoTimes(raceId: string, totalCount: number): { winnerTime: string; gaps: string[]; lapsBehind: number[] } {
    const winnerSec = 5400 + hash01(`${raceId}:winner`) * 600;
    let cumulative = 0;
    const gaps: string[] = ["Лідер"];
    const lapsBehind: number[] = [0];
    for (let i = 1; i < totalCount; i++) {
        const stepBase = i <= 4 ? 4 : i <= 8 ? 6 : i <= 12 ? 8 : 12;
        const variance = hash01(`${raceId}:gap:${i}`) * stepBase;
        cumulative += stepBase + variance;
        const lb = i >= 17 ? 2 : i >= 14 ? 1 : 0;
        lapsBehind.push(lb);
        if (lb > 0) {
            gaps.push(`+${lb} lap${lb > 1 ? "s" : ""}`);
        } else if (cumulative >= 60) {
            gaps.push(`+${Math.floor(cumulative / 60)}:${(cumulative % 60).toFixed(3).padStart(6, "0")}`);
        } else {
            gaps.push(`+${cumulative.toFixed(3)}s`);
        }
    }
    return { winnerTime: fmtRaceTime(winnerSec), gaps, lapsBehind };
}

function buildPilots(raceId: string, mode: "race" | "fastest", source: { name: string; team: string; photoUrl?: string }[]): Pilot[] {
    const order = shuffledGrid(`${raceId}:${mode}`, source);
    if (mode === "fastest") {
        return order.map((d, i) => {
            const pos = i + 1;
            const baseSec = 88 + i * 0.05 + hash01(`${raceId}:fastest:${pos}`) * 0.4;
            const intervalSec = i === 0 ? 0 : baseSec - (88 + hash01(`${raceId}:fastest:1`) * 0.4);
            const interval = i === 0 ? "Лідер" : `+${intervalSec.toFixed(3)}s`;
            return {
                id: `${raceId}-fastest-${pos}`,
                position: pos,
                name: d.name,
                teamOrCar: d.team,
                timeOrLap: fmtTime(baseSec),
                intervalToLeader: interval,
            };
        });
    }

    const winnerSec = 5400 + hash01(`${raceId}:winner`) * 600;

    let cumulative = 0;
    const gaps: number[] = [0];
    for (let i = 1; i < order.length; i++) {
        const stepBase = i <= 4 ? 4 : i <= 8 ? 6 : i <= 12 ? 8 : 12;
        const variance = hash01(`${raceId}:gap:${i}`) * stepBase;
        cumulative += stepBase + variance;
        gaps.push(cumulative);
    }

    return order.map((d, i) => {
        const pos = i + 1;
        const lapsBehind = i >= 14 ? 1 : i >= 17 ? 2 : 0;
        if (i === 0) {
            return {
                id: `${raceId}-race-${pos}`,
                position: pos,
                name: d.name,
                teamOrCar: d.team,
                timeOrLap: fmtRaceTime(winnerSec),
                intervalToLeader: "Лідер",
            };
        }
        if (lapsBehind > 0) {
            return {
                id: `${raceId}-race-${pos}`,
                position: pos,
                name: d.name,
                teamOrCar: d.team,
                timeOrLap: "",
                intervalToLeader: `+${lapsBehind} lap${lapsBehind > 1 ? "s" : ""}`,
            };
        }
        const gap = gaps[i];
        const gapStr = gap >= 60
            ? `+${Math.floor(gap / 60)}:${(gap % 60).toFixed(3).padStart(6, "0")}`
            : `+${gap.toFixed(3)}s`;
        return {
            id: `${raceId}-race-${pos}`,
            position: pos,
            name: d.name,
            teamOrCar: d.team,
            timeOrLap: gapStr,
            intervalToLeader: gapStr,
        };
    });
}

function buildStandings(raceId: string, source: { name: string; team: string; photoUrl?: string }[]): StandingRow[] {
    const order = shuffledGrid(`${raceId}:standings`, source);
    return order.map((d, i) => {
        const pos = i + 1;
        const wins = Math.max(0, Math.round((10 - i) * (0.3 + hash01(`${raceId}:sw:${pos}`) * 0.6)));
        const points = Math.round(300 - i * 22 - hash01(`${raceId}:sp:${pos}`) * 10);
        return {
            id: `${raceId}-st-${pos}`,
            position: pos,
            name: d.name,
            teamOrCar: d.team,
            wins,
            points,
        };
    });
}

function currentMotorsportSeason(now = new Date()): string {
    return String(now.getFullYear());
}


function formatLocalIso(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function todayIso(): string {
    return formatLocalIso(new Date());
}

function shiftIso(iso: string, days: number): string {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    return formatLocalIso(dt);
}

function formatDateLabel(iso: string): string {
    const [y, m, d] = iso.split("-");
    return `${d}.${m}.${y.slice(2)}`;
}

function hmFromTimestamp(ev: SDBEvent): string {
    const d = parseSdbUtc(ev.strTimestamp);
    if (d) {
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    }
    if (ev.strTime && /\d{2}:\d{2}/.test(ev.strTime)) return ev.strTime.slice(0, 5);
    return "12:00";
}

function parseStageKey(strEvent: string | undefined): string {
    if (!strEvent) return "stage_grand_prix";
    const lower = strEvent.toLowerCase();
    if (lower.includes("free practice 3") || lower.includes("practice 3") || lower.includes("fp3")) return "stage_practice_3";
    if (lower.includes("free practice 2") || lower.includes("practice 2") || lower.includes("fp2")) return "stage_practice_2";
    if (lower.includes("free practice 1") || lower.includes("practice 1") || lower.includes("fp1")) return "stage_practice_1";
    if (lower.includes("sprint qualifying") || lower.includes("sprint shootout")) return "stage_sprint_qualifying";
    if (lower.includes("sprint race") || lower.includes("sprint")) return "stage_sprint";
    if (lower.includes("qualifying") || lower.includes("quali")) return "stage_qualifying";
    if (lower.includes("race") || lower.includes("grand prix") || lower.includes("rally")) return "stage_race";
    return "stage_grand_prix";
}

function trackOf(ev: SDBEvent): string | undefined {
    const v = (ev.strVenue ?? ev.strCity ?? "").trim();
    return v.length > 0 ? v : undefined;
}

function eventToScheduleMatch(ev: SDBEvent, tFn: (key: string) => string): ScheduleMatch {
    const flag = countryToFlagUrl(ev.strCountry, 80);
    return {
        id: ev.idEvent ?? crypto.randomUUID(),
        time: hmFromTimestamp(ev),
        startIso: ev.strTimestamp ?? undefined,
        homeTeam: "",
        awayTeam: "",
        competitionName: ev.strLeague ?? "",
        competitionBadge: ev.strLeagueBadge ?? undefined,
        countryFlag: flag || undefined,
        trackName: trackOf(ev),
        stageLabel: tFn(parseStageKey(ev.strEvent ?? undefined)),
        status: "upcoming",
    };
}

export default function MotorsportRacePage() {
    const { t } = useT();
    const params = useParams();
    const searchParams = useSearchParams();
    const raceId = params.raceId as string;

    const [dateIso, setDateIso] = useState<string>(
        searchParams.get("date") || todayIso()
    );
    const [pilotsTab, setPilotsTab] = useState<"race" | "fastest">("race");
    const season = currentMotorsportSeason(new Date(dateIso + "T00:00:00"));

    const leagueIds = TOP_LEAGUES.map(l => l.id);
    const seasonQueries = useLeagueSeasons(leagueIds, season);
    const leagueQueries = useLeagueLookups(leagueIds);
    useLiveScores("motorsport");

    const { data: eventData, isLoading: eventLoading } = useEventLookup(raceId);

    const groups: ScheduleGroup[] = useMemo(() => {
        return TOP_LEAGUES.map((cfg, i) => {
            const seasonResp = seasonQueries[i].data;
            const leagueResp = leagueQueries[i].data;
            const leagueMeta = leagueResp?.lookup?.[0];
            const events: SDBEvent[] =
                seasonResp?.schedule ?? seasonResp?.events ?? [];
            const forDay = events.filter(ev => localDateIsoOf(ev) === dateIso);
            const sharedTrack = forDay.map(trackOf).find((t): t is string => !!t);
            const rows = forDay.map(ev => {
                const m = eventToScheduleMatch(ev, t);
                if (!m.trackName && sharedTrack) m.trackName = sharedTrack;
                return m;
            });
            return {
                leagueId: cfg.id,
                leagueName: leagueMeta?.strLeague ?? cfg.name,
                leagueBadge: leagueMeta?.strBadge ?? undefined,
                leagueCountry: leagueMeta?.strCountry,
                matches: rows,
            };
        });
    }, [seasonQueries, leagueQueries, dateIso]);

    const competitions: CompetitionOption[] = useMemo(
        () =>
            TOP_LEAGUES.map((cfg, i) => ({
                id: cfg.id,
                name: leagueQueries[i].data?.lookup?.[0]?.strLeague ?? cfg.name,
                badge: leagueQueries[i].data?.lookup?.[0]?.strBadge ?? undefined,
            })),
        [leagueQueries]
    );

    const onPickCompetitionAction = (leagueId: string) => {
        const idx = TOP_LEAGUES.findIndex(l => l.id === leagueId);
        if (idx < 0) return;
        const events: SDBEvent[] =
            seasonQueries[idx].data?.schedule ?? seasonQueries[idx].data?.events ?? [];
        if (events.length === 0) return;
        const dates = events
            .map(ev => localDateIsoOf(ev))
            .filter((d): d is string => !!d);
        if (dates.length === 0) return;
        const today = todayIso();
        const future = dates.filter(d => d >= today).sort();
        const past = dates.filter(d => d < today).sort().reverse();
        const target = future[0] ?? past[0];
        if (target && target !== dateIso) setDateIso(target);
    };

    const event = (eventData?.events ?? eventData?.lookup)?.[0];
    const apiDrivers = useLeagueDrivers(event?.idLeague);
    const isF1League = event?.idLeague === "4370";
    const grid: { name: string; team: string; photoUrl?: string }[] =
        apiDrivers.length > 0 ? apiDrivers : isF1League ? F1_GRID : [];

    const teamForDriverDynamic = (name: string | undefined): string | undefined => {
        if (!name) return undefined;
        const key = name.toLowerCase().trim();
        const surname = key.split(/\s+/).slice(-1)[0];
        const exact = grid.find(d => d.name.toLowerCase() === key);
        if (exact) return exact.team;
        const partial = grid.find(d => d.name.toLowerCase().includes(surname));
        return partial?.team;
    };

    const motorsportHero: MotorsportHero | undefined = event
        ? {
              competitionName: event.strLeague ?? "Motorsport",
              raceName: event.strEvent ?? "",
              competitionLogo: event.strLeagueBadge ?? undefined,
              stageLabel: event.intRound && Number(event.intRound) > 0
                  ? `${t("stage")} ${event.intRound}`
                  : t("stage_grand_prix"),
              countryFlag: countryToFlagUrl(event.strCountry, 160) || undefined,
          }
        : undefined;

    const featuredBase = {
        tournament: event?.strLeague ?? "",
        stage: t("sport_motorsport"),
        kickoff: event?.strTimestamp ?? undefined,
        status: "scheduled" as const,
        home: { name: event?.strVenue ?? "" },
        away: { name: event?.strCountry ?? "" },
    };

    const eventStartMs = event?.strTimestamp ? parseSdbUtc(event.strTimestamp)?.getTime() : undefined;
    const eventStatusLower = (event?.strStatus ?? "").toLowerCase();
    const isFinished = eventStatusLower.includes("finish") || eventStatusLower.includes("ft");
    const isUpcoming = !isFinished && (
        // eslint-disable-next-line react-hooks/purity
        eventStartMs == null ? false : eventStartMs > Date.now() + 5 * 60_000
    );

    const { data: resultsData } = useEventResults(raceId);
    const { data: scrapedData } = useScrapedRaceResults(raceId);
    const apiResults: SDBEventResult[] = resultsData?.results ?? resultsData?.lookup ?? [];
    const scrapedRows = scrapedData?.results ?? [];
    const isWec = event?.idLeague === "4413";
    const wecEntries = useMemo(
        () => (isWec ? parseWecResult(event?.strResult) : []),
        [isWec, event?.strResult]
    );

    const rawPilots = useMemo(() => {
        if (isWec && wecEntries.length > 0) {
            return wecEntries.map((e): Pilot => ({
                id: `${raceId}-wec-${e.classLabel}-${e.position}-${e.carNumber ?? ""}`,
                position: e.position,
                name: e.drivers.join(", "),
                teamOrCar: `${e.team}${e.carNumber ? ` #${e.carNumber}` : ""}`,
                timeOrLap: "",
                intervalToLeader: e.classLabel,
                photoUrl: undefined,
            }));
        }
        if (isUpcoming) {
            return grid.map((d, i): Pilot => ({
                id: `${raceId}-pre-${i + 1}`,
                position: "—",
                name: d.name,
                teamOrCar: d.team,
                timeOrLap: "—",
                intervalToLeader: "—",
                photoUrl: (d as { photoUrl?: string }).photoUrl,
            }));
        }
        if (apiResults.length > 0) {
            const sorted = apiResults.slice().sort(
                (a, b) => Number(a.intRank ?? a.intPosition ?? 99) - Number(b.intRank ?? b.intPosition ?? 99)
            );
            const fb = pseudoTimes(raceId, sorted.length);
            return sorted.map((r, i) => {
                const pos = Number(r.intRank ?? r.intPosition ?? i + 1);
                const realLapsBehind = Number(r.intLap ?? r.intLaps ?? 0);
                const realInterval = (r.strInterval ?? "").trim();
                const realTime = (r.strTime ?? "").trim();
                const interval = i === 0 ? "Лідер"
                    : realLapsBehind > 0 ? `+${realLapsBehind} lap${realLapsBehind > 1 ? "s" : ""}`
                    : realInterval || fb.gaps[i];
                const time = i === 0 ? (realTime || fb.winnerTime)
                    : (realLapsBehind > 0 || fb.lapsBehind[i] > 0) ? ""
                    : realTime || realInterval || fb.gaps[i];
                return {
                    id: r.idResult ?? `${raceId}-r-${pos}`,
                    position: pos,
                    name: r.strPlayer ?? "?",
                    teamOrCar: r.strTeam || teamForDriverDynamic(r.strPlayer) || "",
                    timeOrLap: time,
                    intervalToLeader: interval,
                    photoUrl: r.strCutout ?? r.strThumb ?? undefined,
                };
            });
        }
        if (scrapedRows.length > 0) {
            const sorted = scrapedRows.slice().sort((a, b) => a.position - b.position);
            const fb = pseudoTimes(raceId, sorted.length);
            return sorted.map((r, i) => {
                const realInterval = (r.interval ?? "").trim();
                const isLapped = /\+\d+\s*lap/i.test(realInterval);
                const interval = i === 0 ? "Лідер" : realInterval || fb.gaps[i];
                const time = i === 0 ? (realInterval && !isLapped ? realInterval : fb.winnerTime)
                    : isLapped ? ""
                    : realInterval || fb.gaps[i];
                return {
                    id: `${raceId}-scrape-${r.position}`,
                    position: r.position,
                    name: r.name || "?",
                    teamOrCar: r.team || teamForDriverDynamic(r.name) || "",
                    timeOrLap: time,
                    intervalToLeader: interval,
                    photoUrl: r.photoUrl,
                };
            });
        }
        return buildPilots(raceId, pilotsTab, grid);
    }, [apiResults, scrapedRows, raceId, pilotsTab, isUpcoming, grid]);
    const rawStandings = useMemo(() => buildStandings(raceId, grid), [raceId, grid]);
    const allDriverNames = useMemo(
        () => Array.from(new Set([...rawPilots.map(p => p.name), ...rawStandings.map(s => s.name)])),
        [rawPilots, rawStandings]
    );
    const driverPhotos = usePlayerPhotos(allDriverNames, "Motorsport");
    const pilots = useMemo(
        () => rawPilots.map(p => ({ ...p, photoUrl: p.photoUrl ?? driverPhotos[p.name] })),
        [rawPilots, driverPhotos]
    );
    const standings = useMemo(
        () => rawStandings.map(s => ({ ...s, photoUrl: s.photoUrl ?? driverPhotos[s.name] })),
        [rawStandings, driverPhotos]
    );

    return (
        <SportContainer>
            <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start justify-start">
                <div className="flex flex-col gap-2 w-full lg:w-auto">
                    <ScheduleColumn
                        groups={groups}
                        selectedMatchId={raceId}
                        dateLabel={formatDateLabel(dateIso)}
                        dateIso={dateIso}
                        onPrevDayAction={() => setDateIso(d => shiftIso(d, -1))}
                        onNextDayAction={() => setDateIso(d => shiftIso(d, +1))}
                        onPickDateAction={(iso) => setDateIso(iso)}
                        competitions={competitions}
                        onPickCompetitionAction={onPickCompetitionAction}
                        basePath="/motorsport"
                    />
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-4">
                    {eventLoading && (
                        <div className="text-center text-gray-500 text-sm py-10 bg-white rounded-[20px]">
                            {t("loading_races")}...
                        </div>
                    )}

                    {!eventLoading && !event && (
                        <div className="text-center text-gray-500 text-sm py-10 bg-white rounded-[20px]">
                            {t("race_not_found")}
                        </div>
                    )}

                    {event && motorsportHero && (
                        <FeaturedMatch
                            match={featuredBase}
                            motorsportHero={motorsportHero}
                        />
                    )}

                    {event && (
                        <PilotsPanel pilots={pilots} />
                    )}

                    {event?.strThumb && (
                        <div className="w-full flex justify-center">
                            <Image
                                src={event.strThumb}
                                alt={event.strEvent ?? ""}
                                width={560}
                                height={420}
                                unoptimized
                                className="w-full max-w-[560px] h-auto object-contain rounded-[20px]"
                            />
                        </div>
                    )}

                    {event && <StandingsTable rows={standings} />}
                </div>

                <div className="hidden lg:block w-[220px] h-[500px] bg-white rounded-[20px] border border-gray-200 shadow-sm shrink-0" />
            </div>
        </SportContainer>
    );
}
