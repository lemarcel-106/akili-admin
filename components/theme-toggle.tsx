"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Monitor, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getIcon = () => {
    if (!mounted) return <Monitor className="h-5 w-5" />
    
    if (theme === "system") {
      return <Monitor className="h-5 w-5" />
    }
    if (theme === "dark") {
      return <Moon className="h-5 w-5" />
    }
    return <Sun className="h-5 w-5" />
  }

  const themes = [
    { 
      value: "light", 
      label: "Clair",
      icon: <Sun className="h-4 w-4 mr-2" />
    },
    { 
      value: "dark", 
      label: "Sombre",
      icon: <Moon className="h-4 w-4 mr-2" />
    },
    { 
      value: "system", 
      label: "Système",
      icon: <Monitor className="h-4 w-4 mr-2" />
    }
  ]

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="animate-pulse">
        <Monitor className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {getIcon()}
          <span className="sr-only">Changer le thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map(({ value, label, icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                {icon}
                <span>{label}</span>
              </div>
              {theme === value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}