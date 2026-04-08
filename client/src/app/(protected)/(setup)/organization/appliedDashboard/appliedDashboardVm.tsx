import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { UserService } from "@/services/UserService";
import { useAuth } from "@/providers/auth-provider";
import { CurrentOrganization } from "@volunteerly/shared";
import { api } from "@/lib/api";
import { OrganizationService } from "@/services/OrganizationService";
import { useAppSession } from "@/providers/app-session-provider";

export function useAppliedOrgDashboardViewModel() {
    const router = useRouter();
    const { session, user, loading: authLoading, signOut } = useAuth();

    const { loading: appLoading, initialized, currentOrganization } = useAppSession();

    useEffect(() => {
        if (!initialized || appLoading || !currentOrganization) return;

        if (currentOrganization.status === "CREATED") {
            router.replace("/organization/application");
            return;
        }

        if (currentOrganization.status === "VERIFIED") {
            router.replace("/organization");
            return;
        }
    }, [initialized, appLoading, currentOrganization, router]);

    return { loading: authLoading || appLoading || !initialized, session, signOut, router, user, currentOrganization };
}
