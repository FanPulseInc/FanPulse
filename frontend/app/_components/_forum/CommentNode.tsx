import { ICONS } from "../../svg";

interface Comment {
    id: number;
    author: string;
    text: string;
    replies: Comment[];
    createdAt?: string;
    likes?: number;
}

export default function CommentNode({ comment, depth }: { comment: Comment, depth: number }) {
    return (
        <div className="relative">
            {depth > 0 && (
                <div className="absolute -left-6 top-8 w-6 h-[2px] bg-[#af292a]" />
            )}

            <div className="flex flex-col bg-white rounded-[20px] shadow-sm border border-gray-100 mb-2 overflow-visible">
                <div className="bg-[#212121] h-[37px] px-4 flex justify-between items-center rounded-[20px] relative">
                    <span className="text-white text-[11px] font-bold">
                        #{comment.id}
                        <span className="ml-2">{comment.author}</span>
                    </span>
                    <div className="absolute right-[10px] top-[6px] bg-[#af292a] px-3 py-1 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">
                            2026-03-31 14:20
                        </span>
                    </div>
                </div>
                <div className="p-4 flex justify-between items-center bg-white rounded-b-[20px]">
                    <p className="text-sm text-gray-800 font-medium">{comment.text}</p>

                    <div className="flex items-center gap-3">
                        <span className="text-[13px] font-bold text-[#212121]">1000</span>
                        <button className="w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform">
                            {ICONS.LikeBlack}
                        </button>
                    </div>
                </div>
            </div>
            {comment.replies.length > 0 && (
                <div className="ml-10 relative border-l-4 border-[#af292a] pl-6 py-2">
                    {comment.replies.map((reply: Comment) => (
                        <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}