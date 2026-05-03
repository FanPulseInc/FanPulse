'use client'
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ICONS } from "../svg";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { useLeagueLookups } from "@/services/sportsdb/hooks";

const navItems = [
    { icon: ICONS.HOME, label: "ГОЛОВНА", href: "/" },
    { icon: ICONS.SPORT, label: "СПОРТ", href: "/sport" },
    { icon: ICONS.ESPORT, label: "КІБЕРСПОРТ", href: "/esports" },
    { icon: ICONS.FORUM, label: "ФОРУМ", href: "/forum" },
];

interface SportEntry {
    key: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    leagues: { id: string; name: string }[];
}

const SPORT_MENU: SportEntry[] = [
    {
        key: "football",
        label: "Футбол",
        icon: ICONS.FOOTBALL,
        href: "/football",
        leagues: [
            { id: "4328", name: "Premier League" },
            { id: "4335", name: "La Liga" },
            { id: "4331", name: "Bundesliga" },
            { id: "4332", name: "Serie A" },
            { id: "4334", name: "Ligue 1" },
            { id: "4480", name: "UEFA Champions League" },
            { id: "4481", name: "UEFA Europa League" },
            { id: "5071", name: "UEFA Conference League" },
        ],
    },
    {
        key: "basketball",
        label: "Баскетбол",
        icon: ICONS.BASCETBALL,
        href: "/basketball",
        leagues: [{ id: "4387", name: "NBA" }],
    },
    {
        key: "tennis",
        label: "Теніс",
        icon: ICONS.TENIS,
        href: "/tennis",
        leagues: [
            { id: "4464", name: "ATP Tour" },
            { id: "4517", name: "WTA Tour" },
            { id: "4581", name: "Laver Cup" },
        ],
    },
    {
        key: "american-football",
        label: "Американський футбол",
        icon: ICONS.RUGBY,
        href: "/american-football",
        leagues: [{ id: "4391", name: "NFL" }],
    },
    {
        key: "motorsport",
        label: "Мотоспорт",
        icon: ICONS.MOTO,
        href: "/motorsport",
        leagues: [
            { id: "4370", name: "Formula 1" },
            { id: "4486", name: "Formula 2" },
            { id: "4371", name: "Formula E" },
            { id: "4413", name: "WEC" },
            { id: "4409", name: "WRC" },
        ],
    },
];






const Header = () => {

    const { user } = useUserStore()
    const router = useRouter()
    const [isSportOpen, setIsSportOpen] = useState(false);
    const [hoveredSport, setHoveredSport] = useState<string>(SPORT_MENU[0].key);
    const activeSport = SPORT_MENU.find(s => s.key === hoveredSport) ?? SPORT_MENU[0];
    const sportMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!isSportOpen) return;
        const handlePointer = (e: MouseEvent) => {
            const target = e.target as Node | null;
            if (sportMenuRef.current && target && !sportMenuRef.current.contains(target)) {
                setIsSportOpen(false);
            }
        };
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsSportOpen(false);
        };
        document.addEventListener("mousedown", handlePointer);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handlePointer);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isSportOpen]);
    const activeBadgeQueries = useLeagueLookups(activeSport.leagues.map(l => l.id));
    const badgeFor = (idx: number): string | undefined =>
        activeBadgeQueries[idx]?.data?.lookup?.[0]?.strBadge ?? undefined;

    const goToSport = (entry: SportEntry, leagueId?: string) => {
        const url = leagueId ? `${entry.href}?league=${leagueId}` : entry.href;
        router.push(url);
        setIsSportOpen(false);
    };


    return (
        <div className="w-full bg-[#ffffff] px-4 sm:px-6 lg:px-10 py-4 flex flex-col gap-4">


            <div className="flex h-auto lg:h-[70px] items-center justify-between gap-3 w-full flex-wrap lg:flex-nowrap">
                <Link href="/" className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity" aria-label="На головну">
                    {ICONS.ICON}
                </Link>


                <div className="order-3 lg:order-none w-full lg:w-[600px] h-[44px] lg:h-[50px] flex items-center justify-between pl-4 pr-1 bg-white rounded-[50px] border-2 border-brand-red">
                    <input
                        type="text"
                        placeholder="Що Ви шукаєте?"
                        className="flex-1 min-w-0 bg-transparent outline-none text-body-l text-brand-black placeholder:text-brand-black/40"
                    />
                    <button className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center bg-brand-red rounded-full cursor-pointer hover:opacity-90 transition-opacity shrink-0 [&_svg]:w-5 [&_svg]:h-5 lg:[&_svg]:w-6 lg:[&_svg]:h-6">
                        {ICONS.SEARCH}
                    </button>
                </div>


                <div className="flex items-center gap-2 sm:gap-4 lg:gap-[25px]">

                    <button className="hidden sm:flex h-[44px] lg:h-[50px] min-w-[80px] lg:min-w-[100px] items-center justify-center gap-2 px-4 lg:px-6 rounded-[50px] border-2 border-brand-red text-brand-red text-body-l font-medium cursor-pointer hover:bg-brand-red/5 transition-colors">
                        Мова
                        {ICONS.ArrowDown}
                    </button>


                    {user ? (
                        <div
                            className="w-15 h-15 rounded-full border-2 border-brand-red cursor-pointer flex items-center justify-center bg-gray-50 overflow-hidden"
                            onClick={() => router.push("/profile")}
                        >
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-brand-red text-left text-3xl font-bold">
                                    {user?.name && user.name !== "someName"
                                        ? user.name[0].toUpperCase()
                                        : user?.email
                                            ? user.email[0].toUpperCase()
                                            : "?"}
                                </span>
                            )}
                        </div>
                    ) : (
                        <Link
                            href="?auth=login"
                            className="flex h-[44px] lg:h-[50px] min-w-[80px] lg:min-w-[100px] items-center justify-center px-4 lg:px-6 bg-brand-red rounded-[50px] text-white text-body-l font-medium hover:opacity-90 transition-opacity"
                        >
                            Увійти
                        </Link>
                    )}



                </div>
            </div>


            <div className="flex items-center justify-between w-full h-auto lg:h-20 gap-2 sm:gap-4 flex-wrap">
                <nav className="flex items-center gap-2 sm:gap-4 lg:gap-12 shrink-0">
                    <div className="flex items-center gap-1 sm:gap-3 lg:gap-[30px]">
                        {navItems.map((item, index) => {
                            if (item.label === "СПОРТ") {
                                return (
                                    <div key={index} className="relative" ref={sportMenuRef}>
                                        <button
                                            onClick={() => setIsSportOpen(!isSportOpen)}
                                            className="flex items-center justify-center gap-2 p-2.5 rounded-[10px] hover:bg-brand-red/5 transition-colors group cursor-pointer"
                                        >
                                            <div className="w-9 h-9 lg:w-[18px] lg:h-[18px] flex items-center justify-center rounded-full border-2 border-brand-red lg:border-0 [&_svg]:w-4 [&_svg]:h-4 lg:[&_svg]:w-full lg:[&_svg]:h-full">
                                                {item.icon}
                                            </div>
                                            <span className="hidden lg:inline text-body-l font-medium text-brand-red uppercase">
                                                {item.label}
                                            </span>
                                            <div className={`${isSportOpen ? "rotate-180" : ""} transition-transform duration-200`}>
                                                {ICONS.ArrowDown}
                                            </div>
                                        </button>

                                        <div
                                            className={`absolute top-[60px] lg:top-[75px] left-0 z-50 w-[min(760px,calc(100vw-2rem))] h-auto
                                                        bg-[#ffffff] border-[2px] border-[#af292a] rounded-[20px]
                                                        shadow-2xl transition-all duration-300 ease-in-out origin-top overflow-hidden ${
                                                isSportOpen
                                                    ? "opacity-100 scale-y-100 pointer-events-auto"
                                                    : "opacity-0 scale-y-0 pointer-events-none"
                                                }`}
                                        >
                                            <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr]">
                                                <div className="flex flex-col gap-1 p-4 sm:p-6 sm:border-r border-gray-200 bg-[#fafafa]">
                                                    {SPORT_MENU.map(s => (
                                                        <button
                                                            key={s.key}
                                                            onClick={() => goToSport(s)}
                                                            onMouseEnter={() => setHoveredSport(s.key)}
                                                            onFocus={() => setHoveredSport(s.key)}
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-[10px] text-left cursor-pointer transition-colors ${
                                                                hoveredSport === s.key
                                                                    ? "bg-[#af292a]/10"
                                                                    : "hover:bg-[#af292a]/5"
                                                            }`}
                                                        >
                                                            <div className="w-7 h-7 flex items-center justify-center shrink-0">
                                                                {s.icon}
                                                            </div>
                                                            <span className={`text-[15px] font-bold leading-tight transition-colors ${
                                                                hoveredSport === s.key ? "text-[#af292a]" : "text-[#212121]"
                                                            }`}>
                                                                {s.label}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex flex-col gap-1 p-4 sm:p-6">
                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                                                        Топ ліги
                                                    </span>
                                                    {activeSport.leagues.map((l, i) => {
                                                        const badge = badgeFor(i);
                                                        return (
                                                            <button
                                                                key={l.id}
                                                                onClick={() => goToSport(activeSport, l.id)}
                                                                className="flex items-center gap-3 px-3 py-2 rounded-[8px] text-[14px] font-medium text-[#212121] hover:bg-[#af292a]/5 hover:text-[#af292a] transition-colors cursor-pointer"
                                                            >
                                                                {badge ? (
                                                                    <Image
                                                                        src={badge}
                                                                        alt=""
                                                                        width={28}
                                                                        height={28}
                                                                        unoptimized
                                                                        className="w-7 h-7 object-contain shrink-0"
                                                                    />
                                                                ) : (
                                                                    <span className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
                                                                )}
                                                                <span className="truncate">{l.name}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            if (item.label === "КІБЕРСПОРТ") {
                                return (
                                    <div key={index} className="relative">
                                        <button
                                            onClick={() => setIsEsportOpen(!isEsportOpen)}
                                            className="flex items-center justify-center gap-2 p-2.5 rounded-[10px] hover:bg-brand-red/5 transition-colors group cursor-pointer"
                                        >
                                            <div className="w-[18px] h-[18px] flex items-center justify-center">
                                                {item.icon}
                                            </div>
                                            <span className="text-body-l font-medium text-brand-red uppercase">
                                                {item.label}
                                            </span>
                                            <div className={`${isEsportOpen ? "rotate-180" : ""} transition-transform duration-200`}>
                                                {ICONS.ArrowDown}
                                            </div>
                                        </button>

                                        <div
                                            className={`absolute top-[75px] left-0 z-50 w-[760px] 
          pt-8 pl-12 pr-8 pb-10 
          bg-white border-[2px] border-[#af292a] rounded-[20px] 
          shadow-2xl transition-all duration-300 origin-top ${isEsportOpen
                                                    ? "opacity-100 scale-y-100 pointer-events-auto"
                                                    : "opacity-0 scale-y-0 pointer-events-none"
                                                }`}
                                        >
                                            <div className="flex flex-col gap-6">

                                                {/* CS2 */}
                                                <button
                                                    onClick={() => {
                                                        router.push("/esport/cs2");
                                                        setIsEsportOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 group cursor-pointer w-full"
                                                >
                                                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                                        <img src="/icons/cs2.jpg"/>
                                                    </div>
                                                    <span className="text-[18px] font-bold text-[#212121] group-hover:text-[#af292a]">
                                                        CS 2
                                                    </span>
                                                </button>

                                            
                                                <button
                                                    onClick={() => {
                                                        router.push("/esport/dota");
                                                        setIsEsportOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 group cursor-pointer w-full"
                                                >
                                                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                                        <img src={"/icons/dota2.png"}/>
                                                    </div>
                                                    <span className="text-[18px] font-bold text-[#212121] group-hover:text-[#af292a]">
                                                        Dota 2
                                                    </span>
                                                </button>

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
                                    <div className="w-9 h-9 lg:w-[18px] lg:h-[18px] flex items-center justify-center rounded-full border-2 border-brand-red lg:border-0 [&_svg]:w-4 [&_svg]:h-4 lg:[&_svg]:w-full lg:[&_svg]:h-full">
                                        {item.icon}
                                    </div>
                                    <span className="hidden lg:inline text-body-l font-medium text-brand-red uppercase">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="flex items-center gap-3 sm:gap-5 lg:gap-8 px-2 lg:px-4 shrink-0">
                    <button className="cursor-pointer hover:opacity-70 transition-opacity">{ICONS.NOTIFY}</button>
                    <button className="cursor-pointer hover:opacity-70 transition-opacity">{ICONS.STAR}</button>
                    <button className="hidden sm:inline-flex cursor-pointer hover:opacity-70 transition-opacity">{ICONS.TV}</button>
                    <button className="hidden sm:inline-flex cursor-pointer hover:opacity-70 transition-opacity">{ICONS.ASK}</button>
                    <button className="cursor-pointer hover:opacity-70 transition-opacity">{ICONS.SETTING}</button>
                </div>
            </div>

        </div>
    );
};

export default Header;
