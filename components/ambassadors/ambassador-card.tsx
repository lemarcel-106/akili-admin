"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AmbassadorBadge } from "./ambassador-badge"
import { StatusBadge } from "./status-badge"
import { 
  MoreVertical, 
  Mail, 
  Phone, 
  Trophy, 
  Link2,
  Edit,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Ambassador } from "@/lib/ambassadors-api"

interface AmbassadorCardProps {
  ambassador: Ambassador
  onView?: (ambassador: Ambassador) => void
  onEdit?: (ambassador: Ambassador) => void
  onDelete?: (ambassador: Ambassador) => void
  onToggleStatus?: (ambassador: Ambassador) => void
  onGenerateLink?: (ambassador: Ambassador) => void
}

export function AmbassadorCard({
  ambassador,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onGenerateLink
}: AmbassadorCardProps) {
  return (
    <Card className="ambassador-card hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg h-full">
      <CardHeader className="pb-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {ambassador.first_name} {ambassador.last_name}
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <AmbassadorBadge type={ambassador.ambassador_type} />
              <StatusBadge isActive={ambassador.is_active} />
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onView && (
                <DropdownMenuItem onClick={() => onView(ambassador)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Voir détails
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(ambassador)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
              )}
              {onGenerateLink && (
                <DropdownMenuItem onClick={() => onGenerateLink(ambassador)}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Générer lien
                </DropdownMenuItem>
              )}
              {onToggleStatus && (
                <DropdownMenuItem onClick={() => onToggleStatus(ambassador)}>
                  {ambassador.is_active ? (
                    <>
                      <ToggleLeft className="mr-2 h-4 w-4" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <ToggleRight className="mr-2 h-4 w-4" />
                      Activer
                    </>
                  )}
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(ambassador)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          {ambassador.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{ambassador.email}</span>
            </div>
          )}
          {ambassador.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{ambassador.phone}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{ambassador.points} points</span>
          </div>
          {ambassador.promo_code && (
            <Badge variant="outline" className="font-mono">
              {ambassador.promo_code}
            </Badge>
          )}
        </div>

        {ambassador.country_name && (
          <div className="text-sm text-muted-foreground">
            Pays: {ambassador.country_name}
          </div>
        )}
      </CardContent>
    </Card>
  )
}