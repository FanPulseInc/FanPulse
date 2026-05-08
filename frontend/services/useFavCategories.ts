"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "fanpulse:fav-category-ids";
const EVENT = "fav-categories:changed";

function readIds(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.map(String) : [];
    } catch {
        return [];
    }
}

export function saveFavCategoryIds(ids: string[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(EVENT));
}

let snap: string[] = typeof window !== "undefined" ? readIds() : [];

function refreshSnap() {
    snap = readIds();
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

const serverSnap: string[] = [];

export function useFavCategoryIds() {
    const ids = useSyncExternalStore(subscribe, () => snap, () => serverSnap);
    const setIds = useCallback((newIds: string[]) => saveFavCategoryIds(newIds), []);
    return { ids, setIds };
}
