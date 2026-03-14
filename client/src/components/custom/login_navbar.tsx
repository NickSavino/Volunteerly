import Link from "next/link"

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu"

import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import logo from "@/assets/logo.png"

export function Navbar() {
  return (
    <header className="w-full border-b px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        
        <Link href="/" className="text-lg font-bold">
            <img src={logo.src} alt="Logo" width="200" height="200" />
        </Link>

        <NavigationMenu>
          <NavigationMenuList className="flex gap-2">
            <NavigationMenuItem>
              <Link href="/" passHref>
                <Button variant={usePathname() === "/" ? "default" : "ghost"}>Home</Button>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/login" passHref>
                <Button variant={usePathname() === "/login" ? "default" : "ghost"}>Login</Button>
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/signup" passHref>
                <Button variant={usePathname() === "/signup" ? "default" : "ghost"}>Sign Up</Button>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
}