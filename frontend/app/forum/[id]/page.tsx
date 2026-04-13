import { ForumContainer } from "../../_components/_forum/ForumContainer";
import CommentNode from "../../_components/_forum/CommentNode";
import { ICONS } from "../../svg";

const MOCK_THREAD_DATA = {
    title: "Vitality domination",
    content: "They dominate so much that they define the tier of a tournament by themselves...",
    author: "Autor",
    date: "2026-03-31 14:20",
    comments: [
        {
            id: 1,
            author: "Name",
            text: "Shameless bump",
            replies: [
                { id: 3, author: "Name", text: "Shameless bump", replies: [] },
                {
                    id: 5,
                    author: "Name",
                    text: "Shameless bump",
                    replies: [
                        { id: 16, author: "Name", text: "Shameless bump", replies: [] }
                    ]
                },
            ]
        },
        { id: 2, author: "Name", text: "Shameless bump", replies: [] }
    ]
};

export default function ThreadDetailPage() {
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
                                {MOCK_THREAD_DATA.title}
                            </h1>
                        </div>
                        <div className="absolute right-[10px] top-[12px] w-[202px] h-[37px] bg-[#212121] rounded-full flex items-center justify-center shadow-md">
                            <span className="text-white text-sm font-bold tracking-wide">
                                {MOCK_THREAD_DATA.date}
                            </span>
                        </div>
                    </div>
                    <div className="p-8 pt-10 relative">
                        <div className="text-[#212121] text-sm leading-relaxed whitespace-pre-wrap">
                            {MOCK_THREAD_DATA.content}
                        </div>
                        <div className="flex justify-end mt-6">
                            <div className="bg-[#212121] text-white px-8 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                                {MOCK_THREAD_DATA.author}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {MOCK_THREAD_DATA.comments.map(comment => (
                        <CommentNode key={comment.id} comment={comment} depth={0} />
                    ))}
                </div>
            </div>
        </ForumContainer>
    );
}