"use client";
import { useT } from "@/services/i18n/context";

export default function Cs2Page() {
  const { t } = useT();
  return (
    <div className="h-[500px] flex items-center justify-center">
      <span className="text-gray-400 text-sm">
        {t("select_match")}
      </span>
    </div>
  );
}
