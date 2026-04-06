"use client";

import { LoadingIndicator } from "@/components/common/loading-indicator";
import { Spinner } from "@/components/ui/spinner";


type LoadingScreenProps = {
    label?: string;
}

export function LoadingScreen({
    label = "Loading...",
}: LoadingScreenProps) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center">
            <Spinner className="size-20 text-primary" />
            <h2>{label}</h2>
            <p>Please wait a moment while we load your content.</p>
        </div>
    )
}