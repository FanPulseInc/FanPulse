"use client";
import Image from "next/image";
import type { LastFiveRow } from "@/services/sportsdb/adapters";

export interface LastFiveSide {
    teamName: string;
    teamLogo?: string;
    rows: LastFiveRow[];
}

interface Props {
    home: LastFiveSide;
    away: LastFiveSide;
    title?: string; 
}

export default function LastFiveMatches({ home, away, title = "Останні 5 матчів" }: Props) {
    if (home.rows.length === 0 && away.rows.length === 0) return null;

    return (
        <div className="w-full flex flex-col gap-[14px]">
            
            <div className="w-full flex justify-center">
                <span className="text-[#af292a] font-bold text-[18px] uppercase tracking-wider">
                    {title}
                </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:[column-gap:60px]">
                <TeamCard side={home} />
                <TeamCard side={away} />
            </div>
        </div>
    );
}

function TeamCard({ side }: { side: LastFiveSide }) {
    return (
        <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 p-[16px] flex flex-col">
            
            <div className="flex items-center gap-[12px]" style={{ marginBottom: 32 }}>
                {side.teamLogo ? (
                    <Image
                        src={side.teamLogo}
                        alt={side.teamName}
                        width={44}
                        height={44}
                        unoptimized
                        style={{ width: 44, height: 44, objectFit: "contain", flexShrink: 0 }}
                    />
                ) : (
                    <div className="w-[44px] h-[44px] rounded-full bg-gray-200 shrink-0" />
                )}
                <span className="text-[#af292a] font-bold text-[16px] uppercase tracking-wider truncate">
                    {side.teamName}
                </span>
            </div>

            {side.rows.length === 0 ? (
                <div className="text-center text-gray-400 text-xs py-4">
                    Немає даних про попередні матчі
                </div>
            ) : (
                <div className="flex flex-col gap-[14px]">
                    {side.rows.map(row => (
                        <MatchRow key={row.id} row={row} />
                    ))}
                </div>
            )}
        </div>
    );
}

const RESULT_BG: Record<LastFiveRow["result"], string> = {
    W: "#2e7d32", 
    L: "#af292a", 
    D: "#9e9e9e", 
};

function MatchRow({ row }: { row: LastFiveRow }) {
    return (
        <div className="flex items-center gap-[10px]">
            
            {row.opponentLogo ? (
                <Image
                    src={row.opponentLogo}
                    alt={row.opponentName}
                    width={20}
                    height={20}
                    unoptimized
                    style={{ width: 20, height: 20, objectFit: "contain", flexShrink: 0 }}
                />
            ) : (
                <div className="w-[20px] h-[20px] rounded-full bg-gray-200 shrink-0" />
            )}
            
            <span className="flex-1 min-w-0 text-[#212121] text-[13px] font-medium truncate">
                {row.opponentName}
            </span>
            
            <span
                className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-white font-bold text-[12px] shrink-0 shadow-sm"
                style={{ backgroundColor: RESULT_BG[row.result] }}
            >
                {row.result}
            </span>
            <span
                className="bg-[#af292a] text-white font-bold font-data rounded-[8px] flex items-center justify-center shrink-0 px-[8px] h-[26px] text-[13px] tracking-tight tabular-nums"
                style={{ minWidth: 56 }}
            >
                {row.score}
            </span>
        </div>
    );
}
