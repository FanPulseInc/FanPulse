"use client";
import { useEffect, useState } from "react";
import { ForumContainer } from "../_forum/ForumContainer";
import ThreadRow from "../_forum/ThreadRow";
import { ICONS } from "../../svg";
import { useQueries } from "@tanstack/react-query";
import {
    useGetApiPost,
    useGetApiCategoryRoots,
    getApiLikeCountTargetId,
    getGetApiLikeCountTargetIdQueryKey,
} from "@/services/api/generated";
import type { PostResponce } from "@/services/api/model";
import { useT } from "@/services/i18n/context";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useFavCategoryIds } from "@/services/useFavCategories";
import Toast from "../Toast";

export default function ForumPage() {
    const { t } = useT();
    const router = useRouter();
    const { user } = useUserStore();
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get("category");
    const filterParam = searchParams.get("filter");

    const [activeFilter, setActiveFilter] = useState(filterParam === "favourite" ? "recommended" : "latest");
    const [selectedCategory, setSelectedCategory] = useState(categoryParam ?? "__all__");
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [authToast, setAuthToast] = useState(!user);

    const [showOnboarding, setShowOnboarding] = useState(false)

    useEffect(() => {
        const passed = localStorage.getItem("forum_onboarding_passed")
        setShowOnboarding(passed !== "true")
    }, [])

    const handleCloseOnboarding = () => {
        localStorage.setItem("forum_onboarding_passed", "true")
        setShowOnboarding(false)
    }

    const { ids: favCategoryIds } = useFavCategoryIds();

    const navFilters = [
        { id: "latest", label: t("forum_latest") },
        { id: "popular", label: t("forum_popular") },
        { id: "recommended", label: t("forum_recommended") },
    ];

    const { data: postsData, isLoading: postsLoading } = useGetApiPost({ page: 0, count: 20 });
    const rawPosts: PostResponce[] = Array.isArray(postsData)
        ? postsData
        : (postsData as unknown as Record<string, PostResponce[]>)?.data
        ?? (postsData as unknown as Record<string, PostResponce[]>)?.items
        ?? [];
    const { data: categories } = useGetApiCategoryRoots();

    /* resolve favourite category names for the "recommended" filter */
    const favCategoryNames = (categories ?? [])
        .filter((c) => favCategoryIds.includes(c.id ?? ""))
        .map((c) => c.name ?? "");

    const filteredPosts = (() => {
        let base = selectedCategory === "__all__"
            ? rawPosts
            : rawPosts.filter(p => p.category?.name === selectedCategory);

        /* recommended = only posts from favourite categories */
        if (activeFilter === "recommended" && favCategoryNames.length > 0) {
            base = base.filter(p => favCategoryNames.includes(p.category?.name ?? ""));
        }

        return base;
    })();

    const likeCountQueries = useQueries({
        queries: filteredPosts.map(p => ({
            queryKey: getGetApiLikeCountTargetIdQueryKey(p.id!),
            queryFn: ({ signal }: { signal?: AbortSignal }) =>
                getApiLikeCountTargetId(p.id!, signal),
            enabled: !!p.id,
            staleTime: 30_000,
        })),
    });

    const likeCountById = new Map<string, number>();
    filteredPosts.forEach((p, i) => {
        if (p.id) likeCountById.set(p.id, likeCountQueries[i]?.data ?? 0);
    });

    const posts = [...filteredPosts].sort((a, b) => {
        if (activeFilter === "latest") {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        }
        if (activeFilter === "popular") {
            const aLikes = (a.id && likeCountById.get(a.id)) || 0;
            const bLikes = (b.id && likeCountById.get(b.id)) || 0;
            if (bLikes !== aLikes) return bLikes - aLikes;
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
        }
        return 0;
    });

    const displayCategory = selectedCategory === "__all__" ? t("forum_all_categories") : selectedCategory;

    /* redirect unregistered users — placed after all hooks */
    if (!user) {
        return (
            <>
                {authToast && (
                    <Toast
                        message={t("forum_auth_required")}
                        type="error"
                        onClose={() => {
                            setAuthToast(false);
                            router.push("/?auth=register");
                        }}
                        duration={2000}
                    />
                )}
            </>
        );
    }

    function ForumOnboarding({
        onClose,
    }: {
        onClose: () => void
    }) {
        const [step, setStep] = useState(0)

        const steps = [
            {
                title: "Ласкаво просимо до FanPulse Forum",
                text: "Forum — це простір для спортивної та кіберспортивної спільноти, де фанати можуть обговорювати матчі, ділитись думками та створювати власний контент.",
            },
            {
                title: "Створюйте власні пости",
                text: "Публікуйте новини, обговорення, аналітику, думки після матчів або цікаві теми для інших учасників спільноти.",
            },
            {
                title: "Сортування та рекомендації",
                text: "Використовуйте вкладки Latest, Popular та Recommended, щоб знаходити найактуальніші або найпопулярніші обговорення.",
            },
            {
                title: "Категорії форуму",
                text: "Обирайте спортивні або кіберспортивні категорії, щоб швидше знаходити теми саме для ваших улюблених дисциплін.",
            },
            {
                title: "Взаємодія зі спільнотою",
                text: "Коментуйте пости, підтримуйте інших фанатів, отримуйте лайки та формуйте власну активність у FanPulse.",
            },
            {
                title: "Правила спільноти",
                text: "Дотримуйтесь правил форуму та допомагайте підтримувати комфортну атмосферу для всіх учасників.",
            },
        ]

        const current = steps[step]
        const isLast = step === steps.length - 1

        const nextStep = () => {
            if (isLast) {
                onClose()
                return
            }

            setStep((prev) => prev + 1)
        }

        const prevStep = () => {
            setStep((prev) => Math.max(prev - 1, 0))
        }

        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
                <div className="relative w-full max-w-[760px] overflow-hidden rounded-[32px] border-2 border-brand-red bg-white p-6 md:p-8 shadow-2xl">

                    {/* close */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-brand-red text-xl font-bold text-white hover:opacity-90"
                    >
                        ×
                    </button>

                    {/* glow */}
                    <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-brand-red/10" />
                    <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-brand-red/5" />

                    <div className="grid items-center gap-6 md:grid-cols-[1fr_240px]">

                        {/* content */}
                        <div className="flex flex-col gap-5">

                            {/* step */}
                            <div className="flex w-fit items-center gap-2 rounded-full bg-brand-red/10 px-4 py-2 text-sm font-bold text-brand-red">
                                <span>
                                    Крок {step + 1} з {steps.length}
                                </span>
                            </div>

                            {/* text */}
                            <div className="flex flex-col gap-3">
                                <h2 className="text-3xl font-black uppercase leading-tight text-brand-black md:text-4xl">
                                    {current.title}
                                </h2>

                                <p className="max-w-[480px] text-base font-medium leading-relaxed text-brand-black/60">
                                    {current.text}
                                </p>
                            </div>

                            {/* progress */}
                            <div className="flex items-center gap-2">
                                {steps.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-2 rounded-full transition-all ${index === step
                                            ? "w-10 bg-brand-red"
                                            : "w-2 bg-brand-red/25"
                                            }`}
                                    />
                                ))}
                            </div>

                            {/* buttons */}
                            <div className="flex flex-wrap gap-3 pt-2">

                                <button
                                    type="button"
                                    onClick={prevStep}
                                    disabled={step === 0}
                                    className="h-[48px] rounded-2xl border-2 border-brand-red px-6 font-bold text-brand-red transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
                                >
                                    Назад
                                </button>

                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="h-[48px] rounded-2xl bg-brand-red px-6 font-bold text-white hover:opacity-90"
                                >
                                    {isLast ? "Завершити" : "Далі"}
                                </button>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="h-[48px] px-4 text-sm font-bold text-brand-black/40 hover:text-brand-red"
                                >
                                    Пропустити
                                </button>
                            </div>
                        </div>

                        {/* fox */}
                        <div className="relative mx-auto flex justify-center">
                            <div className="absolute inset-0 rounded-full bg-brand-red/20 blur-3xl" />

                            <img
                                src="/icons/fox.png"
                                alt="FanPulse помічник"
                                className="relative z-10 w-[190px] md:w-[240px] drop-shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    return (
        <ForumContainer>
            {
                showOnboarding && (
                    <ForumOnboarding
                        onClose={handleCloseOnboarding}
                    />
                )
            }

            <div className="flex flex-col">
                <div className="w-[1039px] h-[60px] bg-[#af292a] rounded-[20px] flex items-center justify-center relative z-20">
                    <button
                        onClick={() => {
                            if (!user) {
                                router.push("?auth=login");
                                return;
                            }

                            router.push("/forum/create");
                        }}
                        className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[154px] h-[34px] bg-[#212121] rounded-[13px] flex flex-row justify-center items-center gap-[4px] text-white font-bold text-sm hover:bg-black transition-all cursor-pointer"
                    >
                        {t("forum_create_post_plus")}
                    </button>

                    <button
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <h1 className="text-white font-bold text-xl uppercase tracking-wider">
                            {displayCategory}
                        </h1>
                        {isCategoryOpen ? ICONS.ArrowUpWhite : ICONS.ArrowDownWhite}
                    </button>

                    <button onClick={() => router.push("/forum/rules")} className="absolute right-[16px] top-[26px] w-[198px] h-[66px] bg-[#212121] rounded-[20px] flex flex-row justify-center items-center gap-[10px] text-white font-bold text-sm shadow-lg hover:bg-black transition-all">
                        {t("forum_rules")}
                    </button>
                </div>

                <div className="relative">
                    <div
                        className={`absolute left-1/2 -translate-x-1/2 -top-2 z-30 w-[406px] pt-[18px] pr-[20px] pb-[19px] pl-[20px]  bg-[#ffffff] border-[10px] border-[#af292a] rounded-[11px] flex flex-col justify-start items-start gap-[13px] transition-all duration-300 ease-in-out origin-top ${isCategoryOpen
                            ? "opacity-100 scale-y-100 pointer-events-auto"
                            : "opacity-0 scale-y-0 pointer-events-none"
                            }`}
                    >
                        <button
                            key="all"
                            onClick={() => {
                                setSelectedCategory("__all__");
                                setIsCategoryOpen(false);
                            }}
                            className={`w-full text-center font-bold text-lg transition-colors cursor-pointer ${selectedCategory === "__all__" ? "text-[#af292a]" : "hover:text-[#af292a]"
                                }`}
                        >
                            {t("forum_all_categories")}
                        </button>
                        {categories?.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategory(cat.name ?? "");
                                    setIsCategoryOpen(false);
                                }}
                                className={`w-full text-center font-bold text-lg transition-colors cursor-pointer ${selectedCategory === cat.name ? "text-[#af292a]" : "hover:text-[#af292a]"
                                    }`}
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
                        <div className="text-center text-gray-500 py-4">{t("loading")}</div>
                    )}
                    {posts?.map((post) => (
                        <ThreadRow
                            key={post.id}
                            id={post.id!}
                            title={post.title}
                            author={post.user?.name ?? t("forum_anonymous")}
                            authorId={post.user?.id}
                            date={post.createdAt}
                            likesCount={post.likes?.length ?? 0}
                        />
                    ))}
                    {!postsLoading && (!posts || posts.length === 0) && (
                        <div className="text-center text-gray-500 py-4">{t("forum_no_posts")}</div>
                    )}
                </div>
            </div>
        </ForumContainer>
    );
}
