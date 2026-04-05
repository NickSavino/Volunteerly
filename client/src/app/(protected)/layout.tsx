"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSession } from "@/providers/app-session-provider";
import { resolveDefaultAppRoute } from "@/lib/utils";

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

function getRoleBasePath(role: "VOLUNTEER" | "ORGANIZATION" | "MODERATOR") {
  switch (role) {
    case "VOLUNTEER":
      return "/volunteer";
    case "ORGANIZATION":
      return "/organization";
    case "MODERATOR":
      return "/moderator";
  }
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

  useEffect(() => {
    if (!initialized || loading) return;

    if (!isAuthenticated || !currentUser) {
      router.replace("/login");
      return;
    }

    const defaultRoute = resolveDefaultAppRoute({
      currentUser,
      currentOrganization,
    });

    const roleBasePath = getRoleBasePath(currentUser.role);
    const isWrongRoleSection = !pathname.startsWith(roleBasePath);

    if (isWrongRoleSection) {
      router.replace(defaultRoute);
      return;
    }

    if (currentUser.role === "VOLUNTEER") {
      const needsSetup = currentUser.status === "UNVERIFIED";
      const onSetupRoute = isVolunteerSetupRoute(pathname);

      if (needsSetup && !onSetupRoute) {
        router.replace("/volunteer/experience-input");
        return;
      }

      if (!needsSetup && onSetupRoute) {
        router.replace("/volunteer");
        return;
      }
    }

    if (currentUser.role === "ORGANIZATION") {
      const orgStatus = currentOrganization?.status;
      const onSetupRoute = isOrganizationSetupRoute(pathname);

      const needsSetup =
        orgStatus === "CREATED" || orgStatus === "APPLIED";

      if (needsSetup && pathname !== defaultRoute) {
        router.replace(defaultRoute);
        return;
      }

      if (!needsSetup && onSetupRoute) {
        router.replace("/organization");
        return;
      }
    }

    if (currentUser.role === "MODERATOR") {
      const isSetupRoute =
        pathname.startsWith("/organization/application") ||
        pathname.startsWith("/organization/appliedDashboard") ||
        pathname.startsWith("/volunteer/experience-input") ||
        pathname.startsWith("/volunteer/skill-extraction");

      if (isSetupRoute) {
        router.replace("/moderator");
        return;
      }
    }
  }, [
    initialized,
    loading,
    isAuthenticated,
    currentUser,
    currentOrganization,
    pathname,
    router,
  ]);

  if (!initialized || loading || !currentUser) {
    return <main className="p-6">Loading...</main>;
  }

  return <>{children}</>;
}