import Link from "next/link"

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu"

import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import logo from "@/assets/logo.png"

export function Navbar({
  avtImg,
  name,
  role,
  onLogout
}: { avtImg: { src: string }; name: string; role: string; onLogout: () => void }) {
  return (
    <header className="w-full border-b px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        <Link href="/" className="text-lg font-bold">
            <img src={logo.src} alt="Logo" width="200" height="200" />
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="flex gap-2">
            <NavigationMenuItem>
                <NavigationMenuTrigger className="w-40">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col justify-center">
                            <p className="text-primary text-sm">{name}</p>
                            <p className="text-bright text-sm">{role}</p>
                        </div>
                        <Avatar>
                            <AvatarImage src={avtImg.src} />
                            <AvatarFallback>TMS</AvatarFallback>
                        </Avatar>
                    </div>
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                    <button className="w-40" onClick={onLogout}>Log Out </button>
                </NavigationMenuContent>

            </NavigationMenuItem>

          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}