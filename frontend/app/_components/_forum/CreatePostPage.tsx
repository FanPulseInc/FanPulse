"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ForumContainer } from "../_forum/ForumContainer";
import { ICONS } from "../../svg";

const CATEGORIES = [
    "Counter-Strike",
    "Футбол",
    "Американський футбол",
    "Баскетбол",
    "Мотоспорт",
    "Теніс",
    "Dota2",
    "League of Legends",
];

export default function CreatePostPage() {
    const router = useRouter();
    const [category, setCategory] = useState("Counter-Strike");
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [errors, setErrors] = useState<{ title?: string; text?: string }>({});

    const handleSubmit = () => {
        const newErrors: { title?: string; text?: string } = {};

        if (!title.trim()) {
            newErrors.title = "Введіть назву посту";
        }
        if (!text.trim()) {
            newErrors.text = "Введіть текст посту";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        router.push("/forum");
    };

    return (
        <ForumContainer>
            <div className="w-[1039px] flex flex-col gap-4">
                {/* Header - single red bar */}
                <div className="w-full h-[60px] bg-[#af292a] rounded-[20px] flex items-center justify-between px-6">
                    <h1 className="text-white font-bold text-xl italic">Create post</h1>
                    <button className="w-[327px] h-[45px] bg-[#212121] rounded-[18px] flex justify-center items-center text-white font-bold text-sm hover:bg-black transition-all cursor-pointer">
                        Правила форуму
                    </button>
                </div>

                {/* Warning */}
                <div className="w-full py-3 bg-[#f8f8f8] rounded-[20px] flex justify-center items-center shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
                    <span className="font-bold text-base leading-[30px] text-center text-[#212121]">
                        Перед створення посту рекомендується ознайомитись зі правилами форуму !!!
                    </span>
                </div>

                {/* Category selector */}
                <div className="w-full h-[47px] bg-[#f8f8f8] rounded-full flex items-center overflow-visible relative shadow-[0_4px_15px_rgba(0,0,0,0.08)]">
                    <div className="px-10 flex items-center justify-center">
                        <span className="font-bold text-[20px] text-[#212121] whitespace-nowrap pl-5">
                            Категорія
                        </span>
                    </div>
                    <div className="relative flex-1 h-full">
                        <button
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className="w-[90%] ml-auto h-full px-6 bg-[#212121] rounded-full flex items-center justify-between cursor-pointer hover:bg-black transition-colors"
                        >
                            <div className="w-6" />
                            <span className="text-white font-bold text-[20px]">{category}</span>
                            <div className={`${isCategoryOpen ? "rotate-180" : ""} transition-transform duration-200`}>
                                {ICONS.ArrowDownWhite}
                            </div>
                        </button>

                        {/* Category dropdown */}
                        <div
                            className={`absolute right-0 top-[55px] z-30 w-[90%] p-5 bg-white border-[10px] border-[#af292a] rounded-[20px] flex flex-col gap-[13px] shadow-xl transition-all duration-300 ease-in-out origin-top ${
                                isCategoryOpen
                                    ? "opacity-100 scale-y-100 pointer-events-auto"
                                    : "opacity-0 scale-y-0 pointer-events-none"
                            }`}
                        >
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setCategory(cat);
                                        setIsCategoryOpen(false);
                                    }}
                                    className="w-full text-center font-bold text-lg hover:text-[#af292a] transition-colors cursor-pointer"
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Post title block */}
                <div className="w-full flex flex-col">
                    <div className="w-full h-[50px] px-5 bg-[#af292a] rounded-[20px] flex items-center relative z-10">
                        <span className="text-white text-sm font-bold">Введіть назву посту</span>
                    </div>
                    <div className="w-full bg-white rounded-[20px] -mt-4 pt-8 pb-4 px-5 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border-2 border-[#af292a]">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                            }}
                            placeholder="Назва посту..."
                            className={`w-full h-[40px] bg-transparent border-b ${
                                errors.title ? "border-red-500" : "border-gray-200"
                            } text-[#212121] text-sm font-medium outline-none focus:border-[#af292a] transition-colors`}
                        />
                    </div>
                    {errors.title && (
                        <span className="text-red-500 text-xs font-medium px-5 mt-1">{errors.title}</span>
                    )}
                </div>

                {/* Post text block */}
                <div className="w-full flex flex-col">
                    <div className="w-full h-[50px] px-5 bg-[#af292a] rounded-[20px] flex items-center relative z-10">
                        <span className="text-white text-sm font-bold">Введіть текст посту</span>
                    </div>
                    <div className={`w-full bg-[#f8f8f8] rounded-[20px] -mt-4 pt-8 pb-5 px-5 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border-2 border-[#af292a]`}>
                        <textarea
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                if (errors.text) setErrors((prev) => ({ ...prev, text: undefined }));
                            }}
                            placeholder="Текст посту..."
                            className="w-full min-h-[350px] bg-transparent text-[#212121] text-sm font-medium outline-none resize-none"
                        />
                    </div>
                    {errors.text && (
                        <span className="text-red-500 text-xs font-medium px-5 mt-1">{errors.text}</span>
                    )}
                </div>

                {/* Submit button */}
                <button
                    onClick={handleSubmit}
                    className="w-full h-[50px] bg-[#af292a] rounded-[20px] flex justify-center items-center text-white font-bold text-base hover:bg-[#8f2223] transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                >
                    Створити пост
                </button>
            </div>
        </ForumContainer>
    );
}
