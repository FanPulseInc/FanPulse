"use client";

import Link from "next/link";
import { useT } from "@/services/i18n/context";
import { ICONS } from "../../svg";

export default function ForumRulesPage() {
  const { t } = useT();

  const rules = [
    "forum_rules_no_insults",
    "forum_rules_no_hate",
    "forum_rules_no_spam",
    "forum_rules_no_fake_news",
    "forum_rules_no_politics",
    "forum_rules_no_adult",
    "forum_rules_no_threats",
    "forum_rules_no_doxxing",
    "forum_rules_no_flood",
    "forum_rules_no_ads",
    "forum_rules_no_duplicate_posts",
    "forum_rules_no_offtopic",
    "forum_rules_no_match_spoilers",
    "forum_rules_no_caps",
    "forum_rules_no_provocation",
    "forum_rules_no_discrimination",
    "forum_rules_no_illegal_content",
    "forum_rules_no_impersonation",
  ];

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-8">

        {/* HERO */}
        <section
          className="
          relative overflow-hidden

          rounded-[36px]
          border-2 border-brand-red

          bg-gradient-to-br
          from-[#af292a]
          via-[#9f2021]
          to-[#7f1415]

          p-8 md:p-12

          text-white

          shadow-[0_25px_80px_rgba(175,41,42,0.22)]
          "
        >
          {/* glow */}
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-surface/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-black/20 blur-3xl" />

          {/* pattern */}
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="relative z-10 flex flex-col gap-10 md:flex-row md:items-center md:justify-between">

            <div className="max-w-[720px]">

              <div
                className="
                mb-5 w-fit

                rounded-full
                border border-white/20
                bg-black/20

                px-5 py-2

                text-xs font-black uppercase tracking-[0.25em]

                backdrop-blur-sm
                "
              >
                FanPulse Community Rules
              </div>

              <h1 className="text-4xl font-black uppercase leading-none md:text-6xl">
                {t("forum_rules_page_title")}
              </h1>

              <p className="mt-6 max-w-[680px] text-[15px] font-medium leading-relaxed text-white/80 md:text-[17px]">
                {t("forum_rules_page_description")}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                <Link
                  href="/forum"
                  className="
                  group inline-flex items-center gap-2

                  rounded-[18px]
                  bg-surface

                  px-6 py-4

                  text-sm font-black uppercase tracking-wide
                  text-[#af292a]

                  transition-all duration-300

                  hover:-translate-y-1
                  hover:shadow-2xl
                  "
                >
                  <span className="transition-transform duration-300 group-hover:-translate-x-1">
                    {ICONS.ArrowDown}
                  </span>

                  {t("forum_rules_back")}
                </Link>

                <Link
                  href="/forum/create"
                  className="
                  rounded-[18px]
                  border border-white/20
                  bg-black/25

                  px-6 py-4

                  text-sm font-black uppercase tracking-wide
                  text-white

                  backdrop-blur-sm

                  transition-all duration-300

                  hover:-translate-y-1
                  hover:bg-black/40
                  hover:shadow-2xl
                  "
                >
                  {t("forum_rules_create_post")}
                </Link>
              </div>
            </div>

            {/* side block */}
            <div
              className="
              hidden md:flex

              h-[220px] w-[220px]

              flex-col items-center justify-center

              rounded-[32px]
              border border-white/15

              bg-black/15

              backdrop-blur-md

              shadow-[0_15px_50px_rgba(0,0,0,0.15)]
              "
            >
              <div className="text-8xl font-black leading-none">
                !
              </div>

              <div className="mt-3 text-sm font-black uppercase tracking-[0.25em] text-white/80">
                Rules
              </div>
            </div>
          </div>
        </section>

        {/* RULES */}
        <section className="grid gap-5 md:grid-cols-2">
          {rules.map((key, index) => (
            <div
              key={key}
              className="
              group relative overflow-hidden

              rounded-[28px]

              border border-border-theme
              bg-surface

              p-6

              shadow-[0_10px_35px_rgba(0,0,0,0.05)]

              transition-all duration-300

              hover:-translate-y-1
              hover:border-brand-red/30
              hover:shadow-[0_20px_50px_rgba(175,41,42,0.12)]
              "
            >
              {/* red glow */}
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-red/5 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

              {/* line */}
              <div className="absolute left-0 top-0 h-full w-[5px] bg-brand-red" />

              <div className="relative z-10 flex gap-5">

                {/* number */}
                <div
                  className="
                  flex h-12 w-12 shrink-0
                  items-center justify-center

                  rounded-2xl

                  bg-brand-red

                  text-sm font-black text-white

                  shadow-lg shadow-brand-red/20

                  transition-transform duration-300
                  group-hover:scale-110
                  "
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* content */}
                <div>
                  <h2
                    className="
                    text-[15px]
                    font-black uppercase tracking-wide
                    text-text-primary
                    "
                  >
                    {t(key)}
                  </h2>

                  <p
                    className="
                    mt-3

                    text-[13px]
                    leading-relaxed

                    text-text-primary/60
                    "
                  >
                    {t(`${key}_desc`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* punishments */}
        <section
          className="
          relative overflow-hidden

          rounded-[34px]

          border border-brand-red/15
          bg-surface

          p-8

          shadow-[0_15px_45px_rgba(0,0,0,0.06)]
          "
        >
          {/* glow */}
          <div className="absolute -bottom-16 right-0 h-48 w-48 rounded-full bg-brand-red/5 blur-3xl" />

          <div className="relative z-10">

            <div className="flex items-center gap-4">

              <div
                className="
                flex h-14 w-14 items-center justify-center

                rounded-2xl
                bg-brand-red

                text-2xl text-white

                shadow-lg shadow-brand-red/20
                "
              >
                !
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase text-text-primary">
                  {t("forum_rules_punishment_title")}
                </h3>

                <p className="mt-1 text-sm text-text-primary/50">
                  FanPulse Moderation System
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">

              <div
                className="
                rounded-[24px]

                border border-border-theme
                bg-surface-secondary

                p-6

                transition-all duration-300

                hover:-translate-y-1
                hover:bg-surface
                hover:shadow-xl
                "
              >
                <div className="text-sm font-black uppercase text-brand-red">
                  01
                </div>

                <p className="mt-3 text-[14px] font-semibold leading-relaxed text-text-primary/70">
                  {t("forum_rules_punishment_1")}
                </p>
              </div>

              <div
                className="
                rounded-[24px]

                border border-border-theme
                bg-surface-secondary

                p-6

                transition-all duration-300

                hover:-translate-y-1
                hover:bg-surface
                hover:shadow-xl
                "
              >
                <div className="text-sm font-black uppercase text-brand-red">
                  02
                </div>

                <p className="mt-3 text-[14px] font-semibold leading-relaxed text-text-primary/70">
                  {t("forum_rules_punishment_2")}
                </p>
              </div>

              <div
                className="
                rounded-[24px]

                border border-border-theme
                bg-surface-secondary

                p-6

                transition-all duration-300

                hover:-translate-y-1
                hover:bg-surface
                hover:shadow-xl
                "
              >
                <div className="text-sm font-black uppercase text-brand-red">
                  03
                </div>

                <p className="mt-3 text-[14px] font-semibold leading-relaxed text-text-primary/70">
                  {t("forum_rules_punishment_3")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}