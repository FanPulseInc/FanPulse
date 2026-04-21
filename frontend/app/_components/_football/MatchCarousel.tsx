"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export interface CarouselMatch {
    id: string;
    league: string;
    leagueIcon?: string;
    kickoff: string; // ISO
    home: { name: string; logoUrl?: string };
    away: { name: string; logoUrl?: string };
    odds?: { home: number; draw: number; away: number };
    trend?: { home: "up" | "down" | "flat"; draw: "up" | "down" | "flat"; away: "up" | "down" | "flat" };
}

function TeamCrest({ name, logoUrl }: { name: string; logoUrl?: string }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="w-[70px] h-[70px] rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                    <Image
                        src={logoUrl}
                        alt={name}
                        width={70}
                        height={70}
                        unoptimized
                        className="w-full h-full object-contain p-2"
                    />
                ) : (
                    <span className="text-white font-bold text-sm">
                        {name.slice(0, 2).toUpperCase()}
                    </span>
                )}
            </div>
            <span className="text-white font-medium text-sm">{name}</span>
        </div>
    );
}

function TrendIcon({ dir }: { dir?: "up" | "down" | "flat" }) {
    if (dir === "up") return <span className="text-green-400 text-[10px]">▲</span>;
    if (dir === "down") return <span className="text-red-400 text-[10px]">▼</span>;
    return null;
}

function Slide({ match }: { match: CarouselMatch }) {
    const router = useRouter();
    const date = new Date(match.kickoff);
    const dateLabel = date.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeLabel = date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });

    return (
        <div
            onClick={() => router.push(`/football/${match.id}`)}
            className="w-full bg-[#101114] rounded-[16px] p-6 text-white cursor-pointer hover:bg-[#16171b] transition-colors"
        >
            {/* League header */}
            <div className="flex items-center gap-2 mb-5">
                <div className="w-5 h-5 rounded-full bg-[#af292a] flex items-center justify-center text-[10px]">⚽</div>
                <span className="font-bold text-sm">{match.league}</span>
            </div>

            {/* Teams + date */}
            <div className="flex items-center justify-between mb-5">
                <TeamCrest name={match.home.name} logoUrl={match.home.logoUrl} />
                <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-base font-data">{dateLabel}</span>
                    <span className="text-gray-400 text-sm font-data">{timeLabel}</span>
                </div>
                <TeamCrest name={match.away.name} logoUrl={match.away.logoUrl} />
            </div>

            {/* Who will win */}
            <div className="bg-[#1a1b20] rounded-[12px] p-4 mb-4">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <div className="font-bold text-sm">Who will win?</div>
                        <div className="text-gray-400 text-xs">Cast your vote!</div>
                    </div>
                    <span className="text-purple-400 text-lg">🏆</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { key: "home", content: match.home.name.slice(0, 1) },
                        { key: "draw", content: "X" },
                        { key: "away", content: match.away.name.slice(0, 1) },
                    ].map(opt => (
                        <button
                            key={opt.key}
                            onClick={(e) => e.stopPropagation()}
                            className="h-[36px] rounded-full border border-purple-500/40 hover:bg-purple-500/10 transition-colors flex items-center justify-center font-bold text-sm"
                        >
                            {opt.content}
                        </button>
                    ))}
                </div>
            </div>

            {/* Odds */}
            {match.odds && (
                <div>
                    <div className="text-xs text-gray-400 mb-2">Full-time</div>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: "1", val: match.odds.home, trend: match.trend?.home },
                            { label: "X", val: match.odds.draw, trend: match.trend?.draw },
                            { label: "2", val: match.odds.away, trend: match.trend?.away },
                        ].map(o => (
                            <div
                                key={o.label}
                                className="bg-[#1a1b20] rounded-[8px] h-[36px] px-3 flex items-center justify-between text-sm"
                            >
                                <span className="text-gray-400">{o.label}</span>
                                <span className="flex items-center gap-1 font-bold font-data">
                                    <TrendIcon dir={o.trend} />
                                    {o.val.toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="mt-3 text-purple-400 text-xs font-medium hover:text-purple-300 transition-colors">
                        Additional odds ⌄
                    </button>
                </div>
            )}
        </div>
    );
}

export default function MatchCarousel({ matches }: { matches: CarouselMatch[] }) {
    const [idx, setIdx] = useState(0);
    if (matches.length === 0) return null;
    const current = matches[idx];

    const prev = () => setIdx(i => (i - 1 + matches.length) % matches.length);
    const next = () => setIdx(i => (i + 1) % matches.length);

    return (
        <div className="w-full flex flex-col gap-3">
            <Slide match={current} />

            {/* Pager */}
            <div className="flex items-center justify-between px-2">
                <button
                    onClick={prev}
                    className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                    ‹ Previous
                </button>
                <div className="flex items-center gap-2">
                    {matches.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIdx(i)}
                            className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                                i === idx ? "bg-purple-400" : "bg-gray-600 hover:bg-gray-500"
                            }`}
                            aria-label={`Slide ${i + 1}`}
                        />
                    ))}
                </div>
                <button
                    onClick={next}
                    className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                    Next ›
                </button>
            </div>
        </div>
    );
}
