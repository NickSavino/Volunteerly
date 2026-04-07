"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSession } from "@/providers/app-session-provider";
import { resolveDefaultAppRoute } from "@/lib/utils";
import { LoadingScreen } from "@/components/common/loading-screen";
import { UserRole } from "@volunteerly/shared";

function isVolunteerSetupRoute(pathname: string) {
  return (
    pathname === "/volunteer/experience-input" ||
    pathname === "/volunteer/skill-extraction"
  );
}

function isOrganizationSetupRoute(pathname: string) {
  return (
    pathname === "/organization/application" ||
    pathname === "/organization/appliedDashboard"
  );
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    loading,
    initialized,
    isAuthenticated,
    currentUser,
    currentOrganization,
  } = useAppSession();

  const redirectTarget = useMemo(() => {
    if (!initialized || loading) return null;

    if (!isAuthenticated) {
      return "/login";    
    }
    if (!currentUser){
      return null
    }

    const defaultRoute = resolveDefaultAppRoute({
      currentUser,
      currentOrganization,
    });

    const roleBasePath = resolveDefaultAppRoute( { currentUser, currentOrganization } );
    const isWrongRoleSection = !pathname.startsWith(roleBasePath);

    if (isWrongRoleSection) {
      return defaultRoute
    }

    if (currentUser.role === "VOLUNTEER") {
      const needsSetup = currentUser.status === "UNVERIFIED";
      const onSetupRoute = isVolunteerSetupRoute(pathname);

      if (needsSetup && !onSetupRoute) {
        return ("/volunteer/experience-input")
      }

      if (!needsSetup && onSetupRoute) {
        return"/volunteer"
        
      }
    }

    if (currentUser.role === "ORGANIZATION") {
      const orgStatus = currentOrganization?.status;
      const onSetupRoute = isOrganizationSetupRoute(pathname);

      const needsSetup =
        orgStatus === "CREATED" || orgStatus === "APPLIED" || orgStatus == "REJECTED";

      if ((orgStatus == "APPLIED" || orgStatus == "REJECTED") && !(onSetupRoute)){
          return "/organization/appliedDashboard"
      }

      if (orgStatus == 'CREATED' && pathname !== defaultRoute) {  
          return defaultRoute
      }

      if (!needsSetup && onSetupRoute) {
        return "/organization";
      }
    }

    if (currentUser.role === "MODERATOR") {
      const isSetupRoute =
        pathname.startsWith("/organization/application") ||
        pathname.startsWith("/organization/appliedDashboard") ||
        pathname.startsWith("/volunteer/experience-input") ||
        pathname.startsWith("/volunteer/skill-extraction");

      if (isSetupRoute) {
        return "/moderator"
      }
    }

    return null;
  }, [
    initialized,
    loading,
    isAuthenticated,
    currentUser,
    currentOrganization,
    pathname,
  ]);

  useEffect(() => {
    if (redirectTarget) {
      router.replace(redirectTarget)
    }
  }, [redirectTarget, router])

  if (!initialized || loading || !currentUser || redirectTarget) {
    return <LoadingScreen label="Loading..." />
  }

  return <>{children}</>;
}