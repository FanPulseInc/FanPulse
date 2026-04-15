"use client";
import { useParams } from "next/navigation";
import { ForumContainer } from "../../_components/_forum/ForumContainer";
import CommentNode from "../../_components/_forum/CommentNode";
import { ICONS } from "../../svg";
import { useGetApiPostId } from "@/services/api/generated";

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

    return (
        <ForumContainer>
            <div className="flex flex-col gap-6">
                <div className="w-full bg-white rounded-[20px] shadow-sm border border-gray-100 flex flex-col relative overflow-visible">
                    <div className="w-full h-[60px] bg-[#af292a] rounded-[20px] flex items-center justify-center px-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="absolute left-[24px] w-[45px] h-[45px] flex items-center justify-center">
                                <div className="scale-135">
                                    {ICONS.LikeWhite}
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
                        <div className="flex justify-end mt-6">
                            <div className="bg-[#212121] text-white px-8 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                                {post.user?.name ?? "Анонім"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {topLevelComments.map(comment => (
                        <CommentNode key={comment.id} comment={comment} depth={0} />
                    ))}
                </div>
            </div>
        </ForumContainer>
    );
}
