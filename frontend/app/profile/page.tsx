'use client'

import { useUserStore } from "@/store/useUserStore"
import { ICONS } from "../svg"
import { useScroll } from "framer-motion"
import { useState } from "react"
import { usePutApiUserId } from "@/services/api/generated"

const Profile = () => {
    const { user, isLoading, setUser } = useUserStore()

    const [nameEditing, setNameEditing] = useState(false)

    if (isLoading) return <div className="p-10 text-brand-red">Завантаження...</div>
    
    const {mutateAsync } = usePutApiUserId()


    const handleLogout = () => {
        setUser(null)
        location.href = "/"
    }



    const competitions = [
        { name: "Ліга Європи УЄФА", icon: "/Vector.svg" },
        { name: "Євроліга", icon: "/Group.svg" },
        { name: "United21", icon: "/Vector1.svg" },
        { name: "Formula1", icon: "/ic-round-sports-motorsports.svg" },
        { name: "NFL Preseason", icon: "/Data-Values-Five.svg" },
    ];

    const teams = [
        { name: "FC Bayern München", icon: "/Vector.svg" },
        { name: "Kansas City Chiefs", icon: "/Data-Values-Five.svg" },
        { name: "G2 Ares", icon: "/Vector1.svg" },
        { name: "Hapoel Tel-Aviv", icon: "/Group.svg" },
        { name: "LPH Gaming", icon: "/Vector1.svg" },
    ];

    const stats = [
        { label: "Публікації", value: 35 },
        { label: "Коментарі", value: 123 },
        { label: "Вподобайки", value: 241 },
    ];

    const players = [
        { name: "Cristiano Ronaldo", icon: "/Vector.svg" },
        { name: "Lionel Messi", icon: "/Group.svg" },
        { name: "Kevin De Bruyne", icon: "/Vector1.svg" },
        { name: "Erling Haaland", icon: "/Data-Values-Five.svg" },
        { name: "Kylian Mbappé", icon: "/Vector.svg" },
    ];

    const recentActivities = [
        { type: "Пост: ", title: "Як вам гра Шахтаря?", date: "Сьогодні, 12:40", icon: "📝" },
        { type: "Коментар: ", title: "Згоден, арбітр помилився...", date: "Вчора, 20:15", icon: "💬" },
        { type: "Лайк: ", title: "Топ-10 голів тижня", date: "15 Квітня", icon: "❤️" },
    ];



    return (

        <div className="bg-[#efefef] flex flex-row justify-center p-5 min-h-screen  font-['Space_Grotesk']">

            <aside className="w-[400px] shrink-0 px-5">
                <div className="sticky top-5 bg-white rounded-[20px] p-8 flex flex-col gap-6 border-2 border-brand-red shadow-sm">

                    <div className="flex flex-col items-center gap-3">
                        <div className="w-24 h-24 rounded-full border-2 border-brand-red flex items-center justify-center bg-gray-50 overflow-hidden">
                            <span className="text-brand-red text-left text-3xl font-bold">
                                {user?.email?.[0] || "?"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-row items-center gap-4">
                                {nameEditing ? (
                                    <input
                                        autoFocus
                                        className="text-xl font-bold text-brand-red uppercase tracking-wide bg-gray-50 border-b-2 border-brand-red outline-none px-1"
                                        value={user?.name || ""}
                                        onChange={(e) => {
                                           
                                            if (user) setUser({ ...user, name: e.target.value });
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') setNameEditing(false); 
                                        }}
                                    />
                                ) : (
                                    <h2 className="text-xl text-left font-bold text-brand-red uppercase tracking-wide">
                                        {user?.name || user?.email}
                                    </h2>
                                )}

                                <div className="flex flex-row gap-4 items-center">
                                    {nameEditing ? (
                                        <span
                                            className="cursor-pointer hover:scale-110 transition-transform"
                                            onClick={() => {
                                                setNameEditing(false);

                                                
                                            }}
                                        >
                                            {ICONS.STAR}
                                        </span>
                                    ) : (
                                        <span
                                            className="cursor-pointer hover:opacity-70 transition-opacity"
                                            onClick={() => setNameEditing(true)}
                                        >
                                            {ICONS.Edit}
                                        </span>
                                    )}
                                    <span className="cursor-pointer hover:opacity-70 transition-opacity">
                                        {ICONS.Share}
                                    </span>
                                </div>
                            </div>

                        </div>


                    </div>


                    <section className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12px] text-brand-red font-medium ml-4 uppercase">Дата народження</label>
                            <div className="w-full h-[50px] rounded-[20px] bg-gray-50 border-2 border-brand-red flex items-center px-6">
                                <input
                                    className="w-full bg-transparent outline-none font-bold text-brand-red opacity-50 cursor-not-allowed"
                                    value="ДД.ММ.РРРР"
                                    disabled
                                    type="text"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button className="w-full h-[50px] rounded-[20px] border-2 border-brand-red flex items-center px-6 text-brand-red font-bold hover:bg-brand-red/5 transition-colors cursor-pointer">
                                Активність
                            </button>
                            <button className="w-full h-[50px] rounded-[20px] border-2 border-brand-red flex items-center px-6 text-brand-red font-bold hover:bg-brand-red/5 transition-colors cursor-pointer">
                                Улюблене
                            </button>
                            <button className="w-full h-[50px] rounded-[20px] border-2 border-brand-red flex items-center px-6 text-brand-red font-bold hover:bg-brand-red/5 transition-colors cursor-pointer">
                                Змінити пароль
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <button onClick={handleLogout} className="w-full h-[50px] rounded-[20px] bg-brand-red text-white font-bold hover:opacity-90 transition-opacity cursor-pointer">
                                Вийти
                            </button>
                            <button className="text-sm text-brand-red/50 font-medium hover:text-brand-red transition-colors cursor-pointer mt-2">
                                Видалити акаунт
                            </button>
                        </div>
                    </section>
                </div>
            </aside>


            <main className="flex-1 border-[2px] rounded-[20px] border-brand-red max-w-[900px] p-10 flex flex-col gap-12 text-brand-black 
                 h-[calc(100vh-40px)] sticky top-5 overflow-y-auto custom-scrollbar">

                {/* Секция Активність */}
                <section className="w-full flex flex-col gap-6">
                    <h2 className="text-[1.5rem] font-bold uppercase leading-none">
                        Активність
                    </h2>
                    <div className="grid grid-cols-3 gap-5">
                        {stats.map((item, index) => (
                            <div key={index} className="h-[100px] flex flex-col items-center justify-center gap-1 bg-brand-red text-white rounded-[20px] shadow-md transition-transform hover:scale-[1.02]">
                                <span className="text-[1rem] font-medium opacity-90">{item.label}</span>
                                <span className="text-[1.5rem] font-bold leading-none">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Секция Остання активність */}
                <section className="w-full flex flex-col gap-6">
                    <h2 className="text-[1.5rem] font-bold uppercase leading-none">
                        Остання активність
                    </h2>
                    <div className="flex flex-col gap-3">
                        {recentActivities.map((item, index) => (
                            <div
                                key={index}
                                className="w-full min-h-[70px] bg-gray-50 border-2 border-brand-red rounded-[20px] flex flex-row items-center px-6 gap-4 hover:bg-brand-red/5 transition-colors cursor-pointer group"
                            >
                                <div className="flex flex-1 items-center justify-between">
                                    <div className="flex flex-row gap-6 items-center">
                                        <span className="text-[14px] font-bold uppercase text-brand-red">{item.type}</span>
                                        <span className="text-[14px] font-medium text-brand-black ">
                                            {item.title}
                                        </span>
                                    </div>
                                    <span className="text-[12px] text-brand-black/40 font-medium">
                                        {item.date}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Секция Улюблене */}
                <section className="w-full flex flex-col gap-10">
                    <h2 className="text-[2rem] font-bold text-brand-black uppercase border-b-2 border-brand-red/10 pb-2">
                        Улюблене
                    </h2>

                    {/* Змагання */}
                    <div className="flex flex-col gap-5">
                        <h2 className="font-bold ">Змагання</h2>
                        <div className="grid grid-cols-5 gap-4">
                            {competitions.map((item, idx) => (
                                <div key={idx} className="aspect-[4/5] shadow-lg rounded-[20px] bg-brand-red flex flex-col items-center justify-end pb-5 px-2 gap-3 relative transition-transform hover:scale-105 cursor-pointer">
                                    <div className="w-10 h-10 absolute top-4 bg-white rounded-full flex items-center justify-center">
                                        <img src={item.icon} alt="" className="w-5 h-5 object-contain" />
                                    </div>
                                    <span className="text-[0.75rem] text-white font-medium text-center leading-tight">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Команди */}
                    <div className="flex flex-col gap-5">
                        <h2 className="font-bold text-brand-black">Команди</h2>
                        <div className="grid grid-cols-5 gap-4">
                            {teams.map((item, idx) => (
                                <div key={idx} className="aspect-[4/5] shadow-lg rounded-[20px] bg-brand-red flex flex-col items-center justify-end pb-5 px-2 gap-3 relative transition-transform hover:scale-105 cursor-pointer">
                                    <div className="w-10 h-10 absolute top-4 bg-white rounded-full flex items-center justify-center">
                                        <img src={item.icon} alt="" className="w-5 h-5 object-contain" />
                                    </div>
                                    <span className="text-[0.75rem] text-white font-medium text-center leading-tight">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Гравці */}
                    <div className="flex flex-col gap-5">
                        <h3 className="text-[1.25rem] font-bold text-brand-black">Гравці</h3>
                        <div className="grid grid-cols-5 gap-4">
                            {players.map((item, idx) => (
                                <div key={idx} className="aspect-[4/5] shadow-lg rounded-[20px] bg-brand-red flex flex-col items-center justify-end pb-5 px-2 gap-3 relative transition-transform hover:scale-105 cursor-pointer">
                                    <div className="w-10 h-10 absolute top-4 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
                                        <img src={item.icon} alt="" className="w-full h-full object-contain p-1" />
                                    </div>
                                    <span className="text-[0.7rem] text-white font-bold text-center leading-tight uppercase">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <div className="px-6">
                <img src={"banners/banner.png"} className="w-[200px] h-[700px] rounded-[20px];" />

            </div>
        </div>

    )
}

export default Profile
