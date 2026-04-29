"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

function relativeKickoff(startIso: string | undefined, now: number): string | null {
  if (!startIso) return null;

  const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(startIso)
    ? startIso
    : `${startIso}Z`;

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

  return `за ${Math.floor(hr / 24)} дн`;
}

function applyFilter(
  matches: EsportsMatch[],
  topTab: string,
  phaseTab: string | null
): EsportsMatch[] {
  return matches.filter(
    (match) =>
      (topTab !== "fav" || match.favorite) &&
      (!phaseTab || match.status === phaseTab)
  );
}

function TeamLine({
  name,
  logo,
}: {
  name: string;
  logo?: string;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {logo ? (
        <Image
          src={logo}
          alt=""
          width={24}
          height={24}
          unoptimized
          className="w-6 h-6 object-contain shrink-0"
        />
      ) : (
        <span className="w-5 h-5 rounded-full bg-gray-300 shrink-0" />
      )}

      <span className="text-[13px] text-[#212121] truncate">
        {name}
      </span>
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
  const isUpcoming = match.status === "upcoming";
  const countdown = isUpcoming ? relativeKickoff(match.startIso, now) : null;

  return (
    <div
      onClick={onClick}
      className={`grid grid-cols-[54px_1fr_70px_28px] items-center gap-2 h-[60px] px-2 rounded-[8px] cursor-pointer transition-colors border-b border-gray-200 last:border-none ${
        selected ? "bg-[#af292a]/10" : "hover:bg-white"
      }`}
    >
      <span className="text-[#af292a] text-[14px] font-bold font-data">
        {match.time}
      </span>

      <div className="flex flex-col gap-[2px] min-w-0">
        <TeamLine name={match.homeTeam} logo={match.homeLogo} />
        <TeamLine name={match.awayTeam} logo={match.awayLogo} />
      </div>

      <div className="flex flex-col items-end justify-center min-w-0">
        {isUpcoming ? (
          <>
            {match.format && (
              <span className="text-[10px] font-bold text-[#212121] whitespace-nowrap">
                {match.format}
              </span>
            )}

            {countdown ? (
              <span className="text-[10px] font-semibold text-gray-500 whitespace-nowrap">
                {countdown}
              </span>
            ) : (
              <span className="text-[12px] font-bold text-gray-400 font-data">
                –
              </span>
            )}
          </>
        ) : (
          <>
            <span className="text-[14px] font-bold text-[#af292a] font-data leading-tight">
              {match.homeScore ?? "–"}
            </span>
            <span className="text-[14px] font-bold text-[#af292a] font-data leading-tight">
              {match.awayScore ?? "–"}
            </span>
          </>
        )}
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
        }}
        className={`text-xl leading-none ${
          match.favorite
            ? "text-[#af292a]"
            : "text-gray-300 hover:text-[#af292a]"
        } transition-colors cursor-pointer`}
        aria-label="Favorite"
      >
        ☆
      </button>
    </div>
  );
}

export default function EsportsScheduleColumn({
  groups,
  dateLabel = "29.04.26",
  selectedMatchId,
  onPrevDay,
  onNextDay,
  onPickDate,
  dateIso,
}: {
  groups?: EsportsTournamentGroup[];
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
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const safeGroups = groups ?? [];

  const filteredGroups = safeGroups
    .map((group) => ({
      ...group,
      matches: applyFilter(group.matches, topTab, phaseTab),
    }))
    .filter((group) => group.matches.length > 0);

  const isEmpty = filteredGroups.length === 0;

  return (
    <div className="w-[560px] flex flex-col gap-[10px]">
      <div className="w-full h-[40px] bg-[#212121] rounded-[14px] flex flex-row justify-center items-center gap-[10px] px-3">
        {topTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTopTab(tab.id)}
            className={`h-[26px] px-4 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              topTab === tab.id
                ? "bg-[#af292a] text-white"
                : "text-white/80 hover:text-white"
            }`}
          >
            {tab.label}
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
            onClick={() => setPickerOpen((value) => !value)}
            className="h-[26px] px-3 rounded-[8px] border border-white/30 text-white text-[11px] font-bold hover:bg-white/10 cursor-pointer"
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

      <div className="w-full bg-[#f8f8f8] rounded-[20px] pt-[20px] pr-[32px] pb-[20px] pl-[32px] flex flex-col gap-[10px] shadow-sm">
        <div className="w-full flex items-center gap-2">
          {phaseTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setPhaseTab(phaseTab === tab.id ? null : tab.id)
              }
              className={`h-[30px] px-5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                phaseTab === tab.id
                  ? "bg-[#212121] text-white"
                  : "bg-[#af292a] text-white hover:opacity-90"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={() => setPhaseTab(null)}
            className={`ml-auto h-[30px] px-5 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              phaseTab === null
                ? "bg-[#212121] text-white"
                : "bg-[#af292a] text-white hover:opacity-90"
            }`}
          >
            Все
          </button>
        </div>

        {isEmpty && (
          <div className="text-center text-gray-400 text-[12px] py-8">
            Немає матчів
          </div>
        )}

        {filteredGroups.map((group) => (
          <div key={group.tournamentId} className="flex flex-col">
            <div className="flex items-center gap-2 px-2 py-[8px] border-b-2 border-[#af292a]/30">
              {group.tournamentLogo ? (
                <Image
                  src={group.tournamentLogo}
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <span className="w-8 h-8 rounded-full bg-gray-300" />
              )}

              <span className="text-[13px] font-bold uppercase tracking-wider text-[#212121] truncate">
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
                    router.push(`/esport/cs2/${match.id}${suffix}`);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}