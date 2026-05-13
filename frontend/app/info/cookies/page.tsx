"use client";

import { useT } from "@/services/i18n/context";

export default function CookiesPolicyPage() {
    const { t } = useT();

    return (
        <main className="min-h-screen px-4 py-10">
            <div
                className="
                mx-auto
                max-w-[1200px]

                rounded-[32px]
                border-2 border-brand-red

                bg-white

                p-8 md:p-12

                shadow-[0_20px_60px_rgba(0,0,0,0.05)]
                "
            >
                {/* HEADER */}
                <div className="mb-10">
                    <div
                        className="
                        mb-4
                        w-fit

                        rounded-full
                        bg-brand-red/10

                        px-4 py-2

                        text-xs font-black uppercase tracking-[0.2em]
                        text-brand-red
                        "
                    >
                        FanPulse Legal
                    </div>

                    <h1 className="text-3xl font-black text-[#212121] md:text-5xl">
                        {t("cookies_title")}
                    </h1>

                    <p className="mt-4 max-w-[760px] text-sm leading-relaxed text-[#212121]/55 md:text-base">
                        {t("cookies_intro")}
                    </p>
                </div>

                {/* CONTENT */}
                <div className="flex flex-col gap-10">

                    {/* SECTION */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-[#212121]">
                            1. {t("cookies_what_title")}
                        </h2>

                        <p className="text-[15px] leading-relaxed text-[#212121]/70">
                            {t("cookies_what_text")}
                        </p>
                    </section>

                    {/* SECTION */}
                    <section className="flex flex-col gap-5">
                        <h2 className="text-2xl font-black text-[#212121]">
                            2. {t("cookies_usage_title")}
                        </h2>

                        <p className="text-[15px] leading-relaxed text-[#212121]/70">
                            {t("cookies_usage_text")}
                        </p>

                        {/* cards */}
                        <div className="grid gap-5 md:grid-cols-3">

                            {/* REQUIRED */}
                            <div
                                className="
                                rounded-[24px]
                                border border-black/5
                                bg-[#f7f7f7]

                                p-6

                                shadow-sm
                                "
                            >
                                <div
                                    className="
                                    mb-4
                                    w-fit

                                    rounded-full
                                    bg-brand-red

                                    px-4 py-2

                                    text-xs font-black uppercase tracking-wider
                                    text-white
                                    "
                                >
                                    {t("cookies_required")}
                                </div>

                                <ul className="flex flex-col gap-3 text-sm text-[#212121]/70">
                                    <li>• {t("cookies_required_1")}</li>
                                    <li>• {t("cookies_required_2")}</li>
                                    <li>• {t("cookies_required_3")}</li>
                                </ul>
                            </div>

                            {/* ANALYTICS */}
                            <div
                                className="
                                rounded-[24px]
                                border border-black/5
                                bg-[#f7f7f7]

                                p-6

                                shadow-sm
                                "
                            >
                                <div
                                    className="
                                    mb-4
                                    w-fit

                                    rounded-full
                                    bg-[#212121]

                                    px-4 py-2

                                    text-xs font-black uppercase tracking-wider
                                    text-white
                                    "
                                >
                                    {t("cookies_analytics")}
                                </div>

                                <ul className="flex flex-col gap-3 text-sm text-[#212121]/70">
                                    <li>• {t("cookies_analytics_1")}</li>
                                    <li>• {t("cookies_analytics_2")}</li>
                                    <li>• {t("cookies_analytics_3")}</li>
                                </ul>
                            </div>

                            {/* FUNCTIONAL */}
                            <div
                                className="
                                rounded-[24px]
                                border border-black/5
                                bg-[#f7f7f7]

                                p-6

                                shadow-sm
                                "
                            >
                                <div
                                    className="
                                    mb-4
                                    w-fit

                                    rounded-full
                                    border border-brand-red
                                    bg-white

                                    px-4 py-2

                                    text-xs font-black uppercase tracking-wider
                                    text-brand-red
                                    "
                                >
                                    {t("cookies_functional")}
                                </div>

                                <ul className="flex flex-col gap-3 text-sm text-[#212121]/70">
                                    <li>• {t("cookies_functional_1")}</li>
                                    <li>• {t("cookies_functional_2")}</li>
                                    <li>• {t("cookies_functional_3")}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* SECTION */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-[#212121]">
                            3. {t("cookies_third_party_title")}
                        </h2>

                        <p className="text-[15px] leading-relaxed text-[#212121]/70">
                            {t("cookies_third_party_text")}
                        </p>

                        <ul className="flex flex-col gap-3 text-[15px] text-[#212121]/70">
                            <li>• {t("cookies_third_party_1")}</li>
                            <li>• {t("cookies_third_party_2")}</li>
                            <li>• {t("cookies_third_party_3")}</li>
                        </ul>
                    </section>

                    {/* SECTION */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-[#212121]">
                            4. {t("cookies_manage_title")}
                        </h2>

                        <p className="text-[15px] leading-relaxed text-[#212121]/70">
                            {t("cookies_manage_text")}
                        </p>

                        <ul className="flex flex-col gap-3 text-[15px] text-[#212121]/70">
                            <li>• {t("cookies_manage_1")}</li>
                            <li>• {t("cookies_manage_2")}</li>
                            <li>• {t("cookies_manage_3")}</li>
                        </ul>
                    </section>

                    {/* SECTION */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-[#212121]">
                            5. {t("cookies_changes_title")}
                        </h2>

                        <p className="text-[15px] leading-relaxed text-[#212121]/70">
                            {t("cookies_changes_text")}
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}