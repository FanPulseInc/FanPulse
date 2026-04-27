"use client";
/**
 * Votes store — localStorage-backed map of matchId → "home" | "draw" | "away".
 * Mirrors `services/favorites.ts` (same useSyncExternalStore pattern + custom
 * event) so carousel and detail-page vote cards stay in sync live.
 *
 * Only logged-in users can vote. The caller is responsible for gating the
 * action — the hook exposes `ensureAuthed()` to redirect to `?auth=login`
 * when needed, mirroring the Header "login" link pattern already used across
 * the app.
 */
import { useCallback, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";

export type VoteChoice = "home" | "draw" | "away";

const KEY = "fanpulse:votes";
const EVENT = "votes:changed";

function readMap(): Record<string, VoteChoice> {
    if (typeof window === "undefined") return {};
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
        return {};
    }
}

function writeMap(map: Record<string, VoteChoice>) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(EVENT));
}

let snap: Record<string, VoteChoice> = {};
if (typeof window !== "undefined") {
    snap = readMap();
}

function refresh() {
    snap = readMap();
}

function subscribe(cb: () => void) {
    const handler = () => {
        refresh();
        cb();
    };
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
        window.removeEventListener(EVENT, handler);
        window.removeEventListener("storage", handler);
    };
}

const serverSnap: Record<string, VoteChoice> = {};
const getSnap = () => snap;
const getServerSnap = () => serverSnap;

export function useMatchVotes() {
    const state = useSyncExternalStore(subscribe, getSnap, getServerSnap);
    const router = useRouter();
    const pathname = usePathname();
    // The app's canonical "logged in?" signal is the Zustand user store —
    // the Header uses it to toggle the "Увійти" button, so we rely on it
    // here too. Reading only the stale localStorage token missed that
    // UserInitializer may have cleared the session.
    const user = useUserStore(s => s.user);
    const isLoading = useUserStore(s => s.isLoading);

    const voteFor = useCallback((matchId: string | undefined | null): VoteChoice | null => {
        if (!matchId) return null;
        return state[matchId] ?? null;
    }, [state]);

    // Cast or retract a vote. Returns false if the user wasn't logged in (in
    // which case we also route them to the login modal so the interaction
    // completes naturally instead of silently failing).
    const cast = useCallback(
        (matchId: string | undefined | null, choice: VoteChoice): boolean => {
            if (!matchId) return false;
            // While the user store is still resolving (first render after
            // hydration), treat it as "not logged in" and bounce — it
            // stabilises the UX; if the caller really was logged in they just
            // close the modal and nothing was lost.
            if (isLoading || !user) {
                const returnTo = pathname || "/football";
                // URLSearchParams avoids stepping on any existing ?date=...
                const url = new URL(returnTo, window.location.origin);
                url.searchParams.set("auth", "login");
                router.push(url.pathname + url.search);
                return false;
            }
            const current = readMap();
            // Retract: clicking the same option again clears the vote.
            if (current[matchId] === choice) {
                delete current[matchId];
            } else {
                current[matchId] = choice;
            }
            writeMap(current);
            return true;
        },
        [router, pathname, user, isLoading]
    );

    return { voteFor, cast };
}
