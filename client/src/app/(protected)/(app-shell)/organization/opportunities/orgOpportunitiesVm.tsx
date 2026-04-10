/**
 * orgOpportunitiesVm.tsx
 * View model for the organization's opportunities list page
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { CurrentOrganization, Opportunity } from "@volunteerly/shared";
import { OrganizationService } from "@/services/OrganizationService";
import { toast } from "sonner";

export function useOrgOpportunitiesViewModel() {
    const router = useRouter();
    const { session, user, loading, signOut } = useAuth();
    const [currentUser, setCurrentUser] = useState<CurrentOrganization | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [currentTab, setCurrentTab] = useState("OPEN");
    const [fetching, setFetching] = useState(true);

    // Filter the full list down to just the opportunities matching the active tab
    const filteredOpportunities = opportunities.filter((opp) => opp.status === currentTab);

    // Load org profile and redirect to setup pages if not fully verified
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
                console.error(error);
                toast.error("Failed to load Organization.", { position: "top-right" });
                return;
            }
        }
        loadCurrentUser();
    }, [session, router]);

    // Load all opportunities for this org on mount
    useEffect(() => {
        async function loadOpportunities() {
            const opps = await OrganizationService.getAllOpportunities();
            if (!opps.success) {
                console.error(opps.error);
                setError("Failed to load opportunities.");
                toast.error("Failed to load Opportunities.", { position: "top-right" });
                setFetching(false);
                return;
            }
            setOpportunities(opps.data);
            setFetching(false);
        }
        loadOpportunities();
    }, []);

    return {
        loading,
        session,
        fetching,
        signOut,
        router,
        user,
        error,
        currentUser,
        filteredOpportunities,
        currentTab,
        setCurrentTab,
    };
}