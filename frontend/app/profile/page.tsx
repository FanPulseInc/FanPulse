'use client'

import { useUserStore } from "@/store/useUserStore"
import { ICONS } from "../svg"
import { useState } from "react"
import { useDeleteApiUserId, usePutApiUserId } from "@/services/api/generated"
import Toast from "../_components/Toast"
import MainProfile from "./_components/MainProfile"
import RecentActivity from "./_components/RecentActivity"
import ChangePassword from "./_components/ChangePassword"
import DeleteAccountModal from "./_components/DeleteAccountModal"

const Profile = () => {
    const { user, isLoading, setUser } = useUserStore()

    const [nameEditing, setNameEditing] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const { mutateAsync: deleteUser } = useDeleteApiUserId()

    const [activeTab, setActiveTab] = useState<"main" | "activity" | "favorites" | "password">("main")

    const [toast, setToast] = useState<{
        message: string
        type: "success" | "error"
    } | null>(null)
    const { mutateAsync: rename } = usePutApiUserId()

    if (isLoading) return <div className="p-10 text-brand-red">Завантаження...</div>

    const uploadAvatar = async (file: File) => {
        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/upload/avatar", {
            method: "POST",
            body: formData,
        })

        // для дебага оставим
        const text = await res.text()
        console.log("STATUS:", res.status)
        console.log("RESPONSE:", text)

        if (!res.ok) {
            throw new Error("Upload failed")
        }

        const data = JSON.parse(text)
        return data.url as string
    }


    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if (!file || !user) return

        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))

        try {
            const avatarUrl = await uploadAvatar(file)
            await rename({
                id: user.id ?? "",
                data: {
                    name: user.name,
                    avatarUrl,
                },
            })

            setUser({
                ...user,
                avatarUrl,
            })

            setToast({
                message: "Фото акаунта оновлено",
                type: "success",
            })
        } catch (e) {
            console.error(e)

            setToast({
                message: "Помилка при зміні фото",
                type: "error",
            })
        }
    }




    const handleLogout = () => {
        setUser(null)
        localStorage.removeItem("token")
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
        { label: "Публікації", value: user?.countOfPosts },
        { label: "Коментарі", value: user?.countOfComments },
        { label: "Вподобайки", value: user?.countOfLkes },
    ];

    const players = [
        { name: "Cristiano Ronaldo", icon: "/Vector.svg" },
        { name: "Lionel Messi", icon: "/Group.svg" },
        { name: "Kevin De Bruyne", icon: "/Vector1.svg" },
        { name: "Erling Haaland", icon: "/Data-Values-Five.svg" },
        { name: "Kylian Mbappé", icon: "/Vector.svg" },
    ];
    return (

        <div className="bg-[#efefef] flex flex-row justify-center p-5 min-h-screen  font-['Space_Grotesk']">

            <aside className="w-[400px] shrink-0 px-5">
                <div className="sticky top-5 bg-white rounded-[20px] p-8 flex flex-col gap-6 border-2 border-brand-red shadow-sm">

                    <div className="flex flex-col items-center gap-3">
                        <label className="w-24 h-24 rounded-full border-2 border-brand-red flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                            {avatarPreview || user?.avatarUrl ? (
                                <img
                                    src={avatarPreview || user?.avatarUrl || ""}
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

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </label>

                        <label className="text-sm text-brand-red cursor-pointer hover:underline">
                            Змінити фото акаунта
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </label>

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
                                        {user?.name && user.name !== "someName"
                                            ? user.name
                                            : user?.email}
                                    </h2>
                                )}

                                <div className="flex flex-row gap-4 items-center">
                                    {nameEditing ? (
                                        <span
                                            className="cursor-pointer hover:scale-110 transition-transform"
                                            onClick={async () => {
                                                try {
                                                    setNameEditing(false)

                                                    const payload = { name: user?.name }

                                                    await rename({ id: user?.id ?? "", data: payload })

                                                    setToast({
                                                        message: "Імʼя успішно змінено",
                                                        type: "success",
                                                    })
                                                } catch (e) {
                                                    console.error(e)

                                                    setToast({
                                                        message: "Помилка при зміні імені",
                                                        type: "error",
                                                    })
                                                }
                                            }}
                                        >
                                            {ICONS.MARK}
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
                            <button
                                onClick={() => setActiveTab("main")}
                                className="w-full h-[50px] rounded-[20px] border-2 border-brand-red flex items-center px-6 text-brand-red font-bold hover:bg-brand-red/5 transition-colors cursor-pointer"
                            >
                                Улюблене
                            </button>
                            <button
                                onClick={() => setActiveTab("activity")}
                                className="w-full h-[50px] rounded-[20px] border-2 border-brand-red flex items-center px-6 text-brand-red font-bold hover:bg-brand-red/5 transition-colors cursor-pointer"
                            >
                                Активність
                            </button>



                            <button
                                onClick={() => setActiveTab("password")}
                                className="w-full h-[50px] rounded-[20px] border-2 border-brand-red flex items-center px-6 text-brand-red font-bold hover:bg-brand-red/5 transition-colors cursor-pointer"
                            >
                                Змінити пароль
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <button onClick={handleLogout} className="w-full h-[50px] rounded-[20px] bg-brand-red text-white font-bold hover:opacity-90 transition-opacity cursor-pointer">
                                Вийти
                            </button>
                            <button
                                onClick={() => setIsDeleteOpen(true)}
                                className="text-sm text-brand-red/50 font-medium hover:text-brand-red transition-colors cursor-pointer mt-2"
                            >
                                Видалити акаунт
                            </button>
                        </div>
                    </section>
                </div>
            </aside >


            <main className="flex-1 border-[2px] rounded-[20px] border-brand-red max-w-[900px] p-10 flex flex-col gap-12 text-brand-black h-[calc(100vh-40px)] sticky top-5 overflow-y-auto custom-scrollbar">
                {activeTab === "main" && (
                    <MainProfile
                        user={user}
                        stats={stats}
                        competitions={competitions}
                        teams={teams}
                        players={players}
                    />
                )}

                {activeTab === "activity" && (
                    <RecentActivity user={user} />
                )}

                {activeTab === "password" && (
                    <ChangePassword />
                )}
            </main>
            <div className="px-6">
                <img src={"banners/fanpulse_banner_v2.gif"} className="w-[200px] h-[700px] rounded-[20px];" />

            </div>
            {
                toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )
            }
            <DeleteAccountModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={async () => {
                    console.log("DELETE ACCOUNT")

                    await deleteUser({ id: user?.id || "" })

                    setUser(null)
                    localStorage.removeItem("token")
                    location.href = "/"
                }}
            />
        </div >


    )
}

export default Profile
