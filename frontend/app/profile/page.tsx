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
import { useT } from "@/services/i18n/context"
import { useFavoriteTeamsResolved } from "@/services/useFavoriteTeams"

const Profile = () => {
    const { t } = useT()
    const { user, isLoading, setUser } = useUserStore()

    const [nameEditing, setNameEditing] = useState(false)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl ?? null)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)

    const { mutateAsync: deleteUser } = useDeleteApiUserId()
    const { teams: favTeams, competitions: favCompetitions } = useFavoriteTeamsResolved()

    const [activeTab, setActiveTab] = useState<"main" | "activity" | "favorites" | "password">("main")

    const [toast, setToast] = useState<{
        message: string
        type: "success" | "error"
    } | null>(null)
    const { mutateAsync: rename } = usePutApiUserId()

    if (isLoading) return <div className="p-10 text-brand-red">{t("loading")}</div>

    const uploadAvatar = async (file: File) => {
        const res = await fetch("/api/upload/avatar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
            }),
        })

        if (!res.ok) {
            const text = await res.text()
            console.error("Create signed URL failed:", text)
            throw new Error("Upload failed")
        }

        const { uploadUrl, publicUrl } = await res.json()

        const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "Content-Type": file.type,
            },
            body: file,
        })

        if (!uploadRes.ok) {
            const text = await uploadRes.text()
            console.error("S3 upload failed:", text)
            throw new Error("S3 upload failed")
        }

        return publicUrl as string
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
                message: t("profile_photo_updated"),
                type: "success",
            })
        } catch (e) {
            console.error(e)

            setToast({
                message: t("profile_photo_error"),
                type: "error",
            })
        }
    }




    const handleLogout = () => {
        setUser(null)
        localStorage.removeItem("token")
        location.href = "/"
    }



    const competitions = favCompetitions.map((c) => ({
        name: c.name,
        icon: c.badge || "/icons/question_mark.png",
    }));

    const teams = favTeams.map((t) => ({
        name: t.name,
        icon: t.badge || "/icons/question_mark.png",
    }));

    const stats = [
        { label: t("profile_publications"), value: user?.countOfPosts },
        { label: t("profile_comments_count"), value: user?.countOfComments },
        { label: t("profile_likes_count"), value: user?.countOfLkes },
    ];

    const players: { name: string; icon: string }[] = [];
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
                            {t("profile_change_photo")}
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
                                                        message: t("profile_name_updated"),
                                                        type: "success",
                                                    })
                                                } catch (e) {
                                                    console.error(e)

                                                    setToast({
                                                        message: t("profile_name_error"),
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
                            <label className="text-[12px] text-brand-red font-medium ml-4 uppercase">{t("profile_birthday")}</label>
                            <div className="w-full h-[50px] rounded-[20px] bg-gray-50 border-2 border-brand-red flex items-center px-6">
                                <input
                                    className="w-full bg-transparent outline-none font-bold text-brand-red opacity-50 cursor-not-allowed"
                                    value={t("birthday_placeholder")}
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
                                {t("profile_favourite_tab")}
                            </button>
                            <button
                                onClick={() => setActiveTab("activity")}
                                className="w-full h-[50px] rounded-[20px] border-2 border-brand-red flex items-center px-6 text-brand-red font-bold hover:bg-brand-red/5 transition-colors cursor-pointer"
                            >
                                {t("profile_activity_tab")}
                            </button>



                            <button
                                onClick={() => setActiveTab("password")}
                                className="w-full h-[50px] rounded-[20px] border-2 border-brand-red flex items-center px-6 text-brand-red font-bold hover:bg-brand-red/5 transition-colors cursor-pointer"
                            >
                                {t("profile_change_password")}
                            </button>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <button onClick={handleLogout} className="w-full h-[50px] rounded-[20px] bg-brand-red text-white font-bold hover:opacity-90 transition-opacity cursor-pointer">
                                {t("profile_logout")}
                            </button>
                            <button
                                onClick={() => setIsDeleteOpen(true)}
                                className="text-sm text-brand-red/50 font-medium hover:text-brand-red transition-colors cursor-pointer mt-2"
                            >
                                {t("profile_delete_account")}
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
