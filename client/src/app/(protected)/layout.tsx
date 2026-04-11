/**
 * layout.tsx
 * Wraps protected routes with session and access gating.
 */

"use client";

import ProtectedGate from "@/app/(protected)/protected-gate";
import { AppSessionProvider } from "@/providers/app-session-provider";
import { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
    return (
        <AppSessionProvider>
            <ProtectedGate>{children}</ProtectedGate>
        </AppSessionProvider>
    );
}
