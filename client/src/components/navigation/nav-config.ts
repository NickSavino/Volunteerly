export type AppNavbarRole = "VOLUNTEER" | "ORGANIZATION" | "MODERATOR";

export type AppNavItem = {
  label: string;
  href: string;
};

export type AppNavConfig = {
  homeHref: string;
  items: AppNavItem[];
  profileSubtitle: string;
};

export const NAV_CONFIG: Record<AppNavbarRole, AppNavConfig> = {
  MODERATOR: {
    homeHref: "/moderator",
    profileSubtitle: "Moderator",
    items: [
      { label: "Dashboard", href: "/moderator" },
      { label: "Organizations", href: "/moderator/organizations" },
      { label: "Volunteers", href: "/moderator/volunteers" },
      { label: "Tickets", href: "/moderator/tickets" },
    ],
  },

  ORGANIZATION: {
    homeHref: "/organization",
    profileSubtitle: "Organization",
    items: [
      { label: "Dashboard", href: "/organization" },
      { label: "Opportunities", href: "/organization/opportunities" },
      { label: "Messages", href: "/organization/messages" },
    ],
  },

  VOLUNTEER: {
    homeHref: "/volunteer",
    profileSubtitle: "Volunteer",
    items: [
      { label: "Dashboard", href: "/volunteer" },
      { label: "Opportunities", href: "/volunteer/opportunities" },
      { label: "Skill Tree", href: "/volunteer/skills" },
      { label: "Messages", href: "/volunteer/messages" },
      { label: "Profile", href: "/volunteer/profile" }
    ],
  },
};
