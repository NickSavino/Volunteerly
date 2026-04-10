/**
 * appliedDashboardVm.tsx
 * View model for the organization's waiting room page after submitting an application
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useAppSession } from "@/providers/app-session-provider";

export function useAppliedOrgDashboardViewModel() {
    const router = useRouter();
    const { session, user, loading: authLoading, signOut } = useAuth();

    // Use the app session to get the current org status - it updates automatically
    // when the moderator approves or rejects the application
    const { loading: appLoading, initialized, currentOrganization } = useAppSession();

    // Watch the org status and redirect as soon as it changes to a terminal state
    useEffect(() => {
        if (!initialized || appLoading || !currentOrganization) return;

        // If they never actually applied, send them back to the application form
        if (currentOrganization.status === "CREATED") {
            router.replace("/organization/application");
            return;
        }

        // Once approved, drop them into the full org dashboard
        if (currentOrganization.status === "VERIFIED") {
            router.replace("/organization");
            return;
        }

        // APPLIED and REJECTED statuses both stay on this page - rejection is shown inline
    }, [initialized, appLoading, currentOrganization, router]);

    return {
        loading: authLoading || appLoading || !initialized,
        session,
        signOut,
        router,
        user,
        currentOrganization,
    };
}