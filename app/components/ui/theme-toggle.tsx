"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <>
      <Separator className="my-2" />
      <Button
        variant="ghost"
        size="default"
        className="w-full justify-start text-gray-100"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {resolvedTheme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
        <span>Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode</span>
      </Button>
    </>
  )
}

