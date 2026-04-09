import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { VolunteerOrganizationService } from "@/services/VolunteerOrganizationService";
import { VolunteerService } from "@/services/VolunteerService";
import { PublicOrgProfile, CurrentVolunteer } from "@volunteerly/shared";

export function useOrgPublicProfileViewModel(orgId: string) {
    const router = useRouter();
    const { session, loading, signOut } = useAuth();
    const [org, setOrg] = useState<PublicOrgProfile | undefined>(undefined);
    const [currentVolunteer, setCurrentVolunteer] = useState<CurrentVolunteer | undefined>(
        undefined,
    );
    const [error, setError] = useState<string | null>(null);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!loading && !session) router.replace("/login");
    }, [loading, session, router]);

    useEffect(() => {
        async function loadData() {
            if (!session?.access_token) return;
            try {
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
