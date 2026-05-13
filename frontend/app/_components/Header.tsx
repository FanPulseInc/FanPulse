'use client'

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ICONS } from "../svg";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { useLeagueLookups } from "@/services/sportsdb/hooks";
import { useT } from "@/services/i18n/context";
import Toast from "./Toast";

const navItems = [
  { icon: ICONS.HOME, labelKey: "nav_home", href: "/" },
  { icon: ICONS.SPORT, labelKey: "nav_sport", href: "/sport" },
  { icon: ICONS.ESPORT, labelKey: "nav_esport", href: "/esports" },
  { icon: ICONS.FORUM, labelKey: "nav_forum", href: "/forum" },
];

interface SportEntry {
  key: string;
  labelKey: string;
  icon: React.ReactNode;
  href: string;
  leagues: { id: string; name: string }[];
}

const SPORT_MENU: SportEntry[] = [
  {
    key: "football",
    labelKey: "sport_football",
    icon: ICONS.FOOTBALL,
    href: "/football",
    leagues: [
      { id: "4328", name: "Premier League" },
      { id: "4335", name: "La Liga" },
      { id: "4331", name: "Bundesliga" },
      { id: "4332", name: "Serie A" },
      { id: "4334", name: "Ligue 1" },
      { id: "4480", name: "UEFA Champions League" },
      { id: "4481", name: "UEFA Europa League" },
      { id: "5071", name: "UEFA Conference League" },
    ],
  },
  {
    key: "basketball",
    labelKey: "sport_basketball",
    icon: ICONS.BASCETBALL,
    href: "/basketball",
    leagues: [{ id: "4387", name: "NBA" }],
  },
  {
    key: "tennis",
    labelKey: "sport_tennis",
    icon: ICONS.TENIS,
    href: "/tennis",
    leagues: [
      { id: "4464", name: "ATP Tour" },
      { id: "4517", name: "WTA Tour" },
      { id: "4581", name: "Laver Cup" },
    ],
  },
  {
    key: "american-football",
    labelKey: "sport_american_football",
    icon: ICONS.RUGBY,
    href: "/american-football",
    leagues: [{ id: "4391", name: "NFL" }],
  },
  {
    key: "motorsport",
    labelKey: "sport_motorsport",
    icon: ICONS.MOTO,
    href: "/motorsport",
    leagues: [
      { id: "4370", name: "Formula 1" },
      { id: "4486", name: "Formula 2" },
      { id: "4371", name: "Formula E" },
      { id: "4413", name: "WEC" },
      { id: "4409", name: "WRC" },
    ],
  },
];

const Header = () => {
  const { user } = useUserStore();
  const router = useRouter();
  const { lang, setLang, t } = useT();

  const [isSportOpen, setIsSportOpen] = useState(false);
  const [isEsportOpen, setIsEsportOpen] = useState(false);
  const [searchToast, setSearchToast] = useState(false);
  const [hoveredSport, setHoveredSport] = useState<string>(SPORT_MENU[0].key);

  const activeSport =
    SPORT_MENU.find((s) => s.key === hoveredSport) ?? SPORT_MENU[0];

  const sportMenuRef = useRef<HTMLDivElement | null>(null);
  const esportMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isSportOpen) return;

    const handlePointer = (e: MouseEvent) => {
      const target = e.target as Node | null;

      if (
        sportMenuRef.current &&
        target &&
        !sportMenuRef.current.contains(target)
      ) {
        setIsSportOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSportOpen(false);
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSportOpen]);

  useEffect(() => {
    if (!isEsportOpen) return;

    const handlePointer = (e: MouseEvent) => {
      const target = e.target as Node | null;

      if (
        esportMenuRef.current &&
        target &&
        !esportMenuRef.current.contains(target)
      ) {
        setIsEsportOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsEsportOpen(false);
    };

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isEsportOpen]);

  const activeBadgeQueries = useLeagueLookups(
    activeSport.leagues.map((l) => l.id)
  );

  const badgeFor = (idx: number): string | undefined =>
    activeBadgeQueries[idx]?.data?.lookup?.[0]?.strBadge ?? undefined;

  const goToSport = (entry: SportEntry, leagueId?: string) => {
    const url = leagueId ? `${entry.href}?league=${leagueId}` : entry.href;

    router.push(url);
    setIsSportOpen(false);
  };

  return (
    <header className="w-full bg-white px-4 py-4 sm:px-6 lg:px-10">
      {searchToast && (
        <Toast
          message={t("maintenance_message")}
          type="error"
          onClose={() => setSearchToast(false)}
        />
      )}

      <div className="flex flex-col gap-4">
        <div className="flex h-auto w-full flex-wrap items-center justify-between gap-3 lg:h-[70px] lg:flex-nowrap">
          <Link
            href="/"
            className="group relative shrink-0 cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
            aria-label={t("header_back_home")}
          >
            <div className="absolute inset-0 rounded-full bg-brand-red/5 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative transition-transform duration-300 group-hover:-translate-y-0.5">
              {ICONS.ICON}
            </div>
          </Link>

          <div
            onClick={() => setSearchToast(true)}
            className="group order-3 flex h-[44px] w-full cursor-pointer items-center justify-between rounded-[50px] border-2 border-brand-red bg-white pl-4 pr-1 opacity-60 transition-all duration-300 ease-out hover:scale-[1.01] hover:opacity-100 hover:shadow-[0_8px_30px_rgba(175,41,42,0.12)] lg:order-none lg:h-[50px] lg:w-[600px]"
          >
            <span className="min-w-0 flex-1 select-none text-body-l text-brand-black/40 transition-colors duration-300 group-hover:text-brand-black/60">
              {t("header_search_placeholder")}
            </span>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red transition-transform duration-300 group-hover:scale-105 lg:h-9 lg:w-9 [&_svg]:h-5 [&_svg]:w-5 lg:[&_svg]:h-6 lg:[&_svg]:w-6">
              {ICONS.SEARCH}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 lg:gap-[25px]">
            <button
              type="button"
              onClick={() => setLang(lang === "uk" ? "en" : "uk")}
              className="group hidden h-[44px] min-w-[80px] cursor-pointer items-center justify-center gap-2 rounded-[50px] border-2 border-brand-red px-4 text-body-l font-medium text-brand-red transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-red/5 hover:shadow-[0_8px_24px_rgba(175,41,42,0.10)] sm:flex lg:h-[50px] lg:min-w-[100px] lg:px-6"
              aria-label="Switch language"
            >
              {lang === "uk" ? "UA" : "EN"}

              <span className="transition-transform duration-300 group-hover:rotate-180">
                {ICONS.ArrowDown}
              </span>
            </button>

            {user ? (
              <button
                type="button"
                className="group flex h-15 w-15 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-brand-red bg-gray-50 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_8px_26px_rgba(175,41,42,0.18)]"
                onClick={() => router.push("/profile")}
                aria-label="Open profile"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="avatar"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <span className="text-left text-3xl font-bold text-brand-red transition-transform duration-300 group-hover:scale-105">
                    {user?.name && user.name !== "someName"
                      ? user.name[0].toUpperCase()
                      : user?.email
                        ? user.email[0].toUpperCase()
                        : "?"}
                  </span>
                )}
              </button>
            ) : (
              <Link
                href="?auth=login"
                className="flex h-[44px] min-w-[80px] items-center justify-center rounded-[50px] bg-brand-red px-4 text-body-l font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_10px_28px_rgba(175,41,42,0.22)] lg:h-[50px] lg:min-w-[100px] lg:px-6"
              >
                {t("header_login")}
              </Link>
            )}
          </div>
        </div>

        <div className="flex h-auto w-full flex-wrap items-center justify-between gap-2 sm:gap-4 lg:h-20">
          <nav className="flex shrink-0 items-center gap-2 sm:gap-4 lg:gap-12">
            <div className="flex items-center gap-1 sm:gap-3 lg:gap-[30px]">
              {navItems.map((item, index) => {
                if (item.labelKey === "nav_sport") {
                  return (
                    <div key={index} className="relative" ref={sportMenuRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSportOpen(!isSportOpen);
                          setIsEsportOpen(false);
                        }}
                        className="group flex cursor-pointer items-center justify-center gap-2 rounded-[12px] p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-red/5"
                      >
                        <NavIcon>{item.icon}</NavIcon>
                        <NavLabel>{t(item.labelKey)}</NavLabel>

                        <span
                          className={`transition-transform duration-300 ${
                            isSportOpen ? "rotate-180" : ""
                          }`}
                        >
                          {ICONS.ArrowDown}
                        </span>
                      </button>

                      <div
                        className={`absolute left-0 top-[60px] z-50 h-auto w-[min(760px,calc(100vw-2rem))] origin-top overflow-hidden rounded-[20px] border-[2px] border-[#af292a] bg-white shadow-2xl transition-all duration-300 ease-out lg:top-[75px] ${
                          isSportOpen
                            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                        }`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr]">
                          <div className="flex flex-col gap-1 bg-[#fafafa] p-4 sm:border-r sm:border-gray-200 sm:p-6">
                            {SPORT_MENU.map((s) => (
                              <button
                                key={s.key}
                                type="button"
                                onClick={() => goToSport(s)}
                                onMouseEnter={() => setHoveredSport(s.key)}
                                onFocus={() => setHoveredSport(s.key)}
                                className={`flex cursor-pointer items-center gap-2 rounded-[10px] px-3 py-2 text-left transition-all duration-300 hover:translate-x-1 ${
                                  hoveredSport === s.key
                                    ? "bg-[#af292a]/10"
                                    : "hover:bg-[#af292a]/5"
                                }`}
                              >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center transition-transform duration-300 hover:scale-110">
                                  {s.icon}
                                </div>

                                <span
                                  className={`text-[15px] font-bold leading-tight transition-colors duration-300 ${
                                    hoveredSport === s.key
                                      ? "text-[#af292a]"
                                      : "text-[#212121]"
                                  }`}
                                >
                                  {t(s.labelKey)}
                                </span>
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-col gap-1 p-4 sm:p-6">
                            <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                              {t("header_top_leagues")}
                            </span>

                            {activeSport.leagues.map((l, i) => {
                              const badge = badgeFor(i);

                              return (
                                <button
                                  key={l.id}
                                  type="button"
                                  onClick={() => goToSport(activeSport, l.id)}
                                  className="flex cursor-pointer items-center gap-3 rounded-[8px] px-3 py-2 text-[14px] font-medium text-[#212121] transition-all duration-300 hover:translate-x-1 hover:bg-[#af292a]/5 hover:text-[#af292a]"
                                >
                                  {badge ? (
                                    <Image
                                      src={badge}
                                      alt=""
                                      width={28}
                                      height={28}
                                      unoptimized
                                      className="h-7 w-7 shrink-0 object-contain"
                                    />
                                  ) : (
                                    <span className="h-7 w-7 shrink-0 rounded-full bg-gray-200" />
                                  )}

                                  <span className="truncate">{l.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (item.labelKey === "nav_esport") {
                  return (
                    <div key={index} className="relative" ref={esportMenuRef}>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEsportOpen(!isEsportOpen);
                          setIsSportOpen(false);
                        }}
                        className="group flex cursor-pointer items-center justify-center gap-2 rounded-[12px] p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-red/5"
                      >
                        <NavIcon simple>{item.icon}</NavIcon>
                        <NavLabel force>{t(item.labelKey)}</NavLabel>

                        <span
                          className={`transition-transform duration-300 ${
                            isEsportOpen ? "rotate-180" : ""
                          }`}
                        >
                          {ICONS.ArrowDown}
                        </span>
                      </button>

                      <div
                        className={`absolute left-0 top-[75px] z-50 w-[min(760px,calc(100vw-2rem))] origin-top rounded-[20px] border-[2px] border-[#af292a] bg-white px-8 pb-10 pt-8 shadow-2xl transition-all duration-300 ease-out ${
                          isEsportOpen
                            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                        }`}
                      >
                        <div className="flex flex-col gap-6">
                          <EsportMenuItem
                            src="/icons/cs2.jpg"
                            label="CS 2"
                            onClick={() => {
                              router.push("/esport/cs2");
                              setIsEsportOpen(false);
                            }}
                          />

                          <EsportMenuItem
                            src="/icons/dota2.png"
                            label="Dota 2"
                            onClick={() => {
                              router.push("/esport/dota");
                              setIsEsportOpen(false);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={index}
                    href={item.href}
                    className="group flex items-center justify-center gap-2 rounded-[12px] p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-red/5"
                  >
                    <NavIcon>{item.icon}</NavIcon>
                    <NavLabel>{t(item.labelKey)}</NavLabel>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-3 px-2 sm:gap-5 lg:gap-8 lg:px-4">
            <button
              onClick={()=>{router.push("/contacts")}}
              type="button"
              className="hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:opacity-80 sm:inline-flex"
            >
              {ICONS.ASK}
            </button>

            <button
              type="button"
              className="cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:rotate-12 hover:scale-105 hover:opacity-80"
            >
              {ICONS.SETTING}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

function NavIcon({
  children,
  simple = false,
}: {
  children: React.ReactNode;
  simple?: boolean;
}) {
  if (simple) {
    return (
      <div className="flex h-[18px] w-[18px] items-center justify-center transition-transform duration-300 group-hover:scale-110">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-red transition-transform duration-300 group-hover:scale-110 lg:h-[18px] lg:w-[18px] lg:border-0 [&_svg]:h-4 [&_svg]:w-4 lg:[&_svg]:h-full lg:[&_svg]:w-full">
      {children}
    </div>
  );
}

function NavLabel({
  children,
  force = false,
}: {
  children: React.ReactNode;
  force?: boolean;
}) {
  return (
    <span
      className={`relative text-body-l font-medium uppercase text-brand-red after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:rounded-full after:bg-brand-red after:transition-all after:duration-300 group-hover:after:w-full ${
        force ? "inline" : "hidden lg:inline"
      }`}
    >
      {children}
    </span>
  );
}

function EsportMenuItem({
  src,
  label,
  onClick,
}: {
  src: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-3 transition-all duration-300 hover:translate-x-1"
    >
      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-100 transition-transform duration-300 group-hover:scale-105">
        <img src={src} alt="" className="h-full w-full object-contain" />
      </div>

      <span className="text-[18px] font-bold text-[#212121] transition-colors duration-300 group-hover:text-[#af292a]">
        {label}
      </span>
    </button>
  );
}

export default Header;