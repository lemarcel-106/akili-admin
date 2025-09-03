"use client"

import * as React from "react"
import { X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface EnhancedSelectProps {
  options: Option[]
  value?: string
  placeholder?: string
  clearable?: boolean
  disabled?: boolean
  className?: string
  onChange?: (value: string) => void
  onClear?: () => void
}

export function EnhancedSelect({
  options,
  value,
  placeholder = "Sélectionnez une option",
  clearable = false,
  disabled = false,
  className = "",
  onChange,
  onClear
}: EnhancedSelectProps) {
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClear?.()
  }

  return (
    <div className={cn("relative", className)}>
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
          {clearable && value && !disabled && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0.5 hover:bg-transparent"
              onClick={handleClear}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}