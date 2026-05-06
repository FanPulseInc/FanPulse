"use client";
import { useMatchVotes, type VoteChoice } from "@/services/votes";
import { useT } from "@/services/i18n/context";


export default function VoteCard({
    matchId,
    homeInitial,
    awayInitial,
}: {
    matchId: string;
    homeInitial: string;
    awayInitial: string;
}) {
    const { voteFor, cast } = useMatchVotes();
    const { t } = useT();
    const current = voteFor(matchId);

    const options: { key: VoteChoice; label: string }[] = [
        { key: "home", label: homeInitial.toUpperCase() },
        { key: "draw", label: "X" },
        { key: "away", label: awayInitial.toUpperCase() },
    ];

    return (
        <div className="w-full bg-[#e6e6e6] rounded-[20px] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-[14px] font-bold text-[#212121] leading-tight">
                        {current ? t("vote_fan_opinion") : t("vote_who_wins")}
                    </div>
                    <div className="text-[11px] text-[#212121]/60">
                        {current ? t("vote_retract") : t("vote_cast")}
                    </div>
                </div>
                <span className="text-[22px]" role="img" aria-label="trophy">🏆</span>
            </div>

            {current ? (
                <VoteResults
                    matchId={matchId}
                    options={options}
                    current={current}
                    onRetract={(e) => { e.stopPropagation(); cast(matchId, current); }}
                />
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {options.map(opt => (
                        <button
                            key={opt.key}
                            type="button"
                            onClick={(e) => { e.stopPropagation(); cast(matchId, opt.key); }}
                            className="h-[42px] rounded-full text-[14px] font-bold transition-colors cursor-pointer bg-white text-[#212121] hover:bg-white/80"
                            title={t("vote_cast")}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}


function hash01(s: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return ((h >>> 0) % 10000) / 10000;
}

function pseudoSplit(matchId: string, userPick: VoteChoice) {
    const a = hash01(matchId + ":h");
    const b = hash01(matchId + ":d");
    const c = hash01(matchId + ":a");
    let home = 35 + Math.floor(a * 25);   
    let draw = 15 + Math.floor(b * 20);   
    let away = 100 - home - draw;
    if (away < 10) { away = 10; const over = home + draw + away - 100; home -= over; }

    const bump = 3;
    if (userPick === "home") { home += bump; away -= bump; }
    else if (userPick === "away") { away += bump; home -= bump; }
    else { draw += bump; home -= Math.ceil(bump / 2); away -= Math.floor(bump / 2); }

    return { home, draw, away };
}

function VoteResults({
    matchId,
    options,
    current,
    onRetract,
}: {
    matchId: string;
    options: { key: VoteChoice; label: string }[];
    current: VoteChoice;
    onRetract: (e: React.MouseEvent) => void;
}) {
    const { t } = useT();
    const split = pseudoSplit(matchId, current);
    const pct: Record<VoteChoice, number> = {
        home: split.home,
        draw: split.draw,
        away: split.away,
    };

    return (
        <div className="flex flex-col gap-2">
            {options.map(opt => {
                const value = pct[opt.key];
                const active = current === opt.key;
                return (
                    <button
                        key={opt.key}
                        type="button"
                        onClick={onRetract}
                        className="group w-full text-left cursor-pointer"
                        title={active ? t("vote_retract") : ""}
                    >
                        <div className="flex items-center gap-2 text-[12px] font-bold text-[#212121] mb-[2px]">
                            <span className={`inline-flex items-center justify-center w-[22px] h-[22px] rounded-full text-[11px] ${
                                active ? "bg-[#af292a] text-white" : "bg-white text-[#212121]"
                            }`}>
                                {opt.label}
                            </span>
                            <span className="flex-1">
                                {opt.key === "draw" ? t("vote_draw") : t("vote_win")}
                            </span>
                            <span className="font-data">{value}%</span>
                        </div>
                        <div className="w-full h-[8px] rounded-full bg-white overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${active ? "bg-[#af292a]" : "bg-[#212121]/40"}`}
                                style={{ width: `${value}%` }}
                            />
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
