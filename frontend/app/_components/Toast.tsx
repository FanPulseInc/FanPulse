"use client";
import { useEffect } from "react";

interface ToastProps {
    message: string;
    type: "success" | "error";
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

    return (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:right-6 sm:top-6 z-50 animate-slide-in">
            <div className={`${bgColor} text-white px-5 py-4 rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center gap-3 w-full sm:min-w-[300px] sm:w-auto`}>
                <span className="text-xl">{type === "success" ? "\u2713" : "\u2717"}</span>
                <span className="font-bold text-sm">{message}</span>
                <button onClick={onClose} className="ml-auto text-white/70 hover:text-white text-lg cursor-pointer">
                    &times;
                </button>
            </div>
        </div>
    );
}
