"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SportContainer } from "../_components/_shared/SportContainer";
import ScheduleColumn, {
    type ScheduleGroup,
    type ScheduleMatch,
    type CompetitionOption,
} from "../_components/_shared/ScheduleColumn";
import MotorsportCarousel from "../_components/_motorsport/MotorsportCarousel";
import {
    useLiveScores,
    useLeagueSeasons,
    useLeagueLookups,
} from "@/services/sportsdb/hooks";
import { localDateIsoOf, parseSdbUtc } from "@/services/sportsdb/adapters";
import { countryToFlagUrl } from "@/services/sportsdb/flags";
import type { SDBEvent } from "@/services/sportsdb/types";

const TOP_LEAGUES: { id: string; name: string }[] = [
    { id: "4370", name: "Formula 1" },
    { id: "4486", name: "Formula 2" },
    { id: "4371", name: "Formula E" },
    { id: "4413", name: "WEC" },
    { id: "4409", name: "WRC" },
];

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

function parseStageLabel(strEvent: string | undefined): string {
    if (!strEvent) return "Гран-При";
    const lower = strEvent.toLowerCase();
    if (lower.includes("free practice 3") || lower.includes("practice 3") || lower.includes("fp3")) return "Практика 3";
    if (lower.includes("free practice 2") || lower.includes("practice 2") || lower.includes("fp2")) return "Практика 2";
    if (lower.includes("free practice 1") || lower.includes("practice 1") || lower.includes("fp1")) return "Практика 1";
    if (lower.includes("sprint qualifying") || lower.includes("sprint shootout")) return "Спринт-кваліфікація";
    if (lower.includes("sprint race") || lower.includes("sprint")) return "Спринт";
    if (lower.includes("qualifying") || lower.includes("quali")) return "Кваліфікація";
    if (lower.includes("race") || lower.includes("grand prix") || lower.includes("rally")) return "Гонка";
    return "Гран-При";
}

function trackOf(ev: SDBEvent): string | undefined {
    const v = (ev.strVenue ?? ev.strCity ?? "").trim();
    return v.length > 0 ? v : undefined;
}

function eventToScheduleMatch(ev: SDBEvent): ScheduleMatch {
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
        stageLabel: parseStageLabel(ev.strEvent ?? undefined),
        status: "upcoming",
    };
}

export default function MotorsportPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialDate = searchParams.get("date") || todayIso();
    const [dateIso, setDateIso] = useState<string>(initialDate);

    useEffect(() => {
        const current = searchParams.get("date");
        if (current === dateIso) return;
        const next = new URLSearchParams(searchParams.toString());
        next.set("date", dateIso);
        router.replace(`/motorsport?${next.toString()}`, { scroll: false });
    }, [dateIso, router, searchParams]);

    const season = currentMotorsportSeason(new Date(dateIso + "T00:00:00"));

    const leagueIds = TOP_LEAGUES.map(l => l.id);
    const seasonQueries = useLeagueSeasons(leagueIds, season);
    const leagueQueries = useLeagueLookups(leagueIds);
    useLiveScores("motorsport");

    const anyLoading = seasonQueries.some(q => q.isLoading);

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
                const m = eventToScheduleMatch(ev);
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

    const leagueParam = searchParams.get("league");
    useEffect(() => {
        if (!leagueParam) return;
        const idx = TOP_LEAGUES.findIndex(l => l.id === leagueParam);
        if (idx < 0) return;
        const events: SDBEvent[] =
            seasonQueries[idx].data?.schedule ?? seasonQueries[idx].data?.events ?? [];
        if (events.length === 0) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        onPickCompetitionAction(leagueParam);
    }, [leagueParam, seasonQueries]);

    const carouselItems = useMemo(() => {
        const today = todayIso();
        const badgeByLeague = new Map<string, string>();
        leagueQueries.forEach((q, i) => {
            const b = q.data?.lookup?.[0]?.strBadge;
            if (b) badgeByLeague.set(leagueIds[i], b);
        });
        const all: SDBEvent[] = seasonQueries.flatMap(
            q => q.data?.schedule ?? q.data?.events ?? []
        );
        const upcoming = all
            .filter(ev => ev.dateEvent && ev.dateEvent >= today)
            .filter(ev => !!(ev.strPoster ?? ev.strThumb))
            .sort((a, b) => (a.strTimestamp ?? "").localeCompare(b.strTimestamp ?? ""))
            .slice(0, 5);
        return upcoming.map(ev => ({
            id: ev.idEvent ?? "",
            league: ev.strLeague ?? "",
            leagueBadge: (ev.idLeague ? badgeByLeague.get(ev.idLeague) : undefined) ?? ev.strLeagueBadge ?? undefined,
            posterUrl: ev.strPoster ?? ev.strThumb ?? undefined,
            raceName: ev.strEvent ?? undefined,
        }));
    }, [seasonQueries, leagueQueries, leagueIds]);

    return (
        <SportContainer>
            <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-start justify-start">
                <div className="flex flex-col gap-2 w-full lg:w-auto">
                    {anyLoading && (
                        <div className="w-full lg:w-[560px] text-center text-gray-500 text-sm py-2">
                            Завантаження перегонів ({season})...
                        </div>
                    )}
                    <ScheduleColumn
                        groups={groups}
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

                <div className="flex-1 min-w-0">
                    {anyLoading ? (
                        <div className="text-center text-gray-500 text-sm py-10 bg-white rounded-[20px]">
                            Завантаження анонсів...
                        </div>
                    ) : carouselItems.length > 0 ? (
                        <MotorsportCarousel items={carouselItems} />
                    ) : (
                        <div className="text-center text-gray-500 text-sm py-10 bg-white rounded-[20px]">
                            Немає найближчих перегонів
                        </div>
                    )}
                </div>

                <div className="hidden lg:block w-[220px] h-[500px] bg-white rounded-[20px] border border-gray-200 shadow-sm shrink-0" />
            </div>
        </SportContainer>
    );
}
