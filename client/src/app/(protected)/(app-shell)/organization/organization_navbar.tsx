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
import { CurrentOrganization } from "@volunteerly/shared";
import { UserService } from "@/services/UserService";

type OrganizationNavbarProps = {
    currentOrg: CurrentOrganization | undefined;
    onSignOut: () => void;
};

const NAV_LINKS = [
    { label: "Dashboard", href: "/organization" },
    { label: "Opportunities", href: "/organization/opportunities" },
    { label: "Messages", href: "/organization/messages" },
] as const;

export function OrganizationNavbar({ currentOrg, onSignOut }: OrganizationNavbarProps) {
    const pathname = usePathname();

    const fullName = currentOrg?.orgName

    return (
        <header className="w-full border-b bg-white px-6 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <Link href="/moderator" className="flex-shrink-0">
                    <Image src={logo} alt="Volunteerly" width={170} height={40} priority />
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
                            <NavigationMenuTrigger className="w-45">
                                <div className="flex items-center w-full min-w-0 gap-2">
                                    <div className="flex flex-col min-w-0 text-left">
                                        <p className="text-primary text-sm truncate">{fullName}</p>
                                        <p className="text-bright text-sm truncate">{currentOrg?.status === "VERIFIED" ? "VERIFIED" : "UNVERIFIED"}</p>
                                    </div>
                                    <Avatar>
                                        <AvatarImage src={UserService.getAvatarURL(currentOrg?.id || "")} />
                                        <AvatarFallback> {currentOrg?.orgName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent className="w-40">
                                <NavigationMenuList className="md:hidden gap-2 flex flex-col">
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