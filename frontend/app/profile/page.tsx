"use client"

import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/useUserStore"
import { useT } from "@/services/i18n/context"
import ProfileView from "./_components/ProfileView"

export default function MyProfilePage() {
  const { user, isLoading } = useUserStore()
  const router = useRouter()
  const { t } = useT()

  if (isLoading) return <div className="p-10 text-brand-red">{t("loading")}</div>

  if (!user) {
    router.push("/?auth=login")
    return null
  }

  return <ProfileView profileUser={user} isOwnProfile />
}