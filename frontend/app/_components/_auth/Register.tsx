"use client"

import Link from "next/link"
import { ICONS } from "@/app/svg"
import { usePostApiUser } from "@/services/api/generated"
import { useT } from "@/services/i18n/context"
import { saveFavCategoryIds } from "@/services/useFavCategories"
import { useRouter } from "next/navigation"
import { useState } from "react"
import CategorySelectModal from "./CategorySelectModal"
import PasswordHelper from "./PasswordHelper"
import { CredentialResponse, GoogleLogin } from "@react-oauth/google"
import { useUserStore } from "@/store/useUserStore"

const Register = () => {
  const router = useRouter()
  const { t } = useT()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isGoogleFlow, setIsGoogleFlow] = useState(false)
  const [googleUserId, setGoogleUserId] = useState<string | null>(null)

  const [formError, setFormError] = useState("")
  const [showCategoryModal, setShowCategoryModal] = useState(false)

  const { setUser, user } = useUserStore()

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

    const pwValid =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^a-zA-Z0-9]/.test(password) &&
      [...password].every((c) => c.charCodeAt(0) > 32 && c.charCodeAt(0) < 128)

    if (!pwValid) {
      setFormError(t("auth_error_password_weak"))
      return false
    }

    if (password !== confirmPassword) {
      setFormError(t("auth_error_passwords_mismatch"))
      return false
    }

    return true
  }

  const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setFormError("")

      if (!credentialResponse.credential) {
        setFormError("Google credential is missing")
        return
      }

      const authRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/Auth/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken: credentialResponse.credential,
          }),
        }
      )

      if (!authRes.ok) {
        throw new Error("Google auth failed")
      }

      const authData = await authRes.json()

      localStorage.setItem("token", authData.token)

      const meRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/me`,
        {
          headers: {
            Authorization: `Bearer ${authData.token}`,
          },
        }
      )

      if (!meRes.ok) {
        throw new Error("Failed to load user")
      }

      const fullUser = await meRes.json()

      setUser(fullUser)
      setGoogleUserId(fullUser.id)
      setIsGoogleFlow(true)

      const hasCategories = fullUser.favCategories?.length > 0

      if (hasCategories) {
        router.push("/profile")
        return
      }

      setShowCategoryModal(true)
    } catch (e) {
      console.error(e)
      setFormError("Google login failed")
    }
  }

  const onSaveGoogleCategories = async (categoryIds: string[]) => {
    try {
      const userId = googleUserId || user?.id

      if (!userId) {
        throw new Error("User id is missing")
      }

      const token = localStorage.getItem("token")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/User/${userId}/categories`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            favCategoryIds: categoryIds,
          }),
        }
      )

      if (!res.ok) {
        throw new Error("Failed to save categories")
      }

      saveFavCategoryIds(categoryIds)

      const meRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (meRes.ok) {
        const fullUser = await meRes.json()
        setUser(fullUser)
      }

      setShowCategoryModal(false)
      router.push("/profile")
    } catch (e) {
      console.error(e)
      setFormError("Failed to save categories")
      setShowCategoryModal(false)
    }
  }

  const onOpenCategoryModal = () => {
    if (!validateForm()) return
    setIsGoogleFlow(false)
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

      saveFavCategoryIds(categoryIds)
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
        className="w-[370px] h-auto bg-surface rounded-[20px] py-10 p-8 flex flex-col gap-4 shadow-sm"
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
          <PasswordHelper password={password} />
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

        <div className="w-full">
          <GoogleLogin
            theme="outline"
            size="large"
            shape="pill"
            width="306"
            text="continue_with"
            onSuccess={onGoogleSuccess}
            onError={() => {
              setFormError("Google login failed");
            }}
          />
        </div>

        <span className="mt-6 text-body-s text-brand-black/80 leading-tight">
          {t("auth_consent_text")}{" "}
          <Link href="/info/privacy" className="text-brand-red cursor-pointer hover:underline">
            {t("auth_privacy_policy")}
          </Link>{" "}
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
          onSubmit={isGoogleFlow ? onSaveGoogleCategories : onRegisterWithCategories}
        />
      )}
    </>
  )
}

export default Register
