"use client"

import { AlertTriangle, Trash2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  title: string
  itemName: string
  itemType: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  warningMessage?: string
}

export function DeleteConfirmationModal({
  isOpen,
  title,
  itemName,
  itemType,
  onConfirm,
  onCancel,
  loading = false,
  warningMessage
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex flex-col items-center text-center">
            {/* Icône d'alerte */}
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            
            <DialogTitle className="text-xl font-bold text-destructive mb-2">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col items-center text-center">
          {/* Description */}
          <p className="text-muted-foreground mb-1">
            Voulez-vous vraiment supprimer {itemType.toLowerCase()} :
          </p>
          
          <p className="font-semibold text-lg mb-4 text-primary">
            &quot;{itemName}&quot;
          </p>
          
          {/* Message d'avertissement */}
          {warningMessage && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {warningMessage}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Message standard */}
          <p className="text-sm text-muted-foreground mb-8">
            Cette action est <span className="font-semibold text-destructive">irréversible</span>. 
            Toutes les données associées seront définitivement perdues.
          </p>
          
          {/* Actions */}
          <div className="flex gap-4 w-full">
            <Button 
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              type="button"
              variant="destructive"
              className="flex-1"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}