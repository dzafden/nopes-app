"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-between px-4 py-2 transition-colors">
      <div className="flex items-center space-x-2">
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="text-sm font-medium">Theme</span>
      </div>
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  )
} 