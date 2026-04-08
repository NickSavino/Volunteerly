export type AppNavbarRole = "VOLUNTEER" | "ORGANIZATION" | "MODERATOR";

export type AppNavItem = {
    label: string;
    href: string;
};

export type AppNavConfig = {
    homeHref: string;
    profileHref: string;
    items: AppNavItem[];
    profileSubtitle: string;
};

export const NAV_CONFIG: Record<AppNavbarRole, AppNavConfig> = {
    MODERATOR: {
        homeHref: "/moderator",
        profileHref: "/moderator/profile",
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
        profileHref: "/organization/profile",
        profileSubtitle: "Organization",
        items: [
            { label: "Dashboard", href: "/organization" },
            { label: "Opportunities", href: "/organization/opportunities" },
            { label: "Messages", href: "/organization/messages" },
        ],
    },

    VOLUNTEER: {
        homeHref: "/volunteer",
        profileHref: "/volunteer/profile",
        profileSubtitle: "Volunteer",
        items: [
            { label: "Dashboard", href: "/volunteer" },
            { label: "Opportunities", href: "/volunteer/opportunities" },
            { label: "Skill Tree", href: "/volunteer/skills" },
            { label: "Messages", href: "/volunteer/messages" },
        ],
    },
};
