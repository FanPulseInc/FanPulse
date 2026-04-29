"use client";
/**
 * Favourites store — localStorage-backed, no external state lib. Tracks two
 * sets: favourited match IDs and favourited team IDs. The schedule list
 * treats a match as "favourite" if EITHER its own ID is favourited OR one of
 * its teams is — so pinning a club automatically surfaces every fixture of
 * that club on the active date.
 *
 * Cross-component sync is done via a custom window event (`favorites:changed`)
 * plus a storage listener so multiple tabs stay consistent. useSyncExternalStore
 * gives React the right "subscribe + snapshot" hooks without triggering an
 * SSR/CSR mismatch.
 */
import { useCallback, useSyncExternalStore } from "react";

const MATCH_KEY = "fanpulse:fav-matches";
const TEAM_KEY = "fanpulse:fav-teams";
const EVENT = "favorites:changed";

type Kind = "match" | "team";

function readSet(key: string): Set<string> {
    if (typeof window === "undefined") return new Set();
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return new Set();
        const arr = JSON.parse(raw);
        return new Set(Array.isArray(arr) ? arr.map(String) : []);
    } catch {
        return new Set();
    }
}

function writeSet(key: string, set: Set<string>) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify([...set]));
    window.dispatchEvent(new Event(EVENT));
}

// ----- snapshot cache: useSyncExternalStore requires a stable reference when
// nothing changed, otherwise React thinks the store updated every render and
// loops. We rebuild the snapshot object only when the underlying sets change.
let snap: { matches: Set<string>; teams: Set<string> } = {
    matches: new Set(),
    teams: new Set(),
};
// Read once eagerly on module load (client-only) so server/client initial
// snapshots match. During SSR both are empty sets.
if (typeof window !== "undefined") {
    snap = { matches: readSet(MATCH_KEY), teams: readSet(TEAM_KEY) };
}

function refreshSnap() {
    snap = { matches: readSet(MATCH_KEY), teams: readSet(TEAM_KEY) };
}

function subscribe(cb: () => void) {
    const handler = () => {
        refreshSnap();
        cb();
    };
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
        window.removeEventListener(EVENT, handler);
        window.removeEventListener("storage", handler);
    };
}

const serverSnap: { matches: Set<string>; teams: Set<string> } = {
    matches: new Set(),
    teams: new Set(),
};

function getSnap() {
    return snap;
}

function getServerSnap() {
    return serverSnap;
}

export function useFavorites() {
    const state = useSyncExternalStore(subscribe, getSnap, getServerSnap);

    const toggle = useCallback((kind: Kind, id: string | undefined | null) => {
        if (!id) return;
        const key = kind === "match" ? MATCH_KEY : TEAM_KEY;
        const current = readSet(key);
        if (current.has(id)) current.delete(id);
        else current.add(id);
        writeSet(key, current);
    }, []);

    const isMatchFav = useCallback(
        (matchId: string | undefined | null) => !!matchId && state.matches.has(matchId),
        [state]
    );
    const isTeamFav = useCallback(
        (teamId: string | undefined | null) => !!teamId && state.teams.has(teamId),
        [state]
    );

    // A match is "favourited" for display purposes if its own ID is favourited
    // OR either competing team is — pinning Barça makes every Barça match on
    // the active date show up under Улюблене automatically.
    const isMatchFavOrTeam = useCallback(
        (matchId?: string, homeTeamId?: string, awayTeamId?: string) =>
            isMatchFav(matchId) || isTeamFav(homeTeamId) || isTeamFav(awayTeamId),
        [isMatchFav, isTeamFav]
    );

    return {
        matchIds: state.matches,
        teamIds: state.teams,
        toggleMatch: (id: string | undefined | null) => toggle("match", id),
        toggleTeam: (id: string | undefined | null) => toggle("team", id),
        isMatchFav,
        isTeamFav,
        isMatchFavOrTeam,
    };
}
