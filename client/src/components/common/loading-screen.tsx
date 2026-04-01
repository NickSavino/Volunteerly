"use client";

import { LoadingIndicator } from "./loading-indicator";

type LoadingScreenProps = {
    label?: string;
}

export function LoadingScreen({
    label = "Loading...",
}: LoadingScreenProps) {
    return (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
            <LoadingIndicator size={88} strokeWidth={10} />
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
    )
}