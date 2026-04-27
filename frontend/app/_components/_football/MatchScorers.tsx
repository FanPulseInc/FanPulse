"use client";
import type { Scorer } from "@/services/sportsdb/adapters";
import { Icon } from "./Icon";

function ScorerLine({
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
        <div className={`flex items-center gap-2 ${rowJustify}`}>
            <div className={`flex items-baseline gap-[6px] ${orderText}`}>
                <span className="text-[13px] font-semibold text-[#212121] truncate">
                    {scorer.name}
                </span>
                {tag && (
                    <span className="text-[9px] font-bold text-[#af292a] uppercase tracking-wider">
                        ({tag})
                    </span>
                )}
                {scorer.minute && (
                    <span className="text-[12px] font-bold text-[#af292a] font-data">
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

export default function MatchScorers({
    home,
    away,
    homeLabel,
    awayLabel,
}: {
    home: Scorer[];
    away: Scorer[];
    homeLabel?: string;
    awayLabel?: string;
}) {
    if (home.length === 0 && away.length === 0) return null;
    return (
        <div className="w-full bg-white rounded-[20px] shadow-sm border border-gray-100 p-4">
            
            <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#212121] truncate max-w-[48%]">
                    {homeLabel ?? ""}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#212121] truncate max-w-[48%] text-right">
                    {awayLabel ?? ""}
                </span>
            </div>

            
            <div className="relative grid grid-cols-2 gap-4">
                <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px bg-[#af292a]/30" />
                <div className="flex flex-col gap-[10px] pr-3">
                    {home.length === 0 ? (
                        <span className="text-[11px] text-gray-400 text-right">—</span>
                    ) : (
                        home.map(s => <ScorerLine key={s.id} scorer={s} side="home" />)
                    )}
                </div>
                <div className="flex flex-col gap-[10px] pl-3">
                    {away.length === 0 ? (
                        <span className="text-[11px] text-gray-400 text-left">—</span>
                    ) : (
                        away.map(s => <ScorerLine key={s.id} scorer={s} side="away" />)
                    )}
                </div>
            </div>
        </div>
    );
}
