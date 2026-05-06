"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ForumContainer } from "../_forum/ForumContainer";
import { ICONS } from "../../svg";
import { usePostApiPost, useGetApiCategoryRoots } from "@/services/api/generated";
import type { CategoryResponse } from "@/services/api/model";
import { useT } from "@/services/i18n/context";
import Toast from "../Toast";


export default function CreatePostPage() {
    const router = useRouter();
    const { t } = useT();
    const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [errors, setErrors] = useState<{ title?: string; text?: string; category?: string }>({});
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const { data: categories } = useGetApiCategoryRoots();
    const { mutateAsync: createPost, isPending } = usePostApiPost();

    const handleSubmit = async () => {
        const newErrors: { title?: string; text?: string; category?: string } = {};

        if (!title.trim()) {
            newErrors.title = t("forum_error_title");
        }
        if (!text.trim()) {
            newErrors.text = t("forum_error_text");
        }
        if (!selectedCategory?.id) {
            newErrors.category = t("forum_error_category");
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        try {
            const result = await createPost({
                data: {
                    title: title.trim(),
                    description: text.trim(),
                    categoryId: selectedCategory!.id!,
                },
            });
            setToast({ message: t("forum_post_success"), type: "success" });
            setTimeout(() => router.push(`/forum/${result.id}`), 1500);
        } catch (e: unknown) {
            const err = e as { response?: { status?: number } };
            if (err?.response?.status === 401) {
                setToast({ message: t("forum_login_required"), type: "error" });
                setTimeout(() => router.push("/?auth=login"), 2000);
            } else {
                setToast({ message: t("forum_post_error"), type: "error" });
            }
        }
    };

    return (
        <>
        {toast && (
            <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
            />
        )}
        <ForumContainer>
            <div className="w-[1039px] flex flex-col gap-4">
                <div className="w-full h-[60px] bg-[#af292a] rounded-[20px] flex items-center justify-between px-6">
                    <h1 className="text-white font-bold text-xl italic">{t("forum_create_post")}</h1>
                    <button className="w-[327px] h-[45px] bg-[#212121] rounded-[18px] flex justify-center items-center text-white font-bold text-sm hover:bg-black transition-all cursor-pointer">
                        {t("forum_rules")}
                    </button>
                </div>

                <div className="w-full py-3 bg-[#f8f8f8] rounded-[20px] flex justify-center items-center shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
                    <span className="font-bold text-base leading-[30px] text-center text-[#212121]">
                        {t("forum_rules_notice")}
                    </span>
                </div>

                <div className="w-full h-[47px] bg-[#f8f8f8] rounded-full flex items-center overflow-visible relative shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
                    <div className="px-10 flex items-center justify-center">
                        <span className="font-bold text-[20px] text-[#212121] whitespace-nowrap pl-5">
                            {t("forum_category")}
                        </span>
                    </div>
                    <div className="relative flex-1 h-full">
                        <button
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className="w-[90%] ml-auto h-full px-6 bg-[#212121] rounded-full flex items-center justify-between cursor-pointer hover:bg-black transition-colors"
                        >
                            <div className="w-6" />
                            <span className="text-white font-bold text-[20px]">
                                {selectedCategory?.name ?? t("forum_choose_category")}
                            </span>
                            <div className={`${isCategoryOpen ? "rotate-180" : ""} transition-transform duration-200`}>
                                {ICONS.ArrowDownWhite}
                            </div>
                        </button>

                        <div
                            className={`absolute right-0 top-[55px] z-30 w-[90%] p-5 bg-white border-[10px] border-[#af292a] rounded-[20px] flex flex-col gap-[13px] shadow-xl transition-all duration-300 ease-in-out origin-top ${
                                isCategoryOpen
                                    ? "opacity-100 scale-y-100 pointer-events-auto"
                                    : "opacity-0 scale-y-0 pointer-events-none"
                            }`}
                        >
                            {categories?.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setIsCategoryOpen(false);
                                    }}
                                    className="w-full text-center font-bold text-lg hover:text-[#af292a] transition-colors cursor-pointer"
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                {errors.category && (
                    <span className="text-red-500 text-xs font-medium px-5 -mt-2">{errors.category}</span>
                )}

                <div className="w-full flex flex-col">
                    <div className="w-full h-[50px] px-5 bg-[#af292a] rounded-[20px] flex items-center relative z-10">
                        <span className="text-white text-sm font-bold">{t("forum_enter_title")}</span>
                    </div>
                    <div className="w-full bg-white rounded-[20px] -mt-4 pt-8 pb-4 px-5 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border-2 border-[#af292a]">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                            }}
                            placeholder={t("forum_title_placeholder")}
                            className={`w-full h-[40px] bg-transparent border-b ${
                                errors.title ? "border-red-500" : "border-gray-200"
                            } text-[#212121] text-sm font-medium outline-none focus:border-[#af292a] transition-colors`}
                        />
                    </div>
                    {errors.title && (
                        <span className="text-red-500 text-xs font-medium px-5 mt-1">{errors.title}</span>
                    )}
                </div>

                <div className="w-full flex flex-col">
                    <div className="w-full h-[50px] px-5 bg-[#af292a] rounded-[20px] flex items-center relative z-10">
                        <span className="text-white text-sm font-bold">{t("forum_enter_text")}</span>
                    </div>
                    <div className={`w-full bg-[#f8f8f8] rounded-[20px] -mt-4 pt-8 pb-5 px-5 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border-2 border-[#af292a]`}>
                        <textarea
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                if (errors.text) setErrors((prev) => ({ ...prev, text: undefined }));
                            }}
                            placeholder={t("forum_text_placeholder")}
                            className="w-full min-h-[350px] bg-transparent text-[#212121] text-sm font-medium outline-none resize-none"
                        />
                    </div>
                    {errors.text && (
                        <span className="text-red-500 text-xs font-medium px-5 mt-1">{errors.text}</span>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="w-full h-[50px] bg-[#af292a] rounded-[20px] flex justify-center items-center text-white font-bold text-base hover:bg-[#8f2223] transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? t("forum_creating") : t("forum_submit")}
                </button>
            </div>
        </ForumContainer>
        </>
    );
}
