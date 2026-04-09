"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";
import type { AppNavItem } from "./nav-config";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type AppNavbarProps = {
    homeHref: string;
    profileHref: string;
    items: AppNavItem[];
    displayName: string;
    subtitle: string;
    avatarUrl?: string | null;
    avatarFallback: string;
    onSignOut: () => void;
};

function isNavItemActive(pathname: string, href: string) {
    if (href === pathname) return true;
    if (href === "/moderator" || href === "/organization" || href === "/volunteer") {
        return pathname === href;
    }
    return pathname.startsWith(`${href}/`) || pathname === href;
}

export function AppNavbar({
    homeHref,
    profileHref,
    items,
    displayName,
    subtitle,
    avatarUrl,
    avatarFallback,
    onSignOut,
}: AppNavbarProps) {
    const pathname = usePathname();

    return (
        <header className="w-full border-b bg-white px-6 py-3">
            <div className="relative flex w-full items-center justify-between gap-6">
                <Link href={homeHref} className="shrink-0">
                    <Image src={logo} alt="Volunteerly" width={170} height={40} priority />
                </Link>

                <NavigationMenu className="
                    absolute left-1/2 hidden -translate-x-1/2
                    md:flex
                ">
                    <NavigationMenuList className="flex gap-6">
                        {items.map(({ label, href }) => {
                            const isActive = isNavItemActive(pathname, href);

                            return (
                                <NavigationMenuItem key={href}>
                                    <Link
                                        href={href}
                                        className={`
                                            text-sm font-medium transition-colors
                                            hover:text-yellow-500
                                            ${
                                            isActive
                                                ? "border-b-2 border-yellow-400 text-yellow-500"
                                                : "text-gray-600"
                                        }
                                        `}
                                    >
                                        {label}
                                    </Link>
                                </NavigationMenuItem>
                            );
                        })}
                    </NavigationMenuList>
                </NavigationMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="
                                flex min-w-55 items-center justify-between gap-3 rounded-full
                                bg-yellow-50 px-4 py-2 text-left transition-colors
                                hover:bg-yellow-100
                            "
                        >
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-yellow-600">
                                        {displayName}
                                    </p>
                                    <p className="truncate text-sm text-gray-400">{subtitle}</p>
                                </div>

                                <Avatar className="size-9">
                                    <AvatarImage src={avatarUrl ?? undefined} />
                                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                                </Avatar>
                            </div>

                            <ChevronDown className="size-4 text-gray-500" />
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56 p-2">
                        <div className="
                            px-2 py-1.5
                            md:hidden
                        ">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {displayName}
                            </p>
                            <p className="truncate text-xs text-gray-500">{subtitle}</p>
                        </div>

                        <div className="md:hidden">
                            <DropdownMenuSeparator />
                            {items.map(({ label, href }) => {
                                const isActive = isNavItemActive(pathname, href);

                                return (
                                    <DropdownMenuItem key={href} asChild>
                                        <Link
                                            href={href}
                                            className={
                                                isActive ? "text-yellow-600 font-medium" : ""
                                            }
                                        >
                                            {label}
                                        </Link>
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem asChild>
                            <Link href={profileHref}>Profile</Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={onSignOut} className="cursor-pointer">
                            Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
