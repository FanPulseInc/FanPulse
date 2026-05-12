"use client"

import { useParams, useRouter } from "next/navigation"
import { useT } from "@/services/i18n/context"
import { useUserStore } from "@/store/useUserStore"
import { useGetApiUserId } from "@/services/api/generated"
import ProfileView from "../_components/ProfileView"

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { t } = useT()
  const { user: currentUser } = useUserStore()

  const { data: profileUser, isLoading } = useGetApiUserId(id)

  if (isLoading) return <div className="p-10 text-brand-red">{t("loading")}</div>

  if (!profileUser) {
    return <div className="p-10 text-brand-red">{t("profile_not_found")}</div>
  }

  if (currentUser?.id === profileUser.id) {
    router.push("/profile")
    return null
  }

  return <ProfileView profileUser={profileUser} isOwnProfile={false} />
}