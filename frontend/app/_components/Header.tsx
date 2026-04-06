export default function Header() {
  const navItems = [
    { label: "Головна", icon: "icons/house.png" },
    { label: "Спорт", icon: "icons/sport.png" },
    { label: "Кіберспорт", icon: "icons/esport.png" },
    { label: "Форум", icon: "icons/forum.png" },
  ];
  const rightIcons = [
    { icon: "icons/notify.png", alt: "notify" },
    { icon: "icons/star.png", alt: "star" },
    { icon: "icons/TV.png", alt: "TV" },
    { icon: "icons/FAQ.png", alt: "FAQ" },
    { icon: "icons/settings.png", alt: "settings" },
  ];
  return (
    <header className="bg-white border-xl">
      <div className="max-w-7xl mx-auto p-4 flex items-between gap-4">
        <div className="text-2xl font-bold">
          <img src={"Logo.png"} alt="Fan Pulse logo" className="w-[347px] h-[50px]" />
        </div>

        <div className="flex items-center w-full border rounded-full px-1 py-1 ring-2 ring-red-500 bg-white">
          <input
            placeholder="Що Ви шукаєте?"
            className="flex-grow bg-transparent px-3 py-1 outline-none"
          />
          <div className="bg-[#AF292A] rounded-full p-2 flex-shrink-0">
            <img src="icons/search.png" className="w-4 h-4" />
          </div>
        </div>



        <div className="flex items-center gap-3">
          <button className="border px-3 py-1 rounded-full">Мова</button>
          <button className="bg-red-600 text-white px-4 py-1 rounded-full">
            Увійти
          </button>
        </div>
      </div>

      <div className="flex justify-between px-4 py-2">
        {/* Nav */}
        <div className="flex gap-2">
          {navItems.map(({ label, icon }) => (
            <button
              key={label}
              className="border border-[#AF292A] text-[#AF292A] rounded-full px-3 py-0.5 text-xl hover:bg-red-50 flex items-center gap-1"
            >
              <img src={icon} alt={label} className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        {/* Right Icons */}
        <div className="flex flex-row gap-6">
          {rightIcons.map(({ icon, alt }) => (
            <span key={alt} className="rounded-full border-2 border-[#AF292A] p-2">
              <img src={icon} alt={alt} className="w-[25px] h-[25px]" />
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}