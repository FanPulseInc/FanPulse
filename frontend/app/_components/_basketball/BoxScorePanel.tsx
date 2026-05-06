"use client";
import Image from "next/image";
import { useT } from "@/services/i18n/context";

export interface BoxScorePlayer {
    id: string;
    name: string;
    position?: string;
    photoUrl?: string;
    pts?: number | string;
    reb?: number | string;
    ast?: number | string;
}

export interface BoxScoreTeam {
    teamName: string;
    teamLogo?: string;
    players: BoxScorePlayer[];
}

function StatPill({ value }: { value: number | string | undefined }) {
    const display = value ?? "—";
    return (
        <div className="min-w-[36px] h-[24px] px-2 rounded-[6px] bg-[#af292a] flex items-center justify-center">
            <span
                className="text-white font-bold text-[12px]"
                style={{ fontFamily: "'Roboto Mono', monospace" }}
            >
                {display}
            </span>
        </div>
    );
}

function PlayerRow({ p, showStats }: { p: BoxScorePlayer; showStats: boolean }) {
    return (
        <div className="grid grid-cols-[44px_1fr_auto] items-center gap-3 py-[10px] border-b border-gray-100 last:border-none">
            <div className="w-[44px] h-[44px] rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                {p.photoUrl ? (
                    <Image
                        src={p.photoUrl}
                        alt={p.name}
                        width={44}
                        height={44}
                        unoptimized
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-[12px] font-bold text-gray-500">
                        {p.name.slice(0, 1).toUpperCase()}
                    </span>
                )}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-bold text-[#212121] truncate">
                    {p.name}
                </span>
                {p.position && (
                    <span className="text-[11px] uppercase tracking-wider text-gray-500">
                        {p.position}
                    </span>
                )}
            </div>
            {showStats && (
                <div className="flex items-center gap-2">
                    <StatPill value={p.pts} />
                    <StatPill value={p.reb} />
                    <StatPill value={p.ast} />
                </div>
            )}
        </div>
    );
}

export default function BoxScorePanel({ team }: { team: BoxScoreTeam }) {
    const { t } = useT();
    const showStats = team.players.some(
        p => p.pts != null || p.reb != null || p.ast != null
    );
    return (
        <div className="w-full flex flex-col gap-2">
            <div className="w-full h-[64px] bg-[#af292a] rounded-[14px] flex items-center gap-3 px-[16px] shadow-sm">
                {team.teamLogo ? (
                    <Image
                        src={team.teamLogo}
                        alt={team.teamName}
                        width={48}
                        height={48}
                        unoptimized
                        className="w-12 h-12 object-contain shrink-0"
                    />
                ) : (
                    <span className="w-12 h-12 rounded-full bg-white/20 shrink-0" />
                )}
                <span className="text-white font-bold text-[16px] uppercase tracking-wider truncate">
                    {team.teamName}
                </span>
            </div>

            <div className="w-full bg-white rounded-[14px] overflow-hidden shadow-sm border border-gray-100 flex flex-col">
                <div className="grid grid-cols-[44px_1fr_auto] items-center gap-3 px-[16px] py-[8px] bg-[#f1f1f1] border-b border-gray-200">
                    <span />
                    <span className="text-[12px] font-bold uppercase tracking-wider text-[#212121]">
                        {t("player")}
                    </span>
                    {showStats && (
                        <div className="flex items-center gap-2">
                            <span className="min-w-[36px] text-center text-[11px] font-bold uppercase tracking-wider text-[#212121]">PTS</span>
                            <span className="min-w-[36px] text-center text-[11px] font-bold uppercase tracking-wider text-[#212121]">REB</span>
                            <span className="min-w-[36px] text-center text-[11px] font-bold uppercase tracking-wider text-[#212121]">AST</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col px-[16px]">
                    {team.players.length === 0 ? (
                        <div className="text-center text-gray-400 text-[12px] py-6">
                            {t("squad_unavailable")}
                        </div>
                    ) : (
                        team.players.map(p => (
                            <PlayerRow key={p.id} p={p} showStats={showStats} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
