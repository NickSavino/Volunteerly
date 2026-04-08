import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/UserService";
import { ModeratorService } from "@/services/ModeratorService";
import { OrganizationService } from "@/services/OrganizationService";
import { useAuth } from "@/providers/auth-provider";
import type { CurrentModerator, ModeratorOrganizationList } from "@volunteerly/shared";
import { useAppSession } from "@/providers/app-session-provider";

export function useModDashboardViewModel() {
    const router = useRouter();
    const { session, user, loading: authLoading, signOut } = useAuth();

    const { loading: appLoading, initialized, currentModerator } = useAppSession();

    const [pendingOrgsCount, setPendingOrgsCount] = useState(0);
    const [recentPendingOrgs, setRecentPendingOrgs] = useState<ModeratorOrganizationList>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadDashboardData() {
            if (!session?.access_token || !initialized || !currentModerator) return;

            try {
                const orgsResult = await OrganizationService.getAllOrganizations("APPLIED");

                if (orgsResult) {
                    setPendingOrgsCount(orgsResult.length);
                    setRecentPendingOrgs(orgsResult.slice(0, 2));
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load moderator dashboard data.");
            }
        }

        void loadDashboardData();
    }, [session, initialized, currentModerator]);

    return {
        loading: authLoading || appLoading || !initialized || !currentModerator,
        session,
        signOut,
        router,
        user,
        error,
        currentModerator,
        pendingOrgsCount,
        recentPendingOrgs,
    };
}
