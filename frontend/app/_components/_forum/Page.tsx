"use client";
import { useState } from "react";
import Link from "next/link";
import {ForumContainer} from "../_forum/ForumContainer";
import ThreadRow from "../_forum/ThreadRow";
import { ICONS } from "../../svg";

const navFilters = [
    { id: "latest", label: "Найновіші" },
    { id: "popular", label: "Найпопулярніші" },
    { id: "recommended", label: "Рекомендовані" },
];

const CATEGORIES = [
    "Футбол",
    "Американський футбол",
    "Баскетбол",
    "Моторспорт",
    "Теніс",
    "Dota2",
    "League of Legends",
];

const MOCK_THREADS = [
    { id: 1, title: "A quick note regarding Off-Topic content in the CS forum", author: "admin" },
    { id: 2, title: "Senzu is NAVI agent", author: "Maksym" },
    { id: 3, title: "FROZEN STAYS IN FAZE", author: "karrigan" },
    { id: 4, title: "Vitality domination", author: "zywoo" },
];

export default function ForumPage() {
    const [activeFilter, setActiveFilter] = useState("latest");
    const [selectedCategory, setSelectedCategory] = useState("Counter-Strike");
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    return (
        <ForumContainer>
            <div className="flex flex-col">
                <div className="w-[1039px] h-[60px] bg-[#af292a] rounded-[20px] flex items-center justify-center relative z-20">
                    <Link href="/forum/create" className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[154px] h-[34px] bg-[#212121] rounded-[13px] flex flex-row justify-center items-center gap-[4px] text-white font-bold text-sm hover:bg-black transition-all cursor-pointer">
                        Створити пост +
                    </Link>

                    <button
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className="flex items-center gap-2"
                    >
                        <h1 className="text-white font-bold text-xl uppercase tracking-wider">
                            {selectedCategory}
                        </h1>
                        {isCategoryOpen ? ICONS.ArrowUpWhite : ICONS.ArrowDownWhite}
                    </button>

                    <button className="absolute right-[16px] top-[26px] w-[198px] h-[66px] bg-[#212121] rounded-[20px] flex flex-row justify-center items-center gap-[10px] text-white font-bold text-sm shadow-lg hover:bg-black transition-all">
                        Правила форуму
                    </button>
                </div>

                <div className="relative">
                    <div
                        className={`absolute left-1/2 -translate-x-1/2 -top-2 z-30 w-[406px] pt-[18px] pr-[20px] pb-[19px] pl-[20px]  bg-[#ffffff] border-[10px] border-[#af292a] rounded-[11px] flex flex-col justify-start items-start gap-[13px] transition-all duration-300 ease-in-out origin-top ${
                            isCategoryOpen
                                ? "opacity-100 scale-y-100 pointer-events-auto"
                                : "opacity-0 scale-y-0 pointer-events-none"
                        }`}
                    >
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => {
                                    setSelectedCategory(cat);
                                    setIsCategoryOpen(false);
                                }}
                                className="w-full text-center font-bold text-lg hover:text-[#af292a] transition-colors cursor-pointer"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
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
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-colors cursor-pointer
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
