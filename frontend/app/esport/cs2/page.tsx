"use client";

import { useEffect, useState } from "react";
import EsportsScheduleColumn from "../_components/EsportsScheduleColumn";

type GridSeries = {
  id: string;
  startTimeScheduled: string;
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

function mapToGroups(series: GridSeries[]) {
  const map: Record<string, any> = {};

  for (const s of series) {
    const t = s.tournament;

    if (!t) continue;

    if (!map[t.id]) {
      map[t.id] = {
        tournamentId: t.id,
        tournamentName: t.name,
        matches: [],
      };
    }

    const date = new Date(s.startTimeScheduled);

    map[t.id].matches.push({
      id: s.id,
      time: date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      startIso: s.startTimeScheduled,
      homeTeam: s.teams?.[0]?.baseInfo?.name ?? "TBD",
      awayTeam: s.teams?.[1]?.baseInfo?.name ?? "TBD",
      status: date.getTime() > Date.now() ? "upcoming" : "past",
      format: "BO3",
    });
  }

  return Object.values(map);
}

export default function Cs2Page() {
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/grid/cs2/series");
      const data = await res.json();

      const mapped = mapToGroups(data.series ?? []);
      setGroups(mapped);
    }

    load();
  }, []);

  return (
    <div className="flex gap-6 items-start justify-start">
      {/* LEFT — matches */}
      <div className="p-10">
        <EsportsScheduleColumn groups={groups} />
      </div>

      {/* CENTER — placeholder */}
      <div className="flex-1 min-w-0">
        <div className="w-full h-[500px] bg-white rounded-[20px] border border-gray-200 shadow-sm flex items-center justify-center">
          <span className="text-gray-400 text-sm">
            Завантаження...
          </span>
        </div>
      </div>

      {/* RIGHT — banner */}
      <div className="shrink-0 max-w-[280px] max-h-[910px]">
        <img
          src="/banners/fanpulse_banner_v2.gif"
          alt="banner"
          className="w-full h-auto rounded-[20px]"
        />
      </div>
    </div>
  );
}