"use client";

import { Spinner } from "@/components/ui/spinner";

type LoadingScreenProps = {
    label?: string;
};

export function LoadingScreen({ label = "Loading..." }: LoadingScreenProps) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center text-center">
            <Spinner className="size-20 text-primary" />
            <h2>{label}</h2>
            <p>Please wait a moment while we load your content.</p>
        </div>
    );
}
