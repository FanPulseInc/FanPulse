"use client";

export interface StatRow {
    label: string;
    home: number | string;
    away: number | string;
}

const FIGMA_STATS: readonly string[] = [
    "Очікувані голи (xG)",
    "Володіння м'ячем %",
    "Всього ударів",
    "Удари у площину воріт",
    "Удари повз",
    "Заблоковані удари",
    "Кутові",
    "Офсайди",
    "Фоли",
    "Паси",
    "Точні паси",
    "Точність пасів %",
    "Жовті картки",
    "Червоні картки",
];
const FIGMA_STATS_SET: ReadonlySet<string> = new Set(FIGMA_STATS);


function Row({ row }: { row: StatRow }) {
    return (
        <div className="grid grid-cols-3 items-center py-[10px] justify-items-center">
            <span className="w-[60px] sm:w-[87px] h-[19px] bg-[#d9d9d9] rounded-[6px] flex justify-center items-center text-[#212121] font-data font-bold text-[12px] leading-none"
                  style={{ fontFamily: "'Roboto Mono'", fontSize: "16px", fontWeight: 500, lineHeight: "30px",letterSpacing: "0em", textAlign: "center", color: "#212121" }}>
                {row.home}
            </span>
            <span
                className="text-center text-[#212121] font-bold text-[12px] sm:text-[16px] px-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif", lineHeight: "1.2", letterSpacing: "0em" }}
            >
                {row.label}
            </span>
            <span className="w-[60px] sm:w-[87px] h-[19px] bg-[#d9d9d9] rounded-[6px] flex justify-center items-center text-[#212121] font-data font-bold text-[12px] leading-none"
                  style={{ fontFamily: "'Roboto Mono'", fontSize: "16px", fontWeight: 500, lineHeight: "30px",letterSpacing: "0em", textAlign: "center", color: "#212121" }}>
                {row.away}
            </span>
        </div>
    );
}

export default function StatsTable({ rows, labels }: { rows: StatRow[]; labels?: readonly string[] }) {
    const order = labels ?? FIGMA_STATS;
    const orderSet: ReadonlySet<string> = labels ? new Set(labels) : FIGMA_STATS_SET;
    const byLabel = new Map(rows.map(r => [r.label, r]));

    const preferred = order
        .map(label => byLabel.get(label))
        .filter((r): r is StatRow => !!r);

    const limit = order.length;
    let filtered: StatRow[] = preferred;

    if (filtered.length < limit) {
        const extras = rows.filter(r => !orderSet.has(r.label));
        filtered = [...filtered, ...extras].slice(0, limit);
    }

    if (filtered.length === 0 && rows.length > 0) {
        filtered = rows.slice(0, limit);
    }

    if (filtered.length === 0) return null;

    return (
        <div className="w-full p-[20px] bg-[#f8f8f8] rounded-[20px] flex flex-col gap-[10px]">
            <div className="w-full flex justify-center mb-[4px]">
                <div className="min-w-[220px] h-[42px] px-8 bg-[#af292a] rounded-[10px] flex items-center justify-center">
                    <span className="text-white font-bold text-[16px] uppercase tracking-wider">
                        Статистика
                    </span>
                </div>
            </div>
            <div className="flex flex-col">
                {filtered.map(row => (
                    <Row key={row.label} row={row} />
                ))}
            </div>
        </div>
    );
}
