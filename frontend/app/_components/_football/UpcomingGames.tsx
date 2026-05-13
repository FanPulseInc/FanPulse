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
        <div className="w-full bg-surface rounded-[20px] shadow-sm border border-border-theme p-4 flex flex-col gap-3">
            <div className="text-center text-text-primary font-bold text-xs uppercase tracking-wider">
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
                                    className="flex items-center justify-between bg-surface-secondary rounded-[8px] px-2 h-[22px]"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-4 h-4 rounded-full bg-[#af292a]" />
                                        <span className="text-[10px] text-text-primary truncate">{p.name}</span>
                                    </div>
                                    <span className="text-[10px] font-data font-bold text-[#af292a]">{p.number}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-1 flex items-center gap-2 bg-surface-secondary rounded-[8px] px-2 h-[22px]">
                            <div className="w-4 h-4 rounded-full bg-surface-tertiary" />
                            <span className="text-[10px] text-text-primary truncate">{t.coach}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
