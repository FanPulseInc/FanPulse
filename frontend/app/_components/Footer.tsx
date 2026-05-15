"use client";

import Link from "next/link";
import { useT } from "@/services/i18n/context";

const Footer = () => {
  const { t } = useT();

  const sportItems = [
    { label: t("sport_football"), href: "/football" },
    { label: t("sport_basketball"), href: "/basketball" },
    { label: t("sport_american_football"), href: "/american-football" },
    { label: t("sport_tennis"), href: "/tennis" },
    { label: t("sport_motorsport"), href: "/motorsport" },
  ];

  const esportItems = [
    { label: "Counter Strike", href: "/esport/cs2" },
    { label: "Dota 2", href: "/esport/dota" },
  ];

  const anotherItems = [
    { label: t("contacts"), href: "/contacts" },
    { label: t("privacy"), href: "/info/privacy" },
    { label: t("cookies"), href: "/info/cookies" },
    { label: t("accessibility"), href: "/info/accessibility" },
    { label: t("ads"), href: "/ads" },
  ];

  const linkClass =
    "text-text-primary hover:text-brand-red hover:underline transition-colors cursor-pointer";

  return (
    <div className="w-full max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-6 lg:gap-11 bg-surface px-4 sm:px-6 lg:px-[45px] py-6">
      <div className="w-full lg:w-[653px] flex-col items-start gap-2.5 p-4 sm:p-2.5 bg-surface-secondary rounded-[20px] lg:rounded-[30px] opacity-80 flex">
        <div className="text-[length:var(--l-interface-font-size)] flex items-center w-fit font-l-interface font-[number:var(--l-interface-font-weight)] text-text-primary tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] [font-style:var(--l-interface-font-style)]">
          {t("info_title")}
        </div>

        <p className="self-stretch [font-family:'Inter-Medium',Helvetica] font-medium text-text-primary text-xs tracking-[0] leading-5">
          {t("footer_description")}
        </p>
      </div>

      <div className="w-full lg:w-[653px] grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-2 items-start p-4 sm:p-2.5 bg-surface-secondary rounded-[20px] lg:rounded-[30px] opacity-80">
        <div className="flex flex-col items-start gap-1">
          <div className="font-l-interface font-[number:var(--l-interface-font-weight)] text-text-primary text-[length:var(--l-interface-font-size)] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] [font-style:var(--l-interface-font-style)]">
            {t("sport_section")}
          </div>

          {sportItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${linkClass} text-[length:var(--s-interface-font-size)] font-s-interface font-[number:var(--s-interface-font-weight)] tracking-[var(--s-interface-letter-spacing)] leading-[var(--s-interface-line-height)] [font-style:var(--s-interface-font-style)]`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-start gap-1">
          <div className="font-l-interface font-[number:var(--l-interface-font-weight)] text-text-primary text-[length:var(--l-interface-font-size)] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] [font-style:var(--l-interface-font-style)]">
            {t("esport_section")}
          </div>

          {esportItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${linkClass} font-s-interface font-[number:var(--s-interface-font-weight)] text-[length:var(--s-interface-font-size)] tracking-[var(--s-interface-letter-spacing)] leading-[var(--s-interface-line-height)] [font-style:var(--s-interface-font-style)]`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-start gap-1">
          <div className="font-l-interface font-[number:var(--l-interface-font-weight)] text-text-primary text-[length:var(--l-interface-font-size)] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] [font-style:var(--l-interface-font-style)]">
            {t("forum_section")}
          </div>

          {anotherItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${linkClass} font-l-interface font-[number:var(--l-interface-font-weight)] text-[length:var(--l-interface-font-size)] tracking-[var(--l-interface-letter-spacing)] leading-[var(--l-interface-line-height)] [font-style:var(--l-interface-font-style)]`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Footer;