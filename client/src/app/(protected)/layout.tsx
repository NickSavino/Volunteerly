"use client";

import { ReactNode } from "react";
import { AppSessionProvider } from "@/providers/app-session-provider";
import ProtectedGate from "@/app/(protected)/protected-gate";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
    return (
        <AppSessionProvider>
            <ProtectedGate>{children}</ProtectedGate>
        </AppSessionProvider>
    );
}
