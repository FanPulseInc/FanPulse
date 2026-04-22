"use client";
import Image from "next/image";

export interface PitchPlayer {
    id: string;
    name: string;
    photoUrl?: string;
    role?: string; // Position abbreviation: "GK" | "LB" | "CB" | "RB" | "CDM" | "CM" | "LW" | …
    side?: "L" | "C" | "R"; // side of the pitch — used to sort players within a line
    number?: number; // jersey number — shown as a small badge when no rating
    rating?: number; // optional rating (0–10 or 0–100)
}

export interface FormationTeam {
    label: string; // "Команда 1" / team name
    logoUrl?: string;
    coachName?: string;
    coachPhotoUrl?: string;
    formation?: string; // e.g. "4-3-3" — team-level strFormation from the lineup endpoint
    goalkeeper: PitchPlayer;
    defense: PitchPlayer[];    // 4
    midfield: PitchPlayer[];   // 4
    attack: PitchPlayer[];     // 2
}

/** Header pill: red rounded card with the team crest on the left + name next to it. */
function TeamHeader({ team }: { team: FormationTeam }) {
    return (
        <div className="w-full h-[67px] px-4 bg-[#af292a] rounded-[20px] flex items-center gap-3">
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
                <span className="ml-auto text-white/90 text-[11px] font-bold font-data bg-black/20 px-2 py-[2px] rounded-full tracking-wider">
                    {team.formation}
                </span>
            )}
        </div>
    );
}

function PlayerCard({ player, half }: { player: PitchPlayer; half: "top" | "bottom" }) {
    // Short name for the pitch: "Pontus Jansson" → "Jansson" (surname only
    // reads cleaner inside the gray card with a bigger face photo).
    const parts = (player.name ?? "").trim().split(/\s+/);
    const shortName = parts.length >= 2 ? parts.slice(-1)[0] : player.name;
    const badge =
        player.rating != null
            ? player.rating.toFixed(1)
            : player.number != null
                ? String(player.number)
                : null;
    return (
        <div className="relative z-10 flex flex-col items-center gap-[2px] w-[80px] h-[90px] pt-[6px] pr-[4px] pb-[6px] pl-[4px] bg-[#e6e6e6] rounded-[10px] shadow-sm">
            {half === "top" && player.role && (
                <span className="text-[8px] text-[#af292a] font-bold tracking-wider">{player.role}</span>
            )}
            <div className="relative">
                <div className="w-[48px] h-[48px] rounded-full bg-white overflow-hidden flex items-center justify-center shadow-sm">
                    {player.photoUrl ? (
                        <Image
                            src={player.photoUrl}
                            alt={player.name}
                            width={48}
                            height={48}
                            unoptimized
                            // `object-top` keeps the face in frame when TheSportsDB
                            // returns a torso-length cutout.
                            className="w-full h-full object-cover object-top"
                        />
                    ) : (
                        <span className="text-[#af292a] text-[12px] font-bold">
                            {player.name.slice(0, 2).toUpperCase()}
                        </span>
                    )}
                </div>
                {badge && (
                    <span
                        className={`absolute bottom-0 -right-1 w-[20px] h-[14px] py-[1px] px-[2px] rounded-[3px] text-[10px] font-bold leading-none flex flex-row justify-center items-center font-data ${
                            player.rating != null
                                ? "bg-[#212121] text-white"
                                : "bg-[#af292a] text-white"
                        }`}
                    >
                        {badge}
                    </span>
                )}
            </div>
            <span className="text-[10px] text-[#212121] font-semibold truncate max-w-full">
                {shortName}
            </span>
            {half === "bottom" && player.role && (
                <span className="text-[8px] text-[#af292a] font-bold tracking-wider">{player.role}</span>
            )}
        </div>
    );
}

/**
 * Goal markings for one half of the pitch — Figma spec, 3 px solid #af292a:
 *   penalty area  — 169×54 outer rectangle
 *   six-yard box  — 92×29 inner rectangle
 * Both are FULL rectangles flush to the top (home) or bottom (away) edge of the
 * pitch container. The goalkeeper card paints on top of them (z-10 vs z-0), so
 * what the user sees is "the back of the goal sticking out behind the GK".
 *
 * Renders as a fragment — the parent must be `position: relative`.
 */
function GoalArea({ position }: { position: "top" | "bottom" }) {
    // Both halves of the pitch draw 3 sides with the edge-facing border
    // omitted, so no horizontal line touches the pitch card's edge. The top
    // goal box opens upward (bottom + sides drawn); the bottom goal box opens
    // downward (top + sides drawn). Visually this leaves the penalty area /
    // six-yard box as a bracket that "connects" into the centre line.
    const yClass = position === "top" ? "top-0" : "bottom-0";
    const sides =
        position === "top"
            ? "border-b-[3px] border-l-[3px] border-r-[3px]"
            : "border-t-[3px] border-l-[3px] border-r-[3px]";
    return (
        <>
            {/* Outer penalty area */}
            <span
                aria-hidden
                className={`pointer-events-none absolute ${yClass} left-1/2 -translate-x-1/2 w-[169px] h-[54px] ${sides} border-[#af292a] z-0`}
            />
            {/* Inner six-yard box */}
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
    /** "around" keeps equal gaps; "between" pins the first/last to the edges — used
     *  for the central-midfield row so LM/RM sit visibly wider than CM. */
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

/** Split the midfield into three vertical layers so CDM sits below CM sits below CAM.
 *  LM/RM stay in the central row but spread wide via `spread="between"`. */
function splitMidfield(players: PitchPlayer[]) {
    const back: PitchPlayer[] = [];
    const centre: PitchPlayer[] = [];
    const front: PitchPlayer[] = [];
    for (const p of players) {
        const r = (p.role ?? "").toUpperCase();
        if (r === "CDM" || r === "DM") back.push(p);
        else if (r === "CAM" || r === "AM") front.push(p);
        else centre.push(p); // CM / LM / RM / fallback
    }
    return { back, centre, front };
}

export default function FormationPitch({ top, bottom }: { top: FormationTeam; bottom: FormationTeam }) {
    const topMid = splitMidfield(top.midfield);
    const bottomMid = splitMidfield(bottom.midfield);
    return (
        <div className="w-full flex flex-col gap-3">
            {/* Top team header — standalone rounded card, separated from the pitch. */}
            <TeamHeader team={top} />

            {/* Pitch */}
            <div className="relative bg-white rounded-[20px] shadow-sm border border-gray-100 px-4 pt-[40px] pb-[40px] flex flex-col gap-3 overflow-hidden">
                {/* Centre line + circle — Figma spec: 3 px solid #af292a, 150 px circle.
                    Line spans full width (left-0 right-0) so it touches both side
                    walls and "connects" the pitch edges. The circle has no fill,
                    so the line passes straight through it. */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 border-t-[3px] border-[#af292a] z-0" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full border-[3px] border-[#af292a] z-0" />

                {/* Goal markings — penalty area + six-yard box at each end. */}
                <GoalArea position="top" />
                <GoalArea position="bottom" />

                {/* Top half — team 1 (attacking down) */}
                <div className="flex justify-center relative z-10">
                    <PlayerCard player={top.goalkeeper} half="top" />
                </div>
                <Line players={top.defense} half="top" />
                {/* Top team attacks downward, so closer to the centre line = more
                    attacking. Order: CDM → CM(+LM/RM) → CAM. */}
                <Line players={topMid.back} half="top" />
                <Line players={topMid.centre} half="top" spread="between" />
                <Line players={topMid.front} half="top" />
                <Line players={top.attack} half="top" />

                {/* Bottom half — team 2 (attacking up). Mirror the midfield order:
                    CAM nearest the centre line, CDM nearest its own defence. */}
                <Line players={bottom.attack} half="bottom" />
                <Line players={bottomMid.front} half="bottom" />
                <Line players={bottomMid.centre} half="bottom" spread="between" />
                <Line players={bottomMid.back} half="bottom" />
                <Line players={bottom.defense} half="bottom" />
                <div className="flex justify-center relative z-10">
                    <PlayerCard player={bottom.goalkeeper} half="bottom" />
                </div>
            </div>

            {/* Bottom team header — mirrors the top, standalone. */}
            <TeamHeader team={bottom} />

            <div className="flex justify-center gap-4">
                {[top, bottom].map((t, i) => (
                    <div
                        key={i}
                        className="w-[236px] h-[133px] p-[20px] bg-[#f8f8f8] rounded-[20px] flex flex-col items-center gap-[10px]"
                    >
                        {/* Header row: crest + red team pill */}
                        <div className="flex items-center gap-2 w-full">
                            <div className="w-[28px] h-[28px] flex items-center justify-center overflow-hidden shrink-0">
                                {t.logoUrl ? (
                                    <Image
                                        src={t.logoUrl}
                                        alt={t.label}
                                        width={28}
                                        height={28}
                                        unoptimized
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <span className="text-[#af292a] font-bold text-[10px]">
                                        {t.label.slice(0, 2).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div className="w-[169px] h-[27px] bg-[#af292a] rounded-[10px] flex items-center justify-center">
                                <span className="text-white font-bold text-[12px] uppercase tracking-wider">
                                    Команда{i + 1}
                                </span>
                            </div>
                        </div>

                        {/* Coach pill: avatar + name */}
                        <div className="w-[211px] h-[64px] pt-[6px] pr-[17px] pb-[4px] pl-[4px] bg-[#e6e6e6] rounded-[10px] flex items-center gap-[10px]">
                            <div className="w-[52px] h-[52px] rounded-full bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                                {t.coachPhotoUrl ? (
                                    <Image
                                        src={t.coachPhotoUrl}
                                        alt={t.coachName ?? "Тренер"}
                                        width={52}
                                        height={52}
                                        unoptimized
                                        className="w-full h-full object-cover object-top"
                                    />
                                ) : (
                                    <span className="text-[#af292a] font-bold text-[12px]">
                                        {(t.coachName ?? "T").slice(0, 2).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <span className="text-[#212121] font-semibold text-[13px] truncate">
                                {t.coachName ?? "Тренер"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
