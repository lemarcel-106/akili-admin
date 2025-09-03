"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  isActive: boolean
  className?: string
}

export function StatusBadge({ isActive, className }: StatusBadgeProps) {
  return (
    <Badge 
      className={cn(
        "font-semibold",
        isActive 
          ? "bg-green-100 text-green-800 border-green-300" 
          : "bg-red-100 text-red-800 border-red-300",
        className
      )}
    >
      {isActive ? "Actif" : "Inactif"}
    </Badge>
  )
}