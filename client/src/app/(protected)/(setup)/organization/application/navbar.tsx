import Link from "next/link";

import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuTrigger,
    NavigationMenuContent,
} from "@/components/ui/navigation-menu";

import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { User } from "lucide-react";

export function Navbar({ name, role, onLogout }: { name: string; role: string; onLogout: () => void }) {
    return (
        <header className="w-full border-b bg-white px-6 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <Link href="/" className="text-lg font-bold">
                    <img src={logo.src} alt="Logo" width="200" height="200" />
                </Link>

                <NavigationMenu>
                    <NavigationMenuList className="flex gap-2">
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="w-45">
                                <div className="flex items-center w-full min-w-0 gap-2">
                                    <div className="flex flex-col min-w-0 text-left">
                                        <p className="text-primary text-sm truncate">{name}</p>
                                        <p className="text-bright text-sm truncate">{role}</p>
                                    </div>
                                    <Avatar>
                                        <AvatarImage>
                                            {" "}
                                            <User />{" "}
                                        </AvatarImage>
                                        <AvatarFallback>ORG</AvatarFallback>
                                    </Avatar>
                                </div>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <button className="w-40 cursor-pointer" onClick={onLogout}>
                                    Log Out{" "}
                                </button>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        </header>
    );
}
