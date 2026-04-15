"use client";
import { useState } from "react";
import Link from "next/link";
import {ForumContainer} from "../_forum/ForumContainer";
import ThreadRow from "../_forum/ThreadRow";
import { ICONS } from "../../svg";
import { useGetApiPost, useGetApiCategoryRoots } from "@/services/api/generated";
import type { PostResponce } from "@/services/api/model";

const navFilters = [
    { id: "latest", label: "Найновіші" },
    { id: "popular", label: "Найпопулярніші" },
    { id: "recommended", label: "Рекомендовані" },
];

export default function ForumPage() {
    const [activeFilter, setActiveFilter] = useState("latest");
    const [selectedCategory, setSelectedCategory] = useState("Counter-Strike");
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    const { data: postsData, isLoading: postsLoading } = useGetApiPost({ page: 0, count: 20 });
    const posts: PostResponce[] = Array.isArray(postsData)
        ? postsData
        : (postsData as unknown as Record<string, PostResponce[]>)?.data
            ?? (postsData as unknown as Record<string, PostResponce[]>)?.items
            ?? [];
    const { data: categories } = useGetApiCategoryRoots();

    return (
        <ForumContainer>
            <div className="flex flex-col">
                <div className="w-[1039px] h-[60px] bg-[#af292a] rounded-[20px] flex items-center justify-center relative z-20">
                    <Link href="/forum/create" className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[154px] h-[34px] bg-[#212121] rounded-[13px] flex flex-row justify-center items-center gap-[4px] text-white font-bold text-sm hover:bg-black transition-all cursor-pointer">
                        Створити пост +
                    </Link>

                    <button
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className="flex items-center gap-2 cursor-pointer"
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
                        {categories?.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategory(cat.name ?? "");
                                    setIsCategoryOpen(false);
                                }}
                                className="w-full text-center font-bold text-lg hover:text-[#af292a] transition-colors cursor-pointer"
                            >
                                {cat.name}
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
                        {postsLoading && (
                            <div className="text-center text-gray-500 py-4">Завантаження...</div>
                        )}
                        {posts?.map((post) => (
                            <ThreadRow
                                key={post.id}
                                id={post.id!}
                                title={post.title}
                                author={post.user?.name ?? "Анонім"}
                                date={post.createdAt}
                                likesCount={post.likes?.length ?? 0}
                            />
                        ))}
                        {!postsLoading && (!posts || posts.length === 0) && (
                            <div className="text-center text-gray-500 py-4">Немає постів</div>
                        )}
                </div>
            </div>
        </ForumContainer>
    );
}
