"use client";
import { useT } from "@/services/i18n/context"

interface ActivityItem {
  type?: string;
  title?: string;
  createdAt?: string;
}

interface UserWithActivity {
  recentActivities?: ActivityItem[];
}

export default function RecentActivity({ user }: { user?: UserWithActivity }) {
  const { t } = useT()

  const typeMap: Record<string, string> = {
    Post: t("activity_post"),
    Comment: t("activity_comment"),
    Like: t("activity_like"),
    Пост: t("activity_post"),
    Коментар: t("activity_comment"),
    Лайк: t("activity_like"),
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()

    const isToday = date.toDateString() === now.toDateString()

    const yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)

    const isYesterday = date.toDateString() === yesterday.toDateString()

    if (isToday) {
      return `${t("activity_today")}, ${date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    }

    if (isYesterday) {
      return `${t("activity_yesterday")}, ${date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    }

    return date.toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
    })
  }

  return (
    <section className="w-full flex flex-col gap-6">
      <h2 className="text-[1.5rem] font-bold uppercase leading-none">
        {t("activity_title")}
      </h2>

      <div className="flex flex-col gap-3">
        {!user?.recentActivities || user.recentActivities.length === 0 ? (
          <div className="w-full min-h-[70px] bg-gray-50 border-2 border-brand-red/30 rounded-[20px] flex items-center justify-center px-6">
            <span className="text-[14px] text-brand-black/50 font-medium">
              {t("activity_empty")}
            </span>
          </div>
        ) : (
          user.recentActivities.map((item: ActivityItem, index: number) => (
            <div
              key={index}
              className="w-full min-h-[70px] bg-gray-50 border-2 border-brand-red rounded-[20px] flex flex-row items-center px-6 gap-4 hover:bg-brand-red/5 transition-colors cursor-pointer group"
            >
              <div className="flex flex-1 items-center justify-between">
                <div className="flex flex-row gap-6 items-center">
                  <span className="text-[14px] font-bold uppercase text-brand-red">
                    {typeMap[item.type ?? ""] || item.type}
                  </span>

                  <span className="text-[14px] font-medium text-brand-black">
                    {item.title}
                  </span>
                </div>

                <span className="text-[12px] text-brand-black/40 font-medium">
                  {formatDate(item.createdAt ?? "")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
