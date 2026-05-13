"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ICONS } from "../../svg"
import { useUserStore } from "@/store/useUserStore"
import {
  useDeleteApiUserId,
  usePutApiUserId,
} from "@/services/api/generated"
import type { UserResponse } from "@/services/api/model/userResponse"
import Toast from "@/app/_components/Toast"
import MainProfile from "./MainProfile"
import ChangePassword from "./ChangePassword"
import DeleteAccountModal from "./DeleteAccountModal"
import Activity from "./Activity"
import { useT } from "@/services/i18n/context"
import { useFavoriteTeamsResolved } from "@/services/useFavoriteTeams"

type ProfileTab = "main" | "activity" | "password"

export default function ProfileView({
  profileUser,
  isOwnProfile,
}: {
  profileUser: UserResponse
  isOwnProfile: boolean
}) {
  const { t } = useT()
  const router = useRouter()
  const { setUser, user: currentUser } = useUserStore()

  const [localUser, setLocalUser] = useState<UserResponse>(profileUser)
  const [nameEditing, setNameEditing] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profileUser?.avatarUrl ?? null
  )
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<ProfileTab>("main")
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error"
  } | null>(null)

  const { mutateAsync: deleteUser } = useDeleteApiUserId()
  const { mutateAsync: rename } = usePutApiUserId()

  const { teams: favTeams, competitions: favCompetitions } =
    useFavoriteTeamsResolved()

  const displayName =
    localUser?.name && localUser.name !== "someName"
      ? localUser.name
      : localUser?.email

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${localUser.id}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: displayName || "FanPulse profile",
          text: "Подивись профіль на FanPulse",
          url: profileUrl,
        })
        return
      }

      await navigator.clipboard.writeText(profileUrl)

      setToast({
        message: "Посилання на профіль скопійовано",
        type: "success",
      })
    } catch (error) {
      console.error(error)

      setToast({
        message: "Не вдалося поділитися профілем",
        type: "error",
      })
    }
  }

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
    if (!isOwnProfile) return

    const file = e.target.files?.[0]
    if (!file || !localUser) return

    setAvatarPreview(URL.createObjectURL(file))

    try {
      const avatarUrl = await uploadAvatar(file)

      await rename({
        id: localUser.id ?? "",
        data: {
          name: localUser.name,
          avatarUrl,
        },
      })

      const updatedUser = {
        ...localUser,
        avatarUrl,
      }

      setLocalUser(updatedUser)
      setUser(updatedUser)

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
    if (!isOwnProfile || !localUser) return

    try {
      await rename({
        id: localUser.id ?? "",
        data: {
          name: localUser.name,
        },
      })

      setNameEditing(false)
      setUser(localUser)

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
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("token")
    location.href = "/"
  }

  const competitions = isOwnProfile
    ? favCompetitions.map((c) => ({
        name: c.name,
        icon: c.badge || "/icons/question_mark.png",
      }))
    : []

  const teams = isOwnProfile
    ? favTeams.map((t) => ({
        name: t.name,
        icon: t.badge || "/icons/question_mark.png",
      }))
    : []

  const players: { name: string; icon: string }[] = []

  const stats = [
    { label: t("profile_publications"), value: localUser?.countOfPosts ?? 0 },
    { label: t("profile_comments_count"), value: localUser?.countOfComments ?? 0 },
    { label: t("profile_likes_count"), value: localUser?.countOfLkes ?? 0 },
  ]

  return (
    <div className="min-h-screen bg-surface-tertiary p-4 md:p-5 font-sans">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 xl:flex-row xl:items-start xl:justify-center">
        <aside className="w-full shrink-0 xl:w-[390px]">
          <div className="bg-surface rounded-[24px] md:rounded-[28px] p-5 md:p-8 flex flex-col gap-6 md:gap-8 border-2 border-brand-red shadow-sm xl:sticky xl:top-5">
            <div className="flex flex-col items-center gap-4">
              <label
                className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-[3px] border-brand-red group ${
                  isOwnProfile ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {avatarPreview || localUser?.avatarUrl ? (
                  <img
                    src={avatarPreview || localUser?.avatarUrl || ""}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-secondary text-brand-red text-3xl md:text-4xl font-bold">
                    {localUser?.name?.[0]?.toUpperCase() ||
                      localUser?.email?.[0]?.toUpperCase() ||
                      "?"}
                  </div>
                )}

                {isOwnProfile && (
                  <>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </>
                )}
              </label>

              {isOwnProfile && (
                <label className="text-sm text-brand-red cursor-pointer hover:underline">
                  {t("profile_change_photo")}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              )}

              <div className="flex flex-col gap-1">
                <div className="flex min-w-0 flex-row items-center gap-4">
                  {isOwnProfile && nameEditing ? (
                    <input
                      autoFocus
                      value={localUser?.name || ""}
                      onChange={(e) => {
                        setLocalUser({
                          ...localUser,
                          name: e.target.value,
                        })
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNameSave()
                        if (e.key === "Escape") setNameEditing(false)
                      }}
                      className="min-w-0 max-w-[240px] text-center text-xl md:text-2xl font-semibold text-brand-red border-b-2 border-brand-red bg-transparent outline-none"
                    />
                  ) : (
                    <h2 className="min-w-0 max-w-[220px] truncate text-center text-xl md:text-2xl font-semibold text-brand-red">
                      {displayName}
                    </h2>
                  )}

                  <div className="shrink-0 flex flex-row gap-4 items-center">
                    {isOwnProfile && (
                      <>
                        {nameEditing ? (
                          <span
                            className="cursor-pointer hover:scale-110 transition-transform"
                            onClick={handleNameSave}
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
                      </>
                    )}

                    <span
                      onClick={handleShareProfile}
                      className="cursor-pointer hover:opacity-70 transition-opacity"
                    >
                      {ICONS.Share}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("main")}
                  className={`h-[52px] rounded-2xl border-2 border-brand-red transition-all font-semibold text-left px-5 cursor-pointer ${
                    activeTab === "main"
                      ? "bg-brand-red text-white"
                      : "bg-surface text-brand-red hover:bg-brand-red hover:text-white"
                  }`}
                >
                  {t("profile_favourite_tab")}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("activity")}
                  className={`h-[52px] rounded-2xl border-2 border-brand-red transition-all font-semibold text-left px-5 cursor-pointer ${
                    activeTab === "activity"
                      ? "bg-brand-red text-white"
                      : "bg-surface text-brand-red hover:bg-brand-red hover:text-white"
                  }`}
                >
                  {t("profile_activity_tab")}
                </button>

                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("password")}
                    className={`h-[52px] rounded-2xl border-2 border-brand-red transition-all font-semibold text-left px-5 cursor-pointer ${
                      activeTab === "password"
                        ? "bg-brand-red text-white"
                        : "bg-surface text-brand-red hover:bg-brand-red hover:text-white"
                    }`}
                  >
                    {t("profile_change_password")}
                  </button>
                )}
              </div>

              {isOwnProfile && (
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={handleLogout}
                    className="w-full h-[50px] rounded-[20px] bg-brand-red text-white font-bold hover:opacity-90 transition-opacity cursor-pointer"
                  >
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
              )}
            </section>
          </div>
        </aside>

        <main className="w-full flex-1 bg-surface rounded-[24px] md:rounded-[28px] border-2 border-brand-red p-5 md:p-8 lg:p-10 overflow-y-auto xl:h-[calc(100vh-40px)] xl:sticky xl:top-5 xl:max-w-[920px]">
          {activeTab === "main" && (
            <MainProfile
              user={localUser}
              stats={stats}
              competitions={competitions}
              teams={teams}
              players={players}
            />
          )}

          {activeTab === "activity" && <Activity user={localUser} />}

          {isOwnProfile && activeTab === "password" && <ChangePassword />}
        </main>

        <div className="hidden 2xl:block shrink-0 px-6">
          <img
            src="/banners/fanpulse_banner_v2.gif"
            alt="FanPulse banner"
            className="w-[220px] h-[700px] rounded-[28px] border-2 border-brand-red object-cover"
          />
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {isOwnProfile && (
        <DeleteAccountModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={async () => {
            await deleteUser({
              id: currentUser?.id || "",
            })

            setUser(null)
            localStorage.removeItem("token")
            location.href = "/"
          }}
        />
      )}
    </div>
  )
}