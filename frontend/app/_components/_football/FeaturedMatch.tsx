"use client";
import Image from "next/image";
import type { Scorer } from "@/services/sportsdb/adapters";

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
    /** Live elapsed minutes ("67'", "HT") — shown under the score when live. */
    elapsed?: string;
    venue?: string;
}

function TeamCrest({ team }: { team: MatchTeam }) {
    return (
        <div className="w-[110px] h-[110px] flex items-center justify-center shrink-0">
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

/** "Brighton and Hove Albion" → "Brighton", "Athletic Bilbao" → "Athletic". */
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


/** White football icon used inside the red header — sized for inline scorer rows. */
function FootballIconWhite({ size = 12 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden
            className="shrink-0"
        >
            <circle cx="12" cy="12" r="10" fill="white" stroke="white" strokeWidth="1.5" />
            <path d="M12 7l3.8 2.8-1.5 4.4h-4.6l-1.5-4.4L12 7z" fill="#af292a" />
        </svg>
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
            <span className={orderIcon}>
                <FootballIconWhite />
            </span>
        </div>
    );
}

export default function FeaturedMatch({
    match,
    homeScorers = [],
    awayScorers = [],
}: {
    match: FeaturedMatchData;
    homeScorers?: Scorer[];
    awayScorers?: Scorer[];
}) {
    const hasScorers = homeScorers.length > 0 || awayScorers.length > 0;
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
        <div className={`relative w-full ${hasScorers ? "min-h-[237px] pb-[48px]" : "h-[237px]"} p-[20px] bg-[#af292a] rounded-[20px] flex flex-col justify-between items-center gap-[10px] shadow-lg`}>
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
                    <span
                        className="text-[36px] leading-[30px] tracking-[-0.08em] text-center text-[#f8f8f8]"
                        style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 500 }}
                    >
                        {scoreLabel}
                    </span>
                </div>

                <TeamCrest team={match.away} />
            </div>

            {/* Bottom row: team labels — mirror the crest row (w-[130px] slots +
                flex-1 spacer in the middle) so each label sits centered under its logo. */}
            <div className="w-full flex items-center justify-between px-2">
                <div className="w-[100px] flex justify-center">
                    <TeamLabel team={match.home} />
                </div>
                <div className="flex-1" />
                <div className="w-[100px] flex justify-center">
                    <TeamLabel team={match.away} />
                </div>
            </div>

            {/* Scorers — two columns under the crests, split by a faint white
                divider. Lives inside the red card so colours invert: white text,
                white ball, white minute, white divider. */}
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

            {/* "Футбол" tab pinned flush to the bottom edge of the red card —
                rounded top corners, flat bottom that merges with the card's edge. */}
            {match.stage && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#212121] rounded-t-[26px] px-4 w-[186px] h-[28px] flex items-center justify-center">
                    <span
                        className="text-[15px] font-bold leading-[30px] tracking-normal text-center text-[#f8f8f8]"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        {match.stage}
                    </span>
                </div>
            )}
        </div>
    );
}
