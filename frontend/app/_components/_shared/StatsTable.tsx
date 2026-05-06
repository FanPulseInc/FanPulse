"use client";
import { useT } from "@/services/i18n/context";

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

const STAT_LABEL_EN: Record<string, string> = {
    // Football
    "Очікувані голи (xG)": "Expected Goals (xG)",
    "Володіння м'ячем %": "Possession %",
    "Всього ударів": "Total Shots",
    "Удари у площину воріт": "Shots on Target",
    "Удари повз": "Shots off Target",
    "Заблоковані удари": "Blocked Shots",
    "Кутові": "Corners",
    "Офсайди": "Offsides",
    "Фоли": "Fouls",
    "Паси": "Passes",
    "Точні паси": "Accurate Passes",
    "Точність пасів %": "Pass Accuracy %",
    "Жовті картки": "Yellow Cards",
    "Червоні картки": "Red Cards",
    // Basketball
    "Підбори": "Rebounds",
    "Підбори в обороні": "Def. Rebounds",
    "Підбори в атаці": "Off. Rebounds",
    "Втрати": "Turnovers",
    "Перехвати": "Steals",
    "Блоки": "Blocks",
    "Макс. очків впідряд": "Max Pts Streak",
    // Tennis
    "Ейси": "Aces",
    "Подвійні помилки": "Double Faults",
    "Перша подача": "1st Serve %",
    "Друга подача": "2nd Serve %",
    "Поінти першої подачі": "1st Serve Pts Won",
    "Поінти другої подачі": "2nd Serve Pts Won",
    "Зіграні подачі": "Service Games",
    "Захищені брейк-поінти": "Break Pts Saved",
    "Всього": "Total",
    "Очки (за свою подачу)": "Pts (own serve)",
    "Очки (за подачу суперника)": "Pts (opp. serve)",
    "Максимум очків впідряд": "Max Pts in a Row",
    // American football
    "Тачдауни": "Touchdowns",
    "Голи з гри": "Field Goals",
    "Всього ярдів": "Total Yards",
    "Ефективність (червона зона)": "Red Zone Eff.",
    "Час володіння": "Time of Possession",
    "Перші дауни": "First Downs",
    "Ефективність (третій даун)": "3rd Down Eff.",
    "Панти": "Punts",
    "Середня к-сть ярдів за пант": "Avg Yards/Punt",
    "Середня к-сть ярдів за гру": "Avg Yards/Play",
    "Паси в 1-ому дауні": "1st Down Passes",
    "Ярди на пасі (чисті)": "Net Pass Yards",
    "Ярди на пасі (Всього)": "Gross Pass Yards",
    "Паси в тачдауні": "TD Passes",
    "Кидаючі перехвати": "Interceptions",
    "Середня к-сть ярдів на пасі за спробу": "Avg Yards/Attempt",
    "Спроби пасу в червону зону": "Red Zone Pass Att.",
    "Ярди в прориві": "Rushing Yards",
    "Прорив в 1-ому дауні": "1st Down Rushes",
    "Спроби прориву в червону зону": "Red Zone Rush Att.",
    "Пенальті": "Penalties",
    "Штрафні ярди": "Penalty Yards",
    "Фамбли": "Fumbles",
    "Втрати м'яча": "Fumbles Lost",
};

function Row({ row, lang }: { row: StatRow; lang: string }) {
    const label = lang === "en" ? (STAT_LABEL_EN[row.label] ?? row.label) : row.label;
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
                {label}
            </span>
            <span className="w-[60px] sm:w-[87px] h-[19px] bg-[#d9d9d9] rounded-[6px] flex justify-center items-center text-[#212121] font-data font-bold text-[12px] leading-none"
                  style={{ fontFamily: "'Roboto Mono'", fontSize: "16px", fontWeight: 500, lineHeight: "30px",letterSpacing: "0em", textAlign: "center", color: "#212121" }}>
                {row.away}
            </span>
        </div>
    );
}

export default function StatsTable({ rows, labels, title }: { rows: StatRow[]; labels?: readonly string[]; title?: string }) {
    const { t, lang } = useT();
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
                        {title ?? t("statistics")}
                    </span>
                </div>
            </div>
            <div className="flex flex-col">
                {filtered.map(row => (
                    <Row key={row.label} row={row} lang={lang} />
                ))}
            </div>
        </div>
    );
}
