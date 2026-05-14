"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EmailConfirmedPage() {
    const router = useRouter();

    useEffect(() => {
        localStorage.removeItem("pending_verification_email")

        sessionStorage.setItem("show_email_confirmed", "true")

        const timeout = setTimeout(() => {
            router.push("/?auth=login");
        }, 1500);

        return () => clearTimeout(timeout);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white border-2 border-brand-red rounded-[28px] p-10">
                <h1 className="text-3xl font-black text-brand-red">
                    Email confirmed
                </h1>

                <p className="mt-4 text-[#212121]/70">
                    Redirecting...
                </p>
            </div>
        </div>
    );
}