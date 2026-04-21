"use client";
import Image from "next/image";

export interface PitchPlayer {
    id: string;
    name: string;
    photoUrl?: string;
    role?: string; // "Голкіпер" | "Захисник" etc.
    number?: number; // jersey number — shown as a small badge when no rating
    rating?: number; // optional rating (0–10 or 0–100)
}

export interface FormationTeam {
    label: string; // "Команда 1" / team name
    coachName?: string;
    goalkeeper: PitchPlayer;
    defense: PitchPlayer[];    // 4
    midfield: PitchPlayer[];   // 4
    attack: PitchPlayer[];     // 2
}

function PlayerCard({ player, half }: { player: PitchPlayer; half: "top" | "bottom" }) {
    // Short name for the pitch: "Pontus Jansson" → "P. Jansson"
    const parts = (player.name ?? "").trim().split(/\s+/);
    const shortName =
        parts.length >= 2 ? `${parts[0][0]}. ${parts.slice(1).join(" ")}` : player.name;
    const badge =
        player.rating != null
            ? player.rating.toFixed(1)
            : player.number != null
                ? String(player.number)
                : null;
    return (
        <div className="flex flex-col items-center gap-[2px] w-[64px]">
            {half === "top" && player.role && (
                <span className="text-[8px] text-[#212121] font-medium">{player.role}</span>
            )}
            <div className="relative w-[48px] h-[48px] rounded-full bg-[#af292a] border border-white overflow-hidden flex items-center justify-center shadow-sm">
                {player.photoUrl ? (
                    <Image
                        src={player.photoUrl}
                        alt={player.name}
                        width={48}
                        height={48}
                        unoptimized
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-white text-[10px] font-bold">
                        {player.name.slice(0, 2).toUpperCase()}
                    </span>
                )}
                {badge && (
                    <span
                        className={`absolute -bottom-[2px] -right-[2px] min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center border border-white font-data ${
                            player.rating != null
                                ? "bg-[#212121] text-white"
                                : "bg-[#af292a] text-white"
                        }`}
                    >
                        {badge}
                    </span>
                )}
            </div>
            <span className="text-[9px] text-[#212121] font-semibold truncate max-w-full">
                {shortName}
            </span>
            {half === "bottom" && player.role && (
                <span className="text-[8px] text-[#212121] font-medium">{player.role}</span>
            )}
        </div>
    );
}

function Line({ players, half }: { players: PitchPlayer[]; half: "top" | "bottom" }) {
    return (
        <div className="flex justify-around items-center w-full">
            {players.map(p => <PlayerCard key={p.id} player={p} half={half} />)}
        </div>
    );
}

export default function FormationPitch({ top, bottom }: { top: FormationTeam; bottom: FormationTeam }) {
    return (
        <div className="w-full bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden">
            {/* Top team header */}
            <div className="bg-[#af292a] h-[32px] flex items-center justify-center px-4">
                <span className="text-white font-bold text-xs uppercase tracking-wider">
                    {top.label}
                </span>
            </div>

            {/* Pitch */}
            <div className="relative bg-white px-4 py-5 flex flex-col gap-3">
                {/* Center line */}
                <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 border-t border-[#af292a]/30" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-[#af292a]/30" />

                {/* Top half — team 1 (attacking down) */}
                <div className="flex justify-center">
                    <PlayerCard player={top.goalkeeper} half="top" />
                </div>
                <Line players={top.defense} half="top" />
                <Line players={top.midfield} half="top" />
                <Line players={top.attack} half="top" />

                {/* Bottom half — team 2 (attacking up) */}
                <Line players={bottom.attack} half="bottom" />
                <Line players={bottom.midfield} half="bottom" />
                <Line players={bottom.defense} half="bottom" />
                <div className="flex justify-center">
                    <PlayerCard player={bottom.goalkeeper} half="bottom" />
                </div>
            </div>

            {/* Bottom team header */}
            <div className="bg-[#af292a] h-[32px] flex items-center justify-center px-4 gap-2">
                <div className="w-4 h-4 rounded-full bg-white" />
                <span className="text-white font-bold text-xs uppercase tracking-wider">
                    {bottom.label}
                </span>
            </div>

            {/* Coaches */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-white">
                {[top, bottom].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#e6e6e6] rounded-[12px] p-2">
                        <div className="bg-[#af292a] text-white text-[9px] font-bold px-2 py-[2px] rounded-full uppercase">
                            Команда{i + 1}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-300" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-[#212121]">{t.coachName ?? "Тренер"}</span>
                            <span className="text-[8px] text-gray-500">Тренер</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
