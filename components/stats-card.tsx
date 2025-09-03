"use client"

import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TrendData {
  value: string
  direction: 'up' | 'down' | 'neutral'
}

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'
  trend?: TrendData
  description: string
  className?: string
  loading?: boolean
}

const colorClasses = {
  primary: {
    icon: "text-primary",
    bg: "bg-primary/10",
    trend: "text-primary"
  },
  secondary: {
    icon: "text-secondary", 
    bg: "bg-secondary/10",
    trend: "text-secondary"
  },
  success: {
    icon: "text-success",
    bg: "bg-success/10", 
    trend: "text-success"
  },
  warning: {
    icon: "text-warning",
    bg: "bg-warning/10",
    trend: "text-warning"
  },
  info: {
    icon: "text-info",
    bg: "bg-info/10",
    trend: "text-info"
  },
  error: {
    icon: "text-error",
    bg: "bg-error/10",
    trend: "text-error"
  }
}

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  description, 
  className = "",
  loading = false 
}: StatsCardProps) {
  const colorClass = colorClasses[color]
  
  const TrendIcon = trend?.direction === 'up' 
    ? TrendingUp 
    : trend?.direction === 'down' 
      ? TrendingDown 
      : Minus

  const trendColorClass = trend?.direction === 'up' 
    ? 'text-success' 
    : trend?.direction === 'down' 
      ? 'text-error' 
      : 'text-base-content/50'

  return (
    <Card className={cn(
      "hover:shadow-xl transition-all duration-300 group hover:-translate-y-1",
      className
    )}>
      <CardContent className="p-6">
        {loading ? (
          <div className="animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-base-300 rounded-xl"></div>
                <div className="w-24 h-3 bg-base-300 rounded"></div>
              </div>
            </div>
            <div className="w-16 h-8 bg-base-300 rounded mb-2"></div>
            <div className="w-20 h-4 bg-base-300 rounded"></div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-xl transition-transform group-hover:scale-105 ${colorClass.bg}`}>
                    <Icon className={`h-5 w-5 ${colorClass.icon}`} />
                  </div>
                  <span className="text-xs font-medium text-base-content/60 uppercase tracking-wide">
                    {description}
                  </span>
                </div>
                <p className="text-2xl font-bold text-base-content mb-1 transition-colors">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                <p className="text-sm font-medium text-base-content/80">{title}</p>
              </div>
            </div>
            
            {trend && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-base-300/30">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 ${trendColorClass}`}>
                    <TrendIcon className="h-4 w-4" />
                    <span className="text-sm font-semibold">{trend.value}</span>
                  </div>
                </div>
                <span className="text-xs text-base-content/50">vs période précédente</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}