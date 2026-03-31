"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import logo from "@/assets/logo.png";
import avtImg from "@/assets/avatarImg.png";
import type { CurrentVolunteer } from "@volunteerly/shared";

const NAV_LINKS = [
    { label: "Dashboard",     href: "/volunteer" },
    { label: "Opportunities", href: "/volunteer/opportunities" },
    { label: "Skills",        href: "/volunteer/skills" },
    { label: "Messages",      href: "/volunteer/messages" },
] as const;

type VolunteerNavbarProps = {
    currentVolunteer: CurrentVolunteer | undefined;
    onSignOut: () => void;
};

export function VolunteerNavbar({ currentVolunteer, onSignOut }: VolunteerNavbarProps) {
    const pathname = usePathname();

    const fullName = currentVolunteer
        ? `${currentVolunteer.firstName} ${currentVolunteer.lastName}`
        : "Loading...";

    return (
        <header className="w-full flex-shrink-0 border-b bg-card px-6 py-3">
            <div className="mx-auto flex max-w-full items-center justify-between">
                <Link href="/volunteer" className="flex-shrink-0">
                    <Image src={logo} alt="Volunteerly" width={140} height={40} priority />
                </Link>

                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList className="flex gap-6">
                        {NAV_LINKS.map(({ label, href }) => (
                            <NavigationMenuItem key={href}>
                                <Link
                                    href={href}
                                    className={`text-sm font-medium transition-colors hover:text-primary ${
                                        pathname === href
                                            ? "border-b-2 border-primary text-primary"
                                            : "text-muted-foreground"
                                    }`}
                                >
                                    {label}
                                </Link>
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>

                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="p-0">
                                <div className="flex items-center gap-2">
                                    <div className="hidden text-right sm:block">
                                        <p className="text-sm font-semibold text-foreground leading-tight">{fullName}</p>
                                        <p className="text-xs text-muted-foreground">Verified Volunteer</p>
                                    </div>
                                    <Avatar className="h-9 w-9">
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
                                    <p className="px-2 py-1 text-sm font-medium text-foreground">{fullName}</p>
                                    <p className="px-2 pb-2 text-xs text-muted-foreground">Volunteer</p>
                                    <hr className="mb-1 border-border" />
                                    <button
                                        className="w-full rounded px-2 py-1 text-left text-sm text-foreground hover:bg-secondary"
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