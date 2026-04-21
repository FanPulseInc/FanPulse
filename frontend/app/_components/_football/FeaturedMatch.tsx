"use client";
import Image from "next/image";

export interface MatchTeam {
    name: string;
    logoUrl?: string;
    score?: number;
    possession?: number; // e.g. 100
    accuracy?: number;   // e.g. 100 (percent)
}

export interface FeaturedMatchData {
    tournament: string;
    stage?: string;
    kickoff?: string;
    home: MatchTeam;
    away: MatchTeam;
    status?: "scheduled" | "live" | "finished";
    venue?: string;
}

function TeamCrest({ team }: { team: MatchTeam }) {
    return (
        <div className="w-[130px] h-[130px] flex items-center justify-center shrink-0">
            {team.logoUrl ? (
                <Image
                    src={team.logoUrl}
                    alt={team.name}
                    width={130}
                    height={130}
                    unoptimized
                    className="w-full h-full object-contain drop-shadow-md"
                />
            ) : (
                <span className="text-white font-bold text-2xl">
                    {team.name.slice(0, 2).toUpperCase()}
                </span>
            )}
        </div>
    );
}

/** "Brighton and Hove Albion" → "Brighton", "Athletic Bilbao" → "Athletic". */
function shortTeamName(name: string): string {
    return (name ?? "").trim().split(/\s+/)[0] ?? name;
}

function TeamLabel({ team }: { team: MatchTeam }) {
    return (
        <div className="h-[22px] flex flex-row justify-start items-center gap-1">
            <span className="text-white text-[12px] font-bold uppercase tracking-wider">
                {shortTeamName(team.name)}
            </span>
        </div>
    );
}

function StatPills({ team }: { team: MatchTeam }) {
    return (
        <div className="flex items-center gap-[4px]">
            <span className="bg-white text-[#af292a] text-[10px] font-bold rounded-[6px] px-2 h-[18px] flex items-center font-data">
                {team.possession ?? 100}
            </span>
            <span className="bg-white text-[#af292a] text-[10px] font-bold rounded-[6px] px-2 h-[18px] flex items-center font-data">
                {team.accuracy ?? 100}%
            </span>
        </div>
    );
}

export default function FeaturedMatch({ match }: { match: FeaturedMatchData }) {
    const kickoffDate = match.kickoff ? new Date(match.kickoff) : null;
    const dateLabel = kickoffDate
        ? kickoffDate.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" }) +
          " " +
          kickoffDate.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
        : "";

    const scoreLabel =
        match.status === "scheduled"
            ? "VS"
            : `${match.home.score ?? 0} - ${match.away.score ?? 0}`;

    return (
        <div className="w-full h-[237px] p-[20px] bg-[#af292a] rounded-[20px] flex flex-col justify-between items-center gap-[10px] shadow-lg">
            {/* Top: tournament */}
            <div className="w-full flex items-center justify-between">
                <span className="text-white font-bold text-sm uppercase tracking-wider mx-auto">
                    {match.tournament}
                </span>
                {match.status === "live" && (
                    <span className="absolute right-[30px] top-[22px] bg-white text-[#af292a] text-[10px] font-bold uppercase px-2 py-[2px] rounded-full">
                        Live
                    </span>
                )}
            </div>

            {/* Middle: crests + score */}
            <div className="w-full flex items-center justify-between px-2">
                <TeamCrest team={match.home} />

                <div className="flex flex-col items-center gap-0">
                    {dateLabel && (
                        <span className="text-white/80 text-[10px] uppercase tracking-wider font-data">
                            {dateLabel}
                        </span>
                    )}
                    <span className="text-white font-bold text-[42px] font-data leading-tight tracking-wider">
                        {scoreLabel}
                    </span>
                    {match.status === "live" && (
                        <span className="text-white font-bold text-[11px] uppercase">LIVE</span>
                    )}
                </div>

                <TeamCrest team={match.away} />
            </div>

            {/* Bottom row: team labels with stat pills, "Футбол" pill */}
            <div className="w-full flex items-end justify-between">
                <div className="flex flex-col gap-1">
                    <TeamLabel team={match.home} />
                    <StatPills team={match.home} />
                </div>

                {match.stage && (
                    <div className="bg-[#212121] rounded-full px-4 h-[24px] flex items-center">
                        <span className="text-white text-[11px] font-bold uppercase tracking-wider">
                            {match.stage}
                        </span>
                    </div>
                )}

                <div className="flex flex-col gap-1 items-end">
                    <TeamLabel team={match.away} />
                    <StatPills team={match.away} />
                </div>
            </div>
        </div>
    );
}
