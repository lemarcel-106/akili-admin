"use client"

import { useMemo } from 'react'

interface BaseEntity {
  id: number
  is_active: number | boolean
  created_at?: string
}

export function useStats<T extends BaseEntity>(
  entities: T[],
  entityName: string,
  additionalCalculations?: (entities: T[]) => Record<string, any>
) {
  return useMemo(() => {
    const total = entities.length
    const active = entities.filter(entity => 
      typeof entity.is_active === 'boolean' ? entity.is_active : entity.is_active === 1
    ).length
    const inactive = total - active
    const activationRate = total > 0 ? Math.round((active / total) * 100) : 0
    
    // Calcul des trends (simulé pour l'instant - basé sur les 30 derniers jours)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const recentEntities = entities.filter(entity => {
      if (!entity.created_at) return false
      const createdDate = new Date(entity.created_at)
      return createdDate >= thirtyDaysAgo
    })
    
    const growthRate = total > 0 ? Math.round((recentEntities.length / total) * 100) : 0
    
    const baseStats = {
      total,
      active,
      inactive,
      activationRate,
      growthRate,
      recentCount: recentEntities.length,
      // Calculs de trends simulés
      totalTrend: total > 10 ? '+12%' : '+5%',
      activeTrend: activationRate > 80 ? '+8%' : '+3%',
      activationTrend: activationRate > 90 ? '+2%' : '+5%'
    }
    
    // Ajout des calculs supplémentaires si fournis
    const additional = additionalCalculations ? additionalCalculations(entities) : {}
    
    return { ...baseStats, ...additional }
  }, [entities, entityName, additionalCalculations])
}