"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSessionProvider, useAppSession } from "@/providers/app-session-provider";
import { resolveDefaultAppRoute } from "@/lib/utils";
import { LoadingScreen } from "@/components/common/loading-screen";
import { UserRole } from "@volunteerly/shared";
import ProtectedGate from "@/app/(protected)/protected-gate";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
    return (
        <AppSessionProvider>
            <ProtectedGate>{children}</ProtectedGate>
        </AppSessionProvider>
    );
}
