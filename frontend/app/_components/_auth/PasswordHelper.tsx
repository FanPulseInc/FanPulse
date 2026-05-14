"use client"

import { useT } from "@/services/i18n/context"
import { useMemo } from "react"

interface PasswordHelperProps {
    password: string
}

interface Rule {
    key: string
    test: (p: string) => boolean
}

const rules: Rule[] = [
    { key: "pw_min_length", test: (p) => p.length >= 8 },
    { key: "pw_uppercase", test: (p) => /[A-Z]/.test(p) },
    { key: "pw_number", test: (p) => /[0-9]/.test(p) },
    { key: "pw_special", test: (p) => /[^a-zA-Z0-9]/.test(p) },
    { key: "pw_ascii_only", test: (p) => p.length === 0 || [...p].every((c) => c.charCodeAt(0) > 32 && c.charCodeAt(0) < 128) },
]

export default function PasswordHelper({ password }: PasswordHelperProps) {
    const { t } = useT()

    const results = useMemo(
        () => rules.map((r) => ({ ...r, passed: r.test(password) })),
        [password]
    )

    const passedCount = results.filter((r) => r.passed).length
    const strength = password.length === 0 ? 0 : passedCount / rules.length

    if (password.length === 0) return null

    return (
        <div className="flex flex-col gap-2 animate-[fadeSlideIn_0.25s_ease-out]">
            {/* strength bar */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-[5px] rounded-full bg-border-theme overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: `${strength * 100}%`,
                            backgroundColor:
                                strength <= 0.4
                                    ? "#ef4444"
                                    : strength <= 0.7
                                      ? "#f59e0b"
                                      : "#22c55e",
                        }}
                    />
                </div>
                <span
                    className="text-[11px] font-bold uppercase tracking-wider transition-colors duration-300"
                    style={{
                        color:
                            strength <= 0.4
                                ? "#ef4444"
                                : strength <= 0.7
                                  ? "#f59e0b"
                                  : "#22c55e",
                    }}
                >
                    {strength <= 0.4
                        ? t("pw_strength_weak")
                        : strength <= 0.7
                          ? t("pw_strength_medium")
                          : t("pw_strength_strong")}
                </span>
            </div>

            {/* rules checklist */}
            <ul className="flex flex-col gap-[5px]">
                {results.map((r, i) => (
                    <li
                        key={r.key}
                        className="flex items-center gap-2 text-[12px] leading-tight transition-all duration-300"
                        style={{
                            animationDelay: `${i * 40}ms`,
                        }}
                    >
                        {/* icon */}
                        <span
                            className={`
                                flex items-center justify-center
                                w-[16px] h-[16px] rounded-full
                                text-[10px] font-bold
                                transition-all duration-300
                                ${r.passed
                                    ? "bg-green-500 text-white scale-100"
                                    : "bg-border-theme text-text-muted scale-90"
                                }
                            `}
                        >
                            {r.passed ? (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <path
                                        d="M2 5.5L4 7.5L8 3"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            ) : (
                                <span className="block w-[6px] h-[6px] rounded-full bg-text-muted/40" />
                            )}
                        </span>

                        {/* label */}
                        <span
                            className={`
                                transition-all duration-300
                                ${r.passed
                                    ? "text-green-600 dark:text-green-400 line-through opacity-60"
                                    : "text-text-secondary"
                                }
                            `}
                        >
                            {t(r.key)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
