"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import EsportsScheduleColumn from "../_components/EsportsScheduleColumn";

type GridDotaSeries = {
  id: string;
  startTimeScheduled: string;
  liveState?: {
    teams?: {
      score?: number;
      kills?: number;
      deaths?: number;
    }[];
  };
  teams: {
    baseInfo: {
      id?: string;
      name: string;
    };
  }[];
  tournament: {
    id: string;
    name: string;
  } | null;
  format?: {
    id?: string;
    name?: string;
    nameShortened?: string;
  } | null;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateIsoLocal(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function parseDateIsoLocal(dateIso: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

function formatDateLabel(dateIso: string) {
  const date = parseDateIsoLocal(dateIso);

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(
    date.getFullYear()
  ).slice(2)}`;
}

function shiftDate(dateIso: string, days: number) {
  const date = parseDateIsoLocal(dateIso);
  date.setDate(date.getDate() + days);
  return toDateIsoLocal(date);
}

function mapToGroups(
  series: GridDotaSeries[],
  forcedStatus?: "live" | "past" | "upcoming"
) {
  type TournamentGroup = {
    tournamentId: string;
    tournamentName: string;
    matches: {
      id: string;
      time: string;
      startIso: string;
      homeTeam: string;
      awayTeam: string;
      homeScore: number | undefined;
      awayScore: number | undefined;
      status: "live" | "past" | "upcoming";
      format: string;
    }[];
  };
  const map: Record<string, TournamentGroup> = {};

  for (const s of series) {
    const tournament = s.tournament;
    if (!tournament) continue;

    if (!map[tournament.id]) {
      map[tournament.id] = {
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        matches: [],
      };
    }

    const date = new Date(s.startTimeScheduled);

    const status =
      forcedStatus ?? (date.getTime() > Date.now() ? "upcoming" : "past");

    map[tournament.id].matches.push({
      id: s.id,
      time:
        status === "live"
          ? "LIVE"
          : date.toLocaleTimeString("uk-UA", {
              hour: "2-digit",
              minute: "2-digit",
            }),
      startIso: s.startTimeScheduled,
      homeTeam: s.teams?.[0]?.baseInfo?.name ?? "TBD",
      awayTeam: s.teams?.[1]?.baseInfo?.name ?? "TBD",
      homeScore: s.liveState?.teams?.[0]?.score,
      awayScore: s.liveState?.teams?.[1]?.score,
      status,
      format: s.format?.nameShortened ?? s.format?.name ?? "BO3",
    });
  }

  return Object.values(map);
}

export default function DotaLayout({ children }: { children: ReactNode }) {
  const [groups, setGroups] = useState<ReturnType<typeof mapToGroups>>([]);
  const [dateIso, setDateIso] = useState(() => toDateIsoLocal(new Date()));
  const [phase, setPhase] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dateLabel = useMemo(() => formatDateLabel(dateIso), [dateIso]);

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const endpoint =
          phase === "live"
            ? "/api/grid/dota/live"
            : `/api/grid/dota/series?date=${dateIso}`;

        const res = await fetch(endpoint, {
          cache: "no-store",
        });

        if (!res.ok) {
          setGroups([]);
          return;
        }

        const data = await res.json();

        setGroups(
          mapToGroups(data.series ?? [], phase === "live" ? "live" : undefined)
        );
      } catch (error) {
        console.error(error);
        setGroups([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [dateIso, phase]);

  return (
    <div className="flex items-start justify-start gap-6">
      <div className="p-10">
        {loading ? (
          <div className="w-[560px] rounded-[20px] bg-[#f8f8f8] py-10 text-center text-sm text-gray-400">
            Завантаження...
          </div>
        ) : (
          <EsportsScheduleColumn
            groups={groups}
            dateIso={dateIso}
            dateLabel={dateLabel}
            onPhaseChangeAction={setPhase}
            onPrevDayAction={() => setDateIso((v) => shiftDate(v, -1))}
            onNextDayAction={() => setDateIso((v) => shiftDate(v, 1))}
            onPickDateAction={(iso) => setDateIso(iso)}
            gameSlug="dota"
          />
        )}
      </div>

      <div className="min-w-0 flex-1 p-5">
        <div className="min-h-[500px] w-full overflow-hidden rounded-[20px] border border-gray-200 bg-zinc-200 shadow-sm">
          {children}
        </div>
      </div>

      <div className="m-3 mt-6 max-h-[1000px] max-w-[280px] shrink-0">
        <img
          src="/banners/dota_promo.gif"
          alt="dota"
          className="h-auto w-full rounded-[20px]"
        />
      </div>
    </div>
  );
}