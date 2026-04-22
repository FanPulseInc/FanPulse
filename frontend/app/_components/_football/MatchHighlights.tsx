"use client";
import Image from "next/image";

/** Pull the YouTube video id out of any common URL shape:
 *   https://www.youtube.com/watch?v=ABC123
 *   https://youtu.be/ABC123
 *   https://www.youtube.com/embed/ABC123
 *   https://www.youtube.com/shorts/ABC123
 *  Returns null if we can't recognise the URL — the component then renders nothing.
 */
function extractYoutubeId(url: string): string | null {
    try {
        const u = new URL(url);
        if (u.hostname.includes("youtu.be")) {
            return u.pathname.slice(1).split("/")[0] || null;
        }
        if (u.hostname.includes("youtube.com")) {
            const v = u.searchParams.get("v");
            if (v) return v;
            const parts = u.pathname.split("/").filter(Boolean);
            // /embed/<id>, /shorts/<id>, /v/<id>
            const idx = parts.findIndex(p => ["embed", "shorts", "v"].includes(p));
            if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
        }
        return null;
    } catch {
        return null;
    }
}

export default function MatchHighlights({
    videoUrl,
    homeName,
    awayName,
}: {
    videoUrl: string;
    homeName?: string;
    awayName?: string;
}) {
    const id = extractYoutubeId(videoUrl);
    if (!id) return null;
    const thumb = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
    const titleParts = [homeName, awayName].filter(Boolean).join(" – ");

    return (
        <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block w-full h-[160px] rounded-[20px] overflow-hidden bg-[#212121] shadow-sm border border-gray-100"
            aria-label="Огляд матчу"
        >
            {/* YouTube thumbnail — slightly dimmed so the play button reads cleanly. */}
            <Image
                src={thumb}
                alt={titleParts ? `${titleParts} — огляд` : "Огляд матчу"}
                fill
                unoptimized
                sizes="600px"
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            />

            {/* Dark gradient bottom-up so the title strip stays legible. */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#212121]/85 via-[#212121]/30 to-transparent" />

            {/* Red "HIGHLIGHTS" pill in the top-left — uses the project red. */}
            <span className="absolute top-3 left-3 bg-[#af292a] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-[4px] rounded-full">
                Огляд
            </span>

            {/* Centered play button — red circle with white triangle. */}
            <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-[58px] h-[58px] rounded-full bg-[#af292a] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white" aria-hidden>
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </span>
            </span>

            {/* Bottom strip — match label + small "open on youtube" hint. */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between gap-3">
                <span className="text-white font-bold text-[13px] uppercase tracking-wider truncate">
                    {titleParts || "Огляд матчу"}
                </span>
                <span className="text-white/80 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                    YouTube ↗
                </span>
            </div>
        </a>
    );
}
