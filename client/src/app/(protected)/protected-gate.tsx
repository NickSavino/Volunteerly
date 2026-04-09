import { LoadingScreen } from "@/components/common/loading-screen";
import { resolveDefaultAppRoute } from "@/lib/utils";
import { useAppSession } from "@/providers/app-session-provider";
import { useAuth } from "@/providers/auth-provider";
import { UserRole } from "@volunteerly/shared";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo } from "react";

function isVolunteerSetupRoute(pathname: string) {
    return pathname === "/volunteer/experience-input" || pathname === "/volunteer/skill-extraction";
}

function isOrganizationSetupRoute(pathname: string) {
    return (
        pathname === "/organization/application" || pathname === "/organization/appliedDashboard"
    );
}

function getRoleBasePath(role: UserRole) {
    switch (role) {
        case "VOLUNTEER":
            return "/volunteer";
        case "ORGANIZATION":
            return "/organization";
        case "MODERATOR":
            return "/moderator";
        case "ADMIN":
            return "/admin";
        default:
            return "/";
    }
}
export default function ProtectedGate({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const { loading, initialized, isAuthenticated, currentUser, currentOrganization } =
        useAppSession();

    const { signOut } = useAuth();

    useEffect(() => {
        if (!initialized || loading) return;
        if (!isAuthenticated || !currentUser) return;
        if (currentUser?.status !== "BANNED") return;

        void signOut();
    }, [currentUser, currentUser?.status, initialized, isAuthenticated, loading, signOut]);

    const redirectTarget = useMemo(() => {
        if (!initialized || loading) return null;

        if (!isAuthenticated || !currentUser || currentUser.status === "BANNED") {
            return "/login";
        }

        const roleBasePath = getRoleBasePath(currentUser.role);
        const isWrongRoleSection = !pathname.startsWith(roleBasePath);

        if (isWrongRoleSection) {
            if (currentUser.role === "ORGANIZATION") {
                return currentOrganization
                    ? resolveDefaultAppRoute({
                          currentUser,
                          currentOrganization,
                      })
                    : "/organization/application";
            }

            if (currentUser.role === "MODERATOR") {
                return "/moderator";
            }

            if (currentUser.role === "ADMIN") {
                return "/admin";
            }
        }

        if (currentUser.role === "VOLUNTEER") {
            const needsSetup = currentUser.status === "UNVERIFIED";
            const onSetupRoute = isVolunteerSetupRoute(pathname);

            if (needsSetup && !onSetupRoute) {
                return "/volunteer/experience-input";
            }

            if (!needsSetup && onSetupRoute) {
                return "/volunteer";
            }
        }

        if (currentUser.role === "ORGANIZATION") {
            if (!currentOrganization) {
                return null;
            }

            const defaultRoute = resolveDefaultAppRoute({
                currentUser,
                currentOrganization,
            });

            const orgStatus = currentOrganization?.status;
            const onSetupRoute = isOrganizationSetupRoute(pathname);

            const needsSetup =
                orgStatus === "CREATED" || orgStatus === "APPLIED" || orgStatus === "REJECTED";

            if ((orgStatus == "APPLIED" || orgStatus == "REJECTED") && !onSetupRoute) {
                return "/organization/appliedDashboard";
            }

            if (orgStatus == "CREATED" && pathname !== defaultRoute) {
                return defaultRoute;
            }

            if (!needsSetup && onSetupRoute) {
                return "/organization";
            }
        }

        if (currentUser.role === "MODERATOR") {
            const isSetupRoute =
                isVolunteerSetupRoute(pathname) || isOrganizationSetupRoute(pathname);

            if (isSetupRoute) {
                return "/moderator";
            }
        }

        return null;
    }, [initialized, loading, isAuthenticated, currentUser, currentOrganization, pathname]);

    useEffect(() => {
        if (redirectTarget) {
            router.replace(redirectTarget);
        }
    }, [redirectTarget, router]);

    if (!initialized || loading || !currentUser || redirectTarget) {
        return <LoadingScreen label="Loading..." />;
    }

    return <>{children}</>;
}
