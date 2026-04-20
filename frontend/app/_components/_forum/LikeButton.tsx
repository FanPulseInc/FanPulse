"use client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ICONS } from "../../svg";
import { getCurrentUserId, isLoggedIn } from "../../_lib/auth";
import {
    usePostApiLike,
    useDeleteApiLikeId,
    useGetApiLikeCountTargetId,
    useGetApiLikeCheck,
    getGetApiLikeCountTargetIdQueryKey,
    getGetApiLikeCheckQueryKey,
} from "@/services/api/generated";

interface LikeButtonProps {
    targetId: string;
    variant: "white" | "black";
    kind: "post" | "comment";
    knownLikeId?: string;
    onError?: (message: string) => void;
}

export default function LikeButton({ targetId, variant, kind, knownLikeId, onError }: LikeButtonProps) {
    const queryClient = useQueryClient();
    const userId = getCurrentUserId() ?? undefined;

    const { data: count } = useGetApiLikeCountTargetId(targetId, {
        query: { enabled: !!targetId },
    });
    const { data: hasLiked } = useGetApiLikeCheck(
        { targetId, userId },
        { query: { enabled: !!targetId && !!userId } }
    );

    const { mutateAsync: addLike } = usePostApiLike();
    const { mutateAsync: removeLike } = useDeleteApiLikeId();

    const [likeId, setLikeId] = useState<string | undefined>(knownLikeId);
    useEffect(() => {
        setLikeId(knownLikeId);
    }, [knownLikeId]);

    const [busy, setBusy] = useState(false);

    const invalidateAll = () =>
        Promise.all([
            queryClient.invalidateQueries({ queryKey: getGetApiLikeCountTargetIdQueryKey(targetId) }),
            queryClient.invalidateQueries({ queryKey: getGetApiLikeCheckQueryKey({ targetId, userId }) }),
            queryClient.invalidateQueries({ queryKey: ["/api/Post"] }),
            queryClient.invalidateQueries({ predicate: (q) => {
                const k = q.queryKey?.[0];
                return typeof k === "string" && k.startsWith("/api/Post");
            }}),
        ]);

    const onClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isLoggedIn() || !userId) {
            onError?.("Увійдіть, щоб ставити лайк");
            return;
        }
        if (busy) return;
        setBusy(true);

        try {
            if (hasLiked) {
                if (!likeId) {
                    onError?.("Оновіть сторінку, щоб скасувати лайк");
                    return;
                }
                await removeLike({ id: likeId });
                setLikeId(undefined);
            } else {
                const created = await addLike({
                    data: kind === "post"
                        ? { postId: targetId, userId }
                        : { commentId: targetId, userId },
                });
                if (created?.id) setLikeId(created.id);
            }
            await invalidateAll();
        } catch (err) {
            const e = err as { response?: { status?: number; data?: { error?: string; message?: string } } };
            const status = e.response?.status;
            const serverMsg = e.response?.data?.error ?? e.response?.data?.message;
            console.error("Like failed", status, e.response?.data, err);
            onError?.(serverMsg ?? (status === 401 ? "Увійдіть, щоб ставити лайк" : "Не вдалося оновити лайк"));
        } finally {
            setBusy(false);
        }
    };

    const liked = !!hasLiked;
    const icon = variant === "white" ? ICONS.LikeWhite : ICONS.LikeBlack;
    const textColor = variant === "white" ? "text-white" : "text-[#212121]";

    return (
        <button
            onClick={onClick}
            disabled={busy}
            className={`flex items-center gap-1 cursor-pointer transition-all hover:scale-110 active:scale-95 disabled:opacity-50 ${liked ? "opacity-100 drop-shadow-[0_0_4px_rgba(175,41,42,0.6)]" : "opacity-70"}`}
            aria-label={liked ? "Unlike" : "Like"}
            title={liked ? "Скасувати лайк" : "Поставити лайк"}
        >
            <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
            <span className={`text-[12px] font-bold ${textColor}`}>{count ?? 0}</span>
        </button>
    );
}
