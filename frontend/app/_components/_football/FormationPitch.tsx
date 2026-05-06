"use client";
import Image from "next/image";
import { Icon } from "../_shared/Icon";
import { useT } from "@/services/i18n/context";

export interface PitchPlayer {
    id: string;
    name: string;
    photoUrl?: string;
    role?: string; 
    side?: "L" | "C" | "R"; 
    number?: number; 
    rating?: number; 
    nationality?: string; 
    goals?: string[];        
    ownGoals?: string[];     
    assists?: string[];      
    subOutMinute?: string;   
    yellowCard?: string;     
    redCard?: string;        
}

export interface FormationTeam {
    label: string; 
    logoUrl?: string;
    coachName?: string;
    coachPhotoUrl?: string;
    formation?: string; 
    goalkeeper: PitchPlayer;
    defense: PitchPlayer[];    
    midfield: PitchPlayer[];   
    attack: PitchPlayer[];     
}


function TeamHeader({ team }: { team: FormationTeam }) {
    const { t } = useT();
    return (
        <div className="w-full min-h-[67px] px-4 py-2 bg-[#af292a] rounded-[20px] flex items-center gap-3">
            <div className="w-[40px] h-[40px] flex items-center justify-center overflow-hidden shrink-0">
                {team.logoUrl ? (
                    <Image
                        src={team.logoUrl}
                        alt={team.label}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <span className="text-[#af292a] font-bold text-xs">
                        {team.label.slice(0, 2).toUpperCase()}
                    </span>
                )}
            </div>
            <span className="text-white font-bold text-sm uppercase tracking-wider">
                {team.label}
            </span>
            {team.formation && (
                <span className="text-white/90 text-[11px] font-bold font-data bg-black/20 px-2 py-[2px] rounded-full tracking-wider">
                    {team.formation}
                </span>
            )}
            {team.coachName && (
                <div className="ml-auto flex items-center gap-2 bg-white/15 rounded-full pl-1 pr-3 py-1">
                    <div className="w-[34px] h-[34px] rounded-full overflow-hidden bg-white/20 flex items-center justify-center shrink-0">
                        {team.coachPhotoUrl ? (
                            <Image
                                src={team.coachPhotoUrl}
                                alt={team.coachName}
                                width={34}
                                height={34}
                                unoptimized
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-white text-[11px] font-bold">
                                {team.coachName.slice(0, 1).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-white text-[11px] font-bold uppercase tracking-wider truncate max-w-[140px]">
                            {team.coachName}
                        </span>
                        <span className="text-white/70 text-[9px] font-bold uppercase tracking-wider">
                            {t("coach")}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

function PlayerCard({ player, half }: { player: PitchPlayer; half: "top" | "bottom" }) {
    const parts = (player.name ?? "").trim().split(/\s+/);
    const shortName = parts.length >= 2 ? parts.slice(-1)[0] : player.name;
    const badge =
        player.rating != null
            ? player.rating.toFixed(1)
            : player.number != null
                ? String(player.number)
                : null;

    const goalCount = (player.goals?.length ?? 0);
    const ownGoalCount = (player.ownGoals?.length ?? 0);
    const assistCount = (player.assists?.length ?? 0);
    const hasAnyEvent =
        goalCount > 0 ||
        ownGoalCount > 0 ||
        assistCount > 0 ||
        !!player.subOutMinute ||
        !!player.yellowCard ||
        !!player.redCard;

    return (
        <div className="relative z-10 flex flex-col items-center gap-[1px] w-[60px] sm:w-[72px] min-h-[88px] sm:min-h-[96px] pt-[4px] pr-[3px] pb-[4px] pl-[3px] bg-[#e6e6e6] rounded-[8px] shadow-sm">
            {half === "top" && player.role && (
                <span className="text-[7px] text-[#af292a] font-bold tracking-wider leading-none">{player.role}</span>
            )}
            <div className="relative">
                
                {(player.redCard || player.yellowCard) && (
                    <span className="absolute -top-[12px] -right-[4px] inline-flex drop-shadow z-20">
                        <Icon
                            name={player.redCard ? "REDCARD" : "YELLOWCARD"}
                            size={14}
                            title={player.redCard ?? player.yellowCard}
                        />
                    </span>
                )}
                <div className="w-[40px] h-[40px] rounded-full bg-white overflow-hidden flex items-center justify-center shadow-sm">
                    {player.photoUrl ? (
                        <Image
                            src={player.photoUrl}
                            alt={player.name}
                            width={40}
                            height={40}
                            unoptimized
                            className="w-full h-full object-cover object-top"
                        />
                    ) : (
                        <span className="text-[#af292a] text-[11px] font-bold">
                            {player.name.slice(0, 2).toUpperCase()}
                        </span>
                    )}
                </div>
                {badge && (
                    <span
                        className={`absolute bottom-0 -right-[2px] w-[18px] h-[13px] py-[1px] px-[2px] rounded-[3px] text-[9px] font-bold leading-none flex flex-row justify-center items-center font-data ${
                            player.rating != null
                                ? "bg-[#212121] text-white"
                                : "bg-[#af292a] text-white"
                        }`}
                    >
                        {badge}
                    </span>
                )}
            </div>
            <span className="text-[9px] text-[#212121] font-semibold truncate max-w-full leading-tight">
                {shortName}
            </span>
            {half === "bottom" && player.role && (
                <span className="text-[7px] text-[#af292a] font-bold tracking-wider leading-none">{player.role}</span>
            )}
            {hasAnyEvent && (
                <div className="flex flex-row items-center gap-[2px] leading-none">
                    {Array.from({ length: goalCount }).map((_, i) => (
                        <Icon
                            key={`g${i}`}
                            name="WHITEBALL"
                            size={14}
                            title={player.goals?.[i] ?? "Goal"}
                        />
                    ))}
                    {Array.from({ length: ownGoalCount }).map((_, i) => (
                        <Icon
                            key={`og${i}`}
                            name="REDBALL"
                            size={14}
                            title={player.ownGoals?.[i] ?? "Own goal"}
                        />
                    ))}
                    {Array.from({ length: assistCount }).map((_, i) => (
                        <Icon
                            key={`a${i}`}
                            name="ASSIST"
                            size={14}
                            title={player.assists?.[i] ?? "Assist"}
                        />
                    ))}
                    {player.subOutMinute && (
                        <span className="flex flex-row items-center gap-[2px]">
                            <Icon name="SWITCH" size={14} title={player.subOutMinute} />
                            <span className="text-[9px] text-[#af292a] font-bold font-data leading-none">
                                {player.subOutMinute}
                            </span>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

function GoalArea({ position }: { position: "top" | "bottom" }) {
    const yClass = position === "top" ? "top-0" : "bottom-0";
    const sides =
        position === "top"
            ? "border-b-[3px] border-l-[3px] border-r-[3px]"
            : "border-t-[3px] border-l-[3px] border-r-[3px]";
    return (
        <>
            
            <span
                aria-hidden
                className={`pointer-events-none absolute ${yClass} left-1/2 -translate-x-1/2 w-[169px] h-[54px] ${sides} border-[#af292a] z-0`}
            />
            
            <span
                aria-hidden
                className={`pointer-events-none absolute ${yClass} left-1/2 -translate-x-1/2 w-[92px] h-[29px] ${sides} border-[#af292a] z-0`}
            />
        </>
    );
}

function Line({
    players,
    half,
    spread = "around",
}: {
    players: PitchPlayer[];
    half: "top" | "bottom";
    
    spread?: "around" | "between";
}) {
    if (players.length === 0) return null;
    const justify = spread === "between" && players.length >= 2
        ? "justify-between px-6"
        : "justify-around";
    return (
        <div className={`flex ${justify} items-center w-full`}>
            {players.map(p => <PlayerCard key={p.id} player={p} half={half} />)}
        </div>
    );
}


function splitMidfield(players: PitchPlayer[]) {
    const back: PitchPlayer[] = [];
    const centre: PitchPlayer[] = [];
    const front: PitchPlayer[] = [];
    for (const p of players) {
        const r = (p.role ?? "").toUpperCase();
        if (r === "CDM" || r === "DM") back.push(p);
        else if (r === "CAM" || r === "AM") front.push(p);
        else centre.push(p); 
    }
    return { back, centre, front };
}

export default function FormationPitch({ top, bottom }: { top: FormationTeam; bottom: FormationTeam }) {
    const topMid = splitMidfield(top.midfield);
    const bottomMid = splitMidfield(bottom.midfield);
    return (
        <div className="w-full flex flex-col gap-3">
            <TeamHeader team={top} />
            <div className="w-full">
            <div className="relative bg-white rounded-[20px] shadow-sm border border-gray-100 px-2 sm:px-4 pt-[20px] sm:pt-[28px] pb-[20px] sm:pb-[28px] overflow-hidden w-full">
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-[3px] border-[#af292a] z-0" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full border-[3px] border-[#af292a] z-0" />

                <GoalArea position="top" />
                <GoalArea position="bottom" />

                <div className="relative z-10 grid grid-rows-2 min-h-[640px]">
                    <div className="flex flex-col justify-between items-stretch gap-2 pb-[88px]">
                        <div className="flex justify-center">
                            <PlayerCard player={top.goalkeeper} half="top" />
                        </div>
                        <Line players={top.defense} half="top" />
                        <Line players={topMid.back} half="top" />
                        <Line players={topMid.centre} half="top" spread="between" />
                        <Line players={topMid.front} half="top" />
                        <Line players={top.attack} half="top" />
                    </div>
                    <div className="flex flex-col justify-between items-stretch gap-2 pt-[88px]">
                        <Line players={bottom.attack} half="bottom" />
                        <Line players={bottomMid.front} half="bottom" />
                        <Line players={bottomMid.centre} half="bottom" spread="between" />
                        <Line players={bottomMid.back} half="bottom" />
                        <Line players={bottom.defense} half="bottom" />
                        <div className="flex justify-center">
                            <PlayerCard player={bottom.goalkeeper} half="bottom" />
                        </div>
                    </div>
                </div>
            </div>
            </div>

            <TeamHeader team={bottom} />
        </div>
    );
}
