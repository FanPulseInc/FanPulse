"use client";
import Image from "next/image";
import { useT } from "@/services/i18n/context";

export interface StandingRow {
    id: string;
    position: number;
    name: string;
    teamOrCar: string;
    photoUrl?: string;
    wins: number;
    points: number;
}

interface Props {
    rows: StandingRow[];
    title?: string;
}

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <span className="bg-[#af292a] text-white text-[12px] font-bold rounded-[6px] px-2 py-[2px] tabular-nums">
            {children}
        </span>
    );
}

function Row({ r }: { r: StandingRow }) {
    return (
        <div className="grid grid-cols-[40px_44px_1fr_auto] items-center gap-3 py-[10px] border-b border-gray-100 last:border-none">
            <div className="w-8 h-8 rounded-full bg-[#212121] text-white text-[12px] font-bold flex items-center justify-center">
                {r.position}
            </div>
            <div className="w-[44px] h-[44px] rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                {r.photoUrl ? (
                    <Image
                        src={r.photoUrl}
                        alt={r.name}
                        width={44}
                        height={44}
                        unoptimized
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-[14px] font-bold text-gray-500">
                        {r.name.slice(0, 1).toUpperCase()}
                    </span>
                )}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-bold text-[#212121] truncate">
                    {r.name}
                </span>
                <span className="text-[11px] bg-gray-200 px-2 py-[2px] rounded inline-block self-start truncate max-w-full">
                    {r.teamOrCar}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Pill>{r.wins}</Pill>
                <Pill>{r.points}</Pill>
            </div>
        </div>
    );
}

export default function StandingsTable({ rows, title }: Props) {
    const { t } = useT();
    const heading = title ?? t("standings");
    return (
        <div className="w-full bg-white rounded-[14px] shadow-sm border border-gray-100 flex flex-col p-3">
            <div className="w-full text-center text-[#212121] text-[16px] font-bold py-2">
                {heading}
            </div>
            <div className="grid grid-cols-[40px_44px_1fr_auto] items-center gap-3 px-[16px] py-[8px] bg-[#212121] rounded-[12px]">
                <span />
                <span />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                    {t("sport_pilot")}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                        {t("wins")}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                        {t("points")}
                    </span>
                </div>
            </div>
            <div className="flex flex-col px-[16px]">
                {rows.length === 0 ? (
                    <div className="text-center text-gray-400 text-[12px] py-6">
                        {t("no_data")}
                    </div>
                ) : (
                    rows.map(r => <Row key={r.id} r={r} />)
                )}
            </div>
        </div>
    );
}
