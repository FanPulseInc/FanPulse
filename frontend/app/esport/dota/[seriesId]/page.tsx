"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type GridPlayer = {
  id?: string;
  handle?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  nationality?: string | null;
};

type GridDotaSeries = {
  id: string;
  startTimeScheduled?: string;
  title?: {
    id: string;
    name: string;
  } | null;
  format?: {
    id?: string;
    name?: string;
    nameShortened?: string;
  } | null;
  teams?: Array<{
    baseInfo?: {
      id?: string;
      name: string;
    };
    players?: GridPlayer[];
  }>;
  tournament?: {
    id: string;
    name: string;
  } | null;
  state?: {
    startedAt: string | null;
    started: boolean;
    finished: boolean;
    teams: Array<{
      won: boolean;
      score: number;
      kills: number;
      deaths: number;
      players?: Array<{
        kills: number;
        deaths: number;
        assists?: number;
      }>;
    }>;
  } | null;
};

const mockHeroes = ["Carry", "Mid", "Offlane", "Support", "Hard Support"];

const mockStats = [
  ["WIN", "52%", "48%"],
  ["KILLS", "28", "24"],
  ["DEATHS", "18", "22"],
  ["GPM", "580", "545"],
  ["XPM", "710", "690"],
  ["TOWERS", "7", "5"],
  ["ROSHAN", "1", "0"],
];

export default function DotaMatchPage() {
  const params = useParams();
  const seriesId = params.seriesId as string;

  const [match, setMatch] = useState<GridDotaSeries | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seriesId) return;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch(`/api/grid/dota/series/${seriesId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setMatch(null);
          return;
        }

        const data = await res.json();
        setMatch(data);
      } catch (error) {
        console.error(error);
        setMatch(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [seriesId]);

  if (loading) {
    return (
      <main className="flex min-h-[500px] items-center justify-center bg-[#e9e9e9] text-sm font-black text-[#111111]">
        Завантаження...
      </main>
    );
  }

  if (!match) {
    return (
      <main className="flex min-h-[500px] items-center justify-center bg-[#e9e9e9] text-sm font-black text-[#111111]">
        Матч не знайдено
      </main>
    );
  }

  const teamAName = match.teams?.[0]?.baseInfo?.name ?? "Team Spirit";
  const teamBName = match.teams?.[1]?.baseInfo?.name ?? "Gaimin Gladiators";

  const tournamentName = match.tournament?.name ?? "Dota 2 Tournament";
  const formatName = match.format?.nameShortened ?? match.format?.name ?? "BO3";

  const teamAState = match.state?.teams?.[0];
  const teamBState = match.state?.teams?.[1];

  const scoreA = teamAState?.score ?? 0;
  const scoreB = teamBState?.score ?? 0;

  const killsA = teamAState?.kills ?? 28;
  const killsB = teamBState?.kills ?? 24;

  const deathsA = teamAState?.deaths ?? 18;
  const deathsB = teamBState?.deaths ?? 22;

  const isLive =
    match.state?.started === true && match.state?.finished === false;

  const isFinished = match.state?.finished === true;

  const statusLabel = isLive ? "LIVE" : isFinished ? "FINISHED" : "UPCOMING";

  const startTime = match.startTimeScheduled
    ? new Date(match.startTimeScheduled).toLocaleString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBA";

  const teamAPlayers =
    match.teams?.[0]?.players?.length
      ? match.teams[0].players.map((player, index) => {
          const fullName = [player.firstName, player.lastName]
            .filter(Boolean)
            .join(" ");

          return {
            id: player.id ?? `a-${index}`,
            name: player.handle ?? (fullName || "Player"),
            nationality: player.nationality ?? "—",
          };
        })
      : mockHeroes.map((name) => ({
          id: name,
          name,
          nationality: "—",
        }));

  const teamBPlayers =
    match.teams?.[1]?.players?.length
      ? match.teams[1].players.map((player, index) => {
          const fullName = [player.firstName, player.lastName]
            .filter(Boolean)
            .join(" ");

          return {
            id: player.id ?? `b-${index}`,
            name: player.handle ?? (fullName || "Player"),
            nationality: player.nationality ?? "—",
          };
        })
      : mockHeroes.map((name) => ({
          id: name,
          name,
          nationality: "—",
        }));

  const visibleTeamAPlayers = teamAPlayers.slice(0, 5);
  const visibleTeamBPlayers = teamBPlayers.slice(0, 5);

  return (
    <main className="min-h-[500px] w-full bg-[#e9e9e9] px-4 py-4 text-[#111111]">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-3">
        <section className="overflow-hidden rounded-[22px] bg-[#af292a] text-white shadow-[0_8px_20px_rgba(0,0,0,0.22)]">
          <div className="px-5 pb-5 pt-5 md:px-7 md:pb-6">
            <div className="mx-auto max-w-[620px] text-center text-[14px] font-black uppercase leading-tight tracking-[0.12em] opacity-90 md:text-[17px]">
              {tournamentName}
            </div>

            <div className="mt-6 grid grid-cols-[1fr_120px_1fr] items-center gap-3 md:grid-cols-[1fr_170px_1fr] md:gap-5">
              <div className="flex min-w-0 flex-col items-center text-center">
                <div className="flex h-[88px] w-[108px] items-center justify-center rounded-[18px] bg-white shadow-[0_6px_14px_rgba(0,0,0,0.2)] md:h-[112px] md:w-[136px]">
                  <Image
                    src="/icons/question_mark.png"
                    alt=""
                    width={54}
                    height={54}
                    unoptimized
                    className="object-contain md:h-[66px] md:w-[66px]"
                  />
                </div>

                <div className="mt-3 line-clamp-2 min-h-[38px] max-w-[150px] px-1 text-center text-[14px] font-black leading-[1.15] md:max-w-[190px] md:text-[17px]">
                  {teamAName}
                </div>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="text-[42px] font-black leading-none tracking-[-0.08em] md:text-[58px]">
                  {scoreA}-{scoreB}
                </div>

                <div className="mt-3 rounded-full bg-white px-5 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#af292a] shadow-md md:text-[13px]">
                  {statusLabel}
                </div>

                <div className="mt-3 text-[12px] font-black uppercase tracking-[0.12em] text-white/75 md:text-[14px]">
                  {formatName} · {startTime}
                </div>
              </div>

              <div className="flex min-w-0 flex-col items-center text-center">
                <div className="flex h-[88px] w-[108px] items-center justify-center rounded-[18px] bg-white shadow-[0_6px_14px_rgba(0,0,0,0.2)] md:h-[112px] md:w-[136px]">
                  <Image
                    src="/icons/question_mark.png"
                    alt=""
                    width={54}
                    height={54}
                    unoptimized
                    className="object-contain md:h-[66px] md:w-[66px]"
                  />
                </div>

                <div className="mt-3 line-clamp-2 min-h-[38px] max-w-[150px] px-1 text-center text-[14px] font-black leading-[1.15] md:max-w-[190px] md:text-[17px]">
                  {teamBName}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[14px] bg-[#111111] text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
          <div className="flex h-[48px] items-center justify-between px-4 md:h-[54px] md:px-5">
            <div className="flex items-center gap-2">
              <div className="rounded-[8px] bg-[#af292a] px-3 py-1.5 text-[12px] font-black md:text-[13px]">
                GAME 1
              </div>

              <div className="rounded-[8px] bg-white/15 px-3 py-1.5 text-[12px] font-black md:text-[13px]">
                {formatName}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[12px] font-black md:text-[13px]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#af292a]" />
              {startTime}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <section className="flex min-w-0 flex-col gap-2">
            <div className="flex h-[48px] items-center gap-3 rounded-[14px] bg-[#af292a] px-4 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              <span className="h-8 w-8 shrink-0 rounded-full bg-white" />
              <span className="line-clamp-1 text-[15px] font-black">
                {teamAName}
              </span>
            </div>

            <div className="rounded-[16px] bg-white px-3 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <div className="flex items-start justify-between gap-2">
                {visibleTeamAPlayers.map((player, index) => (
                  <div
                    key={player.id ?? `${player.name}-${index}`}
                    className="flex min-w-0 flex-1 flex-col items-center text-center"
                  >
                    <div className="flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full border-[3px] border-[#af292a] bg-[#2b3c44] md:h-[56px] md:w-[56px]">
                      <Image
                        src="/icons/question_mark.png"
                        alt=""
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </div>

                    <div className="mt-1 max-w-full truncate text-[11px] font-black md:text-[12px]">
                      {player.name}
                    </div>

                    <div className="max-w-full truncate text-[9px] font-bold text-[#888888]">
                      {player.nationality}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 overflow-hidden rounded-[12px] bg-[#111111] text-white">
                <div className="flex">
                  {visibleTeamAPlayers.map((_, index) => {
                    const player = teamAState?.players?.[index];

                    return (
                      <div
                        key={index}
                        className="flex flex-1 flex-col border-l border-[#333333] px-1.5 py-2.5 text-center first:border-l-0"
                      >
                        <div className="flex justify-around text-[12px] font-black md:text-[13px]">
                          <span>{player?.kills ?? Math.round(killsA / 5)}</span>
                          <span>{player?.assists ?? 0}</span>
                          <span>{player?.deaths ?? Math.round(deathsA / 5)}</span>
                        </div>

                        <div className="mt-1 flex justify-around text-[8px] font-bold text-[#999999]">
                          <span>K</span>
                          <span>A</span>
                          <span>D</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="flex min-w-0 flex-col gap-2">
            <div className="flex h-[48px] items-center gap-3 rounded-[14px] bg-[#af292a] px-4 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              <span className="h-8 w-8 shrink-0 rounded-full bg-white" />
              <span className="line-clamp-1 text-[15px] font-black">
                {teamBName}
              </span>
            </div>

            <div className="rounded-[16px] bg-white px-3 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <div className="flex items-start justify-between gap-2">
                {visibleTeamBPlayers.map((player, index) => (
                  <div
                    key={player.id ?? `${player.name}-${index}`}
                    className="flex min-w-0 flex-1 flex-col items-center text-center"
                  >
                    <div className="flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full border-[3px] border-[#af292a] bg-[#2b3c44] md:h-[56px] md:w-[56px]">
                      <Image
                        src="/icons/question_mark.png"
                        alt=""
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </div>

                    <div className="mt-1 max-w-full truncate text-[11px] font-black md:text-[12px]">
                      {player.name}
                    </div>

                    <div className="max-w-full truncate text-[9px] font-bold text-[#888888]">
                      {player.nationality}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 overflow-hidden rounded-[12px] bg-[#111111] text-white">
                <div className="flex">
                  {visibleTeamBPlayers.map((_, index) => {
                    const player = teamBState?.players?.[index];

                    return (
                      <div
                        key={index}
                        className="flex flex-1 flex-col border-l border-[#333333] px-1.5 py-2.5 text-center first:border-l-0"
                      >
                        <div className="flex justify-around text-[12px] font-black md:text-[13px]">
                          <span>{player?.kills ?? Math.round(killsB / 5)}</span>
                          <span>{player?.assists ?? 0}</span>
                          <span>{player?.deaths ?? Math.round(deathsB / 5)}</span>
                        </div>

                        <div className="mt-1 flex justify-around text-[8px] font-bold text-[#999999]">
                          <span>K</span>
                          <span>A</span>
                          <span>D</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-[16px] bg-white px-4 pb-5 pt-4 shadow-[0_4px_12px_rgba(0,0,0,0.12)] md:px-5">
          <div className="mb-4 text-center text-[15px] font-black uppercase tracking-[0.14em] md:text-[17px]">
            Статистика
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            {mockStats.map(([label, left, right], index) => (
              <div
                key={label}
                className="grid grid-cols-[55px_1fr_55px] items-center gap-2 text-center md:grid-cols-[70px_1fr_70px]"
              >
                <div className="text-[14px] font-black text-[#af292a] md:text-[16px]">
                  {index === 0 ? scoreA : left}
                </div>

                <div className="min-w-0 text-[10px] font-black uppercase leading-tight text-[#111111] md:text-[12px]">
                  {label}
                </div>

                <div className="text-[14px] font-black text-[#af292a] md:text-[16px]">
                  {index === 0 ? scoreB : right}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}