// Types TypeScript pour le module Ambassadeur
export interface Ambassador {
  id: number
  id_country?: number
  first_name: string
  last_name: string
  email?: string
  phone?: string
  ambassador_type: 'standard' | 'silver' | 'gold' | 'diamond'
  points: number
  created_by: string
  is_active: boolean
  created_at?: string
  updated_at?: string
  // Relations
  country_name?: string
  promo_code?: string
  total_licenses?: number
}

export interface PromoCode {
  id: number
  id_ambassador?: number
  code: string
  type_code: string
  times_used: number
  usage_limit?: number
  valid_from?: string
  valid_until?: string
  created_by: string
  created_at: string
  is_active: boolean
  // Champs calculés
  ambassador_name?: string
  is_valid?: boolean
  remaining_uses?: number
}

export interface CreateAmbassadorData {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  ambassador_type: 'standard' | 'silver' | 'gold' | 'diamond'
  id_country?: number
  is_active?: boolean
}

export interface UpdateAmbassadorData {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  ambassador_type?: 'standard' | 'silver' | 'gold' | 'diamond'
  id_country?: number
  is_active?: boolean
}

export interface CreatePromoCodeData {
  id_ambassador?: number
  code: string
  type_code: string
  usage_limit?: number
  valid_from?: string
  valid_until?: string
  is_active?: boolean
}

export interface UpdatePromoCodeData {
  type_code?: string
  usage_limit?: number
  valid_from?: string
  valid_until?: string
  is_active?: boolean
}

export interface AmbassadorStats {
  id: number
  first_name: string
  last_name: string
  ambassador_type: string
  points: number
  total_licenses: number
  total_revenue: number
  conversion_rate: number
  ranking: number
  monthly_licenses: number
  monthly_revenue: number
  promo_code?: {
    code: string
    times_used: number
    usage_limit?: number
    is_active: boolean
  }
}

export interface PromoCodeUsageHistory {
  date: string
  license_id: number
  user_email?: string
  amount?: number
}

export interface AmbassadorFilters {
  ambassador_type?: string
  is_active?: boolean
  id_country?: number
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export interface PromoCodeFilters {
  is_active?: boolean
  type_code?: string
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const TOKEN_KEY = 'akili_admin_token'

// Utilitaire pour récupérer le token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

// Utilitaire pour les headers HTTP
const getHeaders = () => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  }
}

// Utilitaire pour gérer les erreurs API
const handleApiError = (error: any) => {
  console.error('API Error:', error)
  
  if (error.response?.status === 401) {
    // Token expiré ou invalide
    localStorage.removeItem(TOKEN_KEY)
    window.location.href = '/login'
    return { success: false, error: 'Session expirée. Veuillez vous reconnecter.' }
  }
  
  if (error.response?.data?.detail) {
    return { success: false, error: error.response.data.detail }
  }
  
  if (error.response?.data?.message) {
    return { success: false, error: error.response.data.message }
  }
  
  return { success: false, error: 'Une erreur est survenue lors de la communication avec le serveur.' }
}

// =====================================================================
// FONCTIONS AMBASSADEURS
// =====================================================================

/**
 * Récupère la liste des ambassadeurs avec filtres optionnels
 */
export const getAmbassadors = async (filters?: AmbassadorFilters) => {
  try {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.ambassador_type) params.append('ambassador_type', filters.ambassador_type)
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString())
      if (filters.id_country) params.append('id_country', filters.id_country.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.ordering) params.append('ordering', filters.ordering)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.page_size) params.append('page_size', filters.page_size.toString())
    }
    
    const queryString = params.toString()
    const url = `${API_BASE_URL}/api/ambassadors/${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return { success: true, ambassadors: data.results || data, count: data.count }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Récupère les détails d'un ambassadeur spécifique
 */
export const getAmbassador = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ambassadors/${id}/`, {
      method: 'GET',
      headers: getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return { success: true, ambassador: data }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Crée un nouvel ambassadeur
 */
export const createAmbassador = async (ambassadorData: CreateAmbassadorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ambassadors/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(ambassadorData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw { response: { status: response.status, data: errorData } }
    }
    
    const data = await response.json()
    return { success: true, ambassador: data }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Met à jour un ambassadeur existant
 */
export const updateAmbassador = async (id: number, ambassadorData: UpdateAmbassadorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ambassadors/${id}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(ambassadorData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw { response: { status: response.status, data: errorData } }
    }
    
    const data = await response.json()
    return { success: true, ambassador: data }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Supprime un ambassadeur
 */
export const deleteAmbassador = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ambassadors/${id}/`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return { success: true }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Active/désactive un ambassadeur
 */
export const toggleAmbassadorStatus = async (id: number, isActive: boolean) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ambassadors/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ is_active: isActive })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw { response: { status: response.status, data: errorData } }
    }
    
    const data = await response.json()
    return { success: true, ambassador: data }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Récupère les statistiques détaillées d'un ambassadeur
 */
export const getAmbassadorStats = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ambassadors/${id}/stats/`, {
      method: 'GET',
      headers: getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return { success: true, stats: data }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Génère un code promo pour un ambassadeur
 */
export const generatePromoCode = async (id: number, codeData: Partial<CreatePromoCodeData>) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ambassadors/${id}/generate-code/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(codeData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw { response: { status: response.status, data: errorData } }
    }
    
    const data = await response.json()
    return { success: true, promoCode: data }
  } catch (error) {
    return handleApiError(error)
  }
}

// =====================================================================
// FONCTIONS CODES PROMO
// =====================================================================

/**
 * Récupère la liste des codes promo avec filtres optionnels
 */
export const getPromoCodes = async (filters?: PromoCodeFilters) => {
  try {
    const params = new URLSearchParams()
    
    if (filters) {
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString())
      if (filters.type_code) params.append('type_code', filters.type_code)
      if (filters.search) params.append('search', filters.search)
      if (filters.ordering) params.append('ordering', filters.ordering)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.page_size) params.append('page_size', filters.page_size.toString())
    }
    
    const queryString = params.toString()
    const url = `${API_BASE_URL}/api/promo-codes/${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return { success: true, promoCodes: data.results || data, count: data.count }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Récupère les détails d'un code promo spécifique
 */
export const getPromoCode = async (code: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/promo-codes/${code}/`, {
      method: 'GET',
      headers: getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return { success: true, promoCode: data }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Crée un nouveau code promo
 */
export const createPromoCode = async (promoCodeData: CreatePromoCodeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/promo-codes/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(promoCodeData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw { response: { status: response.status, data: errorData } }
    }
    
    const data = await response.json()
    return { success: true, promoCode: data }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Met à jour un code promo existant
 */
export const updatePromoCode = async (code: string, promoCodeData: UpdatePromoCodeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/promo-codes/${code}/`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(promoCodeData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw { response: { status: response.status, data: errorData } }
    }
    
    const data = await response.json()
    return { success: true, promoCode: data }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Supprime un code promo
 */
export const deletePromoCode = async (code: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/promo-codes/${code}/`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return { success: true }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Valide un code promo
 */
export const validatePromoCode = async (code: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/promo-codes/validate/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw { response: { status: response.status, data: errorData } }
    }
    
    const data = await response.json()
    return { success: true, validation: data }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Récupère l'historique d'utilisation d'un code promo
 */
export const getPromoCodeUsageHistory = async (code: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/promo-codes/${code}/usage/`, {
      method: 'GET',
      headers: getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return { success: true, usage: data }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Active/désactive un code promo
 */
export const togglePromoCodeStatus = async (code: string, isActive: boolean) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/promo-codes/${code}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ is_active: isActive })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw { response: { status: response.status, data: errorData } }
    }
    
    const data = await response.json()
    return { success: true, promoCode: data }
  } catch (error) {
    return handleApiError(error)
  }
}

// =====================================================================
// STATISTIQUES GÉNÉRALES
// =====================================================================

/**
 * Récupère les statistiques générales des ambassadeurs
 */
export const getAmbassadorGeneralStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ambassadors/stats/`, {
      method: 'GET',
      headers: getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return { success: true, stats: data }
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Récupère le top des ambassadeurs
 */
export const getTopAmbassadors = async (limit: number = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ambassadors/top/?limit=${limit}`, {
      method: 'GET',
      headers: getHeaders()
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return { success: true, ambassadors: data }
  } catch (error) {
    return handleApiError(error)
  }
}

// =====================================================================
// UTILITAIRES
// =====================================================================

/**
 * Génère un code promo unique automatiquement
 */
export const generateUniqueCode = (prefix: string = 'AKILI', length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = prefix
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Formate le niveau d'ambassadeur pour l'affichage
 */
export const formatAmbassadorType = (type: string): string => {
  const types: Record<string, string> = {
    standard: 'Standard',
    silver: 'Argent',
    gold: 'Or',
    diamond: 'Diamant'
  }
  return types[type] || type
}

/**
 * Détermine la couleur associée à un niveau d'ambassadeur
 */
export const getAmbassadorTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    standard: 'gray',
    silver: 'slate',
    gold: 'yellow',
    diamond: 'purple'
  }
  return colors[type] || 'gray'
}

/**
 * Calcule les seuils de points pour les niveaux
 */
export const getPointsThresholds = () => {
  return {
    standard: { min: 0, max: 99, next: 'silver' },
    silver: { min: 100, max: 499, next: 'gold' },
    gold: { min: 500, max: 999, next: 'diamond' },
    diamond: { min: 1000, max: Infinity, next: null }
  }
}

/**
 * Détermine le niveau suivant basé sur les points
 */
export const getNextLevel = (currentPoints: number): string | null => {
  if (currentPoints < 100) return 'silver'
  if (currentPoints < 500) return 'gold'
  if (currentPoints < 1000) return 'diamond'
  return null
}

/**
 * Calcule les points nécessaires pour le niveau suivant
 */
export const getPointsToNextLevel = (currentPoints: number): number => {
  if (currentPoints < 100) return 100 - currentPoints
  if (currentPoints < 500) return 500 - currentPoints
  if (currentPoints < 1000) return 1000 - currentPoints
  return 0
}