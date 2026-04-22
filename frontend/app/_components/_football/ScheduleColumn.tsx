"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export interface ScheduleMatch {
    id: string;
    time: string;
    /** UTC ISO timestamp of kickoff, used for dynamic countdowns. */
    startIso?: string;
    homeTeam: string;
    awayTeam: string;
    homeLogo?: string;
    awayLogo?: string;
    homeScore?: number;
    awayScore?: number;
    /** Short time-state label — "67'" / "HT" during a live match, "FT" after it ends.
     *  Shown under the time/date cell whenever the match is live or past. */
    elapsed?: string;
    favorite?: boolean;
    status?: "live" | "past" | "upcoming";
}

/**
 * "за 2г 15хв", "за 3 дн", "зараз" — relative kickoff label for upcoming matches.
 * Returns null if we can't compute (no timestamp or already started).
 */
function relativeKickoff(startIso: string | undefined, now: number): string | null {
    if (!startIso) return null;
    const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(startIso) ? startIso : `${startIso}Z`;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return null;
    const diffMs = t - now;
    if (diffMs <= 0) return null;
    const min = Math.round(diffMs / 60_000);
    if (min < 60) return `за ${min} хв`;
    const hr = Math.floor(min / 60);
    if (hr < 24) {
        const rem = min % 60;
        return rem > 0 ? `за ${hr}г ${rem}хв` : `за ${hr}г`;
    }
    const days = Math.floor(hr / 24);
    return `за ${days} дн`;
}

export interface ScheduleGroup {
    leagueId: string;
    leagueName: string;
    leagueBadge?: string;
    leagueCountry?: string;
    matches: ScheduleMatch[];
}

const topTabs = [
    { id: "all", label: "Все" },
    { id: "fav", label: "Улюблене" },
    { id: "compete", label: "Змагання" },
];

const phaseTabs = [
    { id: "live", label: "Наживо" },
    { id: "past", label: "Минулі" },
    { id: "upcoming", label: "Майбутні" },
];

function applyFilter(
    matches: ScheduleMatch[],
    topTab: string,
    phaseTab: string | null
): ScheduleMatch[] {
    return matches.filter(m =>
        (topTab !== "fav" || m.favorite) &&
        (!phaseTab || m.status === phaseTab)
    );
}

function MatchRow({
    m,
    selected,
    onClick,
    now,
}: {
    m: ScheduleMatch;
    selected: boolean;
    onClick: () => void;
    now: number;
}) {
    const isUpcoming = m.status === "upcoming";
    const isPast = m.status === "past";
    const countdown = isUpcoming ? relativeKickoff(m.startIso, now) : null;
    // Finished matches: swap the kickoff time for the play date (DD.MM) so the
    // user sees when the game was played, not when it would've started today.
    const timeLabel = isPast && m.startIso
        ? (() => {
              const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(m.startIso!) ? m.startIso! : `${m.startIso!}Z`;
              const d = new Date(iso);
              if (Number.isNaN(d.getTime())) return m.time;
              const dd = String(d.getDate()).padStart(2, "0");
              const mm = String(d.getMonth() + 1).padStart(2, "0");
              return `${dd}.${mm}`;
          })()
        : m.time;
    return (
        <div
            onClick={onClick}
            className={`grid grid-cols-[54px_1fr_60px_28px] items-center gap-2 h-[56px] px-2 rounded-[8px] cursor-pointer transition-colors border-b border-gray-200 last:border-none ${
                selected ? "bg-[#af292a]/10" : "hover:bg-white"
            }`}
        >
            <div className="flex flex-col items-start leading-tight">
                <span className="text-[#af292a] text-[14px] font-bold font-data">{timeLabel}</span>
                {(m.status === "live" || isPast) && m.elapsed && (
                    <span className="text-[10px] font-bold text-[#af292a] font-data pl-3">
                        {m.elapsed}
                    </span>
                )}
            </div>
            <div className="flex flex-col gap-[2px] min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    {m.homeLogo ? (
                        <Image
                            src={m.homeLogo}
                            alt=""
                            width={18}
                            height={18}
                            unoptimized
                            className="w-[18px] h-[18px] object-contain shrink-0"
                        />
                    ) : (
                        <span className="w-5 h-5 rounded-full bg-gray-300 shrink-0" />
                    )}
                    <span className="text-[13px] text-[#212121] truncate">{m.homeTeam}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                    {m.awayLogo ? (
                        <Image
                            src={m.awayLogo}
                            alt=""
                            width={18}
                            height={18}
                            unoptimized
                            className="w-[18px] h-[18px] object-contain shrink-0"
                        />
                    ) : (
                        <span className="w-5 h-5 rounded-full bg-gray-300 shrink-0" />
                    )}
                    <span className="text-[13px] text-[#212121] truncate">{m.awayTeam}</span>
                </div>
            </div>
            <div className="flex flex-col items-end justify-center min-w-0">
                {isUpcoming ? (
                    countdown ? (
                        <span className="text-[10px] font-semibold text-gray-500 whitespace-nowrap">
                            {countdown}
                        </span>
                    ) : (
                        <span className="text-[12px] font-bold text-gray-400 font-data">–</span>
                    )
                ) : (
                    <>
                        <span className="text-[14px] font-bold text-[#af292a] font-data leading-tight">
                            {m.homeScore ?? "–"}
                        </span>
                        <span className="text-[14px] font-bold text-[#af292a] font-data leading-tight">
                            {m.awayScore ?? "–"}
                        </span>
                    </>
                )}
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); }}
                className={`text-xl leading-none ${m.favorite ? "text-[#af292a]" : "text-gray-300 hover:text-[#af292a]"} transition-colors cursor-pointer`}
                aria-label="Favorite"
            >
                ☆
            </button>
        </div>
    );
}

export default function ScheduleColumn({
    matches,
    groups,
    dateLabel = "22.03.26",
    selectedMatchId,
    onPrevDay,
    onNextDay,
    onPickDate,
    dateIso,
}: {
    matches?: ScheduleMatch[];
    groups?: ScheduleGroup[];
    dateLabel?: string;
    selectedMatchId?: string;
    onPrevDay?: () => void;
    onNextDay?: () => void;
    onPickDate?: (iso: string) => void;
    dateIso?: string;
}) {
    const router = useRouter();
    const [topTab, setTopTab] = useState("all");
    const [phaseTab, setPhaseTab] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    // Re-tick once a minute so countdowns stay accurate without being chatty.
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(id);
    }, []);

    // Apply filters to either source
    const filteredFlat = matches ? applyFilter(matches, topTab, phaseTab) : [];
    const filteredGroups = groups
        ? groups
              .map(g => ({ ...g, matches: applyFilter(g.matches, topTab, phaseTab) }))
              .filter(g => g.matches.length > 0)
        : [];

    const totalGrouped = filteredGroups.reduce((n, g) => n + g.matches.length, 0);
    const isEmpty = groups ? totalGrouped === 0 : filteredFlat.length === 0;

    return (
        <div className="w-[560px] flex flex-col gap-[10px]">
            {/* Black mini header with tabs + date — separate card */}
            <div className="w-full h-[40px] bg-[#212121] rounded-[14px] flex flex-row justify-center items-center gap-[10px] px-3">
                {topTabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTopTab(t.id)}
                        className={`h-[26px] px-4 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            topTab === t.id ? "bg-[#af292a] text-white" : "text-white/80 hover:text-white"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
                <div className="ml-auto flex items-center gap-1 relative">
                    <button
                        onClick={onPrevDay}
                        disabled={!onPrevDay}
                        className="h-[26px] w-[22px] rounded-[6px] border border-white/30 text-white text-xs flex items-center justify-center hover:bg-white/10 disabled:opacity-40 disabled:cursor-default cursor-pointer"
                        aria-label="Previous day"
                    >
                        ‹
                    </button>
                    <button
                        onClick={() => setPickerOpen(v => !v)}
                        className="h-[26px] px-3 rounded-[8px] border border-white/30 text-white text-[11px] font-bold hover:bg-white/10 cursor-pointer"
                    >
                        {dateLabel}
                    </button>
                    {pickerOpen && onPickDate && (
                        <input
                            type="date"
                            defaultValue={dateIso}
                            onChange={(e) => {
                                onPickDate(e.target.value);
                                setPickerOpen(false);
                            }}
                            className="absolute right-0 top-[30px] z-10 text-[11px] rounded-[6px] border border-gray-300 bg-white px-2 py-1 text-[#212121]"
                        />
                    )}
                    <button
                        onClick={onNextDay}
                        disabled={!onNextDay}
                        className="h-[26px] w-[22px] rounded-[6px] border border-white/30 text-white text-xs flex items-center justify-center hover:bg-white/10 disabled:opacity-40 disabled:cursor-default cursor-pointer"
                        aria-label="Next day"
                    >
                        ›
                    </button>
                </div>
            </div>

            {/* List card: phase row + match rows */}
            <div className="w-full bg-[#f8f8f8] rounded-[20px] pt-[20px] pr-[32px] pb-[20px] pl-[32px] flex flex-col gap-[10px] shadow-sm">
                {/* Red phase buttons row */}
                <div className="w-full flex items-center gap-2">
                    {phaseTabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setPhaseTab(phaseTab === t.id ? null : t.id)}
                            className={`h-[30px] px-5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                                phaseTab === t.id
                                    ? "bg-[#212121] text-white"
                                    : "bg-[#af292a] text-white hover:opacity-90"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setPhaseTab(null)}
                        className={`ml-auto h-[30px] px-5 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                            phaseTab === null ? "bg-[#212121] text-white" : "bg-[#af292a] text-white hover:opacity-90"
                        }`}
                    >
                        Все
                    </button>
                </div>

                {isEmpty && (
                    <div className="text-center text-gray-400 text-[12px] py-8">Немає матчів</div>
                )}

                {/* Grouped rendering */}
                {groups && filteredGroups.map(g => (
                    <div key={g.leagueId} className="flex flex-col">
                        <div className="flex items-center gap-2 px-2 py-[8px] border-b-2 border-[#af292a]/30">
                            {g.leagueBadge ? (
                                <Image
                                    src={g.leagueBadge}
                                    alt=""
                                    width={32}
                                    height={32}
                                    unoptimized
                                    className="w-8 h-8 object-contain"
                                />
                            ) : (
                                <span className="w-8 h-8 rounded-full bg-gray-300" />
                            )}
                            <span className="text-[13px] font-bold uppercase tracking-wider text-[#212121]">
                                {g.leagueName}
                            </span>
                            {g.leagueCountry && (
                                <span className="text-[11px] text-gray-500">
                                    · {g.leagueCountry}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            {g.matches.map(m => (
                                <MatchRow
                                    key={m.id}
                                    m={m}
                                    now={now}
                                    selected={selectedMatchId === m.id}
                                    onClick={() => {
                                        const suffix = dateIso ? `?date=${dateIso}` : "";
                                        router.push(`/football/${m.id}${suffix}`);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                {/* Flat rendering (detail page) */}
                {!groups && (
                    <div className="flex flex-col">
                        {filteredFlat.map(m => (
                            <MatchRow
                                key={m.id}
                                m={m}
                                now={now}
                                selected={selectedMatchId === m.id}
                                onClick={() => {
                                    const suffix = dateIso ? `?date=${dateIso}` : "";
                                    router.push(`/football/${m.id}${suffix}`);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
