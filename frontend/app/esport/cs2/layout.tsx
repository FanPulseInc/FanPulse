"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import EsportsScheduleColumn from "../_components/EsportsScheduleColumn";
import { useT } from "@/services/i18n/context";

type GridSeries = {
  id: string;
  startTimeScheduled: string;
  liveState?: {
    teams?: {
      score?: number;
    }[];
  };
  teams: {
    baseInfo: {
      name: string;
    };
  }[];
  tournament: {
    id: string;
    name: string;
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
  series: GridSeries[],
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
      format: "BO3",
    });
  }

  return Object.values(map);
}

export default function Cs2Layout({ children }: { children: ReactNode }) {
  const { t } = useT();
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
            ? "/api/grid/cs2/live"
            : `/api/grid/cs2/series?date=${dateIso}`;

        const res = await fetch(endpoint, {
          cache: "no-store",
        });

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
    <div className="flex gap-6 items-start justify-start">
      <div className="p-10">
        {loading ? (
          <div className="w-[560px] rounded-[20px] bg-[#f8f8f8] py-10 text-center text-sm text-gray-400">
            {t("loading")}
          </div>
        ) : (
          <EsportsScheduleColumn
            groups={groups}
            dateIso={dateIso}
            dateLabel={dateLabel}
            onPhaseChangeAction={setPhase}
            onPrevDayAction={() => setDateIso((value) => shiftDate(value, -1))}
            onNextDayAction={() => setDateIso((value) => shiftDate(value, 1))}
            onPickDateAction={(iso) => setDateIso(iso)}
            gameSlug="cs2"
          />
        )}
      </div>

      <div className="flex-1 min-w-0 p-5">
        <div className="w-full min-h-[500px] overflow-hidden rounded-[20px] bg-zinc-200 border border-gray-200 shadow-sm">
          {children}
        </div>
      </div>

      <div className="shrink-0 m-3 mt-6 max-w-[280px] max-h-[1000px]">
        <img
          src="/banners/cs2_promo.gif"
          alt="cs2"
          className="w-full  rounded-[20px] h-auto"
        />
      </div>
    </div>
  );
}