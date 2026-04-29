"use client";

export interface ScoringPlay {
    quarter: 1 | 2 | 3 | 4 | 5;
    minute: string;
    side: "home" | "away";
    playerName: string;
    homeScoreAfter: number;
    awayScoreAfter: number;
}

interface Props {
    plays: ScoringPlay[];
    title?: string;
    homeName: string;
    awayName: string;
}

function quarterLabel(q: 1 | 2 | 3 | 4 | 5): string {
    return q === 5 ? "OT" : `Q${q}`;
}

function PlayCell({ play }: { play: ScoringPlay }) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-[13px] font-data text-[#212121]/70 tabular-nums">
                {play.minute}
            </span>
            <span className="bg-[#af292a] text-white px-2 py-[2px] rounded-[6px] text-[12px] font-bold tabular-nums">
                {play.homeScoreAfter}-{play.awayScoreAfter}
            </span>
            <span className="text-[13px] font-medium text-[#212121] truncate">
                {play.playerName}
            </span>
        </div>
    );
}

export default function ScoringTimeline({ plays, title = "Атака" }: Props) {
    if (!plays || plays.length === 0) {
        return (
            <div className="w-full p-[20px] bg-[#f8f8f8] rounded-[20px] flex flex-col gap-[10px]">
                <div className="w-full flex justify-center mb-[4px]">
                    <div className="min-w-[220px] h-[42px] px-8 bg-[#af292a] rounded-[10px] flex items-center justify-center">
                        <span className="text-white font-bold text-[16px] uppercase tracking-wider">
                            {title}
                        </span>
                    </div>
                </div>
                <div className="text-center text-gray-400 text-sm py-6">
                    Поки що немає набраних очок
                </div>
            </div>
        );
    }

    const groupsByQ = new Map<number, ScoringPlay[]>();
    for (const p of plays) {
        const arr = groupsByQ.get(p.quarter) ?? [];
        arr.push(p);
        groupsByQ.set(p.quarter, arr);
    }

    const orderedQuarters = Array.from(groupsByQ.keys()).sort((a, b) => b - a) as (1 | 2 | 3 | 4 | 5)[];

    return (
        <div className="w-full p-[20px] bg-[#f8f8f8] rounded-[20px] flex flex-col gap-[10px]">
            <div className="w-full flex justify-center mb-[4px]">
                <div className="min-w-[220px] h-[42px] px-8 bg-[#af292a] rounded-[10px] flex items-center justify-center">
                    <span className="text-white font-bold text-[16px] uppercase tracking-wider">
                        {title}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {orderedQuarters.map((q) => {
                    const arr = groupsByQ.get(q) ?? [];
                    const last = arr[arr.length - 1];
                    const endLabel = last
                        ? `${quarterLabel(q)} ${last.homeScoreAfter}-${last.awayScoreAfter}`
                        : quarterLabel(q);
                    return (
                        <div key={q} className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-[#af292a]/40" />
                                <span className="text-[13px] font-bold text-[#af292a] tabular-nums">
                                    {endLabel}
                                </span>
                                <div className="flex-1 h-px bg-[#af292a]/40" />
                            </div>
                            <div className="flex flex-col py-2">
                                {arr.map((p, idx) => (
                                    <div
                                        key={`${q}-${idx}-${p.minute}-${p.playerName}`}
                                        className="grid grid-cols-2 gap-3 py-[6px] items-center"
                                    >
                                        <div className="flex justify-start">
                                            {p.side === "home" ? <PlayCell play={p} /> : null}
                                        </div>
                                        <div className="flex justify-end">
                                            {p.side === "away" ? <PlayCell play={p} /> : null}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-px bg-[#af292a]/40" />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
