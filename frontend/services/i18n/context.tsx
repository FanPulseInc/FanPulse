"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, type Lang, type TranslationKey } from "./dictionaries";

const STORAGE_KEY = "fanpulse:lang";

interface LangContextValue {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

function readInitial(): Lang {
    if (typeof window === "undefined") return "uk";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "en" || stored === "uk" ? (stored as Lang) : "uk";
}

export function LangProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLangState] = useState<Lang>("uk");

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLangState(readInitial());
    }, []);

    const setLang = useCallback((l: Lang) => {
        setLangState(l);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, l);
        }
    }, []);

    const t = useCallback(
        (key: TranslationKey, vars?: Record<string, string | number>) => {
            const dict = dictionaries[lang] ?? dictionaries.uk;
            let value = dict[key] ?? dictionaries.uk[key] ?? key;
            if (vars) {
                for (const [k, v] of Object.entries(vars)) {
                    value = value.replace(`{${k}}`, String(v));
                }
            }
            return value;
        },
        [lang]
    );

    const ctx = useMemo<LangContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

    return <LangContext.Provider value={ctx}>{children}</LangContext.Provider>;
}

export function useT() {
    const ctx = useContext(LangContext);
    if (!ctx) {
        const fallback: LangContextValue = {
            lang: "uk",
            setLang: () => {},
            t: (key) => dictionaries.uk[key] ?? key,
        };
        return fallback;
    }
    return ctx;
}
