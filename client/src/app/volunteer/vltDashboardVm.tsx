import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/UserService";
import { VolunteerService } from "@/services/VolunteerService";
import { useAuth } from "@/providers/auth-provider";
import { CurrentVolunteer, Opportunity, CurrentOrganization } from "@volunteerly/shared";

const MOCK_MONTHLY_HOURS = [18, 32, 24, 38, 27, 48];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];

export function useVltDashboardViewModel() {
    const router = useRouter();
    const { session, user, loading, signOut } = useAuth();
    const [currentVolunteer, setCurrentVolunteer] = useState<CurrentVolunteer | undefined>(undefined);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [partnerOrgs, setPartnerOrgs] = useState<CurrentOrganization[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !session) {
            router.replace("/login");
        }
    }, [loading, session, router]);

    useEffect(() => {
        async function loadData() {
            if (!session?.access_token) return;

            try {
                const userResult = await UserService.getCurrentUser();
                if (!userResult.success) {
                    console.error(userResult.error);
                    setError("Received invalid user data from the server.");
                    return;
                }

                if (userResult.data.role !== "VOLUNTEER") {
                    router.replace("/bootstrap");
                    return;
                }

                const volResult = await VolunteerService.getCurrentVolunteer();
                if (!volResult.success) {
                    console.error(volResult.error);
                    setError("Failed to load volunteer.");
                    return;
                }
                setCurrentVolunteer(volResult.data);

                const oppResult = await VolunteerService.getYourOpportunities();
                if (!oppResult.success) {
                    console.error(oppResult.error);
                    setError("Failed to load opportunities.");
                    return;
                }
                setOpportunities(oppResult.data);

                
                const orgResult = await VolunteerService.getVolunteerOrganizations();
                console.log("org result:", orgResult);
                if (!orgResult.success) {
                    console.error("org zod error:", orgResult.error.format());
                    setError("Failed to load organizations.");
                    return;
                }
                setPartnerOrgs(orgResult.data);

            } catch (err) {
                console.error(err);
                setError("Failed to load data.");
            }
        }
        loadData();
    }, [session, router]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/");
    };

    return {
        loading,
        session,
        signOut,
        router,
        user,
        error,
        currentVolunteer,
        opportunities,
        partnerOrgs,
        handleSignOut,
        firstName: currentVolunteer?.firstName ?? "Volunteer",
        totalHours: currentVolunteer?.hourlyValue ?? 0,
        economicValue: ((currentVolunteer?.hourlyValue ?? 0) * 31.8).toFixed(0),
        monthlyHours: MOCK_MONTHLY_HOURS,
        months: MONTHS,
    };
}