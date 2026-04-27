'use client'

import { useSearchParams, useRouter } from "next/navigation"
import Login from "./_auth/Login"
import Register from "./_auth/Register"
import ResetPassword from "./_auth/ResetPassword"
import { ModalLayout } from "./_auth/ModalLayout"
import ConfirmRegister from "./_auth/ConfirmRegister"

const Auth = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const type = searchParams.get("auth")

  const close = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("auth")
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <ModalLayout isOpen={!!type} onCloseAction={close}>
      {type === 'login' && <Login />}
      {type === 'register' && <Register />}
      {type === 'reset' && <ResetPassword />}
      {type == 'confirm' && <ConfirmRegister/>}
    </ModalLayout>
  )
}

export default Auth