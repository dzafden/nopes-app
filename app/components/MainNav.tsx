"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Archive, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "./ThemeToggle"

export function MainNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] flex flex-col">
        <SheetTitle className="px-3 py-2">
          Navigation
        </SheetTitle>
        <div className="flex-1 space-y-4 py-4">
          <div className="px-3 py-2">
            <div className="space-y-1">
              <Link href="/archive" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className={cn("w-full justify-start", pathname === "/archive" && "bg-muted")}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-auto">
          <Separator />
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  )
}

