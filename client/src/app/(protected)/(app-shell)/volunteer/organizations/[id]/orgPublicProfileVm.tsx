/**
 * orgPublicProfileVm.tsx
 * View model for the organization public profile page - loads org data and volunteer context
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { VolunteerOrganizationService } from "@/services/VolunteerOrganizationService";
import { VolunteerService } from "@/services/VolunteerService";
import { PublicOrgProfile, CurrentVolunteer } from "@volunteerly/shared";

/**
 * Drives all state for the organization public profile page
 * @param orgId - the ID of the organization whose profile is being viewed
 * @returns loading state, org data, volunteer data, error, router, and sign-out handler
 */
export function useOrgPublicProfileViewModel(orgId: string) {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();
    const [org, setOrg] = useState<PublicOrgProfile | undefined>(undefined);
    const [currentVolunteer, setCurrentVolunteer] = useState<CurrentVolunteer | undefined>(
        undefined,
    );
    const [error, setError] = useState<string | null>(null);
    const [dataLoading, setDataLoading] = useState(true);

    // Redirect to login if the session is gone
    useEffect(() => {
        if (!loading && !session) router.replace("/login");
    }, [loading, session, router]);

    // Fetch volunteer profile and org data once the session is available
    useEffect(() => {
        async function loadData() {
            if (!session?.access_token) return;
            try {
                // Load the volunteer profile in parallel with the org profile
                const volResult = await VolunteerService.getCurrentVolunteer();
                if (volResult.success) setCurrentVolunteer(volResult.data);

                const orgResult = await VolunteerOrganizationService.getPublicOrgProfile(orgId);
                if (!orgResult.success) {
                    setError("Failed to load organization profile.");
                    return;
                }
                setOrg(orgResult.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load organization profile.");
            } finally {
                setDataLoading(false);
            }
        }
        loadData();
    }, [session, orgId]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    return {
        loading: loading || dataLoading,
        session,
        error,
        org,
        currentVolunteer,
        handleSignOut,
        router,
    };
}
