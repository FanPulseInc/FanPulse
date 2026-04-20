import { ICONS } from "../../svg";
import type { Comment as ApiComment } from "@/services/api/model";

function formatDate(dateStr?: string) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("uk-UA", {
        day: "2-digit", month: "2-digit", year: "numeric",
    }) + " " + d.toLocaleTimeString("uk-UA", {
        hour: "2-digit", minute: "2-digit",
    });
}

export default function CommentNode({ comment, depth }: { comment: ApiComment, depth: number }) {
    const replies = comment.children ?? [];

    return (
        <div className="relative">
            <div className="flex flex-col bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-visible">
                <div className="bg-[#212121] h-[37px] px-4 flex justify-between items-center rounded-[20px] relative">
                    <span className="text-white text-[11px] font-bold">
                        <span className="ml-2">{comment.user?.name ?? "Анонім"}</span>
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
                        <button className="w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform">
                            {ICONS.LikeBlack}
                        </button>
                    </div>
                </div>
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
                                <CommentNode comment={reply} depth={depth + 1} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
