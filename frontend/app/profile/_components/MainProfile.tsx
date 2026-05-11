"use client";
import RecentActivity from "./RecentActivity"
import { useT } from "@/services/i18n/context"
import type { UserResponse } from "@/services/api/model/userResponse"
import { useEffect, useState } from "react";

interface StatItem { label: string; value: string | number }
interface FavoriteItem { icon: string; name: string }

function ProfileOnboarding({
  name,
  onClose,
}: {
  name?: string
  onClose: () => void
}) {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: name
        ? `${name}, ласкаво просимо у FanPulse`
        : "Ласкаво просимо у FanPulse",
      text: "FanPulse — це спортивна платформа для фанатів, де можна стежити за матчами, взаємодіяти зі спільнотою та формувати власний фан-профіль.",
    },
    {
      title: "Персоналізований профіль",
      text: "У профілі зберігається твоя активність: публікації, коментарі, лайки та взаємодія з іншими користувачами.",
    },
    {
      title: "Улюблені команди та турніри",
      text: "Додавай команди, ліги та гравців у вибране, щоб швидше знаходити актуальні новини та контент.",
    },
    {
      title: "Спортивна спільнота",
      text: "Бери участь в обговореннях, залишай коментарі, підтримуй інших фанатів та створюй власний контент.",
    },
    {
      title: "Керуйте своїм профілем",
      text: "Змінюй фото профілю, редагуй імʼя, налаштовуй безпеку акаунта та ділись профілем з друзями.",
    },
  ]

  const current = steps[step]
  const isLast = step === steps.length - 1

  const nextStep = () => {
    if (isLast) {
      onClose()
      return
    }

    setStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[760px] overflow-hidden rounded-[32px] border-2 border-brand-red bg-white p-6 md:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-brand-red text-xl font-bold text-white hover:opacity-90"
          aria-label="Закрити онбординг"
        >
          ×
        </button>

        <div className="grid items-center gap-6 md:grid-cols-[1fr_240px]">
          <div className="flex flex-col gap-5">
            <div className="flex w-fit items-center gap-2 rounded-full bg-brand-red/10 px-4 py-2 text-sm font-bold text-brand-red">
              <span>
                Крок {step + 1} з {steps.length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="text-3xl font-black uppercase leading-tight text-brand-black md:text-4xl">
                {current.title}
              </h2>

              <p className="max-w-[480px] text-base font-medium leading-relaxed text-brand-black/60">
                {current.text}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${index === step
                      ? "w-10 bg-brand-red"
                      : "w-2 bg-brand-red/25"
                    }`}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0}
                className="h-[48px] rounded-2xl border-2 border-brand-red px-6 font-bold text-brand-red transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
              >
                Назад
              </button>

              <button
                type="button"
                onClick={nextStep}
                className="h-[48px] rounded-2xl bg-brand-red px-6 font-bold text-white hover:opacity-90"
              >
                {isLast ? "Завершити" : "Далі"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="h-[48px] px-4 text-sm font-bold text-brand-black/40 hover:text-brand-red"
              >
                Пропустити
              </button>
            </div>
          </div>

          <div className="relative mx-auto flex justify-center">
            <div className="absolute inset-0 rounded-full bg-brand-red/20 blur-3xl" />

            <img
              src="/icons/fox.png"
              alt="FanPulse помічник"
              className="relative z-10 w-[190px] md:w-[240px] drop-shadow-xl"
            />
          </div>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-brand-red/10" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-brand-red/5" />
      </div>
    </div>
  )
}



export default function MainProfile({
  user,
  stats,
  competitions,
  teams,
  players,
}: {
  user?: UserResponse;
  stats: StatItem[];
  competitions: FavoriteItem[];
  teams: FavoriteItem[];
  players: FavoriteItem[];
}) {
  const { t } = useT()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const passed = localStorage.getItem("profile_onboarding_passed")
    setShowOnboarding(passed !== "true")
  }, [])

  const handleCloseOnboarding = () => {
    localStorage.setItem("profile_onboarding_passed", "true")
    setShowOnboarding(false)
  }
  return (
    <>
      {showOnboarding && (
        <ProfileOnboarding
          name={user?.name || undefined}
          onClose={handleCloseOnboarding}
        />
      )}
      <section className="w-full flex flex-col gap-6 pb-4">
        <h2 className="text-[1.5rem] font-bold uppercase leading-none">
          {t("profile_activity_tab")}
        </h2>


        <div className="grid grid-cols-3 gap-5">
          {stats.map((item: StatItem, index: number) => (
            <div
              key={index}
              className="h-[100px] flex flex-col items-center justify-center gap-1 bg-brand-red text-white rounded-[20px] shadow-md transition-transform hover:scale-[1.02]"
            >
              <span className="text-[1rem] font-medium opacity-90">
                {item.label}
              </span>
              <span className="text-[1.5rem] font-bold leading-none">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <RecentActivity user={user} />

      <section className="w-full flex flex-col gap-10">
        <h2 className="text-[2rem] font-bold text-brand-black uppercase border-b-2 border-brand-red/10 pb-2">
          {t("profile_favourite_tab")}
        </h2>

        {competitions.length > 0 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-bold">{t("profile_competitions_tab")}</h2>
            <div className="grid grid-cols-5 gap-4">
              {competitions.map((item: FavoriteItem, idx: number) => (
                <FavoriteCard key={idx} item={item} />
              ))}
            </div>
          </div>
        )}

        {teams.length > 0 && (
          <div className="flex flex-col gap-5">
            <h2 className="font-bold text-brand-black">{t("profile_teams_tab")}</h2>
            <div className="grid grid-cols-5 gap-4">
              {teams.map((item: FavoriteItem, idx: number) => (
                <FavoriteCard key={idx} item={item} />
              ))}
            </div>
          </div>
        )}

        {players.length > 0 && (
          <div className="flex flex-col gap-5">
            <h3 className="text-[1.25rem] font-bold text-brand-black">
              {t("profile_players_tab")}
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {players.map((item: FavoriteItem, idx: number) => (
                <FavoriteCard key={idx} item={item} player />
              ))}
            </div>
          </div>
        )}

        {competitions.length === 0 && teams.length === 0 && players.length === 0 && (
          <div className="py-8 text-center text-[14px] text-brand-black/40 font-medium">
            {t("no_favourites")}
          </div>
        )}
      </section>
    </>
  )
}

function FavoriteCard({ item, player }: { item: FavoriteItem; player?: boolean }) {
  return (
    <div className="aspect-[4/5] shadow-lg rounded-[20px] bg-brand-red flex flex-col items-center justify-end pb-5 px-2 gap-3 relative transition-transform hover:scale-105 cursor-pointer">
      <div className="w-16 h-16 absolute top-4 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
        <img
          src={item.icon}
          alt={item.name}
          className={player ? "w-full h-full object-contain p-1" : "w-12 h-12 object-contain"}
        />
      </div>

      <span className="text-[0.7rem] text-white font-medium text-center leading-tight line-clamp-2">
        {item.name}
      </span>
    </div>
  )
}