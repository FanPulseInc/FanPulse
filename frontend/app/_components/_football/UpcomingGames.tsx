"use client";
import { useT } from "@/services/i18n/context";

export interface UpcomingTeam {
    label: string;
    coach: string;
    players: { id: string; name: string; number: number }[];
}

export default function UpcomingGames({ left, right }: { left: UpcomingTeam; right: UpcomingTeam }) {
    const { t } = useT();
    return (
        <div className="w-full bg-white rounded-[20px] shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
            <div className="text-center text-[#212121] font-bold text-xs uppercase tracking-wider">
                {t("upcoming_games")}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {[left, right].map((t, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        <div className="bg-[#af292a] h-[26px] rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-[10px] uppercase">{t.label}</span>
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                            {t.players.map(p => (
                                <div
                                    key={p.id}
                                    className="flex items-center justify-between bg-gray-50 rounded-[8px] px-2 h-[22px]"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-4 h-4 rounded-full bg-[#af292a]" />
                                        <span className="text-[10px] text-[#212121] truncate">{p.name}</span>
                                    </div>
                                    <span className="text-[10px] font-data font-bold text-[#af292a]">{p.number}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-1 flex items-center gap-2 bg-gray-50 rounded-[8px] px-2 h-[22px]">
                            <div className="w-4 h-4 rounded-full bg-gray-300" />
                            <span className="text-[10px] text-[#212121] truncate">{t.coach}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
