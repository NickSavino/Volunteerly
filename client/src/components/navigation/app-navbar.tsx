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
import type { AppNavItem } from "./nav-config";

type AppNavbarProps = {
  homeHref: string;
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
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href={homeHref} className="shrink-0">
          <Image src={logo} alt="Volunteerly" width={170} height={40} priority />
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList className="flex gap-6">
            {items.map(({ label, href }) => {
              const isActive = isNavItemActive(pathname, href);

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
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="w-45">
                <div className="flex w-full min-w-0 items-center gap-2">
                  <div className="flex min-w-0 flex-col text-left">
                    <p className="truncate text-sm text-primary">{displayName}</p>
                    <p className="truncate text-sm text-gray-400">{subtitle}</p>
                  </div>

                  <Avatar>
                    <AvatarImage src={avatarUrl ?? undefined} />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                  </Avatar>
                </div>
              </NavigationMenuTrigger>

              <NavigationMenuContent className="w-45 p-3">
                <NavigationMenuList className="flex flex-col gap-2 md:hidden">
                  {items.map(({ label, href }) => {
                    const isActive = isNavItemActive(pathname, href);

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

                <hr className="my-3 border-gray-300 md:hidden" />

                <button
                  className="w-40 cursor-pointer text-sm font-medium text-gray-600 transition-colors hover:text-yellow-500"
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