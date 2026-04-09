/**
 * volunteer-navbar.tsx
 * Top navigation bar for the volunteer app shell - logo, nav links, and profile dropdown
 */
"use client";

import avtImg from "@/assets/avatarImg.png";
import logo from "@/assets/logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import type { CurrentVolunteer } from "@volunteerly/shared";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Static nav link definitions - kept here so the component stays declarative
const NAV_LINKS = [
    { label: "Dashboard", href: "/volunteer" },
    { label: "Opportunities", href: "/volunteer/opportunities" },
    { label: "Skills", href: "/volunteer/skills" },
    { label: "Messages", href: "/volunteer/messages" },
] as const;

type VolunteerNavbarProps = {
    currentVolunteer: CurrentVolunteer | undefined;
    onSignOut: () => void;
};

/**
 * Renders the sticky top navigation bar with:
 * - Volunteerly logo linking to the dashboard
 * - Desktop nav links with active-state underline
 * - Profile avatar dropdown with name, role label, and sign-out button
 *
 * @param currentVolunteer - the logged-in volunteer's profile (undefined while loading)
 * @param onSignOut - callback invoked when the user clicks "Log Out"
 */
export function VolunteerNavbar({ currentVolunteer, onSignOut }: VolunteerNavbarProps) {
    const pathname = usePathname();

    // Show a placeholder until the volunteer data arrives
    const fullName = currentVolunteer
        ? `${currentVolunteer.firstName} ${currentVolunteer.lastName}`
        : "Loading...";

    return (
        <header className="relative z-999 w-full shrink-0 border-b bg-card px-6 py-3">
            <div className="mx-auto flex max-w-full items-center justify-between">
                {/* Logo - always links back to the volunteer dashboard */}
                <Link href="/volunteer" className="shrink-0">
                    <Image src={logo} alt="Volunteerly" width={140} height={40} priority />
                </Link>

                {/* Desktop nav links - hidden on mobile */}
                <NavigationMenu
                    className="
                        hidden
                        md:flex
                    "
                >
                    <NavigationMenuList className="flex gap-6">
                        {NAV_LINKS.map(({ label, href }) => (
                            <NavigationMenuItem key={href}>
                                <Link
                                    href={href}
                                    className={`
                                        text-sm font-medium transition-colors
                                        hover:text-primary
                                        ${
                                            pathname === href
                                                ? "border-b-2 border-primary text-primary"
                                                : "text-muted-foreground"
                                        }
                                    `}
                                >
                                    {label}
                                </Link>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Profile dropdown - always visible */}
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="p-0">
                                <div className="flex items-center gap-2">
                                    {/* Name and role - hidden on very small screens */}
                                    <div
                                        className="
                                            hidden text-right
                                            sm:block
                                        "
                                    >
                                        <p className="text-sm/tight font-semibold text-foreground">
                                            {fullName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Verified Volunteer
                                        </p>
                                    </div>
                                    <Avatar className="size-9">
                                        <AvatarImage src={avtImg.src} />
                                        <AvatarFallback>
                                            {currentVolunteer?.firstName?.[0] ?? "V"}
                                            {currentVolunteer?.lastName?.[0] ?? ""}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <div className="w-40 p-1">
                                    <p className="px-2 py-1 text-sm font-medium text-foreground">
                                        {fullName}
                                    </p>
                                    <p className="px-2 pb-2 text-xs text-muted-foreground">
                                        Volunteer
                                    </p>
                                    <hr className="mb-1 border-border" />
                                    <button
                                        className="
                                            w-full rounded-sm px-2 py-1 text-left text-sm
                                            text-foreground
                                            hover:bg-secondary
                                        "
                                        onClick={onSignOut}
                                    >
                                        Log Out
                                    </button>
                                </div>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </header>
    );
}
