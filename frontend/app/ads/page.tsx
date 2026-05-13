"use client";

import { useState } from "react";
import { useT } from "@/services/i18n/context";

export default function AdvertisingPage() {
    const { t } = useT();

    const [accepted, setAccepted] = useState(false);

    return (
        <main className="min-h-screen px-4 py-10">
            <div className="mx-auto max-w-[1000px] rounded-[32px] border-2 border-brand-red bg-surface p-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)] md:p-12">
                <div className="mb-8">
                    <div className="mb-4 w-fit rounded-full bg-brand-red/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-brand-red">
                        FanPulse Partners
                    </div>

                    <h1 className="text-3xl font-black uppercase text-text-primary md:text-5xl">
                        {t("advertising_title")}
                    </h1>

                    <p className="mt-5 max-w-[760px] text-sm font-semibold leading-relaxed text-text-primary/70">
                        {t("advertising_intro")}
                    </p>
                </div>

                <form className="flex flex-col gap-5">
                    <textarea
                        placeholder={t("advertising_message_placeholder")}
                        rows={7}
                        className="w-full resize-none rounded-[22px] border-2 border-brand-red bg-surface p-5 text-sm font-medium text-text-primary outline-none transition-all placeholder:text-text-primary/35 focus:shadow-[0_0_0_4px_rgba(175,41,42,0.08)]"
                    />

                    <input
                        placeholder={t("advertising_name_placeholder")}
                        className="h-[52px] rounded-[18px] border-2 border-brand-red bg-surface px-5 text-sm font-medium text-text-primary outline-none transition-all placeholder:text-text-primary/35 focus:shadow-[0_0_0_4px_rgba(175,41,42,0.08)]"
                    />

                    <input
                        type="email"
                        placeholder={t("advertising_email_placeholder")}
                        className="h-[52px] rounded-[18px] border-2 border-brand-red bg-surface px-5 text-sm font-medium text-text-primary outline-none transition-all placeholder:text-text-primary/35 focus:shadow-[0_0_0_4px_rgba(175,41,42,0.08)]"
                    />

                    <input
                        placeholder={t("advertising_company_placeholder")}
                        className="h-[52px] rounded-[18px] border-2 border-brand-red bg-surface px-5 text-sm font-medium text-text-primary outline-none transition-all placeholder:text-text-primary/35 focus:shadow-[0_0_0_4px_rgba(175,41,42,0.08)]"
                    />

                    <label className="flex min-h-[46px] cursor-pointer items-center gap-3 rounded-[18px] border-2 border-brand-red bg-surface-secondary px-5 text-sm font-black text-text-primary">
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            className="h-4 w-4 accent-brand-red"
                        />

                        <span>{t("advertising_privacy_agree")}</span>
                    </label>

                    <button
                        type="submit"
                        disabled={!accepted}
                        className="h-[52px] rounded-full bg-brand-red text-xs font-black uppercase tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(175,41,42,0.25)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        {t("advertising_submit")}
                    </button>
                </form>
            </div>
        </main>
    );
}