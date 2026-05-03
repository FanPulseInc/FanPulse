"use client";
import Image from "next/image";
import type { Scorer } from "@/services/sportsdb/adapters";
import { Icon } from "./Icon";

export interface MatchTeam {
    name: string;
    logoUrl?: string;
    score?: number;
    possession?: number; 
    accuracy?: number;   
}

export interface FeaturedMatchData {
    tournament: string;
    stage?: string;
    kickoff?: string;
    home: MatchTeam;
    away: MatchTeam;
    status?: "scheduled" | "live" | "finished";
    
    elapsed?: string;
    venue?: string;
}

function TeamCrest({ team }: { team: MatchTeam }) {
    return (
        <div className="w-[80px] h-[80px] sm:w-[110px] sm:h-[110px] flex items-center justify-center shrink-0">
            {team.logoUrl ? (
                <Image
                    src={team.logoUrl}
                    alt={team.name}
                    width={110}
                    height={110}
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


function shortTeamName(name: string): string {
    return (name ?? "").trim().split(/\s+/)[0] ?? name;
}

function TeamLabel({ team }: { team: MatchTeam }) {
    return (
        <div className="h-[22px] flex flex-row justify-center items-center gap-1">
            <span className="text-white text-[12px] font-bold uppercase tracking-wider">
                {shortTeamName(team.name)}
            </span>
        </div>
    );
}

function HeaderScorerLine({
    scorer,
    side,
}: {
    scorer: Scorer;
    side: "home" | "away";
}) {
    const tag = scorer.ownGoal ? "OG" : scorer.penalty ? "PEN" : null;
    const rowJustify = side === "home" ? "justify-end" : "justify-start";
    const orderIcon = side === "home" ? "order-2" : "order-1";
    const orderText = side === "home" ? "order-1" : "order-2";
    return (
        <div className={`flex items-center gap-[6px] ${rowJustify}`}>
            <div className={`flex items-baseline gap-[5px] ${orderText}`}>
                <span className="text-[12px] font-semibold text-white truncate">
                    {scorer.name}
                </span>
                {tag && (
                    <span className="text-[9px] font-bold text-white/85 uppercase tracking-wider">
                        ({tag})
                    </span>
                )}
                {scorer.minute && (
                    <span className="text-[11px] font-bold text-white font-data">
                        {scorer.minute}
                    </span>
                )}
            </div>
            
            <span className={`inline-flex items-center ${orderIcon}`}>
                <Icon name={scorer.ownGoal ? "REDBALL" : "WHITEBALL"} size={14} />
            </span>
        </div>
    );
}

export interface MotorsportHero {
    competitionName: string;
    raceName: string;
    competitionLogo?: string;
    stageLabel?: string;
    countryFlag?: string;
}

export default function FeaturedMatch({
    match,
    homeScorers = [],
    awayScorers = [],
    footerSlot,
    motorsportHero,
}: {
    match: FeaturedMatchData;
    homeScorers?: Scorer[];
    awayScorers?: Scorer[];
    footerSlot?: React.ReactNode;
    motorsportHero?: MotorsportHero;
}) {
    if (motorsportHero) {
        const hasFooter = !!footerSlot;
        const isFlagUrl = !!motorsportHero.countryFlag && motorsportHero.countryFlag.startsWith("http");
        return (
            <div className={`relative w-full ${hasFooter ? "min-h-[237px] pb-[48px]" : "min-h-[200px] pb-[40px]"} p-[20px] bg-[#af292a] rounded-[20px] flex flex-col items-center gap-3 shadow-lg`}>
                <div className="w-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm uppercase tracking-wider">
                        {motorsportHero.competitionName}
                    </span>
                </div>

                <div className="w-full flex-1 flex items-center justify-center px-2">
                    <div className="relative w-full max-w-[420px] mx-auto bg-[#212121] rounded-[24px] pl-[80px] pr-5 py-4 flex flex-col items-center gap-1 shadow-md">
                        <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-[88px] h-[88px] rounded-full bg-white flex items-center justify-center overflow-hidden shadow-md ring-2 ring-[#af292a]">
                            {motorsportHero.countryFlag ? (
                                isFlagUrl ? (
                                    <Image
                                        src={motorsportHero.countryFlag}
                                        alt=""
                                        width={88}
                                        height={88}
                                        unoptimized
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-[44px] leading-none">{motorsportHero.countryFlag}</span>
                                )
                            ) : motorsportHero.competitionLogo ? (
                                <Image
                                    src={motorsportHero.competitionLogo}
                                    alt=""
                                    width={88}
                                    height={88}
                                    unoptimized
                                    className="w-full h-full object-contain p-1"
                                />
                            ) : null}
                        </div>
                        <span
                            className="text-white text-[18px] sm:text-[22px] font-bold leading-tight text-center truncate w-full"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                            {motorsportHero.raceName}
                        </span>
                        {motorsportHero.stageLabel && (
                            <span className="text-white/80 text-[12px] font-bold uppercase tracking-wider">
                                {motorsportHero.stageLabel}
                            </span>
                        )}
                    </div>
                </div>

                {footerSlot && (
                    <div className="w-full" onClick={(e) => e.stopPropagation()}>
                        {footerSlot}
                    </div>
                )}

                {match.stage && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#212121] rounded-t-[26px] px-5 min-w-[140px] h-[28px] flex items-center justify-center whitespace-nowrap">
                        <span
                            className="text-[13px] sm:text-[15px] font-bold leading-none tracking-normal text-center text-[#f8f8f8]"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                            {match.stage}
                        </span>
                    </div>
                )}
            </div>
        );
    }

    const hasScorers = homeScorers.length > 0 || awayScorers.length > 0;
    const hasFooter = !!footerSlot;
    const kickoffDate = match.kickoff ? new Date(match.kickoff) : null;
    const dateLabel = kickoffDate
        ? kickoffDate.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit" }) +
          " " +
          kickoffDate.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
        : "";

    const scoreLabel =
        match.status === "scheduled"
            ? "VS"
            : `${match.home.score ?? 0} ‑ ${match.away.score ?? 0}`;

    return (
        <div className={`relative w-full ${hasScorers || hasFooter ? "min-h-[237px] pb-[48px]" : "h-[237px]"} p-[20px] bg-[#af292a] rounded-[20px] flex flex-col justify-between items-center gap-[10px] shadow-lg`}>
            
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

            
            <div className="w-full flex items-center justify-between px-2">
                <TeamCrest team={match.home} />

                <div className="flex flex-col items-center gap-0">
                    <span
                        className="text-[28px] sm:text-[36px] leading-[26px] sm:leading-[30px] tracking-[-0.08em] text-center text-[#f8f8f8]"
                        style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 500 }}
                    >
                        {scoreLabel}
                    </span>
                </div>

                <TeamCrest team={match.away} />
            </div>

            
            <div className="w-full flex items-center justify-between px-2">
                <div className="w-[100px] flex justify-center">
                    <TeamLabel team={match.home} />
                </div>
                <div className="flex-1" />
                <div className="w-[100px] flex justify-center">
                    <TeamLabel team={match.away} />
                </div>
            </div>

            
            {hasScorers && (
                <div className="relative w-full grid grid-cols-2 gap-3 mt-1">
                    <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-white/40" />
                    <div className="flex flex-col gap-[6px] pr-3">
                        {homeScorers.length === 0 ? (
                            <span className="text-[11px] text-white/60 text-right">—</span>
                        ) : (
                            homeScorers.map(s => (
                                <HeaderScorerLine key={s.id} scorer={s} side="home" />
                            ))
                        )}
                    </div>
                    <div className="flex flex-col gap-[6px] pl-3">
                        {awayScorers.length === 0 ? (
                            <span className="text-[11px] text-white/60 text-left">—</span>
                        ) : (
                            awayScorers.map(s => (
                                <HeaderScorerLine key={s.id} scorer={s} side="away" />
                            ))
                        )}
                    </div>
                </div>
            )}

            
            {footerSlot && (
                <div className="w-full mt-1" onClick={(e) => e.stopPropagation()}>
                    {footerSlot}
                </div>
            )}

            
            {match.stage && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#212121] rounded-t-[26px] px-5 min-w-[140px] h-[28px] flex items-center justify-center whitespace-nowrap">
                    <span
                        className="text-[13px] sm:text-[15px] font-bold leading-none tracking-normal text-center text-[#f8f8f8]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        {match.stage}
                    </span>
                </div>
            )}
        </div>
    );
}
