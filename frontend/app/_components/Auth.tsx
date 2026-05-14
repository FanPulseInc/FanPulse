'use client'

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Login from "./_auth/Login"
import Register from "./_auth/Register"
import ResetPassword from "./_auth/ResetPassword"
import ConfirmRegister from "./_auth/ConfirmRegister"
import EmailConfirmed from "./_auth/EmailConfirmed"
import EmailConfirmFailed from "./_auth/EmailConfirmedFailed"
import { ModalLayout } from "./_auth/ModalLayout"

const Auth = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const type = searchParams.get("auth")

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key !== "email_verified_success") return

      const params = new URLSearchParams(searchParams.toString())

      params.set("auth", "email-confirmed")

      router.replace(`?${params.toString()}`, {
        scroll: false,
      })
    }

    window.addEventListener("storage", handler)

    return () => {
      window.removeEventListener("storage", handler)
    }
  }, [router, searchParams])

  const close = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("auth")

    const query = params.toString()
    router.replace(query ? `?${query}` : "/", { scroll: false })
  }

  return (
    <ModalLayout isOpen={!!type} onCloseAction={close}>
      {type === "login" && <Login />}
      {type === "register" && <Register />}
      {type === "reset" && <ResetPassword />}
      {type === "confirm" && <ConfirmRegister />}
      {type === "email-confirmed" && <EmailConfirmed onClose={close} />}
      {type === "email-confirm-failed" && <EmailConfirmFailed onClose={close} />}
    </ModalLayout>
  )
}

export default Auth