'use client'
import Link from "next/link";
import { useState } from "react";
import { ICONS } from "../svg";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { useGetApiCategoryRoots } from "@/services/api/generated";

const navItems = [
    { icon: ICONS.HOME, label: "ГОЛОВНА", href: "/" },
    { icon: ICONS.SPORT, label: "СПОРТ", href: "/sport" },
    { icon: ICONS.ESPORT, label: "КІБЕРСПОРТ", href: "/esports" },
    { icon: ICONS.FORUM, label: "ФОРУМ", href: "/forum" },
];




const Header = () => {

    const { user } = useUserStore()
    const router = useRouter()
    const [isSportOpen, setIsSportOpen] = useState(false);
    const { data: categories } = useGetApiCategoryRoots();


    return (
        <div className="w-full  bg-[#ffffff] px-10 py-4 flex flex-col gap-4">


            <div className="flex h-[70px] items-center justify-between w-full">
                {ICONS.ICON}


                <div className="flex w-[600px] h-[50px] items-center justify-between px-2 py-1 bg-white rounded-[50px] border-2 border-brand-red">
                    <input
                        type="text"
                        placeholder="Що Ви шукаєте?"
                        className="flex-1 bg-transparent outline-none text-body-l text-brand-black placeholder:text-brand-black/40"
                    />
                    <button className="flex items-center justify-center p-2  bg-brand-red rounded-full cursor-pointer hover:opacity-90 transition-opacity">
                        {ICONS.SEARCH}
                    </button>
                </div>


                <div className="flex items-center gap-[25px]">

                    <button className="flex h-[50px] min-w-[100px] items-center justify-center gap-2 px-6 rounded-[50px] border-2 border-brand-red text-brand-red text-body-l font-medium cursor-pointer hover:bg-brand-red/5 transition-colors">
                        Мова
                        {ICONS.ArrowDown}
                    </button>


                    {user ? (
                        <div className="w-15 h-15  rounded-full border-2 border-brand-red cursor-pointer flex items-center justify-center bg-gray-50 overflow-hidden" onClick={()=> router.push("/profile")}>
                            <span className="text-brand-red text-left text-3xl font-bold">
                                {user?.name && user.name !== "someName"
                                    ? user.name[0].toUpperCase()
                                    : user?.email
                                        ? user.email[0].toUpperCase()
                                        : "?"}            
                            </span>
                        </div>
                    ) :
                        (<Link
                            href="?auth=login"
                            className="flex h-[50px] min-w-[100px] items-center justify-center px-6 bg-brand-red rounded-[50px] text-white text-body-l font-medium hover:opacity-90 transition-opacity"
                        >
                            Увійти
                        </Link> )
                    }



                </div>
            </div>


            <div className="flex items-center justify-between w-full h-20">
                <nav className="flex items-center gap-12">
                    <div className="flex items-center gap-[30px]">
                        {navItems.map((item, index) => {
                            if (item.label === "СПОРТ") {
                                return (
                                    <div key={index} className="relative">
                                        <button
                                            onClick={() => setIsSportOpen(!isSportOpen)}
                                            className="flex items-center justify-center gap-2 p-2.5 rounded-[10px] hover:bg-brand-red/5 transition-colors group cursor-pointer"
                                        >
                                            <div className="w-[18px] h-[18px] flex items-center justify-center">
                                                {item.icon}
                                            </div>
                                            <span className="text-body-l font-medium text-brand-red uppercase">
                                                {item.label}
                                            </span>
                                            <div className={`${isSportOpen ? "rotate-180" : ""} transition-transform duration-200`}>
                                                {ICONS.ArrowDown}
                                            </div>
                                        </button>

                                        <div
                                            className={`absolute top-[75px] left-0 z-50 w-[760px] h-auto 
                                                        pt-8 pl-12 pr-8 pb-10 
                                                        bg-[#ffffff] border-[2px] border-[#af292a] rounded-[20px] 
                                                        shadow-2xl transition-all duration-300 ease-in-out origin-top ${
                                                isSportOpen
                                                    ? "opacity-100 scale-y-100 pointer-events-auto"
                                                    : "opacity-0 scale-y-0 pointer-events-none"
                                            }`}
                                        >
                                            <div className="flex flex-col gap-6">
                                                <button
                                                    key="football"
                                                    onClick={() => {
                                                        router.push("/football");
                                                        setIsSportOpen(false);
                                                    }}
                                                    className="flex items-center gap-1 group cursor-pointer w-full"
                                                >
                                                    <div className="w-8 h-8 flex items-center justify-center">
                                                        {ICONS.SPORT}
                                                    </div>
                                                    <span className="text-[18px] font-bold text-[#212121] leading-none group-hover:text-[#af292a] transition-colors">
                                                        Футбол
                                                    </span>
                                                </button>
                                                {categories
                                                    ?.filter((cat) => cat.name?.toLowerCase() !== "футбол" && cat.name?.toLowerCase() !== "football")
                                                    .map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            onClick={() => {
                                                                router.push(`/sport/${cat.id}`);
                                                                setIsSportOpen(false);
                                                            }}
                                                            className="flex items-center gap-1 group cursor-pointer w-full"
                                                        >
                                                            <div className="w-8 h-8 flex items-center justify-center">
                                                                
                                                                {ICONS.SPORT}
                                                            </div>
                                                            <span className="text-[18px] font-bold text-[#212121] leading-none group-hover:text-[#af292a] transition-colors">
                                                                {cat.name}
                                                            </span>
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className="flex items-center justify-center gap-2 p-2.5 rounded-[10px] hover:bg-brand-red/5 transition-colors group"
                                >
                                    <div className="w-[18px] h-[18px] flex items-center justify-center">
                                        {item.icon}
                                    </div>
                                    <span className="text-body-l font-medium text-brand-red uppercase">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="flex items-center gap-8 px-4">
                    <button className="cursor-pointer hover:opacity-70 transition-opacity">{ICONS.NOTIFY}</button>
                    <button className="cursor-pointer hover:opacity-70 transition-opacity">{ICONS.STAR}</button>
                    <button className="cursor-pointer hover:opacity-70 transition-opacity">{ICONS.TV}</button>
                    <button className="cursor-pointer hover:opacity-70 transition-opacity">{ICONS.ASK}</button>
                    <button className="cursor-pointer hover:opacity-70 transition-opacity">{ICONS.SETTING}</button>
                </div>
            </div>

        </div>
    );
};

export default Header;
