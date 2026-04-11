import Link from "next/link";
import { ICONS } from "../svg";

const navItems = [
  { icon: ICONS.HOME, label: "ГОЛОВНА", href: "/" },
  { icon: ICONS.SPORT, label: "СПОРТ", href: "/sport"  },
  { icon: ICONS.ESPORT, label: "КІБЕРСПОРТ", href:  "/esports" },
  { icon: ICONS.FORUM, label: "ФОРУМ", href: "/forum" },
];

const Header = () => {
    return (
        <div className="w-full max-w-[1440px] bg-[#ffffff] px-10 py-4 flex flex-col gap-4">


          <div className="flex h-[70px] items-center justify-between w-full">
              {ICONS.ICON}


              <div className="flex w-[600px] h-[50px] items-center justify-between px-2 py-1 bg-white rounded-[50px] border-2 border-brand-red">
                  <input
                      type="text"
                      placeholder="Що Ви шукаєте?"
                      className="flex-1 bg-transparent outline-none text-body-l text-brand-black placeholder:text-brand-black/40"
                  />
                  <button className="flex items-center justify-center p-2  bg-brand-red rounded-full cursor-pointer hover:opacity-90 transition-opacity">
                      {ICONS.SEARCH}
                  </button>
              </div>


              <div className="flex items-center gap-[25px]">

                  <button className="flex h-[50px] min-w-[100px] items-center justify-center gap-2 px-6 rounded-[50px] border-2 border-brand-red text-brand-red text-body-l font-medium cursor-pointer hover:bg-brand-red/5 transition-colors">
                      Мова
                      {ICONS.ArrowDown}
                  </button>


                  <Link
                      href="?auth=login"
                      className="flex h-[50px] min-w-[100px] items-center justify-center px-6 bg-brand-red rounded-[50px] text-white text-body-l font-medium hover:opacity-90 transition-opacity"
                  >
                      Увійти
                  </Link>
              </div>
          </div>


          <div className="flex items-center justify-between w-full h-20">
              <nav className="flex items-center gap-12">
                  <div className="flex items-center gap-[30px]">
                      {navItems.map((item, index) => (
                          <Link
                              key={index}
                              href={item.href}
                              className="flex items-center justify-center gap-2 p-2.5 rounded-[10px] hover:bg-brand-red/5 transition-colors group"
                          >
                              <div className="w-[18px] h-[18px] flex items-center justify-center">
                                  {item.icon}
                              </div>
                              <span className="text-body-l font-medium text-brand-red uppercase">
                    {item.label}
                  </span>
                          </Link>
                      ))}
                  </div>
              </nav>


              <div className="flex items-center gap-8 px-4">
                  <button className="cursor-pointer hover:opacity-70 transition-opacity">{ICONS.NOTIFY}</button>
                  <button className="cursor-pointer hover:opacity-70 transition-opacity">{ICONS.STAR}</button>
                  <button className="cursor-pointer hover:opacity-70 transition-opacity">{ICONS.TV}</button>
                  <button className="cursor-pointer hover:opacity-70 transition-opacity">{ICONS.ASK}</button>
                  <button className="cursor-pointer hover:opacity-70 transition-opacity">{ICONS.SETTING}</button>
              </div>
          </div>

      </div>
  );
};

export default Header;
