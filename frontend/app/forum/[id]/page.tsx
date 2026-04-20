"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ForumContainer } from "../../_components/_forum/ForumContainer";
import CommentNode from "../../_components/_forum/CommentNode";
import LikeButton from "../../_components/_forum/LikeButton";
import Toast from "../../_components/Toast";
import {
    useGetApiPostId,
    usePostApiComment,
    getGetApiPostIdQueryKey,
} from "@/services/api/generated";
import { getCurrentUserId, isLoggedIn } from "../../_lib/auth";

function formatDate(dateStr?: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("uk-UA", {
        day: "2-digit", month: "2-digit", year: "numeric",
    }) + " " + d.toLocaleTimeString("uk-UA", {
        hour: "2-digit", minute: "2-digit",
    });
}

export default function ThreadDetailPage() {
    const params = useParams();
    const postId = params.id as string;

    const { data: post, isLoading } = useGetApiPostId(postId);
    const queryClient = useQueryClient();
    const { mutateAsync: addComment, isPending } = usePostApiComment();

    const [isCommenting, setIsCommenting] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const onSubmit = async () => {
        if (!commentText.trim()) return;
        if (!isLoggedIn()) {
            window.location.href = "/?auth=login";
            return;
        }
        try {
            await addComment({
                data: {
                    commentText: commentText.trim(),
                    postId,
                },
            });
            setCommentText("");
            setIsCommenting(false);
            setToast({ message: "Коментар додано", type: "success" });
            await queryClient.invalidateQueries({ queryKey: getGetApiPostIdQueryKey(postId) });
        } catch (err) {
            const e = err as { response?: { status?: number; data?: { error?: string; message?: string } } };
            const status = e.response?.status;
            const serverMsg = e.response?.data?.error ?? e.response?.data?.message;
            console.error("Comment failed", status, e.response?.data, err);

            let message = "Не вдалося надіслати коментар";
            if (serverMsg && /forbidden words/i.test(serverMsg)) {
                message = "Коментар містить заборонені слова";
            } else if (serverMsg) {
                message = serverMsg;
            } else if (status === 401) {
                message = "Увійдіть, щоб коментувати";
            }
            setToast({ message, type: "error" });
        }
    };

    if (isLoading) {
        return (
            <ForumContainer>
                <div className="text-center text-gray-500 py-10">Завантаження...</div>
            </ForumContainer>
        );
    }

    if (!post) {
        return (
            <ForumContainer>
                <div className="text-center text-gray-500 py-10">Пост не знайдено</div>
            </ForumContainer>
        );
    }

    const topLevelComments = (post.comments ?? []).filter(c => !c.parentId);
    const postAuthorId = post.user?.id;
    const currentUserId = getCurrentUserId();
    const isCurrentUserAuthor = !!currentUserId && currentUserId === postAuthorId;
    const currentUserLikeId = currentUserId
        ? post.likes?.find(l => l.userId === currentUserId)?.id ?? undefined
        : undefined;

    return (
        <ForumContainer>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="flex flex-col gap-6">
                <div className="w-full bg-white rounded-[20px] shadow-sm border border-gray-100 flex flex-col relative overflow-visible">
                    <div className="w-full h-[60px] bg-[#af292a] rounded-[20px] flex items-center justify-center px-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="absolute left-[24px] w-[45px] h-[45px] flex items-center justify-center">
                                <div className="scale-135">
                                    <LikeButton
                                        targetId={postId}
                                        kind="post"
                                        variant="white"
                                        knownLikeId={currentUserLikeId ?? undefined}
                                        onError={(message) => setToast({ message, type: "error" })}
                                    />
                                </div>
                            </div>
                            <h1 className="text-white font-bold text-lg tracking-tight">
                                {post.title}
                            </h1>
                        </div>
                        <div className="absolute right-[10px] top-[12px] w-[202px] h-[37px] bg-[#212121] rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-bold tracking-wide">
                                {formatDate(post.createdAt)}
                            </span>
                        </div>
                    </div>
                    <div className="p-8 pt-10 relative">
                        <div className="text-[#212121] text-sm leading-relaxed whitespace-pre-wrap">
                            {post.description}
                        </div>
                        <div className="flex justify-between items-center mt-6">
                            <button
                                onClick={() => setIsCommenting(v => !v)}
                                className="w-[165px] h-[31px] bg-[#212121] text-white rounded-[20px] text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                            >
                                Коментувати
                            </button>
                            <div className="bg-[#212121] text-white px-8 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <span>{post.user?.name ?? "Анонім"}</span>
                                {isCurrentUserAuthor && (
                                    <span className="bg-[#af292a] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-[2px] rounded-full">
                                        Автор
                                    </span>
                                )}
                            </div>
                        </div>

                        {isCommenting && (
                            <div className="mt-4 flex flex-col gap-2">
                                <textarea
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    placeholder="Ввести текст"
                                    rows={3}
                                    className="w-full rounded-[12px] border-2 border-[#af292a] p-3 text-sm outline-none resize-none"
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => { setIsCommenting(false); setCommentText(""); }}
                                        className="h-[36px] px-5 rounded-full text-[12px] font-bold border border-gray-300 hover:bg-gray-100 transition cursor-pointer"
                                    >
                                        Скасувати
                                    </button>
                                    <button
                                        onClick={onSubmit}
                                        disabled={isPending || !commentText.trim()}
                                        className="h-[36px] px-6 bg-[#212121] text-white rounded-full text-[12px] font-bold hover:opacity-90 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {isPending ? "Надсилання..." : "Відправити"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {topLevelComments.map(comment => (
                        <CommentNode
                            key={comment.id}
                            comment={comment}
                            depth={0}
                            postId={postId}
                            postAuthorId={postAuthorId}
                        />
                    ))}
                </div>
            </div>
        </ForumContainer>
    );
}
