import Link from "next/link";
import { ICONS } from "../../svg";

const navItems = [
    { icon: ICONS.SPORT, label: "СПОРТ", href: "/sport" },
    { icon: ICONS.ESPORT, label: "КІБЕРСПОРТ", href: "/esports" },
    { icon: ICONS.FORUM, label: "ФОРУМ", href: "/forum" },
];

const Header = () => {
    // In a real app need to use usePathname() to set this,
    // but for now, we'll hardcode it for the forum view
    const activePath = "/forum";

    return (
        <header className="w-full h-[89px] bg-white border-b border-gray-100 flex items-center justify-center sticky top-0 z-50">
            <div className="w-full max-w-[1440px] px-10 flex items-center justify-between h-full">

                <div className="flex items-center">
                    <Link href="/">{ICONS.ICON}</Link>
                </div>

                <nav className="flex items-center gap-10 h-full">
                    {navItems.map((item) => {
                        const isActive = item.href === activePath;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="relative flex items-center gap-2 h-full group cursor-pointer transition-all"
                            >
                                <div className="w-5 h-5 flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <span className={`text-[13px] font-bold uppercase tracking-tight transition-colors 
                                    ${isActive ? 'text-brand-red' : 'text-slate-700 group-hover:text-brand-red'}`}
                                >
                                    {item.label}
                                </span>

                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-red rounded-t-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-brand-red flex items-center justify-center text-white hover:opacity-90 transition-opacity">
                        <div className="w-5 h-5">{ICONS.SEARCH}</div>
                    </button>

                    <Link
                        href="?auth=login"
                        className="flex h-[42px] min-w-[110px] items-center justify-center px-6 bg-brand-red rounded-full text-white text-sm font-bold uppercase tracking-wide hover:opacity-90 transition-opacity"
                    >
                        Увійти
                    </Link>

                    <button className="p-2 text-slate-500 hover:text-brand-red transition-colors">
                        {ICONS.SETTING}
                    </button>
                </div>

            </div>
        </header>
    );
};

export default Header;