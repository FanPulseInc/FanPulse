"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export interface MotorsportCarouselItem {
    id: string;
    league: string;
    leagueBadge?: string;
    posterUrl?: string;
    raceName?: string;
}

const AUTOPLAY_MS = 6000;

function Slide({ item }: { item: MotorsportCarouselItem }) {
    const router = useRouter();
    return (
        <div
            onClick={() => router.push(`/motorsport/${item.id}`)}
            className="relative w-full bg-[#af292a] rounded-[20px] p-4 shadow-lg cursor-pointer hover:brightness-105 transition group"
        >
            <div className="absolute top-5 left-5 z-10 flex items-center gap-2 bg-white/95 rounded-full pl-1 pr-3 py-1 shadow-md">
                {item.leagueBadge ? (
                    <Image
                        src={item.leagueBadge}
                        alt=""
                        width={24}
                        height={24}
                        unoptimized
                        className="w-6 h-6 rounded-full object-contain bg-white"
                    />
                ) : (
                    <span className="w-6 h-6 rounded-full bg-gray-300" />
                )}
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#212121]">
                    {item.league}
                </span>
            </div>
            <div className="w-full flex items-center justify-center">
                {item.posterUrl ? (
                    <Image
                        src={item.posterUrl}
                        alt={item.raceName ?? item.league}
                        width={420}
                        height={236}
                        unoptimized
                        className="max-h-[200px] sm:max-h-[260px] w-auto h-auto object-contain rounded-[12px] shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="w-full aspect-[16/9] bg-[#212121]/30 rounded-[12px]" />
                )}
            </div>
        </div>
    );
}

export default function MotorsportCarousel({ items }: { items: MotorsportCarouselItem[] }) {
    const [idx, setIdx] = useState(0);
    const safeIdx = Math.min(idx, Math.max(0, items.length - 1));
    const [paused, setPaused] = useState(false);
    const len = items.length;

    const pausedRef = useRef(paused);
    useEffect(() => { pausedRef.current = paused; }, [paused]);

    useEffect(() => {
        if (len <= 1) return;
        const id = setInterval(() => {
            if (pausedRef.current) return;
            setIdx(i => (i + 1) % len);
        }, AUTOPLAY_MS);
        return () => clearInterval(id);
    }, [len]);

    if (items.length === 0) return null;
    const current = items[safeIdx];

    const prev = () => setIdx(i => (i - 1 + items.length) % items.length);
    const next = () => setIdx(i => (i + 1) % items.length);

    return (
        <div
            className="w-full relative flex flex-col gap-3"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
        >
            <div className="relative">
                <Slide item={current} />
                {items.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prev}
                            aria-label="Previous"
                            className="absolute left-[-14px] top-1/2 -translate-y-1/2 w-[36px] h-[36px] rounded-full bg-white text-[#af292a] text-[20px] font-bold flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer z-10"
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            onClick={next}
                            aria-label="Next"
                            className="absolute right-[-14px] top-1/2 -translate-y-1/2 w-[36px] h-[36px] rounded-full bg-white text-[#af292a] text-[20px] font-bold flex items-center justify-center shadow-md hover:bg-gray-100 cursor-pointer z-10"
                        >
                            ›
                        </button>
                    </>
                )}
            </div>

            <div className="flex items-center justify-center gap-2">
                {items.map((_, i) => (
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
