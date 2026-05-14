export const ForumContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="w-full min-h-screen bg-background py-10">
            <div className="mx-auto grid max-w-[1540px] grid-cols-[220px_1039px_220px] gap-6 px-4 items-start">

                <aside className="hidden 2xl:block sticky top-[120px]">
                    <img
                        src="/banners/forum_promo.png"
                        alt="Forum Promo"
                        className="w-[220px] rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.16)] transition-all duration-500 hover:-translate-y-1 hover:scale-[1.01]"
                    />
                </aside>

                <main className="w-full max-w-[1039px]">
                    {children}
                </main>

                <aside className="hidden 2xl:block sticky top-[120px]">
                    <img
                        src="/banners/forum_promo.png"
                        alt="Forum Promo"
                        className="w-[220px] rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.16)] transition-all duration-500 hover:-translate-y-1 hover:scale-[1.01]"
                    />
                </aside>

            </div>
        </div>
    );
};