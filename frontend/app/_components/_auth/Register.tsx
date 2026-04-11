'use client'

import { ICONS } from "@/app/svg"
import { useGetApiCategory, usePostApiUser } from "@/services/api/generated"
import { h1, i } from "framer-motion/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import CustomSelect from "../CustomSelect"

const Register = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [selectedCategory,setCategory] = useState<string[]>()
    const router = useRouter()

    const onLogin = () => router.push("?auth=login")
 

    const {mutateAsync:registerUser,isPending,isSuccess,error} = usePostApiUser()

    const { isLoading, isError, data } = useGetApiCategory()




    if (isLoading) {
        return null
    }
    

    const categories = data?.map(item => ({
        value: item.id ?? "",
        label: item.name ?? ""
    })) || [];

    const handleSelectChange = (selectedIds: string[]) => {
        console.log("Выбранные ID:", selectedIds);
        setCategory(selectedIds)
    };
    
    const onRegister = async () => {
        const payload = {
            email:email,
            name: "someName",
            favCategoryIds: selectedCategory,
            password:password

            

        }
       const res =  await registerUser({data:payload})  
         
       if(isSuccess){
          console.log("register completed")
          router.push("?auth=login")
          
       }
       console.log("Created mail: " + res.email)
        
    }



    return (

        <div
            onClick={(e) => e.stopPropagation()}
            className="w-[370px] h-auto bg-white rounded-[20px] py-10 p-8  flex flex-col gap-4 shadow-sm"
        >
            <h1 className="text-h1 text-brand-black text-left">Реєстрація</h1>

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

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
                <label className="text-body-s text-brand-black">Повторіть пароль</label>
                <div className="flex items-center border-2 border-brand-red rounded-[20px] px-4 h-[50px] focus-within:ring-1 focus-within:ring-brand-red/20">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Повторіть пароль"
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

            <div>
                
               <CustomSelect options={categories} onChange={handleSelectChange}/>
            </div>

            <button
                onClick={onRegister}
                className="h-[50px] bg-brand-red text-white rounded-[12px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer mt-2"
            >
                Зареєструватися
            </button>

            <button
                onClick={onLogin}
                className="text-brand-red text-body-s text-center cursor-pointer hover:underline"
            >
                Логiн
            </button>

            {/* Divider */}
            <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-brand-red/30" />
                <span className="text-body-s text-brand-red font-medium">або</span>
                <div className="flex-1 h-px bg-brand-red/30" />
            </div>

            {/* Google button */}
            <button className="h-[50px] border-2 border-brand-red rounded-[20px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer">
                <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt="google"
                    className="w-5 h-5"
                />
                <span className="text-body-m text-brand-black/65">Увійдіть за допомогою Google</span>
            </button>

            <span className="mt-6 text-body-s text-brand-black/80 leading-tight">
                Реєструючись Ви підтверджуєте згоду з{" "}
                <span className="text-brand-red cursor-pointer hover:underline">Політикою конфіденційності</span> та{" "}
                <span className="text-brand-red cursor-pointer hover:underline">Умовами використання</span>
            </span>
        </div>
    )
}

export default Register
