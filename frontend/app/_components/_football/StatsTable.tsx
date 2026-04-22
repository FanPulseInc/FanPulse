"use client";

export interface StatRow {
    label: string;
    home: number | string;
    away: number | string;
}

export default function StatsTable({ rows }: { rows: StatRow[] }) {
    return (
        <div className="w-full bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-[#af292a] h-[32px] flex items-center justify-center">
                <span className="text-white font-bold text-xs uppercase tracking-wider">
                    Статистика
                </span>
            </div>
            <div className="flex flex-col">
                {rows.map((row, i) => (
                    <div
                        key={row.label}
                        className={`grid grid-cols-3 items-center h-[32px] px-4 ${
                            i % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                    >
                        <span className="text-[#af292a] font-data font-bold text-xs text-left">{row.home}</span>
                        <span className="text-[#212121] font-medium text-xs text-center">{row.label}</span>
                        <span className="text-[#af292a] font-data font-bold text-xs text-right">{row.away}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
