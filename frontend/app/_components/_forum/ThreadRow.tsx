"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetApiLikeCountTargetId } from "@/services/api/generated";
import { ICONS } from "../../svg";

interface ThreadRowProps {
    id: string;
    title: string;
    author: string;
    authorId?: string | null;
    date?: string;
    likesCount?: number;
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "";

    const d = new Date(dateStr);

    return (
        d.toLocaleDateString("uk-UA", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }) +
        " " +
        d.toLocaleTimeString("uk-UA", {
            hour: "2-digit",
            minute: "2-digit",
        })
    );
}

export default function ThreadRow({
    id,
    title,
    author,
    authorId,
    date,
    likesCount,
}: ThreadRowProps) {
    const router = useRouter();

    const { data: liveCount } = useGetApiLikeCountTargetId(id, {
        query: { enabled: !!id },
    });

    const displayedCount = liveCount ?? likesCount ?? 0;

    const openAuthorProfile = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!authorId) return;

        router.push(`/profile/${authorId}`);
    };

    return (
        <Link href={`/forum/${id}`} className="block">
            <div
                className="
                group mb-2 flex h-[52px] w-full cursor-pointer
                items-center justify-between rounded-[16px]
                bg-background px-2

                transition-all duration-200 ease-in-out
                hover:scale-[1.01]
                hover:bg-surface-tertiary
                hover:shadow-md
                active:scale-[0.99]
                "
            >
                <span className="min-w-0 flex-1 truncate pl-2 text-sm font-medium text-text-primary">
                    {title}
                </span>

                <div className="flex h-[32px] shrink-0 items-center gap-[10px] rounded-full bg-[#af292a] px-4 text-[10px] font-bold text-white">
                    <span>{formatDate(date)}</span>

                    <span className="opacity-40">|</span>

                    <span className="flex items-center gap-1">
                        <span className="flex h-3 w-3 items-center justify-center [&_svg]:h-full [&_svg]:w-full">
                            {ICONS.LikeWhite}
                        </span>
                        {displayedCount}
                    </span>

                    <span className="opacity-40">|</span>

                    <button
                        type="button"
                        onClick={openAuthorProfile}
                        disabled={!authorId}
                        className="
                        max-w-[140px] truncate uppercase tracking-wider
                        transition-opacity
                        hover:underline hover:opacity-80
                        disabled:cursor-default disabled:hover:no-underline
                        "
                    >
                        {author}
                    </button>
                </div>
            </div>
        </Link>
    );
}