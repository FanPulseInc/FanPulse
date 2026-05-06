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
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        user?.avatarUrl ?? null
    )
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
            throw new Error("S3 upload failed")
        }

        return publicUrl as string
    }

    const handleAvatarChange = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0]

        if (!file || !user) return

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

    const handleNameSave = async () => {
        if (!user) return

        try {
            await rename({
                id: user.id ?? "",
                data: {
                    name: user.name,
                },
            })

            setNameEditing(false)

            setToast({
                message: "Імʼя оновлено",
                type: "success",
            })
        } catch (e) {
            console.error(e)

            setToast({
                message: "Помилка при зміні імені",
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
        { label: t("profile_publications"), value: user?.countOfPosts ?? 0 },
        { label: t("profile_comments_count"), value: user?.countOfComments ?? 0 },
        { label: t("profile_likes_count"), value: user?.countOfLkes ?? 0 },
    ];

    const players: { name: string; icon: string }[] = [];
    return (
        <div className="min-h-screen bg-[#efefef] p-4 md:p-5 font-sans">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 xl:flex-row xl:items-start xl:justify-center">

                {/* SIDEBAR */}
                <aside className="w-full shrink-0 xl:w-[390px]">
                    <div className="bg-white rounded-[24px] md:rounded-[28px] p-5 md:p-8 flex flex-col gap-6 md:gap-8 border-2 border-brand-red shadow-sm xl:sticky xl:top-5">

                        {/* AVATAR */}
                        <div className="flex flex-col items-center gap-4">
                            <label className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-[3px] border-brand-red cursor-pointer group">
                                {avatarPreview || user?.avatarUrl ? (
                                    <img
                                        src={avatarPreview || user?.avatarUrl || ""}
                                        alt="avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#f5f5f5] text-brand-red text-3xl md:text-4xl font-bold">
                                        {user?.name?.[0]?.toUpperCase() ||
                                            user?.email?.[0]?.toUpperCase() ||
                                            "?"}
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

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
                                            value={user?.name || ""}
                                            onChange={(e) => {
                                                if (user) {
                                                    setUser({
                                                        ...user,
                                                        name: e.target.value,
                                                    })
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleNameSave()
                                                }

                                                if (e.key === "Escape") {
                                                    setNameEditing(false)
                                                }
                                            }}
                                            className="min-w-0 max-w-[240px] text-center text-xl md:text-2xl font-semibold text-brand-red border-b-2 border-brand-red bg-transparent outline-none"
                                        />
                                    ) : (
                                        <h2 className="min-w-0 truncate text-center text-xl md:text-2xl font-semibold text-brand-red">
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


                            {/* MENU */}
                            <div className="flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("main")}
                                    className={`h-[52px] rounded-2xl border-2 border-brand-red transition-all font-semibold text-left px-5 cursor-pointer ${activeTab === "main"
                                            ? "bg-brand-red text-white"
                                            : "bg-white text-brand-red hover:bg-brand-red hover:text-white"
                                        }`}
                                >
                                    {t("profile_favourite_tab")}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("activity")}
                                    className={`h-[52px] rounded-2xl border-2 border-brand-red transition-all font-semibold text-left px-5 cursor-pointer ${activeTab === "activity"
                                            ? "bg-brand-red text-white"
                                            : "bg-white text-brand-red hover:bg-brand-red hover:text-white"
                                        }`}
                                >
                                    {t("profile_activity_tab")}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("password")}
                                    className={`h-[52px] rounded-2xl border-2 border-brand-red transition-all font-semibold text-left px-5 cursor-pointer ${activeTab === "password"
                                            ? "bg-brand-red text-white"
                                            : "bg-white text-brand-red hover:bg-brand-red hover:text-white"
                                        }`}
                                >
                                    {t("profile_change_password")}
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 mt-4">
                                <button onClick={handleLogout} className="w-full h-[50px] rounded-[20px] bg-brand-red text-white font-bold hover:opacity-90 transition-opacity cursor-pointer">
                                    {t("profile_logout")}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsDeleteOpen(true)}
                                    className="text-sm text-brand-red/60 hover:text-brand-red transition-colors cursor-pointer"
                                >
                                    {t("profile_delete_account")}
                                </button>
                            </div>
                        </section>
                    </div>


                </aside>

                {/* MAIN */}
                <main className="w-full flex-1 bg-white rounded-[24px] md:rounded-[28px] border-2 border-brand-red p-5 md:p-8 lg:p-10 overflow-y-auto xl:h-[calc(100vh-40px)] xl:sticky xl:top-5 xl:max-w-[920px]">
                    {activeTab === "main" && (
                        <MainProfile
                            user={user ?? undefined}
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
            

                {/* BANNER */}
                <div className="hidden 2xl:block shrink-0 px-6">
                    <img
                        src="banners/fanpulse_banner_v2.gif"
                        alt="FanPulse banner"
                        className="w-[220px] h-[700px] rounded-[28px] border-2 border-brand-red object-cover"
                    />
                </div>
            
            </div>


            

            {/* TOAST */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* DELETE MODAL */}
            <DeleteAccountModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={async () => {
                    await deleteUser({
                        id: user?.id || "",
                    })

                    setUser(null)
                    localStorage.removeItem("token")
                    location.href = "/"
                }}
            />
        </div>
    )
}

export default Profile