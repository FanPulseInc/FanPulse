import ForumHeader from "../_forum/ForumHeader";
import {ForumContainer} from "../_forum/ForumContainer";
import ThreadRow from "../_forum/ThreadRow";

const MOCK_THREADS = [
    { id: 1, title: "A quick note regarding Off-Topic content in the CS forum", author: "admin" },
    { id: 2, title: "Senzu is NAVI agent", author: "Maksym" },
    { id: 3, title: "FROZEN STAYS IN FAZE", author: "karrigan" },
    { id: 4, title: "Vitality domination", author: "zywoo" },
];

export default function ForumPage() {
    return (
        <ForumContainer>
            <div className="flex flex-col">
                <div className="bg-white p-4 rounded-b-[20px] shadow-sm border-x border-b border-gray-100">
                    {MOCK_THREADS.map((thread) => (
                        <ThreadRow key={thread.id} title={thread.title} author={thread.author} />
                    ))}
                </div>
            </div>
        </ForumContainer>
    );
}