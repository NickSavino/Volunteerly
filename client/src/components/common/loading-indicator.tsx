"use client";

import { cn } from "@/lib/utils";

type LoadingIndicatorProps = {
    size? :number;
    strokeWidth?: number,
    className?: string;
    label?: string;
}

export function LoadingIndicator({
    size = 72,
    strokeWidth = 10,
    className,
    label = "Loading",
}: LoadingIndicatorProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const trackDash = `${circumference * 0.72} ${circumference * 0.28}`;
    const activeDash = `${circumference * 0.24} ${circumference * 0.76}`

    return (
        <div
            role="status"
            aria-label={label}
            className={cn("inline-flex items-center justify-center", className)}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="animate-spin [animation-duration:1.15s]"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(122, 111, 31, 0.45)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={trackDash}
                    transform={`rotate(-130 ${size / 2} ${size / 2})`}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={activeDash}
                    transform={`rotate(30 ${size / 2} ${size / 2})`}
                />
            </svg>
        </div>
    )
}