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

  if (loading) return <PageState text="Завантаження..." />;
  if (!match) return <PageState text="Матч не знайдено" />;

  const teamAName = match.teams?.[0]?.baseInfo?.name ?? "TBA";
  const teamBName = match.teams?.[1]?.baseInfo?.name ?? "TBA";

  const tournamentName = match.tournament?.name ?? "Tournament";
  const gameName = match.title?.name ?? "Counter-Strike";
  const formatName = match.format?.nameShortened ?? match.format?.name ?? "BO3";

  const teamAState = match.state?.teams?.[0];
  const teamBState = match.state?.teams?.[1];

  const scoreA = teamAState?.score ?? 0;
  const scoreB = teamBState?.score ?? 0;

  const killsA = teamAState?.kills ?? "-";
  const killsB = teamBState?.kills ?? "-";

  const deathsA = teamAState?.deaths ?? "-";
  const deathsB = teamBState?.deaths ?? "-";

  const isLive = match.state?.started === true && match.state?.finished === false;
  const isFinished = match.state?.finished === true;

  const statusLabel = isLive
    ? "LIVE"
    : isFinished
      ? "Завершено"
      : "Майбутній";

  const startTime = match.startTimeScheduled
    ? new Date(match.startTimeScheduled).toLocaleString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "TBA";

  return (
    <main className="min-h-[500px] bg-[#f3f3f3] px-5 py-6">
      <div className="mx-auto max-w-[780px] space-y-5">
        <section className="overflow-hidden rounded-xl bg-brand-red text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
          <div className="px-7 py-6">
            <div className="text-center">


              <h1 className="mt-2 text-[18px] font-black leading-tight">
                {tournamentName}
              </h1>
            </div>

            <div className="mt-8 flex p-8 justify-center items-center gap-5">
              <TeamCard name={teamAName} winner={teamAState?.won} />

              <div className="text-center">
                <div className="flex items-center justify-center gap-6 font-black tracking-tighter text-white">
                  {/* Число А */}
                  <span className="text-[120px] leading-none drop-shadow-2xl">
                    {scoreA}
                  </span>

                  {/* Стилизованный разделитель */}
                  <div className="flex flex-col gap-2 opacity-30">
                    <div className="h-3 w-3 rounded-full bg-current" />
                    <div className="h-3 w-3 rounded-full bg-current" />
                  </div>

                  {/* Число B */}
                  <span className="text-[120px] leading-none drop-shadow-2xl">
                    {scoreB}
                  </span>
                </div>

                {/* Статус LIVE / Finished */}
                <div
                  className={`mx-auto mt-6 w-fit rounded-full px-6 py-2 text-[13px] font-black uppercase tracking-widest shadow-lg transition-all ${isLive
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-white/10 text-white/90 backdrop-blur-md"
                    }`}
                >
                  {statusLabel}
                </div>

                <div className="mt-4 text-[14px] font-bold text-white/50 uppercase tracking-widest">
                  {formatName} <span className="mx-2 text-white/20">|</span> {startTime}
                </div>
              </div>


              <TeamCard name={teamBName} winner={teamBState?.won} />
            </div>
          </div>

          <div className="bg-[#202020] px-7 py-4">
            <div className="grid grid-cols-2 text-center text-[12px] font-bold text-white/80">
              <div>Series ID</div>

              <div>Status</div>
            </div>

            <div className="mt-2 grid grid-cols-2 text-center text-[13px] font-black">
              <div>{match.id}</div>

              <div>{statusLabel}</div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-5">
          <StatsCard
            teamName={teamAName}
            score={scoreA}
            kills={killsA}
            deaths={deathsA}
            players={teamAState?.players}
          />

          <StatsCard
            teamName={teamBName}
            score={scoreB}
            kills={killsB}
            deaths={deathsB}
            players={teamBState?.players}
          />
        </section>

        <section className="rounded-[22px] bg-white p-5 shadow-sm">

          <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
            <InfoRow label="Tournament" value={tournamentName} />
            <InfoRow label="Game" value={gameName} />
            <InfoRow label="Format" value={formatName} />
            <InfoRow label="Scheduled" value={startTime} />

          </div>
        </section>
      </div>
    </main>
  );
}

function PageState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[500px] items-center justify-center bg-[#f3f3f3] text-sm font-bold text-[#202020]">
      {text}
    </div>
  );
}

function TeamCard({
  name,
  winner,
}: {
  name: string;
  winner?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-[78px] w-[100px] items-center justify-center overflow-hidden rounded-xl bg-white/20 ring-2 ring-white/25">
        <Image
          src="/icons/question_mark.png"
          alt=""
          width={34}
          height={34}
          unoptimized
          className="object-contain"
        />
      </div>

      <div className="mt-4 max-w-[180px] text-[16px] font-black leading-tight">
        {name}
      </div>

      {winner !== undefined && (
        <div className="mt-2 rounded-full bg-black/25 px-3 py-1 text-[10px] font-black uppercase">
          {winner ? "Winner" : "Team"}
        </div>
      )}
    </div>
  );
}

function StatsCard({
  teamName,
  score,
  kills,
  deaths,
  players,
}: {
  teamName: string;
  score: number;
  kills: number | string;
  deaths: number | string;
  players?: Array<{
    kills: number;
    deaths: number;
  }>;
}) {
  return (
    <section className="rounded-[22px] bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
          <Image
            src="/icons/question_mark.png"
            alt=""
            width={18}
            height={18}
            unoptimized
          />
        </div>

        <div className="min-w-0">
          <div className="truncate text-[14px] font-black text-[#202020]">
            {teamName}
          </div>
          <div className="text-[11px] font-bold text-gray-400">Team stats</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <MiniStat label="Score" value={score} />
        <MiniStat label="Kills" value={kills} />
        <MiniStat label="Deaths" value={deaths} />
      </div>

      <div className="mt-5">
        <div className="mb-2 text-[11px] font-black uppercase text-gray-400">
          Players
        </div>

        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const player = players?.[index];

            return (
              <div
                key={index}
                className="rounded-[12px] bg-[#202020] px-2 py-3 text-center text-white"
              >
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                  <Image
                    src="/icons/question_mark.png"
                    alt=""
                    width={14}
                    height={14}
                    unoptimized
                  />
                </div>

                <div className="mt-2 text-[9px] font-bold text-white/60">
                  P{index + 1}
                </div>

                <div className="mt-2 grid grid-cols-2 text-[9px] font-black">
                  <span>{player?.kills ?? "-"}</span>
                  <span>{player?.deaths ?? "-"}</span>
                </div>

                <div className="mt-1 grid grid-cols-2 text-[7px] text-white/40">
                  <span>K</span>
                  <span>D</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[14px] bg-[#f1f1f1] px-3 py-3 text-center">
      <div className="text-[18px] font-black text-brand-red">{value}</div>
      <div className="mt-1 text-[10px] font-bold uppercase text-gray-500">
        {label}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-[#f3f3f3] px-4 py-3">
      <div className="text-[10px] font-black uppercase tracking-wide text-gray-400">
        {label}
      </div>
      <div className="mt-1 truncate text-[13px] font-bold text-[#202020]">
        {value}
      </div>
    </div>
  );
}