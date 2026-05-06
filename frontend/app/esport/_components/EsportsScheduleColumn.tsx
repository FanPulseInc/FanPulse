"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useT } from "@/services/i18n/context";

export interface EsportsMatch {
  id: string;
  time: string;
  startIso?: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  homeScore?: number;
  awayScore?: number;
  favorite?: boolean;
  status?: "live" | "past" | "upcoming";
  format?: string;
}

export interface EsportsTournamentGroup {
  tournamentId: string;
  tournamentName: string;
  tournamentLogo?: string;
  stage?: string;
  matches: EsportsMatch[];
}


function relativeKickoff(startIso: string | undefined, now: number, tFn: (key: string, vars?: Record<string, string | number>) => string) {
  if (!startIso) return null;

  const ms = new Date(startIso).getTime();
  if (Number.isNaN(ms)) return null;

  const diffMs = ms - now;
  if (diffMs <= 0) return null;

  const minutes = Math.round(diffMs / 60_000);

  if (min < 60) return tFn("time_in_min", { min });

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hr < 24) return rem > 0 ? tFn("time_in_hours_min", { hr, min: rem }) : tFn("time_in_hours", { hr });

  return tFn("time_in_days", { days: Math.floor(hr / 24) });
}

function getMatchPhase(match: EsportsMatch, now: number) {
  if (match.status === "live" || match.time === "LIVE") {
    return "live";
  }

  if (match.status === "past") {
    return "past";
  }

  if (match.status === "upcoming") {
    return "upcoming";
  }

  if (match.startIso) {
    const startTime = new Date(match.startIso).getTime();

    if (!Number.isNaN(startTime)) {
      return startTime > now ? "upcoming" : "past";
    }
  }

  return "upcoming";
}

function filterMatches(
  matches: EsportsMatch[],
  topTab: string,
  phaseTab: string | null,
  now: number
) {
  return matches.filter((match) => {
    const phase = getMatchPhase(match, now);

    return (
      (topTab !== "fav" || match.favorite) &&
      (!phaseTab || phase === phaseTab)
    );
  });
}

function TeamLine({ name, logo }: { name: string; logo?: string }) {
  const src = logo?.trim() ? logo : "/icons/question_mark.png";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-300">
        <Image
          src={src}
          alt=""
          width={14}
          height={14}
          unoptimized
          className="object-contain"
        />
      </div>

      <span className="truncate text-[13px] text-[#212121]">{name}</span>
    </div>
  );
}

function EsportsMatchRow({
  match,
  selected,
  onClick,
  now,
}: {
  match: EsportsMatch;
  selected: boolean;
  onClick: () => void;
  now: number;
}) {
  const { t: tFn } = useT();
  const realPhase = getMatchPhase(match, now);
  const isUpcoming = realPhase === "upcoming";
  const countdown = isUpcoming ? relativeKickoff(match.startIso, now, tFn) : null;

  return (
    <div
      onClick={onClick}
      className={`grid h-[60px] cursor-pointer grid-cols-[54px_1fr_70px_28px] items-center gap-2 rounded-[8px] border-b border-gray-200 px-2 transition-colors last:border-none ${
        selected ? "bg-[#af292a]/10" : "hover:bg-white"
      }`}
    >
      <span className="font-data text-[14px] font-bold text-[#af292a]">
        {phase === "live" ? "LIVE" : match.time}
      </span>

      <div className="flex min-w-0 flex-col gap-[2px]">
        <TeamLine name={match.homeTeam} logo={match.homeLogo} />
        <TeamLine name={match.awayTeam} logo={match.awayLogo} />
      </div>

      <div className="flex min-w-0 flex-col items-end justify-center">
        {isUpcoming ? (
          <>
            <span className="whitespace-nowrap text-[10px] font-bold text-[#212121]">
              {match.format ?? "BO3"}
            </span>

            <span className="whitespace-nowrap text-[10px] font-semibold text-gray-500">
              {countdown ?? "–"}
            </span>
          </>
        ) : (
          <>
            <span className="font-data text-[14px] font-bold leading-tight text-[#af292a]">
              {match.homeScore ?? "–"}
            </span>
            <span className="font-data text-[14px] font-bold leading-tight text-[#af292a]">
              {match.awayScore ?? "–"}
            </span>
          </>
        )}
      </div>

      <button
        onClick={(event) => event.stopPropagation()}
        className={`cursor-pointer text-xl leading-none transition-colors ${
          match.favorite
            ? "text-[#af292a]"
            : "text-gray-300 hover:text-[#af292a]"
        }`}
        aria-label="Favorite"
      >
        ☆
      </button>
    </div>
  );
}

export default function EsportsScheduleColumn({
  groups = [],
  dateLabel = "29.04.26",
  selectedMatchId,
  onPrevDay,
  onNextDay,
  onPickDate,
  dateIso,
  onPhaseChange,
  gameSlug = "cs2",
}: {
  groups?: EsportsTournamentGroup[];
  dateLabel?: string;
  selectedMatchId?: string;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onPickDate?: (iso: string) => void;
  dateIso?: string;
  onPhaseChange?: (phase: string | null) => void;
  gameSlug?: GameSlug;
}) {
  const { t } = useT();
  const router = useRouter();

  const topTabs = [
    { id: "all", label: t("tab_all") },
    { id: "fav", label: t("tab_favourite") },
    { id: "compete", label: t("tab_competitions") },
  ];

  const phaseTabs = [
    { id: "live", label: t("esport_live") },
    { id: "past", label: t("esport_past") },
    { id: "upcoming", label: t("esport_upcoming") },
  ];

  const [topTab, setTopTab] = useState("all");
  const [phaseTab, setPhaseTab] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const filteredGroups = groups
    .map((group) => ({
      ...group,
      matches: filterMatches(group.matches, topTab, phaseTab, now),
    }))
    .filter((group) => group.matches.length > 0);

  const isEmpty = filteredGroups.length === 0;

  function handlePhaseClick(next: string | null) {
    setPhaseTab(next);
    onPhaseChange?.(next);
  }

  return (
    <div className="flex w-[560px] flex-col gap-[10px]">
      <div className="flex h-[40px] w-full flex-row items-center justify-center gap-[10px] rounded-[14px] bg-[#212121] px-3">
        {topTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTopTab(tab.id)}
            className={`h-[26px] cursor-pointer rounded-full px-4 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              topTab === tab.id
                ? "bg-[#af292a] text-white"
                : "text-white/80 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}

        <div className="relative ml-auto flex items-center gap-1">
          <button
            onClick={onPrevDay}
            disabled={!onPrevDay}
            className="flex h-[26px] w-[22px] cursor-pointer items-center justify-center rounded-[6px] border border-white/30 text-xs text-white hover:bg-white/10 disabled:cursor-default disabled:opacity-40"
            aria-label="Previous day"
          >
            ‹
          </button>

          <button
            onClick={() => setPickerOpen((value) => !value)}
            className="h-[26px] cursor-pointer rounded-[8px] border border-white/30 px-3 text-[11px] font-bold text-white hover:bg-white/10"
          >
            {dateLabel}
          </button>

          {pickerOpen && onPickDate && (
            <input
              type="date"
              defaultValue={dateIso}
              onChange={(event) => {
                onPickDate(event.target.value);
                setPickerOpen(false);
              }}
              className="absolute right-0 top-[30px] z-10 rounded-[6px] border border-gray-300 bg-white px-2 py-1 text-[11px] text-[#212121]"
            />
          )}

          <button
            onClick={onNextDay}
            disabled={!onNextDay}
            className="flex h-[26px] w-[22px] cursor-pointer items-center justify-center rounded-[6px] border border-white/30 text-xs text-white hover:bg-white/10 disabled:cursor-default disabled:opacity-40"
            aria-label="Next day"
          >
            ›
          </button>
        </div>
      </div>

      <div className="flex w-full flex-col gap-[10px] rounded-[20px] bg-[#f8f8f8] px-[32px] py-[20px] shadow-sm">
        <div className="flex w-full items-center gap-2">
          {phaseTabs.map((tab) => {
            const active = phaseTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handlePhaseClick(active ? null : tab.id)}
                className={`h-[30px] cursor-pointer rounded-full px-5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  active
                    ? "bg-[#212121] text-white"
                    : "bg-[#af292a] text-white hover:opacity-90"
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          <button
            onClick={() => handlePhaseClick(null)}
            className={`ml-auto h-[30px] cursor-pointer rounded-full px-5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              phaseTab === null
                ? "bg-[#212121] text-white"
                : "bg-[#af292a] text-white hover:opacity-90"
            }`}
          >
            {t("tab_all")}
          </button>
        </div>

        {isEmpty ? (
          <div className="py-8 text-center text-[12px] text-gray-400">
            {t("no_matches")}
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.tournamentId} className="flex flex-col">
              <div className="flex items-center gap-2 border-b-2 border-[#af292a]/30 px-2 py-[8px]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-300">
                  <Image
                    src={group.tournamentLogo || "/icons/question_mark.png"}
                    alt=""
                    width={16}
                    height={16}
                    unoptimized
                    className="object-contain"
                  />
                </div>

                <span className="truncate text-[13px] font-bold uppercase tracking-wider text-[#212121]">
                  {group.tournamentName}
                </span>

                {group.stage && (
                  <span className="text-[11px] text-gray-500">
                    · {group.stage}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                {group.matches.map((match) => (
                  <EsportsMatchRow
                    key={match.id}
                    match={match}
                    now={now}
                    selected={selectedMatchId === match.id}
                    onClick={() => {
                      const suffix = dateIso ? `?date=${dateIso}` : "";
                      router.push(`/esport/${gameSlug}/${match.id}${suffix}`);
                    }}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}