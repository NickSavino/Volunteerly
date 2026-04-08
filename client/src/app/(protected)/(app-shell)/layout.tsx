"use client";

import { ReactNode } from "react";
import { AppNavbar } from "@/components/navigation/app-navbar";
import { AppNavConfig, AppNavItem, NAV_CONFIG } from "@/components/navigation/nav-config";
import { useAuth } from "@/providers/auth-provider";
import { UserService } from "@/services/UserService";
import { useRouter } from "next/navigation";
import { useAppSession } from "@/providers/app-session-provider";
import { getAvatarFallback } from "@/components/navigation/nav-utils";

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

  const navConfig: AppNavConfig = {
    homeHref: "/",
    profileHref: "/",
    items: [],
    profileSubtitle: ""
  }

  let displayName = "Loading...";
  let subtitle = "";
  let avatarUrl: string | undefined;
  let avatarFallback = "USR";

  switch (currentUser.role) {
    case "MODERATOR":
      navConfig.homeHref = NAV_CONFIG.MODERATOR.homeHref;
      navConfig.profileHref = NAV_CONFIG.MODERATOR.profileHref
      navConfig.items = NAV_CONFIG.MODERATOR.items;
      displayName = currentModerator
        ? `${currentModerator.firstName} ${currentModerator.lastName}`
        : "Loading...";
      subtitle = "Moderator";
      avatarUrl = UserService.getAvatarURL(currentModerator!.id)
      avatarFallback = getAvatarFallback(displayName, "MOD");
      break;

    case "ORGANIZATION":
      navConfig.homeHref = NAV_CONFIG.ORGANIZATION.homeHref;
      navConfig.profileHref = NAV_CONFIG.ORGANIZATION.profileHref
      navConfig.items = NAV_CONFIG.ORGANIZATION.items;
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
      navConfig.homeHref = NAV_CONFIG.VOLUNTEER.homeHref;
      navConfig.profileHref = NAV_CONFIG.VOLUNTEER.profileHref
      navConfig.items = NAV_CONFIG.VOLUNTEER.items;
      displayName = currentVolunteer
        ? `${currentVolunteer.firstName} ${currentVolunteer.lastName}`
        : "Loading...";
      subtitle = "Volunteer";
      avatarUrl = currentVolunteer?.id
      ? UserService.getAvatarURL(currentVolunteer.id)
      : undefined;
      avatarFallback = getAvatarFallback(displayName, "VLT");
      break;
  }

  return (
    <>
      <AppNavbar
        homeHref={navConfig.homeHref}
        profileHref={navConfig.profileHref}
        items={navConfig.items}
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