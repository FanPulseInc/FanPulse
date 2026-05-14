import { useSyncExternalStore } from "react";

const STORAGE_KEY = "fanpulse:theme";

type Theme = "light" | "dark";

function getSnapshot(): Theme {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(STORAGE_KEY) as Theme) ?? "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(cb: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb();
  };
  window.addEventListener("storage", handler);
  window.addEventListener("theme-change", cb);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("theme-change", cb);
  };
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function toggleTheme() {
  const current = getSnapshot();
  const next: Theme = current === "dark" ? "light" : "dark";
  localStorage.setItem(STORAGE_KEY, next);
  applyTheme(next);
  window.dispatchEvent(new Event("theme-change"));
}

export function initTheme() {
  applyTheme(getSnapshot());
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { theme, toggleTheme };
}
