/**
 * oppApplicationVm.tsx
 * View model for the organization's application review page
 */

import { useAuth } from "@/providers/auth-provider";
import { OrganizationService } from "@/services/OrganizationService";
import { Application, CurrentOrganization } from "@volunteerly/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useOppApplicationViewModel(oppId: string, appId: string) {
    const router = useRouter();
    const { session, user, loading, signOut } = useAuth();
    const [currentUser, setCurrentUser] = useState<CurrentOrganization | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [application, setApplication] = useState<Application>();
    const [fetching, setFetching] = useState(true);

    // Days that overlap between what the opportunity needs and what the volunteer has available
    const [matchedSchedule, setMatchedSchedule] = useState<string[]>();

    // Load org session and redirect to setup if not yet verified
    useEffect(() => {
        async function loadCurrentUser() {
            if (!session?.access_token) return;
            try {
                const org = await OrganizationService.getCurrentOrganization();

                if (!org.success) {
                    console.error(org.error);
                    setError("Received invalid user data from the server.");
                    toast.error("Failed to load Organization.", { position: "top-right" });
                    return;
                }
                if (org.data.status == "CREATED") {
                    router.replace("/organization/application");
                    return;
                } else if (org.data.status == "APPLIED") {
                    router.replace("/organization/appliedDashboard");
                    return;
                }
                setCurrentUser(org.data);
            } catch (error) {
                toast.error("Failed to load Organization.", { position: "top-right" });
                console.error(error);
                return;
            }
        }
        loadCurrentUser();
    }, [session, router]);

    // Load the application details and compute the availability overlap
    useEffect(() => {
        async function loadApplication() {
            try {
                setFetching(true);

                // Redirect back if the opportunity is no longer open
                const opp = await OrganizationService.getOpportunity(oppId);
                if (!(opp.data?.status == "OPEN")) {
                    router.replace(`/organization/opportunities/${oppId}`);
                    return;
                }

                const app = await OrganizationService.getApplication(appId);
                if (!app.success) {
                    console.error(app.error);
                    setError("Failed to load application.");
                    toast.error("Failed to load Application.", { position: "top-right" });
                    setFetching(false);
                    return;
                }

                // Compute which days the volunteer is available that the opportunity also needs
                setMatchedSchedule(
                    opp.data.availability.filter((day) =>
                        app.data.volunteer?.availability?.includes(day),
                    ),
                );
                setApplication(app.data);
                setFetching(false);
            } catch (error) {
                console.log(error);
                toast.error("Failed to load Application.", { position: "top-right" });
            }
        }
        loadApplication();
    }, [appId, oppId, router]);

    // Selects this application's volunteer for the opportunity and redirects back
    async function selectVolunteer() {
        if (application?.volunteer?.id) {
            setFetching(true);
            const updated_opp = await OrganizationService.selectOppVolunteer(
                oppId,
                application.volunteer.id,
            );
            if (updated_opp.success) {
                toast.success("Opportunity is now filled. Selected Volunteer has been notified.", {
                    position: "top-right",
                });
                setFetching(false);
                router.replace(`/organization/opportunities/${oppId}`);
                return;
            }
            setFetching(false);
        }
        setError("Cannot Select Volunteer");
        toast.error("Failed to select Volunteer.", { position: "top-right" });
    }

    return {
        loading,
        fetching,
        session,
        signOut,
        router,
        user,
        error,
        currentUser,
        matchedSchedule,
        application,
        selectVolunteer,
    };
}
