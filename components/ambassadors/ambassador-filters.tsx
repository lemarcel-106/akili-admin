"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Search, Filter, X } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { AmbassadorFilters } from "@/lib/ambassadors-api"

interface AmbassadorFiltersProps {
  onFiltersChange: (filters: AmbassadorFilters) => void
  countries?: { id: number; name: string }[]
}

export function AmbassadorFilterBar({
  onFiltersChange,
  countries = []
}: AmbassadorFiltersProps) {
  const [filters, setFilters] = useState<AmbassadorFilters>({
    search: "",
    ambassador_type: "",
    is_active: undefined,
    id_country: undefined,
    ordering: "-created_at"
  })

  const handleFilterChange = (key: keyof AmbassadorFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const resetFilters = () => {
    const defaultFilters: AmbassadorFilters = {
      search: "",
      ambassador_type: "",
      is_active: undefined,
      id_country: undefined,
      ordering: "-created_at"
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  const hasActiveFilters = () => {
    return (
      filters.search ||
      filters.ambassador_type ||
      filters.is_active !== undefined ||
      filters.id_country
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un ambassadeur..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtres
              {hasActiveFilters() && (
                <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                  {Object.values(filters).filter(v => v !== undefined && v !== "").length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filtres avancés</SheetTitle>
              <SheetDescription>
                Affinez votre recherche d'ambassadeurs
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <Label htmlFor="type">Type d'ambassadeur</Label>
                <Select
                  value={filters.ambassador_type || "all"}
                  onValueChange={(value) => 
                    handleFilterChange("ambassador_type", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="silver">Argent</SelectItem>
                    <SelectItem value="gold">Or</SelectItem>
                    <SelectItem value="diamond">Diamant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Select
                  value={filters.id_country?.toString() || "all"}
                  onValueChange={(value) => 
                    handleFilterChange("id_country", value === "all" ? undefined : parseInt(value))
                  }
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Tous les pays" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les pays</SelectItem>
                    {countries.map(country => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Ambassadeurs actifs uniquement</Label>
                <Switch
                  id="active"
                  checked={filters.is_active === true}
                  onCheckedChange={(checked) => 
                    handleFilterChange("is_active", checked ? true : undefined)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort">Trier par</Label>
                <Select
                  value={filters.ordering || "-created_at"}
                  onValueChange={(value) => handleFilterChange("ordering", value)}
                >
                  <SelectTrigger id="sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-created_at">Date de création (récent)</SelectItem>
                    <SelectItem value="created_at">Date de création (ancien)</SelectItem>
                    <SelectItem value="last_name">Nom (A-Z)</SelectItem>
                    <SelectItem value="-last_name">Nom (Z-A)</SelectItem>
                    <SelectItem value="-points">Points (décroissant)</SelectItem>
                    <SelectItem value="points">Points (croissant)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters()}
                >
                  <X className="mr-2 h-4 w-4" />
                  Réinitialiser les filtres
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}