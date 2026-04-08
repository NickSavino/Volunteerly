"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import { useAuth } from "@/providers/auth-provider";
import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
    const { loading } = useAuth();

    if (loading) {
        return <LoadingScreen label="Loading..." />;
    }

    return <>{children}</>;
}
