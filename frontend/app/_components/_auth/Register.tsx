"use client"

import { ICONS } from "@/app/svg"
import { usePostApiUser } from "@/services/api/generated"
import { useT } from "@/services/i18n/context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import CategorySelectModal from "./CategorySelectModal"

const Register = () => {
  const router = useRouter()
  const { t } = useT()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formError, setFormError] = useState("")
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const { mutateAsync: registerUser, isPending } = usePostApiUser()

  const onLogin = () => router.push("?auth=login")

  const validateForm = () => {
    setFormError("")

    if (!email.trim()) {
      setFormError(t("auth_error_email_required"))
      return false
    }

    if (!password.trim()) {
      setFormError(t("auth_error_password_required"))
      return false
    }

    if (password !== confirmPassword) {
      setFormError(t("auth_error_passwords_mismatch"))
      return false
    }

    return true
  }

  const onOpenCategoryModal = () => {
    if (!validateForm()) return
    setShowCategoryModal(true)
  }

  const onRegisterWithCategories = async (categoryIds: string[]) => {
    try {
      setFormError("")

      const payload = {
        email,
        name: "someName",
        favCategoryIds: categoryIds,
        password,
      }

      await registerUser({ data: payload })

      setShowCategoryModal(false)
      router.push("?auth=login")
    } catch (err: unknown) {
      console.error(err)

      const e = err as { response?: { data?: unknown }; message?: string };
      const errorData = e?.response?.data;
      const ed = errorData as { detail?: string; error?: string; message?: string } | null;

      const message =
        typeof errorData === "string"
          ? errorData
          : ed?.detail ||
          ed?.error ||
          ed?.message ||
          e?.message ||
          t("auth_error_register")

      setFormError(message)
      setShowCategoryModal(false)
    }
  }

  return (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[370px] h-auto bg-white rounded-[20px] py-10 p-8 flex flex-col gap-4 shadow-sm"
      >
        <h1 className="text-h1 text-brand-black text-left">{t("auth_register")}</h1>

        <div className="flex flex-col gap-1.5">
          <label className="text-body-s text-brand-black">{t("auth_email")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth_email_placeholder")}
            className="h-[50px] px-4 rounded-[20px] border-2 border-brand-red outline-none text-body-m"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-body-s text-brand-black">{t("auth_password")}</label>
          <div className="flex items-center border-2 border-brand-red rounded-[20px] px-4 h-[50px] focus-within:ring-1 focus-within:ring-brand-red/20">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth_password_placeholder")}
              className="flex-1 outline-none text-body-m bg-transparent"
            />
            <button
              type="button"
              className="cursor-pointer p-1 hover:opacity-70 transition-opacity"
              onClick={() => setShowPassword(!showPassword)}
            >
              {ICONS.EYE}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-body-s text-brand-black">{t("auth_confirm_password")}</label>
          <div className="flex items-center border-2 border-brand-red rounded-[20px] px-4 h-[50px] focus-within:ring-1 focus-within:ring-brand-red/20">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("auth_confirm_password_placeholder")}
              className="flex-1 outline-none text-body-m bg-transparent"
            />
            <button
              type="button"
              className="cursor-pointer p-1 hover:opacity-70 transition-opacity"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {ICONS.EYE}
            </button>
          </div>
        </div>

        {formError && (
          <p className="text-body-s text-brand-red">{formError}</p>
        )}

        <button
          onClick={onOpenCategoryModal}
          disabled={isPending}
          className="h-[50px] bg-brand-red text-white rounded-[12px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? t("loading") : t("auth_register")}
        </button>

        <button
          onClick={onLogin}
          className="text-brand-red text-body-s text-center cursor-pointer hover:underline"
        >
          {t("auth_to_login")}
        </button>

        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-brand-red/30" />
          <span className="text-body-s text-brand-red font-medium">{t("auth_or")}</span>
          <div className="flex-1 h-px bg-brand-red/30" />
        </div>

        <button className="h-[50px] border-2 border-brand-red rounded-[20px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />
          <span className="text-body-m text-brand-black/65">
            {t("auth_google")}
          </span>
        </button>

        <span className="mt-6 text-body-s text-brand-black/80 leading-tight">
          {t("auth_consent_text")}{" "}
          <span className="text-brand-red cursor-pointer hover:underline">
            {t("auth_privacy_policy")}
          </span>{" "}
          {t("auth_consent_and")}{" "}
          <span className="text-brand-red cursor-pointer hover:underline">
            {t("auth_terms")}
          </span>
        </span>
      </div>

      {showCategoryModal && (
        <CategorySelectModal
          isPending={isPending}
          onClose={() => setShowCategoryModal(false)}
          onSubmit={onRegisterWithCategories}
        />
      )}
    </>
  )
}

export default Register
