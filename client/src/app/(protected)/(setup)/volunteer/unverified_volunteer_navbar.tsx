"use client";

import Link from "next/link";
import Image from "next/image";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";

type UnverifiedNavbarProps = {
    fullName: string;
    onSignOut: () => void;
};

// TODO: Remove in favour of navbar in layout
export function UnverifiedNavbar({ fullName, onSignOut }: UnverifiedNavbarProps) {
    return (
        <header className="w-full border-b bg-white px-6 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <Link href="/" className="shrink-0">
                    <Image src={logo} alt="Volunteerly" width={170} height={40} priority />
                </Link>

                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="w-45">
                                <div className="flex items-center gap-2">
                                    <div className="flex min-w-0 flex-col text-left">
                                        <p className="truncate text-sm">{fullName}</p>
                                        <p className="text-xs text-gray-400">VOLUNTEER</p>
                                    </div>
                                    <Avatar>
                                        <AvatarFallback> {fullName?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent className="w-56 p-3">
                                <button
                                    className="
                                        w-full cursor-pointer text-center text-sm font-medium
                                        text-gray-600 transition-colors
                                        hover:text-yellow-500
                                        md:w-40
                                    "
                                    onClick={onSignOut}
                                >
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
