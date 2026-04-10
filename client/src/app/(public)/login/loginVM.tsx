/**
 * loginVM.tsx
 * View model for the login page - handles authentication and role-based routing
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/AuthService";
import { useAuth } from "@/providers/auth-provider";
import { UserService } from "@/services/UserService";
import { OrganizationService } from "@/services/OrganizationService";
import { ModeratorService } from "@/services/ModeratorService";

export function useLoginViewModel() {
    const router = useRouter();
    const { session, loading } = useAuth();

    // Two-phase redirect flow: first we set pendingRedirect after credentials are
    // accepted, then once the session is ready we determine the right route
    const [pendingRedirect, setPendingRedirect] = useState(false);
    const [pendingRoute, setPendingRoute] = useState<string | null>(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1 - submit credentials to Supabase auth
    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const { error } = await AuthService.loginUserWithEmailPass(email, password);

        if (error) {
            setError(error.message);
            setSubmitting(false);
            return;
        }

        // Credentials accepted - wait for the session to propagate before routing
        setPendingRedirect(true);
    }

    // Step 2 - once the session is live, fetch the user's role and determine their landing page
    useEffect(() => {
        async function handleRouting() {
            if (!pendingRedirect) return;
            if (loading) return;
            if (!session?.access_token) return;

            try {
                const userResult = await UserService.getCurrentUser();

                if (!userResult.success) {
                    setError("Failed to load user profile.");
                    setSubmitting(false);
                    setPendingRedirect(false);
                    return;
                }

                const currentUser = userResult.data;

                // Banned users are signed out immediately with an error message
                if (currentUser.status === "BANNED") {
                    await AuthService.signOutUser();
                    setError("This account has been suspended.");
                    setSubmitting(false);
                    setPendingRedirect(false);
                    return;
                }

                if (currentUser.role === "VOLUNTEER") {
                    // Unverified volunteers still need to finish onboarding
                    const nextRoute =
                        currentUser.status === "UNVERIFIED"
                            ? "/volunteer/experience-input"
                            : "/volunteer";

                    setPendingRoute(nextRoute);
                    return;
                }

                if (currentUser.role === "ORGANIZATION") {
                    const orgResult = await OrganizationService.getCurrentOrganization();

                    if (!orgResult.success) {
                        setError("Failed to load organization.");
                        setSubmitting(false);
                        setPendingRedirect(false);
                        return;
                    }

                    const org = orgResult.data;

                    // Orgs in different states get sent to different parts of the setup flow
                    const nextRoute =
                        org.status === "CREATED"
                            ? "/organization/application"
                            : org.status === "APPLIED" || org.status === "REJECTED"
                              ? "/organization/appliedDashboard"
                              : "/organization";

                    setPendingRoute(nextRoute);
                    return;
                }

                if (currentUser.role === "MODERATOR") {
                    const modResult = await ModeratorService.getCurrentModerator();

                    if (!modResult.success) {
                        setError("Failed to load moderator profile.");
                        setSubmitting(false);
                        setPendingRedirect(false);
                        return;
                    }

                    setPendingRoute("/moderator");
                    return;
                }

                if (currentUser.role === "ADMIN") {
                    setPendingRoute("/admin");
                    return;
                }

                setPendingRoute("/");
            } catch (err) {
                console.error(err);
                setError("Failed to complete login.");
                setSubmitting(false);
                setPendingRedirect(false);
            }
        }

        void handleRouting();
    }, [pendingRedirect, loading, session]);

    // Step 3 - once the route is determined and the session is confirmed, navigate
    useEffect(() => {
        async function continueAfterRouteReady() {
            if (!pendingRoute) return;
            if (loading) return;
            if (!session?.access_token) return;

            setSubmitting(false);
            router.replace(pendingRoute);
            setPendingRoute(null);
        }

        void continueAfterRouteReady();
    }, [pendingRoute, loading, session, router]);

    return {
        email,
        setEmail,
        pendingRedirect,
        password,
        setPassword,
        submitting,
        error,
        handleSubmit,
    };
}
