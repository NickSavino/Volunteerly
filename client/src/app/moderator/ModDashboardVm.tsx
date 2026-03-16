import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserService } from "@/services/UserService";
import { ModeratorService } from "@/services/ModeratorService";
import { useAuth } from "@/providers/auth-provider";
import { CurrentModerator } from "@volunteerly/shared";

export function useModDashboardViewModel() {
    const router = useRouter();
    const { session, user, loading, signOut } = useAuth();
    const [currentModerator, setCurrentModerator] = useState<CurrentModerator | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!loading && !session) {
            router.replace("/login");
        }
    }, [loading, session, router]);

    useEffect(() => {
        async function loadAndVerify() {
            if (!session?.access_token) return;

            try {
                const userResult = await UserService.getCurrentUser();

                if (!userResult.success) {
                    console.error(userResult.error);
                    setError("Received invalid user data from the server.");
                    return;
                }

                if (userResult.data.role !== "MODERATOR") {
                    router.replace("/bootstrap");
                    return;
                }

                const modResult = await ModeratorService.getCurrentModerator();

                if (!modResult.success) {
                    console.error(modResult.error);
                    setError("Received invalid moderator data from the server.");
                    return;
                }

                setCurrentModerator(modResult.data);
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
    };
}