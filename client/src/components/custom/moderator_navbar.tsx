"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
} from "@/components/ui/navigation-menu";
import logo from "@/assets/logo.png";
import { CurrentUser } from "@volunteerly/shared";

type ModeratorNavbarProps = {
    currentUser: CurrentUser | undefined;
};

const NAV_LINKS = [
    { label: "Dashboard", href: "/moderator" },
    { label: "Organizations", href: "/moderator/organizations" },
    { label: "Volunteers", href: "/moderator/volunteers" },
    { label: "Tickets", href: "/moderator/tickets" },
] as const;

export function ModeratorNavbar({ currentUser }: ModeratorNavbarProps) {
    const pathname = usePathname();

    const initials =
        currentUser
            ? `${currentUser.firstName[0] ?? ""}${currentUser.lastName[0] ?? ""}`.toUpperCase()
            : "?";

    const fullName =
        currentUser
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : "Loading...";

    return (
        <header className="w-full border-b bg-white px-6 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <Link href="/moderator" className="flex-shrink-0">
                    <Image src={logo} alt="Volunteerly" width={140} height={40} priority />
                </Link>

                <NavigationMenu className="hidden md:flex">
                    <NavigationMenuList className="flex gap-6">
                        {NAV_LINKS.map(({ label, href }) => {
                            const isActive = pathname === href;
                            return (
                                <NavigationMenuItem key={href}>
                                    <Link
                                        href={href}
                                        className={`text-sm font-medium transition-colors hover:text-yellow-500 ${
                                            isActive
                                                ? "border-b-2 border-yellow-400 text-yellow-500"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        {label}
                                    </Link>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="flex items-center gap-3">
                    <div className="hidden text-right sm:block">
                        <p className="text-sm font-semibold leading-tight text-gray-800">
                            {fullName}
                        </p>
                        <p className="text-xs text-gray-400">Moderator</p>
                    </div>
                    <Avatar className="h-9 w-9 bg-gray-200">
                        <AvatarFallback className="text-sm font-semibold text-gray-600">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}