"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import VoteCard from "./VoteCard";

export interface CarouselMatch {
    id: string;
    league: string;
    
    idLeague?: string;
    
    leagueBadge?: string;
    kickoff: string; 
    home: { name: string; logoUrl?: string; score?: number };
    away: { name: string; logoUrl?: string; score?: number };
    
    status?: "scheduled" | "live" | "finished";
    
    elapsed?: string;
}

function TeamCrest({ name, logoUrl }: { name: string; logoUrl?: string }) {
    return (
        <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-[110px] h-[110px] flex items-center justify-center">
                {logoUrl ? (
                    <Image
                        src={logoUrl}
                        alt={name}
                        width={110}
                        height={110}
                        unoptimized
                        className="w-full h-full object-contain drop-shadow-md"
                    />
                ) : (
                    <span className="text-white font-bold text-2xl">
                        {name.slice(0, 2).toUpperCase()}
                    </span>
                )}
            </div>
            <span className="text-white text-[12px] font-bold uppercase tracking-wider">
                {name.split(/\s+/)[0]}
            </span>
        </div>
    );
}

function Slide({ match }: { match: CarouselMatch }) {
    const router = useRouter();
    const normalisedIso =
        /[zZ]|[+-]\d{2}:?\d{2}$/.test(match.kickoff)
            ? match.kickoff
            : `${match.kickoff}Z`;
    const date = new Date(normalisedIso);
    const dateLabel = date.toLocaleDateString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
    const timeLabel = date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
    });
    const isLive = match.status === "live";
    const isFinished = match.status === "finished";
    const showVote = match.status !== "live" && match.status !== "finished";

    return (
        <div
            onClick={(e) => {
                const t = e.target as HTMLElement | null;
                if (t?.closest("button, a, input")) return;
                router.push(`/football/${match.id}`);
            }}
            className="w-full bg-[#af292a] rounded-[20px] p-[20px] flex flex-col gap-4 shadow-lg cursor-pointer hover:brightness-105 transition"
        >
            <div className="relative flex items-center gap-2">
                <div className="w-[28px] h-[28px] rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
                    {match.leagueBadge ? (
                        <Image
                            src={match.leagueBadge}
                            alt=""
                            width={28}
                            height={28}
                            unoptimized
                            className="w-full h-full object-contain p-[2px]"
                        />
                    ) : (
                        <span className="text-[#af292a] font-bold text-[10px]">
                            {match.league.slice(0, 2).toUpperCase()}
                        </span>
                    )}
                </div>
                <span className="text-white font-bold text-sm uppercase tracking-wider">
                    {match.league}
                </span>
                {isLive && (
                    <span className="absolute right-0 top-0 bg-white text-[#af292a] text-[10px] font-bold uppercase px-2 py-[2px] rounded-full">
                        Live
                    </span>
                )}
            </div>

            
            <div className="w-full flex items-center justify-between px-2">
                <TeamCrest name={match.home.name} logoUrl={match.home.logoUrl} />
                <div className="flex flex-col items-center">
                    {isLive || isFinished ? (
                        <>
                            <span
                                className="text-[36px] leading-[34px] tracking-[-0.06em] text-[#f8f8f8]"
                                style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 500 }}
                            >
                                {match.home.score ?? 0} ‑ {match.away.score ?? 0}
                            </span>
                            <span className="mt-1 text-[13px] font-bold text-white/80 font-data tracking-wider">
                                {isFinished ? "FT" : match.elapsed ?? ""}
                            </span>
                        </>
                    ) : (
                        <>
                            <span
                                className="text-[26px] leading-[30px] tracking-[-0.04em] text-[#f8f8f8]"
                                style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 500 }}
                            >
                                {dateLabel}
                            </span>
                            <span
                                className="text-[16px] tracking-[-0.04em] text-[#f8f8f8]/70"
                                style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 500 }}
                            >
                                {timeLabel}
                            </span>
                        </>
                    )}
                </div>
                <TeamCrest name={match.away.name} logoUrl={match.away.logoUrl} />
            </div>

            
            {showVote && (
                <div onClick={(e) => e.stopPropagation()}>
                    <VoteCard
                        matchId={match.id}
                        homeInitial={match.home.name.slice(0, 1)}
                        awayInitial={match.away.name.slice(0, 1)}
                    />
                </div>
            )}
        </div>
    );
}

const AUTOPLAY_MS = 6000;

export default function MatchCarousel({ matches }: { matches: CarouselMatch[] }) {
    const [idx, setIdx] = useState(0);
    const safeIdx = Math.min(idx, Math.max(0, matches.length - 1));
    const [paused, setPaused] = useState(false);
    const len = matches.length;
    
    const pausedRef = useRef(paused);
    useEffect(() => {
        pausedRef.current = paused;
    }, [paused]);
    useEffect(() => {
        if (len <= 1) return;
        const id = setInterval(() => {
            if (pausedRef.current) return;
            setIdx(i => (i + 1) % len);
        }, AUTOPLAY_MS);
        return () => clearInterval(id);
    }, [len]);

    if (matches.length === 0) return null;
    const current = matches[safeIdx];

    const prev = () => setIdx(i => (i - 1 + matches.length) % matches.length);
    const next = () => setIdx(i => (i + 1) % matches.length);

    return (
        <div
            className="w-full relative flex flex-col gap-3"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
        >
            
            <div className="relative">
                <Slide match={current} />
                {matches.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prev}
                            aria-label="Previous match"
                            className="absolute left-[-14px] top-1/2 -translate-y-1/2 w-[36px] h-[36px] rounded-full bg-white text-[#af292a] text-[20px] font-bold flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            aria-label="Next match"
                            className="absolute right-[-14px] top-1/2 -translate-y-1/2 w-[36px] h-[36px] rounded-full bg-white text-[#af292a] text-[20px] font-bold flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer"
                        >
                            ›
                        </button>
                    </>
                )}
            </div>

            
            <div className="flex items-center justify-center gap-2">
                {matches.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIdx(i)}
                        className={`w-[10px] h-[10px] rounded-full transition-colors cursor-pointer ${
                            i === safeIdx ? "bg-[#af292a]" : "bg-gray-300 hover:bg-gray-400"
                        }`}
                        aria-label={`Slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
