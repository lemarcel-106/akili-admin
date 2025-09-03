"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AmbassadorBadgeProps {
  type: 'standard' | 'silver' | 'gold' | 'diamond'
  className?: string
}

export function AmbassadorBadge({ type, className }: AmbassadorBadgeProps) {
  const typeConfig = {
    standard: {
      label: 'Standard',
      className: 'bg-gray-100 text-gray-800 border-gray-300'
    },
    silver: {
      label: 'Argent',
      className: 'bg-slate-100 text-slate-800 border-slate-300'
    },
    gold: {
      label: 'Or',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    },
    diamond: {
      label: 'Diamant',
      className: 'bg-purple-100 text-purple-800 border-purple-300'
    }
  }

  const config = typeConfig[type] || typeConfig.standard

  return (
    <Badge 
      className={cn(
        "font-semibold badge-shine",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  )
}