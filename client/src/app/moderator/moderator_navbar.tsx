"use client";

import Link from "next/link";
import Image from "next/image";
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
import { CurrentModerator } from "@volunteerly/shared";

type ModeratorNavbarProps = {
    currentModerator: CurrentModerator | undefined;
    onSignOut: () => void;
};

const NAV_LINKS = [
    { label: "Dashboard", href: "/moderator" },
    { label: "Organizations", href: "/moderator/organizations" },
    { label: "Volunteers", href: "/moderator/volunteers" },
    { label: "Tickets", href: "/moderator/tickets" },
] as const;

export function ModeratorNavbar({ currentModerator, onSignOut }: ModeratorNavbarProps) {
    const pathname = usePathname();

    const fullName = currentModerator
        ? `${currentModerator.firstName} ${currentModerator.lastName}`
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

                <NavigationMenu>
                    <NavigationMenuList className="flex gap-2">
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="w-40">
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col justify-center">
                                        <p className="text-primary text-sm">{fullName}</p>
                                        <p className="text-bright text-sm">Moderator</p>
                                    </div>
                                    <Avatar>
                                        <AvatarImage src={avtImg.src} />
                                        <AvatarFallback>MOD</AvatarFallback>
                                    </Avatar>
                                </div>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <button className="w-40" onClick={onSignOut}>
                                    Log Out
                                </button>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </header>
    );
}