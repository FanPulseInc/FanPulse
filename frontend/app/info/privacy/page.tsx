"use client";

import { useT } from "@/services/i18n/context";

export default function PrivacyPage() {
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
                        {t("privacy_title")}
                    </h1>

                    <p className="mt-4 max-w-[760px] text-sm leading-relaxed text-text-primary/55 md:text-base">
                        {t("privacy_intro")}
                    </p>
                </div>

                {/* CONTENT */}
                <div className="flex flex-col gap-10">

                    {/* 1. General */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-text-primary">
                            1. {t("privacy_general_title")}
                        </h2>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_general_text_1")}
                        </p>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_general_text_2")}
                        </p>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_general_text_3")}
                        </p>
                    </section>

                    {/* 2. What data */}
                    <section className="flex flex-col gap-5">
                        <h2 className="text-2xl font-black text-text-primary">
                            2. {t("privacy_data_title")}
                        </h2>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_data_intro")}
                        </p>

                        {/* cards */}
                        <div className="grid gap-5 md:grid-cols-3">
                            {/* Registration */}
                            <div className="rounded-[24px] border border-border-theme bg-surface-secondary p-6 shadow-sm">
                                <div className="mb-4 w-fit rounded-full bg-brand-red px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
                                    {t("privacy_data_reg")}
                                </div>
                                <ul className="flex flex-col gap-3 text-sm text-text-primary/70">
                                    <li>• {t("privacy_data_reg_1")}</li>
                                    <li>• {t("privacy_data_reg_2")}</li>
                                    <li>• {t("privacy_data_reg_3")}</li>
                                    <li>• {t("privacy_data_reg_4")}</li>
                                </ul>
                            </div>

                            {/* Interaction */}
                            <div className="rounded-[24px] border border-border-theme bg-surface-secondary p-6 shadow-sm">
                                <div className="mb-4 w-fit rounded-full bg-[#212121] px-4 py-2 text-xs font-black uppercase tracking-wider text-white">
                                    {t("privacy_data_interaction")}
                                </div>
                                <ul className="flex flex-col gap-3 text-sm text-text-primary/70">
                                    <li>• {t("privacy_data_interaction_1")}</li>
                                    <li>• {t("privacy_data_interaction_2")}</li>
                                    <li>• {t("privacy_data_interaction_3")}</li>
                                    <li>• {t("privacy_data_interaction_4")}</li>
                                    <li>• {t("privacy_data_interaction_5")}</li>
                                </ul>
                            </div>

                            {/* Technical */}
                            <div className="rounded-[24px] border border-border-theme bg-surface-secondary p-6 shadow-sm">
                                <div className="mb-4 w-fit rounded-full border border-brand-red bg-surface px-4 py-2 text-xs font-black uppercase tracking-wider text-brand-red">
                                    {t("privacy_data_tech")}
                                </div>
                                <ul className="flex flex-col gap-3 text-sm text-text-primary/70">
                                    <li>• {t("privacy_data_tech_1")}</li>
                                    <li>• {t("privacy_data_tech_2")}</li>
                                    <li>• {t("privacy_data_tech_3")}</li>
                                    <li>• {t("privacy_data_tech_4")}</li>
                                    <li>• {t("privacy_data_tech_5")}</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 3. Purpose */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-text-primary">
                            3. {t("privacy_purpose_title")}
                        </h2>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_purpose_intro")}
                        </p>
                        <ul className="flex flex-col gap-3 text-[15px] text-text-primary/70">
                            <li>• {t("privacy_purpose_1")}</li>
                            <li>• {t("privacy_purpose_2")}</li>
                            <li>• {t("privacy_purpose_3")}</li>
                            <li>• {t("privacy_purpose_4")}</li>
                            <li>• {t("privacy_purpose_5")}</li>
                            <li>• {t("privacy_purpose_6")}</li>
                            <li>• {t("privacy_purpose_7")}</li>
                            <li>• {t("privacy_purpose_8")}</li>
                        </ul>
                    </section>

                    {/* 4. Legal basis */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-text-primary">
                            4. {t("privacy_legal_title")}
                        </h2>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_legal_intro")}
                        </p>
                        <ul className="flex flex-col gap-3 text-[15px] text-text-primary/70">
                            <li>• {t("privacy_legal_1")}</li>
                            <li>• {t("privacy_legal_2")}</li>
                            <li>• {t("privacy_legal_3")}</li>
                            <li>• {t("privacy_legal_4")}</li>
                        </ul>
                    </section>

                    {/* 5. Storage & protection */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-text-primary">
                            5. {t("privacy_storage_title")}
                        </h2>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_storage_intro")}
                        </p>
                        <ul className="flex flex-col gap-3 text-[15px] text-text-primary/70">
                            <li>• {t("privacy_storage_1")}</li>
                            <li>• {t("privacy_storage_2")}</li>
                            <li>• {t("privacy_storage_3")}</li>
                            <li>• {t("privacy_storage_4")}</li>
                        </ul>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_storage_note")}
                        </p>
                    </section>

                    {/* 6. Data transfer */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-text-primary">
                            6. {t("privacy_transfer_title")}
                        </h2>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_transfer_text")}
                        </p>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_transfer_cases")}
                        </p>
                        <ul className="flex flex-col gap-3 text-[15px] text-text-primary/70">
                            <li>• {t("privacy_transfer_1")}</li>
                            <li>• {t("privacy_transfer_2")}</li>
                            <li>• {t("privacy_transfer_3")}</li>
                            <li>• {t("privacy_transfer_4")}</li>
                        </ul>
                    </section>

                    {/* 7. User rights */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-text-primary">
                            7. {t("privacy_rights_title")}
                        </h2>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_rights_intro")}
                        </p>
                        <ul className="flex flex-col gap-3 text-[15px] text-text-primary/70">
                            <li>• {t("privacy_rights_1")}</li>
                            <li>• {t("privacy_rights_2")}</li>
                            <li>• {t("privacy_rights_3")}</li>
                            <li>• {t("privacy_rights_4")}</li>
                            <li>• {t("privacy_rights_5")}</li>
                        </ul>
                    </section>

                    {/* 8. Data deletion */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-text-primary">
                            8. {t("privacy_deletion_title")}
                        </h2>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_deletion_text_1")}
                        </p>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_deletion_text_2")}
                        </p>
                    </section>

                    {/* 9. Minors */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-text-primary">
                            9. {t("privacy_minors_title")}
                        </h2>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_minors_text")}
                        </p>
                    </section>

                    {/* 10. Policy changes */}
                    <section className="flex flex-col gap-4">
                        <h2 className="text-2xl font-black text-text-primary">
                            10. {t("privacy_changes_title")}
                        </h2>
                        <p className="text-[15px] leading-relaxed text-text-primary/70">
                            {t("privacy_changes_text")}
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
