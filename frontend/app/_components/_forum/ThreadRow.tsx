interface ThreadRowProps {
    title: string;
    author: string;
}


export default function ThreadRow({ title, author }: ThreadRowProps) {
    return (
        <div className="w-full h-[52px] px-2 bg-[#e6e6e6] rounded-[16px] flex items-center justify-between mb-2 hover:bg-gray-300 transition-colors cursor-pointer group">
      <span className="text-[#212121] text-sm font-medium pl-2 truncate flex-1">
        {title}
      </span>

            <div className="flex items-center gap-[10px] bg-[#af292a] text-white h-[32px] px-4 rounded-full text-[10px] font-bold">
                <span>31.03.2026 19:20</span>
                <span className="opacity-40">|</span>
                <span>357</span>
                <span className="uppercase tracking-wider">{author}</span>
            </div>
        </div>
    );
}