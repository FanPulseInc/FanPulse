'use client'
import { ICONS } from "@/app/svg";
import { usePostApiAuthLogin } from "@/services/api/generated";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Login = () => {
  const router = useRouter()

  const onRegister = () => router.push("?auth=register")
  const onForgetPassword = () => router.push("?auth=reset")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  

  const {mutateAsync:login,isPending,isSuccess,isError} = usePostApiAuthLogin()
  



  const onLogin = async () => {
    console.log("login started")
    const res = await login({data:{email:email,password:password}})

     if(res.token != undefined && isSuccess){
       localStorage.setItem("token",res.token) 
       router.push("/profile")
     }
     
  

  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}

      className="w-[370px] min-h-[650px] bg-card-bg rounded-[20px] py-10 p-8 flex flex-col gap-4 shadow-sm"
    >
      <h1 className="text-h1 text-brand-black text-left">Увійти</h1>
       
       {isError ? (
        <div className="bg-red-500  rounded-full flex items-center justify-center p-2">
          <span className="text-center">Неправильний email або пароль</span>
        </div>
       ):null}

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-body-s text-brand-black">Електронна пошта</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Введіть електронну пошту"
          className="h-[50px] px-4 rounded-[20px] border-2 border-brand-red outline-none text-body-m"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-body-s text-brand-black">Пароль</label>
        <div className="flex items-center border-2 border-brand-red rounded-[20px] px-4 h-[50px] focus-within:ring-1 focus-within:ring-brand-red/20">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введіть пароль"
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

      {/* Login button */}
      <button onClick={onLogin} className="h-[50px] bg-brand-red text-white rounded-[12px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer mt-2">
        Увійти
      </button>

      {/* Links */}
      <div className="flex flex-col gap-2 mt-2">
        <button
          type="button"
          onClick={onForgetPassword}
          className="text-brand-red text-body-s text-center cursor-pointer hover:underline"
        >
          Забули пароль?
        </button>

        <button
          type="button"
          onClick={onRegister}
          className="text-body-s text-center cursor-pointer hover:underline"
        >
          Зареєструватися
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2 my-2">
        <div className="flex-1 h-px bg-brand-red/30" />
        <span className="text-body-s text-brand-red font-medium">або</span>
        <div className="flex-1 h-px bg-brand-red/30" />
      </div>

      {/* Google button */}
      <button
        type="button"
        className="h-[50px] border-2 border-brand-red rounded-[20px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="google"
          className="w-5 h-5"
        />
        <span className="text-body-m text-brand-black/65">Увійдіть за допомогою Google</span>
      </button>
    </div>
  )
}

export default Login
