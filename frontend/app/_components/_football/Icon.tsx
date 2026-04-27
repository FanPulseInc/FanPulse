"use client";
import React from "react";
import { ICONS } from "@/app/svg";

export type IconName = keyof typeof ICONS;


export function Icon({
    name,
    size = 14,
    className,
    title,
}: {
    name: IconName;
    size?: number;
    className?: string;
    title?: string;
}) {
    const el = ICONS[name] as React.ReactElement<React.SVGProps<SVGSVGElement>>;
    return React.cloneElement(el, {
        width: size,
        height: size,
        className,
        "aria-label": title,
        role: title ? "img" : undefined,
    } as React.SVGProps<SVGSVGElement>);
}
