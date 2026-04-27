"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Icon } from "./Icon";
import { useFavorites } from "@/services/favorites";

export interface ScheduleMatch {
    id: string;
    time: string;
    
    startIso?: string;
    homeTeam: string;
    awayTeam: string;
    
    homeTeamId?: string;
    awayTeamId?: string;
    homeLogo?: string;
    awayLogo?: string;
    homeScore?: number;
    awayScore?: number;
    
    elapsed?: string;
    favorite?: boolean;
    status?: "live" | "past" | "upcoming";
    
    homeRedCard?: boolean;
    awayRedCard?: boolean;

    quarters?: { home: number[]; away: number[] };
}


const QUARTER_RE = /\b(Q[1-4]|[1-4]Q|OT[0-9]?|HT)\b/i;
const CLOCK_RE = /\b(\d{1,2}:\d{2})\b/;
const SET_RE = /\bSet\s*([1-5])\b/i;
const GAME_SPLIT_RE = /\b(\d+-\d+)\b/;

function parseQuarterElapsed(elapsed: string | undefined): { quarter: string; clock?: string } | null {
    if (!elapsed) return null;
    const setMatch = elapsed.match(SET_RE);
    if (setMatch) {
        const quarter = `Set ${setMatch[1]}`;
        const gMatch = elapsed.match(GAME_SPLIT_RE);
        return { quarter, clock: gMatch ? gMatch[1] : undefined };
    }
    const qMatch = elapsed.match(QUARTER_RE);
    if (!qMatch) return null;
    let quarter = qMatch[1].toUpperCase();
    if (/^[1-4]Q$/.test(quarter)) quarter = "Q" + quarter[0];
    const cMatch = elapsed.match(CLOCK_RE);
    return { quarter, clock: cMatch ? cMatch[1] : undefined };
}

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

export interface CompetitionOption {
    id: string;
    name: string;
    badge?: string;
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
    phaseTab: string | null,
    isFav: (matchId?: string, homeId?: string, awayId?: string) => boolean
): ScheduleMatch[] {
    return matches.filter(m =>
        (topTab !== "fav" || isFav(m.id, m.homeTeamId, m.awayTeamId)) &&
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
    const { toggleMatch, toggleTeam, isMatchFav, isTeamFav } = useFavorites();
    const starred =
        isMatchFav(m.id) || isTeamFav(m.homeTeamId) || isTeamFav(m.awayTeamId);
    const homeTeamFav = isTeamFav(m.homeTeamId);
    const awayTeamFav = isTeamFav(m.awayTeamId);
    const isUpcoming = m.status === "upcoming";
    const isPast = m.status === "past";
    const countdown = isUpcoming ? relativeKickoff(m.startIso, now) : null;
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
    const hasQuarters = !!m.quarters && m.quarters.home.length > 0;
    const gridCols = hasQuarters
        ? "grid-cols-[54px_1fr_auto_28px]"
        : "grid-cols-[54px_1fr_60px_28px]";
    return (
        <div
            onClick={onClick}
            className={`grid ${gridCols} items-center gap-2 h-[56px] px-2 rounded-[8px] cursor-pointer transition-colors border-b border-gray-200 last:border-none ${
                selected ? "bg-[#af292a]/10" : "hover:bg-white"
            }`}
        >
            <div className="flex flex-col items-start leading-tight">
                {m.status === "live" && m.elapsed
                    ? (() => {
                          const parsed = parseQuarterElapsed(m.elapsed);
                          if (parsed) {
                              return (
                                  <>
                                      <span className="text-[#af292a] text-[14px] font-bold font-data leading-none">
                                          {parsed.quarter}
                                      </span>
                                      {parsed.clock && (
                                          <span className="text-[#af292a] text-[12px] font-bold font-data tabular-nums leading-tight mt-[2px]">
                                              {parsed.clock}
                                          </span>
                                      )}
                                  </>
                              );
                          }
                          return (
                              <>
                                  <span className="text-[#af292a] text-[14px] font-bold font-data">
                                      {timeLabel}
                                  </span>
                                  <span className="text-[10px] font-bold text-[#af292a] font-data pl-3">
                                      {m.elapsed}
                                  </span>
                              </>
                          );
                      })()
                    : (
                        <>
                            <span className="text-[#af292a] text-[14px] font-bold font-data">
                                {timeLabel}
                            </span>
                            {isPast && m.elapsed && (
                                <span className="text-[10px] font-bold text-[#af292a] font-data pl-3">
                                    {m.elapsed}
                                </span>
                            )}
                        </>
                    )}
            </div>
            <div className="flex flex-col gap-[2px] min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleTeam(m.homeTeamId); }}
                        className={`shrink-0 rounded-full transition ${homeTeamFav ? "ring-2 ring-[#af292a]" : "hover:ring-1 hover:ring-[#af292a]/40"}`}
                        aria-label={`Favourite ${m.homeTeam}`}
                        title={homeTeamFav ? "Прибрати з улюблених" : "Додати команду в улюблені"}
                    >
                        {m.homeLogo ? (
                            <Image
                                src={m.homeLogo}
                                alt=""
                                width={18}
                                height={18}
                                unoptimized
                                className="w-[18px] h-[18px] object-contain"
                            />
                        ) : (
                            <span className="block w-5 h-5 rounded-full bg-gray-300" />
                        )}
                    </button>
                    <span className="text-[13px] text-[#212121] truncate">{m.homeTeam}</span>
                    {m.homeRedCard && (
                        <span className="shrink-0" title="Red card">
                            <Icon name="REDCARD" size={10} />
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleTeam(m.awayTeamId); }}
                        className={`shrink-0 rounded-full transition ${awayTeamFav ? "ring-2 ring-[#af292a]" : "hover:ring-1 hover:ring-[#af292a]/40"}`}
                        aria-label={`Favourite ${m.awayTeam}`}
                        title={awayTeamFav ? "Прибрати з улюблених" : "Додати команду в улюблені"}
                    >
                        {m.awayLogo ? (
                            <Image
                                src={m.awayLogo}
                                alt=""
                                width={18}
                                height={18}
                                unoptimized
                                className="w-[18px] h-[18px] object-contain"
                            />
                        ) : (
                            <span className="block w-5 h-5 rounded-full bg-gray-300" />
                        )}
                    </button>
                    <span className="text-[13px] text-[#212121] truncate">{m.awayTeam}</span>
                    {m.awayRedCard && (
                        <span className="shrink-0" title="Red card">
                            <Icon name="REDCARD" size={10} />
                        </span>
                    )}
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
                ) : hasQuarters ? (
                    <div className="flex flex-col gap-[2px]">
                        <div className="flex items-center gap-[6px]">
                            {m.quarters!.home.map((q, i) => (
                                <span
                                    key={`h-${i}`}
                                    className="font-data tracking-wider text-[11px] text-[#212121]/70 w-[18px] text-right tabular-nums"
                                >
                                    {q}
                                </span>
                            ))}
                            <span className="text-[14px] font-bold text-[#af292a] font-data leading-tight tabular-nums w-[26px] text-right">
                                {m.homeScore ?? "–"}
                            </span>
                        </div>
                        <div className="flex items-center gap-[6px]">
                            {m.quarters!.away.map((q, i) => (
                                <span
                                    key={`a-${i}`}
                                    className="font-data tracking-wider text-[11px] text-[#212121]/70 w-[18px] text-right tabular-nums"
                                >
                                    {q}
                                </span>
                            ))}
                            <span className="text-[14px] font-bold text-[#af292a] font-data leading-tight tabular-nums w-[26px] text-right">
                                {m.awayScore ?? "–"}
                            </span>
                        </div>
                    </div>
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
                onClick={(e) => { e.stopPropagation(); toggleMatch(m.id); }}
                className={`text-xl leading-none ${starred ? "text-[#af292a]" : "text-gray-300 hover:text-[#af292a]"} transition-colors cursor-pointer`}
                aria-label="Favorite match"
                title={starred ? "Прибрати з улюблених" : "Додати матч в улюблені"}
            >
                {starred ? "★" : "☆"}
            </button>
        </div>
    );
}

export default function ScheduleColumn({
    matches,
    groups,
    dateLabel = "22.03.26",
    selectedMatchId,
    onPrevDayAction,
    onNextDayAction,
    onPickDateAction,
    dateIso,
    competitions,
    onPickCompetitionAction,
    basePath = "/football",
    showCompetitionsTab = true,
}: {
    matches?: ScheduleMatch[];
    groups?: ScheduleGroup[];
    dateLabel?: string;
    selectedMatchId?: string;
    onPrevDayAction?: () => void;
    onNextDayAction?: () => void;
    onPickDateAction?: (iso: string) => void;
    dateIso?: string;

    competitions?: CompetitionOption[];

    onPickCompetitionAction?: (leagueId: string) => void;
    basePath?: string;
    showCompetitionsTab?: boolean;
}) {
    const router = useRouter();
    const { isMatchFavOrTeam } = useFavorites();
    const [topTab, setTopTab] = useState("all");
    const [phaseTab, setPhaseTab] = useState<string | null>(null);
    const [pickedCompetition, setPickedCompetition] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 60_000);
        return () => clearInterval(id);
    }, []);

    const filteredFlat = matches ? applyFilter(matches, topTab, phaseTab, isMatchFavOrTeam) : [];
    const filteredGroups = groups
        ? groups
              .filter(g =>
                  topTab !== "compete" || !pickedCompetition || g.leagueId === pickedCompetition
              )
              .map(g => ({ ...g, matches: applyFilter(g.matches, topTab, phaseTab, isMatchFavOrTeam) }))
              .filter(g => g.matches.length > 0)
        : [];

    const inCompeteMode = topTab === "compete";

    const totalGrouped = filteredGroups.reduce((n, g) => n + g.matches.length, 0);
    const isEmpty = groups ? totalGrouped === 0 : filteredFlat.length === 0;

    return (
        <div className="w-full lg:w-[560px] flex flex-col gap-[10px]">
            
            <div className="w-full min-h-[40px] bg-[#212121] rounded-[14px] flex flex-row flex-wrap justify-center items-center gap-2 px-3 py-1">
                {topTabs.filter(t => showCompetitionsTab || t.id !== "compete").map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTopTab(t.id)}
                        className={`h-[26px] px-3 sm:px-4 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            topTab === t.id ? "bg-[#af292a] text-white" : "text-white/80 hover:text-white"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
                
                <div className="ml-auto relative">
                    <div className="h-[30px] pl-[6px] pr-[6px] bg-white rounded-[10px] flex items-center gap-[4px] shadow-sm">
                        <button
                            onClick={onPrevDayAction}
                            disabled={!onPrevDayAction}
                            className="h-[22px] w-[22px] flex items-center justify-center text-[#af292a] text-[18px] font-bold leading-none rounded hover:bg-[#af292a]/10 disabled:opacity-40 disabled:cursor-default cursor-pointer"
                            aria-label="Previous day"
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => setPickerOpen(v => !v)}
                            className="h-[22px] px-1 text-[#af292a] text-[14px] font-bold font-data leading-none cursor-pointer tracking-wider"
                        >
                            {dateLabel}
                        </button>
                        <button
                            onClick={onNextDayAction}
                            disabled={!onNextDayAction}
                            className="h-[22px] w-[22px] flex items-center justify-center text-[#af292a] text-[18px] font-bold leading-none rounded hover:bg-[#af292a]/10 disabled:opacity-40 disabled:cursor-default cursor-pointer"
                            aria-label="Next day"
                        >
                            ›
                        </button>
                    </div>
                    {pickerOpen && onPickDateAction && (
                        <input
                            type="date"
                            defaultValue={dateIso}
                            onChange={(e) => {
                                onPickDateAction(e.target.value);
                                setPickerOpen(false);
                            }}
                            className="absolute right-0 top-[34px] z-10 text-[11px] rounded-[6px] border border-gray-300 bg-white px-2 py-1 text-[#212121]"
                        />
                    )}
                </div>
            </div>

            
            <div className="w-full bg-[#f8f8f8] rounded-[20px] py-[20px] px-[16px] sm:px-[24px] lg:px-[32px] flex flex-col gap-[10px] shadow-sm">
                {inCompeteMode && competitions && competitions.length > 0 && (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#212121]">
                                Вибери змагання
                            </span>
                            {pickedCompetition && (
                                <button
                                    type="button"
                                    onClick={() => setPickedCompetition(null)}
                                    className="text-[10px] font-bold uppercase tracking-wider text-[#af292a] hover:underline cursor-pointer"
                                >
                                    Скинути
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {competitions.map(c => {
                                const active = pickedCompetition === c.id;
                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                            const next = active ? null : c.id;
                                            setPickedCompetition(next);
                                            if (next) onPickCompetitionAction?.(next);
                                        }}
                                        title={c.name}
                                        aria-label={c.name}
                                        style={{
                                            backgroundColor: active
                                                ? "rgba(175, 41, 42, 0.45)"
                                                : "rgba(175, 41, 42, 0.18)",
                                        }}
                                        className={`group relative w-[52px] h-[52px] rounded-[12px] border flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                                            active
                                                ? "border-[#af292a] shadow-[0_0_0_2px_#af292a]"
                                                : "border-transparent"
                                        }`}
                                    >
                                        {c.badge ? (
                                            <Image
                                                src={c.badge}
                                                alt=""
                                                width={40}
                                                height={40}
                                                unoptimized
                                                className="w-10 h-10 object-contain"
                                            />
                                        ) : (
                                            <span className="text-[10px] font-bold text-[#212121] text-center leading-tight px-1">
                                                {c.name.slice(0, 3).toUpperCase()}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                
                <div className="w-full flex items-center flex-wrap gap-2">
                    {phaseTabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setPhaseTab(phaseTab === t.id ? null : t.id)}
                            className={`h-[30px] px-3 sm:px-5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
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
                        className={`sm:ml-auto h-[30px] px-3 sm:px-5 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                            phaseTab === null ? "bg-[#212121] text-white" : "bg-[#af292a] text-white hover:opacity-90"
                        }`}
                    >
                        Все
                    </button>
                </div>

                {isEmpty && (
                    <div className="text-center text-gray-400 text-[12px] py-8">Немає матчів</div>
                )}

                
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
                                        router.push(`${basePath}/${m.id}${suffix}`);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}

                
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
                                    router.push(`${basePath}/${m.id}${suffix}`);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
