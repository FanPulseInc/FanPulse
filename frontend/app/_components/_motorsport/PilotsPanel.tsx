"use client";
import Image from "next/image";

export interface Pilot {
    id: string;
    position: number | string;
    name: string;
    teamOrCar: string;
    photoUrl?: string;
    timeOrLap?: string;
    intervalToLeader?: string;
}

interface Props {
    pilots: Pilot[];
    title?: string;
    isLive?: boolean;
}

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <span className="bg-[#af292a] text-white text-[12px] font-bold rounded-[6px] px-2 py-[2px] tabular-nums">
            {children}
        </span>
    );
}

function Row({ p }: { p: Pilot }) {
    const isLeader = p.intervalToLeader === "Лідер";
    return (
        <div className="grid grid-cols-[40px_44px_1fr_auto] items-center gap-3 py-[10px] border-b border-gray-100 last:border-none">
            <div className="w-8 h-8 rounded-full bg-[#212121] text-white text-[12px] font-bold flex items-center justify-center">
                {p.position}
            </div>
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
                    <span className="text-[14px] font-bold text-gray-500">
                        {p.name.slice(0, 1).toUpperCase()}
                    </span>
                )}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-bold text-[#212121] truncate">
                    {p.name}
                </span>
                <span className="text-[11px] bg-gray-200 px-2 py-[2px] rounded inline-block self-start truncate max-w-full">
                    {p.teamOrCar}
                </span>
            </div>
            <div className="flex items-center gap-2">
                {isLeader ? (
                    <Pill>{p.timeOrLap || "Лідер"}</Pill>
                ) : (
                    p.intervalToLeader && <Pill>{p.intervalToLeader}</Pill>
                )}
            </div>
        </div>
    );
}

export default function PilotsPanel({ pilots, title = "Звітність", isLive }: Props) {
    return (
        <div className="w-full flex flex-col gap-2">
            <div className="w-full bg-white rounded-[14px] shadow-sm border border-gray-100 flex flex-col p-3">
                <div className="grid grid-cols-[40px_44px_1fr_auto] items-center gap-3 px-[16px] py-[8px] bg-[#212121] rounded-[12px]">
                    <span />
                    <span />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                        Пілот
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                        Відрив
                    </span>
                </div>
                <div className="flex flex-col px-[16px]">
                    {pilots.length === 0 ? (
                        <div className="text-center text-gray-400 text-[12px] py-6">
                            Дані недоступні
                        </div>
                    ) : (
                        pilots.map(p => <Row key={p.id} p={p} />)
                    )}
                </div>
            </div>
            {isLive && (
                <div className="w-full flex items-center justify-center gap-3 mt-1">
                    <span className="bg-white text-[#af292a] text-[10px] font-bold uppercase px-2 py-[2px] rounded-full border border-[#af292a]">
                        Live
                    </span>
                </div>
            )}
        </div>
    );
}
