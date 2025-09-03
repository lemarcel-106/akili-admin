"use client"

import { LucideIcon, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface FormLayoutProps {
  title: string
  icon: LucideIcon
  isEditing: boolean
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  loading?: boolean
  submitText?: string
  className?: string
  open?: boolean
}

export function FormLayout({
  title,
  icon: Icon,
  isEditing,
  children,
  onSubmit,
  onCancel,
  loading = false,
  submitText,
  className = "",
  open = true
}: FormLayoutProps) {
  const defaultSubmitText = isEditing ? "Modifier" : "Créer"
  
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className={`max-w-4xl ${className}`}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-2 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            {title}
          </DialogTitle>
          <p className="text-muted-foreground">
            {isEditing ? "Modifiez les informations ci-dessous" : "Remplissez les informations nécessaires"}
          </p>
        </DialogHeader>
        
        <form onSubmit={onSubmit} className="space-y-8">
          {children}
          
          <Separator />
          
          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                submitText || defaultSubmitText
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}