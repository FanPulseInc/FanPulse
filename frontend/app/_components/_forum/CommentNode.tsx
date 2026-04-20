"use client";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "../Toast";
import LikeButton from "./LikeButton";
import type { Comment as ApiComment } from "@/services/api/model";
import { usePostApiComment, getGetApiPostIdQueryKey } from "@/services/api/generated";

function formatDate(dateStr?: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("uk-UA", {
        day: "2-digit", month: "2-digit", year: "numeric",
    }) + " " + d.toLocaleTimeString("uk-UA", {
        hour: "2-digit", minute: "2-digit",
    });
}

interface CommentNodeProps {
    comment: ApiComment;
    depth: number;
    postId: string;
    postAuthorId?: string;
}

export default function CommentNode({ comment, depth, postId, postAuthorId }: CommentNodeProps) {
    const replies = comment.children ?? [];
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const queryClient = useQueryClient();
    const { mutateAsync: addComment, isPending } = usePostApiComment();

    const isAuthor = !!postAuthorId && comment.user?.id === postAuthorId;

    const onSubmitReply = async () => {
        if (!replyText.trim()) return;
        if (!comment.id) {
            console.error("Reply failed: parent comment has no id", comment);
            return;
        }
        try {
            // Send both spellings — backend model has typo "parrentId",
            // but actual DB/endpoint may expect "parentId". Extra keys are ignored.
            const payload = {
                commentText: replyText.trim(),
                postId,
                parrentId: comment.id,
                parentId: comment.id,
            } as unknown as Parameters<typeof addComment>[0]["data"];

            await addComment({ data: payload });
            setReplyText("");
            setIsReplying(false);
            setToast({ message: "Коментар додано", type: "success" });
            await queryClient.invalidateQueries({ queryKey: getGetApiPostIdQueryKey(postId) });
        } catch (err) {
            const e = err as { response?: { status?: number; data?: { error?: string; message?: string } } };
            const status = e.response?.status;
            const serverMsg = e.response?.data?.error ?? e.response?.data?.message;
            console.error("Reply failed", status, e.response?.data, err);

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

    return (
        <div className="relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="flex flex-col bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-visible">
                <div className="bg-[#212121] h-[37px] px-4 flex justify-between items-center rounded-[20px] relative">
                    <span className="text-white text-[11px] font-bold flex items-center gap-2">
                        <span className="ml-2">{comment.user?.name ?? "Анонім"}</span>
                        {isAuthor && (
                            <span className="bg-[#af292a] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-[2px] rounded-full">
                                Автор
                            </span>
                        )}
                    </span>
                    <div className="absolute right-[10px] top-[6px] bg-[#af292a] px-3 py-1 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">
                            {formatDate(comment.createdAt)}
                        </span>
                    </div>
                </div>
                <div className="p-4 flex justify-between items-center bg-white rounded-b-[20px]">
                    <p className="text-sm text-gray-800 font-medium">{comment.commentText}</p>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsReplying(v => !v)}
                            className="h-[28px] px-4 bg-[#212121] text-white rounded-full text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                        >
                            Коментувати
                        </button>
                        {comment.id && (
                            <LikeButton
                                targetId={comment.id}
                                kind="comment"
                                variant="black"
                                onError={(message) => setToast({ message, type: "error" })}
                            />
                        )}
                    </div>
                </div>

                {isReplying && (
                    <div className="px-4 pb-4 flex flex-col gap-2">
                        <textarea
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Ввести текст"
                            rows={2}
                            className="w-full rounded-[12px] border-2 border-[#af292a] p-3 text-sm outline-none resize-none"
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setIsReplying(false); setReplyText(""); }}
                                className="h-[32px] px-4 rounded-full text-[11px] font-bold border border-gray-300 hover:bg-gray-100 transition cursor-pointer"
                            >
                                Скасувати
                            </button>
                            <button
                                onClick={onSubmitReply}
                                disabled={isPending || !replyText.trim()}
                                className="h-[32px] px-5 bg-[#212121] text-white rounded-full text-[11px] font-bold hover:opacity-90 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                            >
                                {isPending ? "..." : "Відправити"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {replies.length > 0 && (
                <div className="ml-10 relative">
                    {replies.map((reply: ApiComment, index: number) => {
                        const isLast = index === replies.length - 1;
                        return (
                            <div key={reply.id} className="relative pl-6 pt-2">
                                <div
                                    className="absolute left-0 top-0 w-1 bg-[#af292a]"
                                    style={{ height: isLast ? '27px' : '100%' }}
                                />
                                <div className="absolute left-0 top-[27px] w-6 h-1 bg-[#af292a]" />
                                <CommentNode
                                    comment={reply}
                                    depth={depth + 1}
                                    postId={postId}
                                    postAuthorId={postAuthorId}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
