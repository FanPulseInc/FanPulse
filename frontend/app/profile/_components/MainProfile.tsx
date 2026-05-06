"use client";
import RecentActivity from "./RecentActivity"
import { useT } from "@/services/i18n/context"
import type { UserResponse } from "@/services/api/model/userResponse"

interface StatItem { label: string; value: string | number }
interface FavoriteItem { icon: string; name: string }

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
  return (
    <>
      <section className="w-full flex flex-col gap-6">
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