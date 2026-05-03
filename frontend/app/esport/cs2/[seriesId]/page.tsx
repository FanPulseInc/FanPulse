"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type GridSeries = {
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
      }>;
    }>;
  } | null;
};

const mockMaps = ["DUST II", "MIRAGE", "INFERNO", "TBA", "TBA", "TBA", "TBA"];
const mockPlayers = ["s1mple", "b1t", "iM", "Aleksib", "jL"];

const mockStats = [
  ["WIN", "19%", "14%"],
  ["KILLS PER ROUND", "1.11", "1.17"],
  ["TEAM RATING", "1.17", "1.11"],
  ["KAST", "72%", "77%"],
  ["MATCH WIN RATE", "13%", "11%"],
  ["FIRST KILL", "11%", "11%"],
  ["WIN PISTOL", "17%", "11%"],
];

export default function Cs2MatchPage() {
  const params = useParams();
  const seriesId = params.seriesId as string;

  const [match, setMatch] = useState<GridSeries | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seriesId) return;

    async function load() {
      try {
        setLoading(true);

        const res = await fetch(`/api/grid/cs2/series/${seriesId}`, {
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
      <div className="flex min-h-[500px] items-center justify-center bg-[#e9e9e9] text-sm font-black text-[#111111]">
        Завантаження...
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-[#e9e9e9] text-sm font-black text-[#111111]">
        Матч не знайдено
      </div>
    );
  }

  const teamAName = match.teams?.[0]?.baseInfo?.name ?? "Natus Vincere";
  const teamBName = match.teams?.[1]?.baseInfo?.name ?? "Team Spirit";

  const tournamentName = match.tournament?.name ?? "ProLeague";
  const formatName = match.format?.nameShortened ?? match.format?.name ?? "BO3";

  const teamAState = match.state?.teams?.[0];
  const teamBState = match.state?.teams?.[1];

  const scoreA = teamAState?.score ?? 0;
  const scoreB = teamBState?.score ?? 0;

  const killsA = teamAState?.kills ?? 58;
  const killsB = teamBState?.kills ?? 51;

  const deathsA = teamAState?.deaths ?? 51;
  const deathsB = teamBState?.deaths ?? 58;

  const isLive =
    match.state?.started === true && match.state?.finished === false;

  const isFinished = match.state?.finished === true;

  const statusLabel = isLive ? "LIVE" : isFinished ? "FINISHED" : "UPCOMING";

  const startTime = match.startTimeScheduled
    ? new Date(match.startTimeScheduled).toLocaleString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "23:14";

  return (
    <main className="min-h-[500px] w-full bg-[#e9e9e9] px-4 py-4 text-[#111111]">
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-3">
        <section className="overflow-hidden rounded-[22px] bg-[#bf262b] text-white shadow-[0_8px_20px_rgba(0,0,0,0.22)]">
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

                <div className="mt-3 rounded-full bg-white px-5 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#bf262b] shadow-md md:text-[13px]">
                  {statusLabel}
                </div>

                <div className="mt-3 text-[12px] font-black uppercase tracking-[0.12em] text-white/75 md:text-[14px]">
                  {formatName}
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
              <div className="rounded-[8px] bg-[#ed1c24] px-3 py-1.5 text-[12px] font-black md:text-[13px]">
                MAP 1
              </div>

              <div className="rounded-[8px] bg-white/15 px-3 py-1.5 text-[12px] font-black md:text-[13px]">
                {formatName}
              </div>
            </div>

            <div className="flex items-center gap-2 text-[12px] font-black md:text-[13px]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ed1c24]" />
              {startTime}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[16px] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.13)]">
          <div className="bg-[#111111] py-3 text-center text-[14px] font-black uppercase tracking-[0.14em] text-white md:text-[15px]">
            Map pool
          </div>

          <div className="flex flex-col">
            {mockMaps.map((map, index) => (
              <div
                key={`${map}-${index}`}
                className="flex h-[38px] items-center justify-center border-t border-[#eeeeee] text-[13px] font-black uppercase text-[#ed1c24] md:h-[44px] md:text-[15px]"
              >
                {map}
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <section className="flex min-w-0 flex-col gap-2">
            <div className="flex h-[48px] items-center gap-3 rounded-[14px] bg-[#bf262b] px-4 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              <span className="h-8 w-8 shrink-0 rounded-full bg-white" />
              <span className="line-clamp-1 text-[15px] font-black">
                {teamAName}
              </span>
            </div>

            <div className="rounded-[16px] bg-white px-3 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <div className="flex items-start justify-between gap-2">
                {mockPlayers.map((name, index) => (
                  <div
                    key={index}
                    className="flex min-w-0 flex-1 flex-col items-center text-center"
                  >
                    <div className="flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full border-[3px] border-[#bf262b] bg-[#2b3c44] md:h-[56px] md:w-[56px]">
                      <Image
                        src="/icons/question_mark.png"
                        alt=""
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </div>

                    <div className="mt-1 max-w-full truncate text-[11px] font-black md:text-[12px]">
                      {name}
                    </div>

                    <div className="text-[9px] font-bold text-[#888888]">
                      Україна
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 overflow-hidden rounded-[12px] bg-[#111111] text-white">
                <div className="flex">
                  {mockPlayers.map((_, index) => {
                    const player = teamAState?.players?.[index];

                    const kills =
                      player?.kills ??
                      Math.max(0, Math.round(killsA / 5) + index - 2);

                    const deaths =
                      player?.deaths ??
                      Math.max(0, Math.round(deathsA / 5) + 2 - index);

                    return (
                      <div
                        key={index}
                        className="flex flex-1 flex-col border-l border-[#333333] px-1.5 py-2.5 text-center first:border-l-0"
                      >
                        <div className="flex justify-around text-[12px] font-black md:text-[13px]">
                          <span>{kills}</span>
                          <span>2</span>
                          <span>{deaths}</span>
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
            <div className="flex h-[48px] items-center gap-3 rounded-[14px] bg-[#bf262b] px-4 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              <span className="h-8 w-8 shrink-0 rounded-full bg-white" />
              <span className="line-clamp-1 text-[15px] font-black">
                {teamBName}
              </span>
            </div>

            <div className="rounded-[16px] bg-white px-3 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
              <div className="flex items-start justify-between gap-2">
                {mockPlayers.map((name, index) => (
                  <div
                    key={index}
                    className="flex min-w-0 flex-1 flex-col items-center text-center"
                  >
                    <div className="flex h-[48px] w-[48px] items-center justify-center overflow-hidden rounded-full border-[3px] border-[#bf262b] bg-[#2b3c44] md:h-[56px] md:w-[56px]">
                      <Image
                        src="/icons/question_mark.png"
                        alt=""
                        width={24}
                        height={24}
                        unoptimized
                      />
                    </div>

                    <div className="mt-1 max-w-full truncate text-[11px] font-black md:text-[12px]">
                      {name}
                    </div>

                    <div className="text-[9px] font-bold text-[#888888]">
                      Україна
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 overflow-hidden rounded-[12px] bg-[#111111] text-white">
                <div className="flex">
                  {mockPlayers.map((_, index) => {
                    const player = teamBState?.players?.[index];

                    const kills =
                      player?.kills ??
                      Math.max(0, Math.round(killsB / 5) + index - 2);

                    const deaths =
                      player?.deaths ??
                      Math.max(0, Math.round(deathsB / 5) + 2 - index);

                    return (
                      <div
                        key={index}
                        className="flex flex-1 flex-col border-l border-[#333333] px-1.5 py-2.5 text-center first:border-l-0"
                      >
                        <div className="flex justify-around text-[12px] font-black md:text-[13px]">
                          <span>{kills}</span>
                          <span>2</span>
                          <span>{deaths}</span>
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

          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex w-[78px] shrink-0 flex-col items-center text-center md:w-[95px]">
              <div className="flex h-[110px] w-[68px] items-center justify-center overflow-hidden rounded-[12px] bg-[#111111] md:h-[130px] md:w-[80px]">
                <Image
                  src="/icons/question_mark.png"
                  alt=""
                  width={34}
                  height={34}
                  unoptimized
                />
              </div>

              <div className="mt-2 line-clamp-2 max-w-full text-[10px] font-black leading-tight md:text-[12px]">
                {teamAName}
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              {mockStats.map(([label, left, right], index) => (
                <div
                  key={label}
                  className="grid grid-cols-[48px_1fr_48px] items-center gap-2 text-center md:grid-cols-[60px_1fr_60px]"
                >
                  <div className="text-[14px] font-black text-[#ed1c24] md:text-[16px]">
                    {index === 0 ? scoreA : left}
                  </div>

                  <div className="min-w-0 text-[10px] font-black uppercase leading-tight text-[#111111] md:text-[12px]">
                    {label}
                  </div>

                  <div className="text-[14px] font-black text-[#ed1c24] md:text-[16px]">
                    {index === 0 ? scoreB : right}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex w-[78px] shrink-0 flex-col items-center text-center md:w-[95px]">
              <div className="flex h-[110px] w-[68px] items-center justify-center overflow-hidden rounded-[12px] bg-[#111111] md:h-[130px] md:w-[80px]">
                <Image
                  src="/icons/question_mark.png"
                  alt=""
                  width={34}
                  height={34}
                  unoptimized
                />
              </div>

              <div className="mt-2 line-clamp-2 max-w-full text-[10px] font-black leading-tight md:text-[12px]">
                {teamBName}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[16px] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.12)] md:p-5">
          <div className="mb-4 text-center text-[15px] font-black text-[#bf262b] md:text-[17px]">
            Matches, past 3 months
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2 text-[13px] font-black text-[#ed1c24]">
                <span className="h-4 w-4 shrink-0 rounded-full bg-[#f1d4d4]" />
                <span className="line-clamp-1">{teamAName}</span>
              </div>

              <div className="flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-[12px] font-bold"
                  >
                    <span className="min-w-0 flex-1 truncate text-[#666666]">
                      Команда {index + 1}
                    </span>
                    <span className="shrink-0 font-black text-[#111111]">
                      8:0
                    </span>
                    <span className="shrink-0 rounded-full bg-[#bf262b] px-2.5 py-1 text-[9px] font-black text-white">
                      BO3
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2 text-[13px] font-black text-[#ed1c24]">
                <span className="h-4 w-4 shrink-0 rounded-full bg-[#f1d4d4]" />
                <span className="line-clamp-1">{teamBName}</span>
              </div>

              <div className="flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-[12px] font-bold"
                  >
                    <span className="min-w-0 flex-1 truncate text-[#666666]">
                      Команда {index + 1}
                    </span>
                    <span className="shrink-0 font-black text-[#111111]">
                      8:0
                    </span>
                    <span className="shrink-0 rounded-full bg-[#bf262b] px-2.5 py-1 text-[9px] font-black text-white">
                      BO3
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}