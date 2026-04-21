import type { SDBLiveScore, SDBEvent, SDBLineupPlayer, SDBEventStat } from "./types";
import type { ScheduleMatch } from "@/app/_components/_football/ScheduleColumn";
import type { CarouselMatch } from "@/app/_components/_football/MatchCarousel";
import type { FeaturedMatchData } from "@/app/_components/_football/FeaturedMatch";
import type { FormationTeam, PitchPlayer } from "@/app/_components/_football/FormationPitch";
import type { StatRow } from "@/app/_components/_football/StatsTable";

// TheSportsDB `strTimestamp` is UTC without timezone suffix (e.g. "2025-08-15T19:00:00").
// Append "Z" so the browser parses it as UTC, then format in the user's local timezone.
export function parseSdbUtc(strTimestamp?: string): Date | null {
    if (!strTimestamp) return null;
    const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(strTimestamp) ? strTimestamp : `${strTimestamp}Z`;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
}

function hmFromTimestamp(strTimestamp?: string, dateEvent?: string, strTime?: string): string {
    const d = parseSdbUtc(strTimestamp);
    if (d) {
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    }
    // Fallback: strTime is UTC HH:mm:ss — still not timezone-aware, but better than nothing.
    if (strTime && /\d{2}:\d{2}/.test(strTime)) return strTime.slice(0, 5);
    if (dateEvent) return "--:--";
    return "--:--";
}

// Local-date (YYYY-MM-DD) that the match kickoff falls on, in the user's TZ.
export function localDateIsoOf(ev: { strTimestamp?: string; dateEvent?: string }): string | undefined {
    const d = parseSdbUtc(ev.strTimestamp);
    if (d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }
    return ev.dateEvent ?? undefined;
}

function toInt(s?: string | null): number {
    const n = Number(s ?? 0);
    return Number.isFinite(n) ? n : 0;
}

function statusBucket(
    progress?: string,
    status?: string,
    startIso?: string
): "live" | "past" | "upcoming" {
    const s = (status ?? "").toLowerCase();
    if (s.includes("finish") || s.includes("ft") || s.includes("aet") || s.includes("pen")) {
        return "past";
    }
    if (progress && progress !== "0") return "live";

    // TheSportsDB sometimes returns null/empty strStatus for completed matches.
    // Fall back to the kickoff timestamp: anything that started more than ~3h
    // ago is definitely "past", anything within the live window is "live".
    const t = parseSdbUtc(startIso)?.getTime();
    if (t != null) {
        const now = Date.now();
        const diffMin = (now - t) / 60_000;
        if (diffMin > 180) return "past";
        if (diffMin > -5) return "live"; // started recently / about to start
    }
    return "upcoming";
}

// ----- Livescore → schedule row -----
export function liveToScheduleRow(ls: SDBLiveScore): ScheduleMatch {
    const status = statusBucket(ls.strProgress, ls.strStatus);
    const showScore = status !== "upcoming";
    return {
        id: ls.idEvent ?? ls.idLiveScore ?? crypto.randomUUID(),
        time: ls.strEventTime?.slice(0, 5) ?? "--:--",
        homeTeam: ls.strHomeTeam ?? "?",
        awayTeam: ls.strAwayTeam ?? "?",
        homeLogo: ls.strHomeTeamBadge ?? undefined,
        awayLogo: ls.strAwayTeamBadge ?? undefined,
        homeScore: showScore ? toInt(ls.intHomeScore) : undefined,
        awayScore: showScore ? toInt(ls.intAwayScore) : undefined,
        status,
    };
}

// ----- Event → schedule row -----
export function eventToScheduleRow(ev: SDBEvent): ScheduleMatch {
    const status = statusBucket(undefined, ev.strStatus ?? undefined, ev.strTimestamp);
    // Scores are meaningless for not-yet-played matches — TheSportsDB sometimes
    // still returns "0"/"0" for those, which looked like a 0–0 draw on screen.
    const showScore = status !== "upcoming";
    return {
        id: ev.idEvent ?? crypto.randomUUID(),
        time: hmFromTimestamp(ev.strTimestamp, ev.dateEvent, ev.strTime),
        startIso: ev.strTimestamp ?? undefined,
        homeTeam: ev.strHomeTeam ?? "?",
        awayTeam: ev.strAwayTeam ?? "?",
        homeLogo: ev.strHomeTeamBadge ?? undefined,
        awayLogo: ev.strAwayTeamBadge ?? undefined,
        homeScore: showScore && ev.intHomeScore != null ? toInt(ev.intHomeScore) : undefined,
        awayScore: showScore && ev.intAwayScore != null ? toInt(ev.intAwayScore) : undefined,
        status,
    };
}

// ----- Event → carousel slide -----
export function eventToCarousel(ev: SDBEvent): CarouselMatch {
    const iso = ev.strTimestamp ?? `${ev.dateEvent ?? ""}T${ev.strTime ?? "00:00:00"}`;
    return {
        id: ev.idEvent ?? crypto.randomUUID(),
        league: ev.strLeague ?? "",
        kickoff: iso,
        home: { name: ev.strHomeTeam ?? "?", logoUrl: ev.strHomeTeamBadge ?? undefined },
        away: { name: ev.strAwayTeam ?? "?", logoUrl: ev.strAwayTeamBadge ?? undefined },
    };
}

// ----- Event → featured-match header -----
export function eventToFeatured(ev: SDBEvent): FeaturedMatchData {
    const iso = ev.strTimestamp ?? `${ev.dateEvent ?? ""}T${ev.strTime ?? "00:00:00"}`;
    const status = statusBucket(undefined, ev.strStatus ?? undefined, ev.strTimestamp);
    const featuredStatus: FeaturedMatchData["status"] =
        status === "past" ? "finished" : status === "upcoming" ? "scheduled" : "live";
    return {
        tournament: ev.strLeague ?? "",
        stage: "Футбол",
        kickoff: iso,
        status: featuredStatus,
        venue: ev.strVenue ?? undefined,
        home: {
            name: ev.strHomeTeam ?? "?",
            logoUrl: ev.strHomeTeamBadge ?? undefined,
            score: ev.intHomeScore != null ? toInt(ev.intHomeScore) : undefined,
        },
        away: {
            name: ev.strAwayTeam ?? "?",
            logoUrl: ev.strAwayTeamBadge ?? undefined,
            score: ev.intAwayScore != null ? toInt(ev.intAwayScore) : undefined,
        },
    };
}

const POS_UA: Record<string, string> = {
    goalkeeper: "Голкіпер",
    defender: "Захисник",
    midfielder: "Півзах.",
    forward: "Нападник",
    attacker: "Нападник",
};

// TheSportsDB v2 reports specific positions ("Left-Back", "Defensive Midfield",
// "Right Winger", "Centre-Forward"…). Bucket them into the 4 pitch lines.
type PitchLine = "goalkeeper" | "defender" | "midfielder" | "forward";

function bucketPosition(strPosition: string | undefined): PitchLine | null {
    const raw = (strPosition ?? "").trim().toLowerCase();
    if (!raw) return null;

    // Abbreviations (common in APIs): GK / CB / LB / RB / LWB / RWB / CDM / CM / CAM / RM / LM / RW / LW / CF / ST
    const abbr: Record<string, PitchLine> = {
        gk: "goalkeeper",
        cb: "defender", lb: "defender", rb: "defender", lwb: "defender", rwb: "defender", sw: "defender",
        cdm: "midfielder", dm: "midfielder", cm: "midfielder", cam: "midfielder", am: "midfielder",
        rm: "midfielder", lm: "midfielder",
        rw: "forward", lw: "forward", cf: "forward", st: "forward",
    };
    if (raw in abbr) return abbr[raw];

    // Word-based matching — ORDER MATTERS.
    // "wing-back" contains "wing" but is a defender, so check back-variants first.
    if (raw.includes("goalkeeper") || raw.includes("keeper")) return "goalkeeper";
    if (
        raw.includes("back") ||          // centre-back, wing-back, full-back, left-back
        raw.includes("defender") ||
        raw.includes("defence") ||
        raw.includes("defense") ||
        raw.includes("sweeper")
    ) {
        return "defender";
    }
    if (raw.includes("midfield")) return "midfielder";
    if (
        raw.includes("wing") ||          // "Left Wing", "Right Winger"
        raw.includes("forward") ||
        raw.includes("striker") ||
        raw.includes("attacker") ||
        raw.includes("attack")
    ) {
        return "forward";
    }
    return null;
}

function lineupPlayerToPitch(p: SDBLineupPlayer): PitchPlayer {
    const num = p.intSquadNumber ? Number(p.intSquadNumber) : NaN;
    const bucket = bucketPosition(p.strPosition);
    return {
        id: p.idPlayer ?? p.idLineup ?? crypto.randomUUID(),
        name: p.strPlayer ?? "?",
        photoUrl: p.strCutout ?? p.strPlayerThumb ?? undefined,
        role: (bucket && POS_UA[bucket]) ?? p.strPosition ?? "",
        number: Number.isFinite(num) ? num : undefined,
    };
}

export function lineupsToFormation(
    lineup: SDBLineupPlayer[] | null | undefined,
    homeLabel: string,
    awayLabel: string
): { top: FormationTeam; bottom: FormationTeam } | null {
    if (!lineup || lineup.length === 0) return null;

    // v1 uses "1"/"0", v2 uses "Yes"/"No". Normalise to booleans.
    const isHome = (p: SDBLineupPlayer) =>
        p.strHome === "1" || p.strHome?.toLowerCase() === "yes";
    const isSub = (p: SDBLineupPlayer) =>
        p.strSubstitute === "1" || p.strSubstitute?.toLowerCase() === "yes";

    const starters = lineup.filter(p => !isSub(p));

    const pick = (home: boolean, line: PitchLine): SDBLineupPlayer[] =>
        starters.filter(p => isHome(p) === home && bucketPosition(p.strPosition) === line);

    const toPlayer = lineupPlayerToPitch;

    const build = (home: boolean, label: string): FormationTeam => {
        const gks = pick(home, "goalkeeper");
        const defs = pick(home, "defender");
        const mids = pick(home, "midfielder");
        const atts = pick(home, "forward");
        const gk: PitchPlayer = gks.length
            ? toPlayer(gks[0])
            : { id: `${label}-gk`, name: "?", role: "Голкіпер" };
        return {
            label,
            coachName: undefined,
            goalkeeper: gk,
            defense: defs.map(toPlayer),
            midfield: mids.map(toPlayer),
            attack: atts.map(toPlayer),
        };
    };

    return { top: build(true, homeLabel), bottom: build(false, awayLabel) };
}

// ----- Predicted line-up from each team's PREVIOUS match lineup -----
// For each team we receive that team's last match's full lineup (both sides),
// filter it down to the players who belong to the team we care about, then
// bucket them by position.
export function predictedFormationFromPrevLineups(
    homePrevLineup: SDBLineupPlayer[] | null | undefined,
    awayPrevLineup: SDBLineupPlayer[] | null | undefined,
    homeTeamId: string | undefined,
    awayTeamId: string | undefined,
    homeLabel: string,
    awayLabel: string
): { top: FormationTeam; bottom: FormationTeam } | null {
    const isSub = (p: SDBLineupPlayer) =>
        p.strSubstitute === "1" || p.strSubstitute?.toLowerCase() === "yes";

    const buildSide = (
        lineup: SDBLineupPlayer[] | null | undefined,
        teamId: string | undefined,
        label: string
    ): FormationTeam | null => {
        if (!lineup || lineup.length === 0 || !teamId) return null;
        const own = lineup.filter(p => p.idTeam === teamId && !isSub(p));
        if (own.length === 0) return null;
        const pick = (line: PitchLine) =>
            own.filter(p => bucketPosition(p.strPosition) === line);
        const gks = pick("goalkeeper");
        const defs = pick("defender");
        const mids = pick("midfielder");
        const atts = pick("forward");
        const gk: PitchPlayer = gks.length
            ? lineupPlayerToPitch(gks[0])
            : { id: `${label}-gk`, name: "?", role: "Голкіпер" };
        return {
            label,
            coachName: undefined,
            goalkeeper: gk,
            defense: defs.map(lineupPlayerToPitch),
            midfield: mids.map(lineupPlayerToPitch),
            attack: atts.map(lineupPlayerToPitch),
        };
    };

    const top = buildSide(homePrevLineup, homeTeamId, homeLabel);
    const bottom = buildSide(awayPrevLineup, awayTeamId, awayLabel);
    if (!top && !bottom) return null;
    const empty = (label: string): FormationTeam => ({
        label,
        goalkeeper: { id: `${label}-gk`, name: "?", role: "Голкіпер" },
        defense: [],
        midfield: [],
        attack: [],
    });
    return { top: top ?? empty(homeLabel), bottom: bottom ?? empty(awayLabel) };
}

const STAT_UA: Record<string, string> = {
    "Shots on Goal": "Удари по воротам",
    "Goals": "Голи",
    "Saves": "Відбиті воротарем",
    "Fouls": "Фоли",
    "Passes": "Паси",
    "Tackles": "Відбір м'яча",
    "Free Kicks": "Вільні удари",
    "Yellow Cards": "Жовті картки",
    "Red Cards": "Червоні картки",
    "Corners": "Кутові",
    "Ball Possession %": "Володіння м'ячем %",
};

export function statsToRows(stats: SDBEventStat[] | null | undefined): StatRow[] {
    if (!stats || stats.length === 0) return [];
    return stats.map(s => ({
        label: STAT_UA[s.strStat ?? ""] ?? s.strStat ?? "",
        home: toInt(s.intHome),
        away: toInt(s.intAway),
    }));
}
