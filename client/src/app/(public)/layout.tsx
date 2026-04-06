"use client";

import { resolveDefaultAppRoute } from "@/lib/utils";
import { useAppSession } from "@/providers/app-session-provider";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const {
        loading,
        initialized,
        isAuthenticated,
        currentUser,
        currentOrganization,
    } = useAppSession();

    useEffect(() => {
        if (!initialized || loading) return;

        if (!isAuthenticated || !currentUser) return;

        const nextRoute = resolveDefaultAppRoute({
            currentUser,
            currentOrganization,
        });

        router.replace(nextRoute);
    }, [
        initialized,
        loading,
        isAuthenticated,
        currentUser,
        currentOrganization,
        router,
    ]);

    if (!initialized || loading) {
        return <main className="p-6">Loading...</main>
    }

    return <>{children}</>
}