/**
 * layout.tsx
 * Layout wrapper for all public (unauthenticated) pages - shows a loading screen
 * while the auth state is being resolved
 */

"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import { useAuth } from "@/providers/auth-provider";
import { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
    const { loading } = useAuth();

    // Block rendering children until we know whether the user is logged in
    // This prevents a flash of the public page for authenticated users
    if (loading) {
        return <LoadingScreen label="Loading..." />;
    }

    return <>{children}</>;
}