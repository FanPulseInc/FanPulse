import RecentActivity from "./RecentActivity"

export default function MainProfile({
  user,
  stats,
  competitions,
  teams,
  players,
}: any) {
  return (
    <>
      <section className="w-full flex flex-col gap-6">
        <h2 className="text-[1.5rem] font-bold uppercase leading-none">
          Активність
        </h2>

        <div className="grid grid-cols-3 gap-5">
          {stats.map((item: any, index: number) => (
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
          Улюблене
        </h2>

        <div className="flex flex-col gap-5">
          <h2 className="font-bold">Змагання</h2>
          <div className="grid grid-cols-5 gap-4">
            {competitions.map((item: any, idx: number) => (
              <FavoriteCard key={idx} item={item} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="font-bold text-brand-black">Команди</h2>
          <div className="grid grid-cols-5 gap-4">
            {teams.map((item: any, idx: number) => (
              <FavoriteCard key={idx} item={item} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h3 className="text-[1.25rem] font-bold text-brand-black">
            Гравці
          </h3>
          <div className="grid grid-cols-5 gap-4">
            {players.map((item: any, idx: number) => (
              <FavoriteCard key={idx} item={item} player />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function FavoriteCard({ item, player }: any) {
  return (
    <div className="aspect-[4/5] shadow-lg rounded-[20px] bg-brand-red flex flex-col items-center justify-end pb-5 px-2 gap-3 relative transition-transform hover:scale-105 cursor-pointer">
      <div className="w-10 h-10 absolute top-4 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
        <img
          src={item.icon}
          alt=""
          className={player ? "w-full h-full object-contain p-1" : "w-5 h-5 object-contain"}
        />
      </div>

      <span className="text-[0.75rem] text-white font-medium text-center leading-tight">
        {item.name}
      </span>
    </div>
  )
}