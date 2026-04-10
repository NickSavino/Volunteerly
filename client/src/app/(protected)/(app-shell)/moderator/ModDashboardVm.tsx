import { useAppSession } from "@/providers/app-session-provider";
import { useAuth } from "@/providers/auth-provider";
import { ModeratorService } from "@/services/ModeratorService";
import { OrganizationService } from "@/services/OrganizationService";
import type {
    ModeratorOrganizationList,
    ModeratorTicketDetail,
    ModeratorVolunteerList,
} from "@volunteerly/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useModDashboardViewModel() {
    const router = useRouter();
    const { session, user, loading: authLoading, signOut } = useAuth();

    const { loading: appLoading, initialized, currentModerator } = useAppSession();

    const [pendingOrgsCount, setPendingOrgsCount] = useState(0);
    const [recentPendingOrgs, setRecentPendingOrgs] = useState<ModeratorOrganizationList>([]);
    const [flaggedAccountsCount, setFlaggedAccountsCount] = useState(0);
    const [recentFlaggedAccounts, setRecentFlaggedAccounts] = useState<ModeratorVolunteerList>([]);
    const [openTicketsCount, setOpenTicketsCount] = useState(0);
    const [recentOpenTickets, setRecentOpenTickets] = useState<ModeratorTicketDetail[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadDashboardData() {
            if (!session?.access_token || !initialized || !currentModerator) return;

            try {
                const [orgsResult, volunteerResult, ticketsResult] = await Promise.all([
                    OrganizationService.getAllOrganizations("APPLIED"),
                    ModeratorService.getModeratorVolunteers(),
                    ModeratorService.getModeratorTickets(),
                ]);

                const flaggedVolunteers = volunteerResult.filter(
                    (volunteer) => volunteer.state === "FLAGGED",
                );
                const openTickets = ticketsResult.filter((ticket) => ticket.status === "OPEN");

                const recentTicketDetails = await Promise.all(
                    openTickets
                        .slice(0, 2)
                        .map((ticket) => ModeratorService.getModeratorTicketDetail(ticket.id)),
                );
                setPendingOrgsCount(orgsResult.length);
                setRecentPendingOrgs(orgsResult.slice(0, 2));

                setFlaggedAccountsCount(flaggedVolunteers.length);
                setRecentFlaggedAccounts(flaggedVolunteers.slice(0, 2));

                setOpenTicketsCount(openTickets.length);
                setRecentOpenTickets(recentTicketDetails);
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
        data: {
            pendingOrgsCount,
            recentPendingOrgs,
            flaggedAccountsCount,
            recentFlaggedAccounts,
            openTicketsCount,
            recentOpenTickets,
        },
    };
}
