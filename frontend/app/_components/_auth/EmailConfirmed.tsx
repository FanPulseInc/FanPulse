"use client"

import { ICONS } from "@/app/svg"
import { useT } from "@/services/i18n/context"
import { useRouter } from "next/navigation"
import { use, useEffect } from "react"

export default function EmailConfirmed({
    onClose,
}: {
    onClose: () => void
}) {
    const { t } = useT()
    const router = useRouter()

    useEffect(() => {
        localStorage.removeItem("pending_verification_email")
        localStorage.setItem(
            "email_verified_success",
            Date.now().toString()
        )
    }, [])

    return (
        <div className="w-[370px] min-h-[560px] bg-white rounded-[20px] flex flex-col items-center p-10 text-left shadow-sm">
            <div className="relative mb-8 mt-4">
                <img
                    className="w-[220px] h-auto aspect-[0.9] object-contain"
                    src={ICONS.Fox}
                    alt="Fox"
                />
            </div>

            <div className="flex w-full flex-col gap-5">
                <h1 className="text-h1 text-brand-black">
                    {t("email_confirmed_title")}
                </h1>

                <p className="text-body-m text-brand-black/80 leading-relaxed">
                    {t("email_confirmed_text")}
                </p>

                <button
                    type="button"
                    onClick={()=>router.push("?auth=login")}
                    className="mt-4 h-[48px] w-full rounded-[18px] bg-brand-red text-white font-bold hover:opacity-90 transition-opacity"
                >
                    {t("email_confirmed_button")}
                </button>
            </div>
        </div>
    )
}