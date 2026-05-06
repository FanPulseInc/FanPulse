'use client'
import React, { useState } from "react"
import { useT } from "@/services/i18n/context"

const ResetPassword = () => {
    const { t } = useT()
    const [email, setEmail] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
    }

    return (
        <div className="bg-white overflow-hidden rounded-[20px] w-[370px] min-h-[650px] flex flex-col gap-8 p-8 items-center justify-center shadow-sm">

            <div className="w-full max-w-[340px] flex flex-col justify-center gap-6 relative">
                <h1 className="text-h1 text-brand-black leading-tight">
                    {t("auth_reset_title")}
                </h1>

                <p className="text-body-m text-brand-black/80 leading-relaxed">
                    {t("auth_reset_description")}
                </p>

                <form
                    className="flex flex-col gap-6 w-full"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="email-input"
                            className="text-body-s font-medium text-brand-black"
                        >
                            E-mail
                        </label>

                        <div className="h-[50px] flex items-center px-5 rounded-[20px] border-2 border-brand-red focus-within:ring-1 focus-within:ring-brand-red/20">
                            <input
                                id="email-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t("auth_reset_email_placeholder")}
                                className="w-full bg-transparent outline-none text-body-m text-brand-black placeholder:text-brand-black/40"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="h-[50px] w-full flex items-center justify-center bg-brand-red rounded-[20px] text-white font-bold text-body-m cursor-pointer hover:opacity-90 transition-opacity active:scale-[0.98]"
                    >
                        {t("auth_reset_submit")}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword
