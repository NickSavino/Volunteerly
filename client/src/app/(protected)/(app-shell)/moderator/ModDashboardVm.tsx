import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/UserService";
import { ModeratorService } from "@/services/ModeratorService";
import { OrganizationService } from "@/services/OrganizationService";
import { useAuth } from "@/providers/auth-provider";
import type { CurrentModerator, ModeratorOrganizationList } from "@volunteerly/shared";

export function useModDashboardViewModel() {
    const router = useRouter();
    const { session, user, loading, signOut } = useAuth();
    const [currentModerator, setCurrentModerator] = useState<CurrentModerator | undefined>(undefined);
    const [pendingOrgsCount, setPendingOrgsCount] = useState(0);
    const [recentPendingOrgs, setRecentPendingOrgs] = useState<ModeratorOrganizationList>([]);
    const [error, setError] = useState<string | null>(null);

    // TODO: remove this logic and tie it to useAppSession()
    useEffect(() => {
        async function loadAndVerify() {
            if (!session?.access_token) return;

            try {
                const modResult = await ModeratorService.getCurrentModerator();
                if (!modResult.success) {
                    console.error(modResult.error);
                    setError("Received invalid moderator data from the server.");
                    return;
                }
                setCurrentModerator(modResult.data);

                const orgsResult = await OrganizationService.getAllOrganizations("APPLIED");
                if (orgsResult) {
                    setPendingOrgsCount(orgsResult.length);
                    setRecentPendingOrgs(orgsResult.slice(0, 2));
                }

            } catch (err) {
                console.error(err);
                setError("Failed to load moderator data.");
            }
        }

        loadAndVerify();
    }, [session, router]);

    return {
        loading,
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