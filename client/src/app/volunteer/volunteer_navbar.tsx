"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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

type VolunteerNavbarProps = {
    currentVolunteer:
        | {
              firstName: string;
              lastName: string;
          }
        | undefined;
    onSignOut: () => void;
};

const NAV_LINKS = [
    { label: "Dashboard", href: "/volunteer" },
    { label: "Opportunities", href: "/volunteer/opportunity" },
    { label: "Skill Tree", href: "/volunteer/skills" },
    { label: "Messages", href: "/volunteer/messages" },
] as const;

export function VolunteerNavbar({
    currentVolunteer,
    onSignOut,
}: VolunteerNavbarProps) {
    const pathname = usePathname();

    const fullName = currentVolunteer
        ? `${currentVolunteer.firstName} ${currentVolunteer.lastName}`
        : "Loading...";

    return (
        <header className="w-full border-b bg-white px-6 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <Link href="/volunteer" className="flex-shrink-0">
                    <Image src={logo} alt="Volunteerly" width={170} height={40} priority />
                </Link>

                {/* Desktop Nav */}
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

                {/* Profile Dropdown */}
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
                                {/* Mobile Nav */}
                                <NavigationMenuList className="md:hidden flex flex-col gap-2">
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

                                <hr className="md:hidden my-3 border-gray-300" />
                                <button className="w-full md:w-40 text-sm font-medium text-center text-gray-600 transition-colors hover:text-yellow-500 cursor-pointer" onClick={onSignOut}>
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