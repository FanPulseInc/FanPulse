"use client";

export default function PromoCard() {
    return (
        <div className="w-[220px] bg-gradient-to-b from-[#212121] to-[#3a1515] rounded-[20px] shadow-lg overflow-hidden flex flex-col">
            <div className="px-5 py-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-3xl italic tracking-tighter">F/P</span>
                    <span className="text-white font-bold text-2xl">FanPulse</span>
                </div>
                <div className="text-center mt-2">
                    <div className="text-white font-bold text-sm uppercase tracking-wider">Sport & Esports</div>
                    <div className="text-white font-bold text-sm uppercase tracking-wider">Statistics</div>
                </div>
                <button className="mt-2 bg-[#af292a] hover:bg-[#8e1f20] transition-colors text-white text-[10px] font-bold uppercase tracking-wider px-4 h-[28px] rounded-full cursor-pointer">
                    Learn More
                </button>
            </div>
            <div className="relative flex-1 min-h-[220px] bg-gradient-to-b from-[#3a1515] to-[#212121]">
                
                <div className="absolute inset-0 flex items-center justify-center opacity-80">
                    <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20" />
                </div>
                <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[#af292a] flex items-center justify-center">
                    <span className="text-white text-sm">💬</span>
                </div>
            </div>
        </div>
    );
}
