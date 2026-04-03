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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";
import avtImg from "@/assets/avatarImg.png";

type UnverifiedNavbarProps = {
    fullName: string;
    onSignOut: () => void;
};

export function UnverifiedNavbar({ fullName, onSignOut }: UnverifiedNavbarProps) {
    return (
        <header className="w-full border-b bg-white px-6 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <Link href="/" className="flex-shrink-0">
                    <Image src={logo} alt="Volunteerly" width={170} height={40} priority />
                </Link>

                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="w-45">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col text-left min-w-0">
                                        <p className="text-sm truncate">{fullName}</p>
                                        <p className="text-xs text-gray-400">VOLUNTEER</p>
                                    </div>
                                    <Avatar>
                                        <AvatarImage src={avtImg.src} />
                                        <AvatarFallback>VLT</AvatarFallback>
                                    </Avatar>
                                </div>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent className="w-56 p-3">
                                <button
                                    className="w-full text-sm font-medium text-center text-gray-600 transition-colors hover:text-yellow-500 cursor-pointer"
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