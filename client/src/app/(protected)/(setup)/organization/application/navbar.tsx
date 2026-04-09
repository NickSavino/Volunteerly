import Link from "next/link";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import logo from "@/assets/logo.png";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import Image from "next/image";

export function Navbar({
    name,
    role,
    onLogout,
}: {
    name: string;
    role: string;
    onLogout: () => void;
}) {
    return (
        <header className="w-full border-b bg-white px-6 py-3">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <Link href="/" className="text-lg font-bold">
                    <Image src={logo.src} alt="Logo" width={200} height={200} />
                </Link>

                <NavigationMenu>
                    <NavigationMenuList className="flex gap-2">
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="w-auto max-w-[calc(100vw-10rem)] sm:min-w-[220px]">
                                <div className="flex w-full min-w-0 items-center gap-2">
                                    <div className="flex min-w-0 flex-col text-left">
                                        <p className="truncate text-sm text-primary">{name}</p>
                                        <p className="truncate text-sm">{role}</p>
                                    </div>
                                    <Avatar className="shrink-0">
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
