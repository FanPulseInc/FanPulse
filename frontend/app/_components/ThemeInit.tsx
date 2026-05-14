"use client";
import { useEffect } from "react";
import { initTheme } from "@/store/useThemeStore";

export default function ThemeInit() {
  useEffect(() => {
    initTheme();
  }, []);
  return null;
}
