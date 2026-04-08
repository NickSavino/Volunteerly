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

    const [pendingRedirect, setPendingRedirect] = useState(false);
    const [pendingRoute, setPendingRoute] = useState<string | null>(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

        setPendingRedirect(true);
    }

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

                if (currentUser.status === "BANNED") {
                    await AuthService.signOutUser();
                    setError("This account has been suspended.");
                    setSubmitting(false);
                    setPendingRedirect(false);
                    return;
                }

                if (currentUser.role === "VOLUNTEER") {
                    const nextRoute =
                        currentUser.status === "UNVERIFIED" ? "/volunteer/experience-input" : "/volunteer";

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
