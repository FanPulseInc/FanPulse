import { ForumContainer } from "../_forum/ForumContainer";

export default function ForumLayout({ children }: { children: React.ReactNode }) {
    return (
        <ForumContainer>
            <div className="flex gap-6">
                <div className="flex-1">
                    {children}
                </div>

                <aside className="hidden lg:block w-[300px] bg-white rounded-[20px] shadow-sm h-fit p-4">
                    <h2 className="font-bold mb-4">Top Match Discussions</h2>
                </aside>
            </div>
        </ForumContainer>
    );
}