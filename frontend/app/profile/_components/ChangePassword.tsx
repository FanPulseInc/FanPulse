"use client"

import { usePatchApiUserIdChangePassword } from "@/services/api/generated"
import { useUserStore } from "@/store/useUserStore"
import { useState } from "react"
import Toast from "../../_components/Toast"
import { useT } from "@/services/i18n/context"

export default function ChangePassword() {
  const { t } = useT()
  const user = useUserStore((s) => s.user)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [error, setError] = useState("")
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error"
  } | null>(null)

  const { mutateAsync: changePassword, isPending } =
    usePatchApiUserIdChangePassword()

  const handleSubmit = async () => {
    setError("")

    
    if (!currentPassword.trim()) {
      setError(t("password_current_required"))
      return
    }

    if (!newPassword.trim()) {
      setError(t("password_new_required"))
      return
    }

    if (newPassword.length < 6) {
      setError(t("password_min_length"))
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t("password_mismatch"))
      return
    }

    if (!user?.id) {
      setError(t("password_user_not_found"))
      return
    }

    try {
      await changePassword({
        id: user.id,
        data: {
          currentPassword,
          newPassword,
        },
      })

      
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

     
      setToast({
        message: t("password_changed"),
        type: "success",
      })
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown }; message?: string };
      const errorData = e?.response?.data

      const ed = errorData as { detail?: string; error?: string; message?: string } | null;
      const message =
        typeof errorData === "string"
          ? errorData
          : ed?.detail ||
            ed?.error ||
            ed?.message ||
            t("password_change_failed")

      setToast({
        message,
        type: "error",
      })
    }
  }

  return (
    <>
      <section className="w-full flex flex-col gap-6">
        <h2 className="text-[1.5rem] font-bold uppercase leading-none">
          {t("profile_change_password")}
        </h2>

        <div className="max-w-[420px] flex flex-col gap-4">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t("password_current_placeholder")}
            className="h-[50px] px-4 rounded-[20px] border-2 border-brand-red outline-none text-body-m bg-white"
          />

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t("password_new_placeholder")}
            className="h-[50px] px-4 rounded-[20px] border-2 border-brand-red outline-none text-body-m bg-white"
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t("password_confirm_placeholder")}
            className="h-[50px] px-4 rounded-[20px] border-2 border-brand-red outline-none text-body-m bg-white"
          />

          {error && (
            <p className="text-sm text-brand-red font-medium">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="h-[50px] bg-brand-red text-white rounded-[12px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? t("saving") : t("save_password")}
          </button>
        </div>
      </section>

      {/* 🔔 Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}