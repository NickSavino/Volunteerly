import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/UserService";
import { useAuth } from "@/providers/auth-provider";
import { CurrentUser, ModeratorDashboardSummary, ModeratorDashboardSummarySchema } from "@volunteerly/shared";
import { api } from "@/lib/api";

export function useModDashboardViewModel() {
    const router = useRouter();
    const { session, user, loading, signOut } = useAuth();
    const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>(undefined);
    const [dashboardSummary, setDashboardSummary] = useState<ModeratorDashboardSummary | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !session) {
            router.replace("/login");
        }
    }, [loading, session, router]);

    useEffect(() => {
        async function loadCurrentUser() {
            if (!session?.access_token) return;

            try {
                const result = await UserService.getCurrentUser();

                if (!result.success) {
                    console.error(result.error);
                    setError("Received invalid user data from the server.");
                    return;
                }

                if (result.data.role !== "MODERATOR") {
                    router.replace("/bootstrap");
                    return;
                }

                setCurrentUser(result.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load user data.");
            }
        }

        loadCurrentUser();
    }, [session, router]);

    useEffect(() => {
        async function loadDashboardSummary() {
            if (!currentUser) return;

            try {
                const raw = await api<unknown>("/moderator/dashboard");
                const parsed = ModeratorDashboardSummarySchema.safeParse(raw);

                if (!parsed.success) {
                    console.error(parsed.error);
                    setError("Received invalid dashboard data from the server.");
                    return;
                }

                setDashboardSummary(parsed.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard data.");
            }
        }

        loadDashboardSummary();
    }, [currentUser]);

    return {
        loading,
        session,
        signOut,
        router,
        user,
        error,
        currentUser,
        dashboardSummary,
    };
}