"use client"

import { usePatchApiUserIdChangePassword } from "@/services/api/generated"
import { useUserStore } from "@/store/useUserStore"
import { useState } from "react"
import Toast from "../../_components/Toast"

export default function ChangePassword() {
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
      setError("Введіть поточний пароль")
      return
    }

    if (!newPassword.trim()) {
      setError("Введіть новий пароль")
      return
    }

    if (newPassword.length < 6) {
      setError("Новий пароль має містити мінімум 6 символів")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Нові паролі не співпадають")
      return
    }

    if (!user?.id) {
      setError("Користувача не знайдено")
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
        message: "Пароль успішно змінено",
        type: "success",
      })
    } catch (err: any) {
      const errorData = err?.response?.data

      const message =
        typeof errorData === "string"
          ? errorData
          : errorData?.detail ||
            errorData?.error ||
            errorData?.message ||
            "Не вдалося змінити пароль"

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
          Змінити пароль
        </h2>

        <div className="max-w-[420px] flex flex-col gap-4">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Поточний пароль"
            className="h-[50px] px-4 rounded-[20px] border-2 border-brand-red outline-none text-body-m bg-white"
          />

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Новий пароль"
            className="h-[50px] px-4 rounded-[20px] border-2 border-brand-red outline-none text-body-m bg-white"
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Повторіть новий пароль"
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
            {isPending ? "Збереження..." : "Зберегти пароль"}
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