import type {
    SDBLiveScore,
    SDBEvent,
    SDBLineupPlayer,
    SDBEventStat,
    SDBTimelineEvent,
} from "./types";
import type { ScheduleMatch } from "@/app/_components/_shared/ScheduleColumn";
import type { CarouselMatch } from "@/app/_components/_shared/MatchCarousel";
import type { FeaturedMatchData } from "@/app/_components/_shared/FeaturedMatch";
import type { FormationTeam, PitchPlayer } from "@/app/_components/_football/FormationPitch";
import type { StatRow } from "@/app/_components/_shared/StatsTable";

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

export function parseQuartersFromResult(
    strResult: string | null | undefined
): { home: number[]; away: number[] } | undefined {
    if (!strResult) return undefined;
    const cleaned = strResult
        .replace(/<br\s*\/?>/gi, " \n ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ");
    const matches: number[][] = [];
    const re = /Quarters\s*:\s*([0-9 \t\r\n]+?)(?=(?:[A-Za-z].*?Quarters\s*:)|$)/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(cleaned)) !== null) {
        const nums = m[1]
            .split(/\s+/)
            .map(s => s.trim())
            .filter(Boolean)
            .map(s => Number(s))
            .filter(n => Number.isFinite(n));
        if (nums.length >= 4 && nums.length <= 6) matches.push(nums);
        if (matches.length === 2) break;
    }
    if (matches.length !== 2) return undefined;
    const [home, away] = matches;
    if (home.length !== away.length) return undefined;
    return { home, away };
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
    if (!p && !s) return undefined;

    // Priority:
    //   1. TERMINAL phases (HT, FT, AET, PEN, ET, PK) — these override any
    //      numeric minute. At half-time TheSportsDB sends progress="45" AND
    //      status="HT"; without this, "HT" would lose to "45'" and the badge
    //      would freeze on 45 for the whole break.
    //   2. Numeric minute from `progress` — the common case during play.
    //      Prefer this over "1H"/"2H" phase codes, which are only useful when
    //      we don't have an actual minute.
    //   3. "1H"/"2H" half marker — fallback when no minute is available.
    //   4. Whatever string the feed sent, verbatim.
    const sLow = s.toLowerCase();
    const pLow = p.toLowerCase();
    const isNotStarted = (low: string) => low === "0" || low === "ns" || low === "not started";
    if (isNotStarted(sLow) && isNotStarted(pLow)) return undefined;
    if (!p && isNotStarted(sLow)) return undefined;

    const terminal = (low: string): string | undefined => {
        if (!low) return undefined;
        if (low === "ft" || low.includes("finish") || low === "aet" || low === "pen") return "FT";
        if (low === "ht" || low.includes("half time") || low.includes("half-time")) return "HT";
        if (low === "et" || low.includes("extra")) return "ET";
        if (low === "pk" || low.includes("penalt")) return "PK";
        return undefined;
    };
    // 1. Terminal phases (checked on status first, then progress).
    const term = terminal(sLow) ?? terminal(pLow);
    if (term) return term;

    // 1b. Basketball quarter — check BEFORE the numeric-minute path, because
    // basketball feeds often send strProgress="10" (a count) alongside
    // strStatus="Q1", and a bare "10'" would be misread as a soccer minute.
    const quarter = (low: string): string | undefined => {
        if (!low) return undefined;
        if (/^q[1-4]$/.test(low)) return low.toUpperCase();
        if (/^[1-4]q$/.test(low)) return `Q${low[0]}`;
        if (/^ot[0-9]?$/.test(low)) return low.toUpperCase();
        return undefined;
    };
    const qEarly = quarter(sLow) ?? quarter(pLow);
    if (qEarly) {
        let clockEarly: string | undefined;
        if (/^\d{1,2}:\d{2}$/.test(p)) {
            clockEarly = p;
        } else if (/^\d{1,2}$/.test(p)) {
            const mins = Number(p);
            if (mins >= 0 && mins <= 12) {
                const remaining = 12 - mins;
                clockEarly = `${remaining}:00`;
            } else {
                clockEarly = `${p}'`;
            }
        } else if (p && p.toLowerCase() !== sLow) {
            clockEarly = p;
        }
        return clockEarly ? `${qEarly} ${clockEarly}` : qEarly;
    }

    // 1c. Tennis set/game progress.
    const tennisSet = (low: string): string | undefined => {
        if (!low) return undefined;
        let m = low.match(/^set\s*([1-5])$/);
        if (m) return `Set ${m[1]}`;
        m = low.match(/^s([1-5])$/);
        if (m) return `Set ${m[1]}`;
        m = low.match(/^([1-5])(?:st|nd|rd|th)?\s*set$/);
        if (m) return `Set ${m[1]}`;
        return undefined;
    };
    const tennisProgress = (raw: string): string | undefined => {
        if (/^\d+-\d+$/.test(raw)) return raw;
        return undefined;
    };
    const setMarker = tennisSet(sLow) ?? tennisSet(pLow);
    const gameSplit = tennisProgress(p) ?? tennisProgress(s);
    if (setMarker && gameSplit) return `${setMarker} · ${gameSplit}`;
    if (setMarker) return setMarker;
    if (gameSplit) return gameSplit;

    // 2. Numeric minute from progress.
    if (/^\d{1,3}$/.test(p)) return `${p}'`;
    // 2b. Already-formatted minute like "45+2" or "90+5" — pass through.
    if (/^\d{1,3}\+\d{1,2}'?$/.test(p) || /^\d{1,3}'$/.test(p)) return p.endsWith("'") ? p : `${p}'`;

    // 3. "1H"/"2H" half marker (only useful when we don't have a minute).
    const half = (low: string): string | undefined => {
        if (low === "1h" || low === "1st" || low.includes("first half")) return "1H";
        if (low === "2h" || low === "2nd" || low.includes("second half")) return "2H";
        return undefined;
    };
    const h = half(sLow) ?? half(pLow);
    if (h) return h;

    // 4. Fallback — return whatever the feed gave us.
    if (p) return p;
    return s || undefined;
}

export function parseTennisResult(
    strResult: string | null | undefined,
    homeName: string | undefined,
    awayName: string | undefined
): { homeSets: number; awaySets: number; homeBySet: number[]; awayBySet: number[] } | undefined {
    if (!strResult) return undefined;
    const lines = strResult.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 3) return undefined;

    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
    const homeKey = norm(homeName ?? "");
    const awayKey = norm(awayName ?? "");

    const playerLine = (line: string): { name: string; scores: number[] } | null => {
        const m = line.match(/^(.+?)\s*:\s*(.+)$/);
        if (!m) return null;
        const name = m[1].trim();
        const scores = m[2]
            .split(/\s+/)
            .map(s => Number(s))
            .filter(n => Number.isFinite(n));
        return { name, scores };
    };

    const parsedLines = lines.slice(1).map(playerLine).filter((x): x is { name: string; scores: number[] } => !!x);
    if (parsedLines.length < 2) return undefined;

    const findFor = (key: string) =>
        parsedLines.find(p => norm(p.name).includes(key) || key.includes(norm(p.name)));
    const homeRow = (homeKey && findFor(homeKey)) || parsedLines[0];
    const awayRow = (awayKey && findFor(awayKey)) || parsedLines[1];
    if (!homeRow || !awayRow) return undefined;

    const homeBySet = homeRow.scores;
    const awayBySet = awayRow.scores;
    const len = Math.min(homeBySet.length, awayBySet.length);
    let homeSets = 0;
    let awaySets = 0;
    for (let i = 0; i < len; i++) {
        if (homeBySet[i] > awayBySet[i]) homeSets++;
        else if (awayBySet[i] > homeBySet[i]) awaySets++;
    }
    return { homeSets, awaySets, homeBySet: homeBySet.slice(0, len), awayBySet: awayBySet.slice(0, len) };
}

const TENNIS_TOURNAMENT_TOKENS = new Set([
    "open", "international", "cup", "championship", "championships",
    "masters", "classic", "tour", "atp", "wta", "challenger",
    "trophy", "invitational", "series",
]);

export function extractTennisPlayers(
    strEvent: string | null | undefined,
    strLeague: string | null | undefined
): { home?: string; away?: string } {
    if (!strEvent) return {};
    const split = strEvent.split(/\s+vs\s+/i);
    if (split.length !== 2) return {};
    let before = split[0].trim();
    const after = split[1].trim();
    if (strLeague && before.toLowerCase().startsWith(strLeague.toLowerCase())) {
        before = before.slice(strLeague.length).trim();
    }
    const beforeWords = before.split(/\s+/).filter(Boolean);
    let homeStart = beforeWords.length;
    for (let i = beforeWords.length - 1; i >= 0; i--) {
        const lower = beforeWords[i].toLowerCase();
        if (TENNIS_TOURNAMENT_TOKENS.has(lower)) break;
        if (/^\d+$/.test(lower)) break;
        homeStart = i;
    }
    const home = beforeWords.slice(homeStart).join(" ") || undefined;
    const away = after || undefined;
    return { home, away };
}

// ----- Livescore → schedule row -----
// Returns a Partial so callers can spread it over a base row (from eventToScheduleRow)
// without clobbering the locally-formatted `time`. TheSportsDB livescore's `strEventTime`
// is UTC-only HH:mm:ss, which is NOT what the user should see — keep the base's local time.
export function liveToScheduleRow(ls: SDBLiveScore): Partial<ScheduleMatch> {
    const hasScores =
        ls.intHomeScore != null && ls.intHomeScore !== "" &&
        ls.intAwayScore != null && ls.intAwayScore !== "";
    const status = statusBucket(ls.strProgress, ls.strStatus);
    const showScore = status !== "upcoming" || hasScores;
    const out: Partial<ScheduleMatch> = {
        id: ls.idEvent ?? ls.idLiveScore ?? crypto.randomUUID(),
        homeTeam: ls.strHomeTeam ?? "?",
        awayTeam: ls.strAwayTeam ?? "?",
        homeTeamId: ls.idHomeTeam ?? undefined,
        awayTeamId: ls.idAwayTeam ?? undefined,
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
    return out;
}

// ----- Event → schedule row -----
export function eventToScheduleRow(ev: SDBEvent): ScheduleMatch {
    const hasFinalScore =
        ev.intHomeScore != null && ev.intHomeScore !== "" &&
        ev.intAwayScore != null && ev.intAwayScore !== "";
    let status = statusBucket(undefined, ev.strStatus ?? undefined, ev.strTimestamp);
    const fallback = (!ev.strHomeTeam || !ev.strAwayTeam)
        ? extractTennisPlayers(ev.strEvent, ev.strLeague)
        : {};
    const homeName = ev.strHomeTeam ?? fallback.home ?? "?";
    const awayName = ev.strAwayTeam ?? fallback.away ?? "?";
    const looksLikeTennis = !!ev.strResult && / beat /i.test(ev.strResult);
    const tennis = looksLikeTennis ? parseTennisResult(ev.strResult, homeName, awayName) : undefined;
    const hasTennisFinal = !!tennis;
    if ((hasFinalScore || hasTennisFinal) && status === "upcoming") status = "past";
    const showScore = status !== "upcoming" || hasFinalScore || hasTennisFinal;
    return {
        id: ev.idEvent ?? crypto.randomUUID(),
        time: hmFromTimestamp(ev.strTimestamp, ev.dateEvent, ev.strTime),
        startIso: ev.strTimestamp ?? undefined,
        homeTeam: homeName,
        awayTeam: awayName,
        homeTeamId: ev.idHomeTeam ?? undefined,
        awayTeamId: ev.idAwayTeam ?? undefined,
        homeLogo: ev.strHomeTeamBadge ?? undefined,
        awayLogo: ev.strAwayTeamBadge ?? undefined,
        homeScore: tennis ? tennis.homeSets : (showScore && ev.intHomeScore != null ? toInt(ev.intHomeScore) : undefined),
        awayScore: tennis ? tennis.awaySets : (showScore && ev.intAwayScore != null ? toInt(ev.intAwayScore) : undefined),
        quarters: tennis ? { home: tennis.homeBySet, away: tennis.awayBySet } : parseQuartersFromResult(ev.strResult),
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
    const fallback = (!ev.strHomeTeam || !ev.strAwayTeam)
        ? extractTennisPlayers(ev.strEvent, ev.strLeague)
        : {};
    return {
        id: ev.idEvent ?? crypto.randomUUID(),
        league: ev.strLeague ?? "",
        idLeague: ev.idLeague ?? undefined,
        kickoff: iso,
        home: { name: ev.strHomeTeam ?? fallback.home ?? "?", logoUrl: ev.strHomeTeamBadge ?? undefined },
        away: { name: ev.strAwayTeam ?? fallback.away ?? "?", logoUrl: ev.strAwayTeamBadge ?? undefined },
    };
}

// ----- Event → featured-match header -----
export function eventToFeatured(ev: SDBEvent): FeaturedMatchData {
    const iso = ev.strTimestamp ?? `${ev.dateEvent ?? ""}T${ev.strTime ?? "00:00:00"}`;
    const hasFinalScore =
        ev.intHomeScore != null && ev.intHomeScore !== "" &&
        ev.intAwayScore != null && ev.intAwayScore !== "";
    let status = statusBucket(undefined, ev.strStatus ?? undefined, ev.strTimestamp);
    if (hasFinalScore && status === "upcoming") status = "past";
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
        home: (() => {
            const players = extractTennisPlayers(ev.strEvent, ev.strLeague);
            const tennisRes = ev.strResult && / beat /i.test(ev.strResult)
                ? parseTennisResult(ev.strResult, ev.strHomeTeam ?? players.home, ev.strAwayTeam ?? players.away)
                : undefined;
            return {
                name: ev.strHomeTeam ?? players.home ?? "?",
                logoUrl: ev.strHomeTeamBadge ?? undefined,
                score: ev.intHomeScore != null ? toInt(ev.intHomeScore) : tennisRes?.homeSets,
            };
        })(),
        away: (() => {
            const players = extractTennisPlayers(ev.strEvent, ev.strLeague);
            const tennisRes = ev.strResult && / beat /i.test(ev.strResult)
                ? parseTennisResult(ev.strResult, ev.strHomeTeam ?? players.home, ev.strAwayTeam ?? players.away)
                : undefined;
            return {
                name: ev.strAwayTeam ?? players.away ?? "?",
                logoUrl: ev.strAwayTeamBadge ?? undefined,
                score: ev.intAwayScore != null ? toInt(ev.intAwayScore) : tennisRes?.awaySets,
            };
        })(),
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
    awayLogo?: string,
    homeCoach?: string,
    awayCoach?: string
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

    const build = (home: boolean, label: string, logoUrl?: string, coachName?: string): FormationTeam => {
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
            coachName,
            formation,
            goalkeeper: gk,
            defense: defs.map(toPlayer),
            midfield: mids.map(toPlayer),
            attack: atts.map(toPlayer),
        };
    };

    return {
        top: build(true, homeLabel, homeLogo, homeCoach),
        bottom: build(false, awayLabel, awayLogo, awayCoach),
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
    awayLogo?: string,
    homeCoach?: string,
    awayCoach?: string
): { top: FormationTeam; bottom: FormationTeam } | null {
    const isSub = (p: SDBLineupPlayer) =>
        p.strSubstitute === "1" || p.strSubstitute?.toLowerCase() === "yes";

    const buildSide = (
        lineup: SDBLineupPlayer[] | null | undefined,
        teamId: string | undefined,
        label: string,
        logoUrl?: string,
        coachName?: string
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
            coachName,
            formation,
            goalkeeper: gk,
            defense: defs.map(lineupPlayerToPitch),
            midfield: mids.map(lineupPlayerToPitch),
            attack: atts.map(lineupPlayerToPitch),
        };
    };

    const top = buildSide(homePrevLineup, homeTeamId, homeLabel, homeLogo, homeCoach);
    const bottom = buildSide(awayPrevLineup, awayTeamId, awayLabel, awayLogo, awayCoach);
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

// TheSportsDB labels are inconsistent across leagues/seasons — the same
// underlying stat can arrive as "Shots on Goal", "Shots on Target", or
// "ShotsOnGoal". We lowercase + strip non-alphanumerics to canonicalise,
// then map to the Ukrainian label.
const STAT_UA_MAP: Array<{ match: RegExp; ua: string }> = [
    { match: /^ballpossession/, ua: "Володіння м'ячем %" },
    { match: /^possession/, ua: "Володіння м'ячем %" },
    { match: /^expectedgoals|^xg$/, ua: "Очікувані голи (xG)" },
    { match: /^shotsongoal|^shotsontarget/, ua: "Удари у площину воріт" },
    { match: /^shotsoffgoal|^shotsofftarget/, ua: "Удари повз" },
    { match: /^totalshots|^shotstotal/, ua: "Всього ударів" },
    { match: /^blockedshots/, ua: "Заблоковані удари" },
    { match: /^goals$/, ua: "Голи" },
    { match: /^saves|^goalkeepersaves/, ua: "Відбиті воротарем" },
    { match: /^fouls/, ua: "Фоли" },
    { match: /^passes$/, ua: "Паси" },
    { match: /^passesaccurate|^accuratepasses/, ua: "Точні паси" },
    { match: /^passaccuracy/, ua: "Точність пасів %" },
    { match: /^tackles/, ua: "Відбір м'яча" },
    { match: /^freekicks/, ua: "Вільні удари" },
    { match: /^yellowcards/, ua: "Жовті картки" },
    { match: /^redcards/, ua: "Червоні картки" },
    { match: /^corners|^cornerkicks/, ua: "Кутові" },
    { match: /^offsides/, ua: "Офсайди" },
];

function statUa(raw: string | undefined): string {
    if (!raw) return "";
    const key = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const { match, ua } of STAT_UA_MAP) {
        if (match.test(key)) return ua;
    }
    return raw; // fall through so unmapped stats still show SOMETHING useful
}

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

    // Goal detection. `strTimeline` is the event TYPE ("Goal", "Yellow Card",
    // "Substitution", "Penalty"), `strTimelineDetail` is free text.
    //
    // Accept rules (applied on strTimeline):
    //   - starts with "goal"  → "Goal", "Goals", "Goal - Penalty", "Goal (OG)"
    //   - "own goal" anywhere
    //   - "penalty" — only if not explicitly missed/saved/awarded
    //
    // Reject rules (override accept):
    //   - disallowed / cancelled / VAR no-goal
    //   - missed / saved (guards against penalty-missed rows that still use
    //     "Goal"-adjacent wording, and against the detail containing "goal" in
    //     phrases like "would have been the equaliser")
    const isGoal = (t: SDBTimelineEvent) => {
        const kind = (t.strTimeline ?? "").trim().toLowerCase();
        const detail = (t.strTimelineDetail ?? "").toLowerCase();

        // Reject first.
        if (kind.includes("disallow") || detail.includes("disallow")) return false;
        if (kind.includes("cancel") || detail.includes("cancel")) return false;
        if (detail.includes("no goal")) return false;

        // Accept: generic goal rows (incl. "Goal - Penalty" / "Goal (OG)").
        if (kind.startsWith("goal")) {
            // If the row is explicitly an own-goal/penalty/etc. it still counts.
            // Only bail if the detail says the attempt failed.
            if (detail.includes("saved") || detail.includes("missed")) return false;
            return true;
        }
        // Accept: own goal.
        if (kind.includes("own goal") || kind.includes("own-goal")) return true;
        // Accept: penalty — unless it was missed / saved / just awarded.
        if (kind.includes("penalty") || kind.includes("penalty kick")) {
            if (
                detail.includes("miss") ||
                detail.includes("saved") ||
                detail.includes("awarded") ||
                detail.includes("won")
            ) {
                return false;
            }
            return true;
        }
        return false;
    };

    // Trust `strHome` as-is. Empirically TheSportsDB sets it to the BENEFITING
    // team for own-goal rows (so an OG by a home-team player has strHome="No"
    // because the away team gets the goal in the score). Earlier we tried
    // flipping this for OGs assuming strHome was the player's team — that put
    // OG scorers under the wrong crest. The OG label still tags the entry via
    // the `ownGoal` flag in toScorer, so the user can tell it was an own goal.
    const creditedToHome = (t: SDBTimelineEvent): boolean => isHome(t);

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

    // Dedupe defensively — some live feeds emit the same goal twice (once as an
    // own-goal row credited to one side, once as a goal-for row on the other).
    // Key on (minute, player) so true doubles survive but literal duplicates go.
    const seen = new Set<string>();
    const unique = goals.filter(g => {
        const key = `${(g.intTime ?? "").trim()}|${(g.strPlayer ?? "").trim().toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return {
        home: unique.filter(creditedToHome).map(toScorer),
        away: unique.filter(t => !creditedToHome(t)).map(toScorer),
    };
}

// ----- Per-player event map (for pitch annotations) -----
// Scans the timeline and groups every in-match event by the PLAYER IT AFFECTS:
//   Goals     → scorer name
//   Own goals → scorer name
//   Assists   → assisting player name (strAssist on a goal row)
//   Sub-off   → outgoing player (strAssist on a substitution row)
//   Cards     → booked player
// Keyed by the name lowercased, because that's the only join we have from the
// timeline back to a lineup row (neither feed guarantees `idPlayer` parity).
export interface PlayerMatchEvents {
    goals: string[];        // minutes the player scored — ["34'", "72'"]
    ownGoals: string[];     // minutes of any own goals
    assists: string[];      // minutes they provided an assist
    subOutMinute?: string;  // minute they were substituted off, if any
    yellowCard?: string;    // minute of first yellow card
    redCard?: string;       // minute of straight red or 2nd yellow
}

function fmtMinute(raw: string | undefined): string {
    const m = (raw ?? "").trim();
    return m ? `${m}'` : "";
}

export function timelineToPlayerEvents(
    timeline: SDBTimelineEvent[] | null | undefined
): Map<string, PlayerMatchEvents> {
    const map = new Map<string, PlayerMatchEvents>();
    if (!timeline) return map;

    const get = (name: string | undefined): PlayerMatchEvents | null => {
        const key = (name ?? "").trim().toLowerCase();
        if (!key) return null;
        let entry = map.get(key);
        if (!entry) {
            entry = { goals: [], ownGoals: [], assists: [] };
            map.set(key, entry);
        }
        return entry;
    };

    for (const t of timeline) {
        const kind = (t.strTimeline ?? "").trim().toLowerCase();
        const detail = (t.strTimelineDetail ?? "").trim().toLowerCase();
        const combined = `${kind} ${detail}`;
        const minute = fmtMinute(t.intTime);

        // Goals (incl. penalties and own goals). Disallowed/missed/saved goals
        // shouldn't annotate the pitch — mirror the scorer filter.
        if (kind.startsWith("goal") || kind.includes("penalty") || combined.includes("own goal")) {
            if (
                detail.includes("disallow") ||
                detail.includes("cancel") ||
                detail.includes("no goal") ||
                detail.includes("missed") ||
                detail.includes("saved") ||
                detail.includes("awarded") ||
                detail.includes("won")
            ) {
                continue;
            }
            const scorer = get(t.strPlayer);
            if (scorer) {
                if (combined.includes("own goal")) scorer.ownGoals.push(minute);
                else scorer.goals.push(minute);
            }
            // Assists are only on true goals (ignore on OG)
            if (!combined.includes("own goal")) {
                const assister = get(t.strAssist);
                if (assister) assister.assists.push(minute);
            }
            continue;
        }

        // Substitutions — strPlayer comes on, strAssist goes off.
        if (kind.startsWith("sub")) {
            const off = get(t.strAssist);
            if (off) off.subOutMinute = minute;
            continue;
        }

        // Cards. strTimeline is often "Card", with detail telling us the colour
        // ("Yellow" / "Red" / "Second Yellow"). Some feeds put it directly in
        // strTimeline ("Yellow Card").
        if (kind.includes("card") || kind.includes("yellow") || kind.includes("red")) {
            const booked = get(t.strPlayer);
            if (!booked) continue;
            const isRed = combined.includes("red") || combined.includes("second yellow");
            const isYellow = combined.includes("yellow") && !isRed;
            if (isRed) booked.redCard = minute;
            else if (isYellow) booked.yellowCard = minute;
        }
    }

    return map;
}

/** Convenience: safely pluck a player's events by name (case-insensitive). */
export function playerEvents(
    map: Map<string, PlayerMatchEvents>,
    name: string | undefined
): PlayerMatchEvents | undefined {
    if (!name) return undefined;
    return map.get(name.trim().toLowerCase());
}

// Walk a FormationTeam (top/bottom halves) and paste the timeline events onto
// every PitchPlayer by name-match. Used to decorate the pitch with scorer
// balls, assist boots, sub arrows and cards without touching the formation
// adapters that build the layout.
export function enrichPitchPlayersWithEvents<
    T extends { goalkeeper: PitchPlayer; defense: PitchPlayer[]; midfield: PitchPlayer[]; attack: PitchPlayer[] }
>(team: T, events: Map<string, PlayerMatchEvents>): T {
    const apply = (p: PitchPlayer): PitchPlayer => {
        const ev = playerEvents(events, p.name);
        if (!ev) return p;
        return {
            ...p,
            goals: ev.goals.length ? ev.goals : undefined,
            ownGoals: ev.ownGoals.length ? ev.ownGoals : undefined,
            assists: ev.assists.length ? ev.assists : undefined,
            subOutMinute: ev.subOutMinute,
            yellowCard: ev.yellowCard,
            redCard: ev.redCard,
        };
    };
    return {
        ...team,
        goalkeeper: apply(team.goalkeeper),
        defense: team.defense.map(apply),
        midfield: team.midfield.map(apply),
        attack: team.attack.map(apply),
    };
}

// Simple boolean summary — did each team receive any red card this match?
// Used by the schedule list to pin a small red-card indicator next to team
// names. Lives here so the list never needs to touch the timeline directly.
export function teamsWithRedCards(
    timeline: SDBTimelineEvent[] | null | undefined
): { home: boolean; away: boolean } {
    if (!timeline) return { home: false, away: false };
    let home = false;
    let away = false;
    for (const t of timeline) {
        const kind = (t.strTimeline ?? "").toLowerCase();
        const detail = (t.strTimelineDetail ?? "").toLowerCase();
        const combined = `${kind} ${detail}`;
        if (!combined.includes("red") && !combined.includes("second yellow")) continue;
        const isHome = t.strHome === "1" || t.strHome?.toLowerCase() === "yes";
        if (isHome) home = true;
        else away = true;
    }
    return { home, away };
}

export function statsToRows(stats: SDBEventStat[] | null | undefined): StatRow[] {
    if (!stats || stats.length === 0) return [];
    return stats.map(s => ({
        label: statUa(s.strStat ?? undefined),
        home: toInt(s.intHome),
        away: toInt(s.intAway),
    }));
}

// ----- Bench / substitutes panel -----

export interface BenchPlayer {
    id: string;
    name: string;
    number?: number;
    photoUrl?: string;
    nationality?: string; // raw country name — UI resolves to a flag emoji
    /** Name of the starter this bench player replaced on the pitch. If empty,
     *  the player stayed on the bench the whole match (unused substitute). */
    replacedName?: string;
    /** Minute they came on, for sorting. Unused subs sort to the bottom. */
    minuteOn?: number;
}

// Subscribe one team's bench from the lineup endpoint, then enrich with
// timeline "Substitution" events to show who each came on for.
//
// Lineup sub rows: `strSubstitute` is "Yes"/"1" and we filter by home/away.
// Timeline sub rows: `strTimeline` is "Substitution" (sometimes "Substitute"
// or "Sub"). TheSportsDB encodes:
//   strPlayer  = player coming ON
//   strAssist  = player going OFF  (reuses the "assist" field)
// We match those against the bench roster by name.
export function lineupToBench(
    lineup: SDBLineupPlayer[] | null | undefined,
    timeline: SDBTimelineEvent[] | null | undefined
): { home: BenchPlayer[]; away: BenchPlayer[] } {
    if (!lineup || lineup.length === 0) return { home: [], away: [] };

    const isHome = (p: SDBLineupPlayer) =>
        p.strHome === "1" || p.strHome?.toLowerCase() === "yes";
    const isSub = (p: SDBLineupPlayer) =>
        p.strSubstitute === "1" || p.strSubstitute?.toLowerCase() === "yes";

    // Map sub events keyed by the incoming player's name (lowercased). Timeline
    // event types for subs vary by feed — accept any kind that starts with "sub".
    const subsByIncoming = new Map<string, { out: string; minute: number }>();
    for (const t of timeline ?? []) {
        const kind = (t.strTimeline ?? "").trim().toLowerCase();
        if (!kind.startsWith("sub")) continue;
        const inName = (t.strPlayer ?? "").trim();
        const outName = (t.strAssist ?? "").trim();
        if (!inName) continue;
        const minute = Number((t.intTime ?? "").split("+")[0]) || 0;
        subsByIncoming.set(inName.toLowerCase(), { out: outName, minute });
    }

    const buildOne = (p: SDBLineupPlayer): BenchPlayer => {
        const name = p.strPlayer ?? "?";
        const sub = subsByIncoming.get(name.trim().toLowerCase());
        const num = p.intSquadNumber ? Number(p.intSquadNumber) : NaN;
        return {
            id: p.idPlayer ?? p.idLineup ?? crypto.randomUUID(),
            name,
            number: Number.isFinite(num) ? num : undefined,
            photoUrl: p.strCutout ?? p.strPlayerThumb ?? undefined,
            nationality: p.strNationality ?? p.strCountry ?? undefined,
            replacedName: sub?.out || undefined,
            minuteOn: sub?.minute,
        };
    };

    // Used subs (came on) sort first by minute; unused subs drag to the bottom
    // ordered by jersey number so the list reads like a team sheet.
    const sortBench = (a: BenchPlayer, b: BenchPlayer) => {
        const aUsed = a.minuteOn != null;
        const bUsed = b.minuteOn != null;
        if (aUsed !== bUsed) return aUsed ? -1 : 1;
        if (aUsed && bUsed) return (a.minuteOn ?? 0) - (b.minuteOn ?? 0);
        return (a.number ?? 999) - (b.number ?? 999);
    };

    const subs = lineup.filter(isSub);
    return {
        home: subs.filter(isHome).map(buildOne).sort(sortBench),
        away: subs.filter(p => !isHome(p)).map(buildOne).sort(sortBench),
    };
}

// ----- Last 5 matches form -----
// For each side's "Past 5" card we need the outcome from the perspective of
// the CURRENT team (not the home/away slot), plus the opponent's name, crest
// and the final score formatted as "H-A".
export interface LastFiveRow {
    id: string;
    opponentName: string;
    opponentLogo?: string;
    result: "W" | "L" | "D";
    score: string; // always "home-away" regardless of which side our team was
}

export function eventsToLastFive(
    events: SDBEvent[] | null | undefined,
    teamId: string | undefined
): LastFiveRow[] {
    if (!events || events.length === 0 || !teamId) return [];

    // TheSportsDB's schedule/previous endpoint returns events newest-first
    // most of the time, but we can't rely on that — sort by timestamp desc
    // ourselves, then slice.
    const finished = events
        .filter(e => e.intHomeScore != null && e.intAwayScore != null)
        .slice()
        .sort((a, b) => {
            const at = a.strTimestamp ?? a.dateEvent ?? "";
            const bt = b.strTimestamp ?? b.dateEvent ?? "";
            return bt.localeCompare(at);
        })
        .slice(0, 5);

    return finished.map(e => {
        const isHome = e.idHomeTeam === teamId;
        const homeScore = Number(e.intHomeScore);
        const awayScore = Number(e.intAwayScore);
        const ourScore = isHome ? homeScore : awayScore;
        const theirScore = isHome ? awayScore : homeScore;
        let result: "W" | "L" | "D";
        if (ourScore > theirScore) result = "W";
        else if (ourScore < theirScore) result = "L";
        else result = "D";
        return {
            id: e.idEvent ?? `${e.strTimestamp}-${e.strHomeTeam}`,
            opponentName: (isHome ? e.strAwayTeam : e.strHomeTeam) ?? "",
            opponentLogo: (isHome ? e.strAwayTeamBadge : e.strHomeTeamBadge) ?? undefined,
            result,
            score: `${homeScore}-${awayScore}`,
        };
    });
}
