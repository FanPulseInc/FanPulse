"use client";
import { useState } from "react";
import {ForumContainer} from "../_forum/ForumContainer";
import ThreadRow from "../_forum/ThreadRow";

const navFilters = [
    { id: "latest", label: "Найновіші" },
    { id: "popular", label: "Найпопулярніші" },
    { id: "recommended", label: "Рекомендовані" },
];

const MOCK_THREADS = [
    { id: 1, title: "A quick note regarding Off-Topic content in the CS forum", author: "admin" },
    { id: 2, title: "Senzu is NAVI agent", author: "Maksym" },
    { id: 3, title: "FROZEN STAYS IN FAZE", author: "karrigan" },
    { id: 4, title: "Vitality domination", author: "zywoo" },
];

export default function ForumPage() {
    const [activeFilter, setActiveFilter] = useState("latest");


    return (
        <ForumContainer>
            <div className="flex flex-col">
                <div className="w-[1039px] h-[60px] bg-[#af292a] rounded-[20px] flex items-center justify-center relative z-20">
                    <h1 className="text-white font-bold text-xl uppercase tracking-wider">
                        Футбол
                    </h1>
                    <button className="absolute right-[16px] top-[26px] w-[198px] h-[66px] bg-[#212121] rounded-[20px] flex flex-row justify-center items-center gap-[10px] text-white font-bold text-sm shadow-lg hover:bg-black transition-all">
                        Правила форуму
                    </button>
                </div>
                <div className="w-[1039px] bg-white rounded-[20px] shadow-sm border border-gray-100 -mt-5 pt-8 pb-5 px-5 flex flex-col gap-4;">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <div className="flex gap-2 -mt-1">
                        {navFilters.map((filter) => {
                            const isActive = activeFilter === filter.id;
                            return (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-colors 
                                            ${isActive
                                        ? "bg-[#af292a] text-white" 
                                        : "bg-[#212121] text-white hover:bg-black" 
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            );
                        })}
                        </div>
                    </div>
                        {MOCK_THREADS.map((thread) => (
                            <ThreadRow key={thread.id} id={thread.id} title={thread.title} author={thread.author} />
                        ))}
                </div>
            </div>
        </ForumContainer>
    );
}