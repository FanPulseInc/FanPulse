"use client"

import { ICONS } from "@/app/svg"
import { usePostApiAuthLogin } from "@/services/api/generated"
import { useT } from "@/services/i18n/context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { CredentialResponse, GoogleLogin } from "@react-oauth/google"
import { useUserStore } from "@/store/useUserStore"
import CategorySelectModal from "./CategorySelectModal"
import { saveFavCategoryIds } from "@/services/useFavCategories"

const Login = () => {
  const router = useRouter()
  const { t } = useT()

  const { setUser } = useUserStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [googleUserId, setGoogleUserId] = useState<string | null>(null)
  const [formError, setFormError] = useState("")

  const onRegister = () => router.push("?auth=register")
  const onForgetPassword = () => router.push("?auth=reset")

  const { mutateAsync: login, isPending, isError } = usePostApiAuthLogin()

  const onLogin = async () => {
    try {
      setFormError("")

      const res = await login({
        data: { email, password },
      })

      if (res?.token) {
        localStorage.setItem("token", res.token)
        window.location.href = "/profile"
      }
    } catch (error) {
      console.error("Login error:", error)
      setFormError(t("auth_error_credentials"))
    }
  }

  const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setFormError("")

      if (!credentialResponse.credential) {
        throw new Error("Google credential missing")
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

      const hasCategories = fullUser.favCategories?.length > 0

      if (hasCategories) {
        router.push("/profile")
        return
      }

      setGoogleUserId(fullUser.id)
      setShowCategoryModal(true)
    } catch (error) {
      console.error("Google login error:", error)
      setFormError("Google login failed")
    }
  }

  const onSaveGoogleCategories = async (categoryIds: string[]) => {
    try {
      setFormError("")

      if (!googleUserId) {
        throw new Error("User id missing")
      }

      const token = localStorage.getItem("token")

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/User/${googleUserId}/categories`,
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

      const meRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (meRes.ok) {
        const fullUser = await meRes.json()
        setUser(fullUser)
      }

      setShowCategoryModal(false)
      router.push("/profile")
    } catch (error) {
      console.error("Save categories error:", error)
      setFormError("Failed to save categories")
      setShowCategoryModal(false)
    }
  }

  return (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[370px] min-h-[650px] bg-card-bg rounded-[20px] py-10 p-8 flex flex-col gap-4 shadow-sm"
      >
        <h1 className="text-h1 text-brand-black text-left">
          {t("auth_login")}
        </h1>

        {(isError || formError) && (
          <div className="bg-red-500 rounded-full flex items-center justify-center p-2">
            <span className="text-center">
              {formError || t("auth_error_credentials")}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-body-s text-brand-black">
            {t("auth_email")}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth_email_placeholder")}
            className="h-[50px] px-4 rounded-[20px] border-2 border-brand-red outline-none text-body-m"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-body-s text-brand-black">
            {t("auth_password")}
          </label>
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

        <button
          onClick={onLogin}
          disabled={isPending}
          className="h-[50px] bg-brand-red text-white rounded-[12px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? t("loading") : t("auth_login")}
        </button>

        <div className="flex flex-col gap-2 mt-2">
          <button
            type="button"
            onClick={onForgetPassword}
            className="text-brand-red text-body-s text-center cursor-pointer hover:underline"
          >
            {t("auth_forgot_password")}
          </button>

          <button
            type="button"
            onClick={onRegister}
            className="text-body-s text-center cursor-pointer hover:underline"
          >
            {t("auth_register")}
          </button>
        </div>

        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-brand-red/30" />
          <span className="text-body-s text-brand-red font-medium">
            {t("auth_or")}
          </span>
          <div className="flex-1 h-px bg-brand-red/30" />
        </div>

        <div className="w-full flex justify-center">
          <GoogleLogin
            theme="outline"
            size="large"
            shape="pill"
            width="306"
            text="continue_with"
            onSuccess={onGoogleSuccess}
            onError={() => {
              setFormError("Google login failed")
            }}
          />
        </div>
      </div>

      {showCategoryModal && (
        <CategorySelectModal
          isPending={false}
          onClose={() => setShowCategoryModal(false)}
          onSubmit={onSaveGoogleCategories}
        />
      )}
    </>
  )
}

export default Login