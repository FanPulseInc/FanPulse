import type {
    SDBLiveScore,
    SDBEvent,
    SDBLineupPlayer,
    SDBEventStat,
    SDBTimelineEvent,
} from "./types";
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

// Normalise a live progress/status string into a short label.
// TheSportsDB mixes exact minutes ("67") with phase codes ("1H", "HT", "FT").
// Returns undefined only for not-started — finished matches return "FT".
export function formatElapsed(progress?: string, status?: string): string | undefined {
    const p = (progress ?? "").trim();
    const s = (status ?? "").trim();
    const pick = p || s;
    if (!pick) return undefined;
    const low = pick.toLowerCase();
    if (low === "0" || low === "ns" || low === "not started") return undefined;
    // Finished phases — collapse into a single "FT" badge.
    if (low === "ft" || low.includes("finish") || low === "aet" || low === "pen") return "FT";
    // Phase codes — the API knows the game is in progress but hasn't sent a minute.
    if (low === "ht" || low.includes("half time") || low.includes("half-time")) return "HT";
    if (low === "1h" || low === "1st" || low.includes("first half")) return "1H";
    if (low === "2h" || low === "2nd" || low.includes("second half")) return "2H";
    if (low === "et" || low.includes("extra")) return "ET";
    if (low === "pk" || low.includes("penalt")) return "PK";
    // Pure numeric → append apostrophe minute marker ("67" → "67'").
    if (/^\d{1,3}$/.test(pick)) return `${pick}'`;
    // Already formatted with apostrophe / "45+2" / etc.
    return pick;
}

// ----- Livescore → schedule row -----
// Returns a Partial so callers can spread it over a base row (from eventToScheduleRow)
// without clobbering the locally-formatted `time`. TheSportsDB livescore's `strEventTime`
// is UTC-only HH:mm:ss, which is NOT what the user should see — keep the base's local time.
export function liveToScheduleRow(ls: SDBLiveScore): Partial<ScheduleMatch> {
    const status = statusBucket(ls.strProgress, ls.strStatus);
    const showScore = status !== "upcoming";
    return {
        id: ls.idEvent ?? ls.idLiveScore ?? crypto.randomUUID(),
        homeTeam: ls.strHomeTeam ?? "?",
        awayTeam: ls.strAwayTeam ?? "?",
        homeLogo: ls.strHomeTeamBadge ?? undefined,
        awayLogo: ls.strAwayTeamBadge ?? undefined,
        homeScore: showScore ? toInt(ls.intHomeScore) : undefined,
        awayScore: showScore ? toInt(ls.intAwayScore) : undefined,
        status,
        elapsed:
            status === "live"
                ? formatElapsed(ls.strProgress, ls.strStatus)
                : status === "past"
                    ? "FT"
                    : undefined,
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
        elapsed:
            status === "live"
                ? formatElapsed(undefined, ev.strStatus ?? undefined)
                : status === "past"
                    ? "FT"
                    : undefined,
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
        elapsed:
            status === "live"
                ? formatElapsed(undefined, ev.strStatus ?? undefined)
                : status === "past"
                    ? "FT"
                    : undefined,
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

// Translate TheSportsDB's verbose position strings into compact pitch-style
// abbreviations (GK / LB / CB / RB / CDM / CM / CAM / LW / RW / CF / ST …).
function positionAbbr(strPosition: string | undefined): string {
    const r = (strPosition ?? "").trim().toLowerCase();
    if (!r) return "";
    // Already an abbreviation from the API.
    const up = r.toUpperCase();
    if (/^(GK|LB|RB|CB|LWB|RWB|SW|CDM|DM|CM|CAM|AM|RM|LM|RW|LW|CF|ST)$/.test(up)) return up;

    if (r.includes("goalkeeper") || r.includes("keeper")) return "GK";

    // Defenders — order matters, "wing-back" must beat plain "back".
    if (r.includes("wing-back") || r.includes("wing back")) {
        if (r.includes("left")) return "LWB";
        if (r.includes("right")) return "RWB";
        return "WB";
    }
    if (r.includes("sweeper")) return "SW";
    if (r.includes("left") && r.includes("back")) return "LB";
    if (r.includes("right") && r.includes("back")) return "RB";
    if (r.includes("back") || r.includes("centre-back") || r.includes("center back")) return "CB";

    // Midfielders.
    if (r.includes("defensive") && r.includes("midfield")) return "CDM";
    if (r.includes("attacking") && r.includes("midfield")) return "CAM";
    if (r.includes("left") && r.includes("midfield")) return "LM";
    if (r.includes("right") && r.includes("midfield")) return "RM";
    if (r.includes("midfield")) return "CM";

    // Forwards / wingers.
    if (r.includes("left") && (r.includes("wing") || r.includes("forward"))) return "LW";
    if (r.includes("right") && (r.includes("wing") || r.includes("forward"))) return "RW";
    if (r.includes("striker") || r.includes("centre-forward") || r.includes("center forward")) return "ST";
    if (r.includes("forward") || r.includes("attacker") || r.includes("attack")) return "CF";

    return up.slice(0, 3);
}

// Which side of the pitch the player sits on — used to sort within a line
// so a Left-Back renders left of the Centre-Backs, Right-Back on the far right, etc.
function positionSide(strPosition: string | undefined): "L" | "C" | "R" {
    const r = (strPosition ?? "").trim().toLowerCase();
    if (!r) return "C";
    if (r.includes("left") || r.startsWith("l")) return "L";
    if (r.includes("right") || r.startsWith("r")) return "R";
    return "C";
}

const SIDE_ORDER: Record<"L" | "C" | "R", number> = { L: 0, C: 1, R: 2 };

function sortBySide<T extends { strPosition?: string }>(players: T[]): T[] {
    return [...players].sort(
        (a, b) => SIDE_ORDER[positionSide(a.strPosition)] - SIDE_ORDER[positionSide(b.strPosition)]
    );
}

// Attacking-tendency score — higher = more attacking. Used by `reshapeByFormation`
// to redistribute outfielders when TheSportsDB's nominal `strPosition` doesn't match
// where the player actually lined up (e.g. a nominal "CM" deputising at LB).
function attackScore(strPosition: string | undefined): number {
    const abbr = positionAbbr(strPosition);
    const m: Record<string, number> = {
        GK: 0,
        CB: 1, LB: 1, RB: 1, SW: 1,
        LWB: 1.5, RWB: 1.5,
        CDM: 2, DM: 2,
        CM: 3, LM: 3, RM: 3,
        CAM: 3.5, AM: 3.5,
        LW: 4, RW: 4,
        CF: 5, ST: 5,
    };
    return m[abbr] ?? 2.5;
}

// Parse a formation string like "4-3-3" / "4-2-3-1" into [defenders, midfielders, attackers].
// Returns null if unparseable. Formations with 4 parts (back-4 + holding pair + AM trio + ST)
// collapse the two midfield rows into one count — we then re-split visually with splitMidfield.
function parseFormationShape(formation: string | undefined): [number, number, number] | null {
    if (!formation) return null;
    const parts = formation.split("-").map(s => Number(s.trim()));
    if (parts.some(n => !Number.isFinite(n) || n <= 0)) return null;
    if (parts.length < 2 || parts.length > 5) return null;
    const def = parts[0];
    const att = parts[parts.length - 1];
    const mid = parts.slice(1, -1).reduce((a, b) => a + b, 0);
    const total = def + mid + att;
    if (total !== 10) return null; // 10 outfielders — GK is separate
    return [def, mid, att];
}

// Re-bucket outfielders so the defender/midfielder/attacker counts honour the
// declared formation. When nominal positions and actual ones disagree we sort
// everyone by attacking-tendency score and slice them into the formation's shape.
// No-op if the formation string is missing / unparseable / already consistent.
function reshapeByFormation(
    defs: SDBLineupPlayer[],
    mids: SDBLineupPlayer[],
    atts: SDBLineupPlayer[],
    formation: string | undefined
): { defs: SDBLineupPlayer[]; mids: SDBLineupPlayer[]; atts: SDBLineupPlayer[] } {
    const shape = parseFormationShape(formation);
    if (!shape) return { defs, mids, atts };
    const [dCount, mCount, aCount] = shape;
    if (defs.length === dCount && mids.length === mCount && atts.length === aCount) {
        return { defs, mids, atts };
    }
    const all = [...defs, ...mids, ...atts];
    if (all.length !== dCount + mCount + aCount) return { defs, mids, atts };
    const sorted = [...all].sort((a, b) => attackScore(a.strPosition) - attackScore(b.strPosition));
    return {
        defs: sorted.slice(0, dCount),
        mids: sorted.slice(dCount, dCount + mCount),
        atts: sorted.slice(dCount + mCount),
    };
}

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
    return {
        id: p.idPlayer ?? p.idLineup ?? crypto.randomUUID(),
        name: p.strPlayer ?? "?",
        photoUrl: p.strCutout ?? p.strPlayerThumb ?? undefined,
        role: positionAbbr(p.strPosition),
        side: positionSide(p.strPosition),
        number: Number.isFinite(num) ? num : undefined,
    };
}

export function lineupsToFormation(
    lineup: SDBLineupPlayer[] | null | undefined,
    homeLabel: string,
    awayLabel: string,
    homeLogo?: string,
    awayLogo?: string
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

    // Team-level formation — TheSportsDB repeats the same string on every lineup
    // row for that team (e.g. "4-3-3"). Grab the first non-empty value.
    const teamFormation = (home: boolean): string | undefined => {
        const hit = lineup.find(p => isHome(p) === home && p.strFormation);
        const f = hit?.strFormation?.trim();
        return f && /^\d(-\d)+$/.test(f) ? f : undefined;
    };

    const build = (home: boolean, label: string, logoUrl?: string): FormationTeam => {
        const gks = pick(home, "goalkeeper");
        const formation = teamFormation(home);
        // Reshape BEFORE sorting by side, so side-sort applies to the final lines.
        const reshaped = reshapeByFormation(
            pick(home, "defender"),
            pick(home, "midfielder"),
            pick(home, "forward"),
            formation,
        );
        const defs = sortBySide(reshaped.defs);
        const mids = sortBySide(reshaped.mids);
        const atts = sortBySide(reshaped.atts);
        const gk: PitchPlayer = gks.length
            ? toPlayer(gks[0])
            : { id: `${label}-gk`, name: "?", role: "GK" };
        return {
            label,
            logoUrl,
            coachName: undefined,
            formation,
            goalkeeper: gk,
            defense: defs.map(toPlayer),
            midfield: mids.map(toPlayer),
            attack: atts.map(toPlayer),
        };
    };

    return {
        top: build(true, homeLabel, homeLogo),
        bottom: build(false, awayLabel, awayLogo),
    };
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
    awayLabel: string,
    homeLogo?: string,
    awayLogo?: string
): { top: FormationTeam; bottom: FormationTeam } | null {
    const isSub = (p: SDBLineupPlayer) =>
        p.strSubstitute === "1" || p.strSubstitute?.toLowerCase() === "yes";

    const buildSide = (
        lineup: SDBLineupPlayer[] | null | undefined,
        teamId: string | undefined,
        label: string,
        logoUrl?: string
    ): FormationTeam | null => {
        if (!lineup || lineup.length === 0 || !teamId) return null;
        const own = lineup.filter(p => p.idTeam === teamId && !isSub(p));
        if (own.length === 0) return null;
        const pick = (line: PitchLine) =>
            own.filter(p => bucketPosition(p.strPosition) === line);
        const gks = pick("goalkeeper");
        const formationStr = own.find(p => p.strFormation)?.strFormation?.trim();
        const formation = formationStr && /^\d(-\d)+$/.test(formationStr) ? formationStr : undefined;
        const reshaped = reshapeByFormation(
            pick("defender"),
            pick("midfielder"),
            pick("forward"),
            formation,
        );
        const defs = sortBySide(reshaped.defs);
        const mids = sortBySide(reshaped.mids);
        const atts = sortBySide(reshaped.atts);
        const gk: PitchPlayer = gks.length
            ? lineupPlayerToPitch(gks[0])
            : { id: `${label}-gk`, name: "?", role: "GK" };
        return {
            label,
            logoUrl,
            coachName: undefined,
            formation,
            goalkeeper: gk,
            defense: defs.map(lineupPlayerToPitch),
            midfield: mids.map(lineupPlayerToPitch),
            attack: atts.map(lineupPlayerToPitch),
        };
    };

    const top = buildSide(homePrevLineup, homeTeamId, homeLabel, homeLogo);
    const bottom = buildSide(awayPrevLineup, awayTeamId, awayLabel, awayLogo);
    if (!top && !bottom) return null;
    const empty = (label: string, logoUrl?: string): FormationTeam => ({
        label,
        logoUrl,
        goalkeeper: { id: `${label}-gk`, name: "?", role: "GK" },
        defense: [],
        midfield: [],
        attack: [],
    });
    return {
        top: top ?? empty(homeLabel, homeLogo),
        bottom: bottom ?? empty(awayLabel, awayLogo),
    };
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

// ----- Timeline → match scorers -----
export interface Scorer {
    id: string;
    name: string;
    minute: string; // "56'", "90+2'", or "" if the API didn't send a time
    ownGoal?: boolean;
    penalty?: boolean;
}

// Keep only goal events and split them by side. Disallowed/VAR-cancelled goals
// are filtered out. Own goals stay with the scorer's own side but are flagged —
// the UI should tag them "(OG)" so a viewer doesn't think the striker of the
// winning team put one past their own keeper.
export function timelineToScorers(
    timeline: SDBTimelineEvent[] | null | undefined
): { home: Scorer[]; away: Scorer[] } {
    if (!timeline || timeline.length === 0) return { home: [], away: [] };

    const isHome = (t: SDBTimelineEvent) =>
        t.strHome === "1" || t.strHome?.toLowerCase() === "yes";

    const isGoal = (t: SDBTimelineEvent) => {
        const kind = (t.strTimeline ?? "").toLowerCase();
        const detail = (t.strTimelineDetail ?? "").toLowerCase();
        if (!kind.includes("goal") && !detail.includes("goal")) return false;
        if (kind.includes("disallow") || detail.includes("disallow")) return false;
        if (kind.includes("cancel") || detail.includes("cancel")) return false;
        return true;
    };

    const toScorer = (t: SDBTimelineEvent, idx: number): Scorer => {
        const raw = (t.intTime ?? "").trim();
        const detail = `${t.strTimeline ?? ""} ${t.strTimelineDetail ?? ""}`.toLowerCase();
        return {
            id: t.idTimeline ?? `${t.idEvent ?? "x"}-${idx}`,
            name: t.strPlayer ?? "?",
            minute: raw ? `${raw}'` : "",
            ownGoal: detail.includes("own goal") || detail.includes("own-goal"),
            penalty: detail.includes("penalty") || detail.includes("pen."),
        };
    };

    const byMinute = (a: SDBTimelineEvent, b: SDBTimelineEvent) => {
        // "90+2" sorts after "90" — strip the added time for primary compare,
        // then use it as a tiebreaker.
        const [aBase, aAdd] = (a.intTime ?? "0").split("+").map(n => Number(n) || 0);
        const [bBase, bAdd] = (b.intTime ?? "0").split("+").map(n => Number(n) || 0);
        return aBase - bBase || aAdd - bAdd;
    };

    const goals = [...timeline].filter(isGoal).sort(byMinute);
    return {
        home: goals.filter(isHome).map(toScorer),
        away: goals.filter(t => !isHome(t)).map(toScorer),
    };
}

export function statsToRows(stats: SDBEventStat[] | null | undefined): StatRow[] {
    if (!stats || stats.length === 0) return [];
    return stats.map(s => ({
        label: STAT_UA[s.strStat ?? ""] ?? s.strStat ?? "",
        home: toInt(s.intHome),
        away: toInt(s.intAway),
    }));
}
