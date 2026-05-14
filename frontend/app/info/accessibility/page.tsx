"use client";

import { useT } from "@/services/i18n/context";

export default function AccessibilityPage() {
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
                        FanPulse Legal
                    </div>

                    <h1 className="text-3xl font-black text-text-primary md:text-5xl">
                        {t("a11y_title")}
                    </h1>

                    <p className="mt-4 max-w-[760px] text-sm leading-relaxed text-text-primary/55 md:text-base">
                        {t("a11y_intro")}
                    </p>
                </div>

                {/* CONTENT */}
                <div className="flex flex-col gap-10">

                    {/* SECTION 1 */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-text-primary">
                            1. {t("a11y_general_title")}
                        </h2>

                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("a11y_general_text_1")}
                        </p>

                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("a11y_general_text_2")}
                        </p>
                    </section>

                    {/* SECTION 2 */}
                    <section className="flex flex-col gap-5">
                        <h2 className="text-2xl font-black text-text-primary">
                            2. {t("a11y_approach_title")}
                        </h2>

                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("a11y_approach_text")}
                        </p>

                        <ul className="flex flex-col gap-3 text-[15px] text-text-primary/70">
                            <li>• {t("a11y_approach_1")}</li>
                            <li>• {t("a11y_approach_2")}</li>
                            <li>• {t("a11y_approach_3")}</li>
                            <li>• {t("a11y_approach_4")}</li>
                            <li>• {t("a11y_approach_5")}</li>
                            <li>• {t("a11y_approach_6")}</li>
                        </ul>
                    </section>

                    {/* SECTION 3 */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-text-primary">
                            3. {t("a11y_content_title")}
                        </h2>

                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("a11y_content_intro")}
                        </p>

                        <ul className="flex flex-col gap-3 text-[15px] text-text-primary/70">
                            <li>• {t("a11y_content_1")}</li>
                            <li>• {t("a11y_content_2")}</li>
                            <li>• {t("a11y_content_3")}</li>
                            <li>• {t("a11y_content_4")}</li>
                        </ul>
                    </section>

                    {/* SECTION 4 */}
                    <section className="flex flex-col gap-5">
                        <h2 className="text-2xl font-black text-text-primary">
                            4. {t("a11y_adaptive_title")}
                        </h2>

                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("a11y_adaptive_intro")}
                        </p>

                        <ul className="flex flex-col gap-3 text-[15px] text-text-primary/70">
                            <li>• {t("a11y_adaptive_1")}</li>
                            <li>• {t("a11y_adaptive_2")}</li>
                            <li>• {t("a11y_adaptive_3")}</li>
                        </ul>

                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("a11y_adaptive_note")}
                        </p>
                    </section>

                    {/* SECTION 5 */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-text-primary">
                            5. {t("a11y_feedback_title")}
                        </h2>

                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("a11y_feedback_text")}
                        </p>

                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("a11y_feedback_contact")}
                        </p>

                        <a
                            href="mailto:support@fanpulse.com"
                            className="text-brand-red font-bold hover:underline"
                        >
                            support@fanpulse.com
                        </a>
                    </section>

                    {/* SECTION 6 */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-text-primary">
                            6. {t("a11y_updates_title")}
                        </h2>

                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("a11y_updates_text")}
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
