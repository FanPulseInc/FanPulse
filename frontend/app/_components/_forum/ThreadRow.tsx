"use client";
import Link from "next/link";
import { useGetApiLikeCountTargetId } from "@/services/api/generated";
import { ICONS } from "../../svg";

interface ThreadRowProps {
    id: string;
    title: string;
    author: string;
    date?: string;
    likesCount?: number;
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("uk-UA", {
        day: "2-digit", month: "2-digit", year: "numeric",
    }) + " " + d.toLocaleTimeString("uk-UA", {
        hour: "2-digit", minute: "2-digit",
    });
}

export default function ThreadRow({ id, title, author, date, likesCount }: ThreadRowProps) {
    // Live count from the same endpoint the heart button uses, so numbers always match.
    // Falls back to the prop (e.g. from post.likes?.length) while the request is in flight.
    const { data: liveCount } = useGetApiLikeCountTargetId(id, {
        query: { enabled: !!id },
    });
    const displayedCount = liveCount ?? likesCount ?? 0;

    return (
        <Link href={`/forum/${id}`} className="block">
            <div className="w-full h-[52px] px-2 bg-[#e6e6e6] rounded-[16px] flex items-center justify-between mb-2
                            hover:bg-gray-300 hover:scale-[1.01] hover:shadow-md
                            active:scale-[0.99]
                            transition-all duration-200 ease-in-out
                            cursor-pointer group origin-center">
          <span className="text-[#212121] text-sm font-medium pl-2 truncate flex-1">
            {title}
          </span>

                <div className="flex items-center gap-[10px] bg-[#af292a] text-white h-[32px] px-4 rounded-full text-[10px] font-bold">
                    <span>{formatDate(date)}</span>
                    <span className="opacity-40">|</span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full">
                            {ICONS.LikeWhite}
                        </span>
                        {displayedCount}
                    </span>
                    <span className="uppercase tracking-wider">{author}</span>
                </div>
            </div>
        </Link>
    );
}
