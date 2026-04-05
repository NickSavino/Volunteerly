"use client";

import { ReactNode } from "react";
import { AppNavbar, getAvatarFallback } from "@/components/navigation/app-navbar";
import { AppNavItem, NAV_CONFIG } from "@/components/navigation/nav-config";
import { useAuth } from "@/providers/auth-provider";
import { UserService } from "@/services/UserService";
import { useAppSession } from "../../../providers/app-session-provider";
import { useRouter } from "next/navigation";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { signOut } = useAuth();
  const { 
    loading, 
    currentUser, 
    currentVolunteer, 
    currentOrganization, 
    currentModerator 
  } = useAppSession();

  if (loading || !currentUser) {
    return <main className="p-6">Loading...</main>
  }

  let homeHref = "/";
  let items: AppNavItem[] = [];
  let displayName = "Loading...";
  let subtitle = "";
  let avatarUrl: string | undefined;
  let avatarFallback = "USR";

  switch (currentUser.role) {
    case "MODERATOR":
      homeHref = NAV_CONFIG.MODERATOR.homeHref;
      items = NAV_CONFIG.MODERATOR.items;
      displayName = currentModerator
        ? `${currentModerator.firstName} ${currentModerator.lastName}`
        : "Loading...";
      subtitle = "Moderator";
      avatarFallback = getAvatarFallback(displayName, "MOD");
      break;

    case "ORGANIZATION":
      homeHref = NAV_CONFIG.ORGANIZATION.homeHref;
      items = NAV_CONFIG.ORGANIZATION.items;
      displayName = currentOrganization?.orgName ?? "Loading...";
      subtitle =
        currentOrganization?.status === "VERIFIED"
          ? "Verified Organization"
          : "Organization";
      avatarUrl = currentOrganization?.id
        ? UserService.getAvatarURL(currentOrganization.id)
        : undefined;
      avatarFallback = getAvatarFallback(displayName, "ORG");
      break;

    case "VOLUNTEER":
      homeHref = NAV_CONFIG.VOLUNTEER.homeHref;
      items = NAV_CONFIG.VOLUNTEER.items;
      displayName = currentVolunteer
        ? `${currentVolunteer.firstName} ${currentVolunteer.lastName}`
        : "Loading...";
      subtitle = "Volunteer";
      avatarFallback = getAvatarFallback(displayName, "VLT");
      break;
  }

  return (
    <>
      <AppNavbar
        homeHref={homeHref}
        items={items}
        displayName={displayName}
        subtitle={subtitle}
        avatarUrl={avatarUrl}
        avatarFallback={avatarFallback}
        onSignOut={async () => {
          await signOut();
          router.push("/");
        }}
      />
      {children}
    </>
  );
}