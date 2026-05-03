export default function RecentActivity({ user }: any) {
  const typeMap: Record<string, string> = {
    Post: "Пост:",
    Comment: "Коментар:",
    Like: "Лайк:",
    Пост: "Пост:",
    Коментар: "Коментар:",
    Лайк: "Лайк:",
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()

    const isToday = date.toDateString() === now.toDateString()

    const yesterday = new Date()
    yesterday.setDate(now.getDate() - 1)

    const isYesterday = date.toDateString() === yesterday.toDateString()

    if (isToday) {
      return `Сьогодні, ${date.toLocaleTimeString("uk-UA", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    }

    if (isYesterday) {
      return `Вчора, ${date.toLocaleTimeString("uk-UA", {
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
        Остання активність
      </h2>

      <div className="flex flex-col gap-3">
        {!user?.recentActivities || user.recentActivities.length === 0 ? (
          <div className="w-full min-h-[70px] bg-gray-50 border-2 border-brand-red/30 rounded-[20px] flex items-center justify-center px-6">
            <span className="text-[14px] text-brand-black/50 font-medium">
              У вас ще немає активності
            </span>
          </div>
        ) : (
          user.recentActivities.map((item: any, index: number) => (
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