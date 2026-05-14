"use client";

import { useT } from "@/services/i18n/context";

export default function ContactPage() {
    const { t } = useT();

    return (
        <main className="min-h-screen px-4 py-10">
            <div
                className="
                mx-auto
                max-w-[1200px]

                rounded-[32px]
                border-2 border-brand-red

                bg-surface

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
                        FanPulse Support
                    </div>

                    <h1 className="text-3xl font-black uppercase text-text-primary md:text-5xl">
                        {t("contact_title")}
                    </h1>

                    <p className="mt-4 max-w-[760px] text-sm leading-relaxed text-text-primary/55 md:text-base">
                        {t("contact_intro")}
                    </p>
                </div>

                {/* CONTENT */}
                <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">

                    {/* LEFT */}
                    <section
                        className="
                        rounded-[28px]
                        border border-border-theme
                        bg-surface-secondary

                        p-8

                        shadow-sm
                        "
                    >
                        <h2 className="text-2xl font-black leading-tight text-text-primary md:text-4xl">
                            {t("contact_heading")}
                        </h2>

                        <div className="mt-8 flex flex-col gap-5 text-[15px] leading-relaxed text-text-primary/75">
                            <p>{t("contact_text_1")}</p>

                            <p>
                                {t("contact_text_2")}{" "}
                                <span className="font-black text-brand-red">
                                    support@fanpulse.com
                                </span>
                            </p>

                            <p>{t("contact_text_3")}</p>

                            <p>{t("contact_text_4")}</p>
                        </div>
                    </section>

                    {/* RIGHT */}
                    <aside
                        className="
                        relative overflow-hidden

                        rounded-[28px]

                        bg-brand-red

                        p-8

                        text-white

                        shadow-[0_20px_50px_rgba(175,41,42,0.22)]
                        "
                    >
                        {/* glow */}
                        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-surface/10 blur-3xl" />

                        <div className="relative z-10 flex h-full flex-col justify-between">

                            <div>
                                <div
                                    className="
                                    mb-5
                                    w-fit

                                    rounded-full
                                    border border-white/20
                                    bg-surface/10

                                    px-4 py-2

                                    text-xs font-black uppercase tracking-[0.2em]

                                    backdrop-blur-sm
                                    "
                                >
                                    FanPulse
                                </div>

                                <h3 className="text-3xl font-black uppercase leading-tight">
                                    {t("contact_support_title")}
                                </h3>

                                <p className="mt-4 text-sm leading-relaxed text-white/80">
                                    {t("contact_support_text")}
                                </p>
                            </div>

                            <div className="mt-10 flex flex-col gap-4">

                                <div
                                    className="
                                    rounded-[20px]
                                    bg-surface/10

                                    px-5 py-4

                                    backdrop-blur-sm
                                    "
                                >
                                    <div className="text-xs font-black uppercase tracking-wider text-white/60">
                                        Email
                                    </div>

                                    <div className="mt-1 text-sm font-bold">
                                        support@fanpulse.com
                                    </div>
                                </div>

                                <div
                                    className="
                                    rounded-[20px]
                                    bg-black/15

                                    px-5 py-4
                                    "
                                >
                                    <div className="text-xs font-black uppercase tracking-wider text-white/60">
                                        Response Time
                                    </div>

                                    <div className="mt-1 text-sm font-bold">
                                        {t("contact_response")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}