import { api, ApiResponse } from './api'

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  is_actived: boolean
  date_joined: string
  phone?: string
  email_verified: boolean
  google_auth_is_active: boolean
  id_country?: {
    id: number
    name: string
    code: string
  }
  avatar?: string
}

export interface RoleObject { code: 'super_admin' | 'admin' | 'data_entry_operator'; label?: string }
export interface CountryObject { id: number; name?: string; code?: string; iso_code?: string }

export interface CreateUserData {
  first_name: string
  last_name: string
  email: string
  role: string | RoleObject
  id_country: number | CountryObject
}

type UpdateUserData = Partial<{
  first_name: string
  last_name: string
  email: string
  role: string | RoleObject
  id_country: number | CountryObject
  is_actived: boolean
}>

function normalizeUserPayload(data: CreateUserData | UpdateUserData) {
  const role = typeof (data as any).role === 'object' && (data as any).role !== null
    ? (data as any).role.code
    : (data as any).role

  const id_country = typeof (data as any).id_country === 'object' && (data as any).id_country !== null
    ? (data as any).id_country.id
    : (data as any).id_country

  const { first_name, last_name, email, is_actived } = data as any

  const payload: any = {}
  if (first_name !== undefined) payload.first_name = first_name
  if (last_name !== undefined) payload.last_name = last_name
  if (email !== undefined) payload.email = email
  if (role !== undefined) payload.role = role
  if (id_country !== undefined) payload.id_country = id_country
  if (is_actived !== undefined) payload.is_actived = is_actived
  return payload
}

export const getUsers = async () => {
  try {
    const response = await api.get<User[]>('/user/')
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV][UsersAPI] GET /user/ ←', { status: response.status, hasData: !!response.data, error: response.error })
    }
    if (response.status === 200 && response.data) {
      // Normaliser différentes formes de réponses possibles
      const raw = response.data as any
      const list: any = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.results)
        ? raw.results
        : Array.isArray(raw?.users)
        ? raw.users
        : []

      return {
        success: true,
        users: list as User[],
        status: response.status
      }
    }
    return {
      success: false,
      error: response.error || 'Erreur lors de la récupération des utilisateurs',
      status: response.status
    }
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV][UsersAPI] GET /user/ exception', error)
    }
    return {
      success: false,
      error: error.message || 'Erreur lors de la récupération des utilisateurs',
      status: 0
    }
  }
}

export const createUser = async (userData: CreateUserData): Promise<ApiResponse<User>> => {
  const payload = normalizeUserPayload(userData)
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[DEV][UsersAPI] POST /user/create/ →', payload)
  }
  const response = await api.post<User>('/user/create/', payload)
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[DEV][UsersAPI] POST /user/create/ ←', { status: response.status, data: response.data, error: response.error })
  }
  return response
}

export const getUserDetails = async (userId: number) => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV][UsersAPI] GET /user/:id →', { id: userId })
    }
    const response = await api.get<User>(`/user/${userId}/`)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV][UsersAPI] GET /user/:id ←', { status: response.status, data: response.data, error: response.error })
    }
    if (response.status === 200 && response.data) {
      return {
        success: true,
        user: response.data
      }
    }
    return {
      success: false,
      error: response.error || 'Erreur lors de la récupération de l\'utilisateur'
    }
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV][UsersAPI] GET /user/:id exception', error)
    }
    return {
      success: false,
      error: error.message || 'Erreur lors de la récupération de l\'utilisateur'
    }
  }
}

export const updateUser = async (userId: number, data: UpdateUserData, method: 'PUT' | 'PATCH' = 'PATCH') => {
  try {
    const payload = normalizeUserPayload(data)
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEV][UsersAPI] ${method} /user/:id →`, { id: userId, payload })
    }
    const response = method === 'PUT'
      ? await api.put(`/user/${userId}/`, payload)
      : await api.patch(`/user/${userId}/`, payload)
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEV][UsersAPI] ${method} /user/:id ←`, { status: response.status, data: response.data, error: response.error })
    }
    if (response.status === 200) {
      return { success: true, message: (response.data as any)?.message || 'Utilisateur mis à jour avec succès' }
    }
    return { success: false, error: response.error || 'Erreur lors de la mise à jour de l\'utilisateur' }
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV][UsersAPI] UPDATE /user/:id exception', error)
    }
    return { success: false, error: error.message || 'Erreur lors de la mise à jour de l\'utilisateur' }
  }
}

export const toggleUserStatus = async (userId: number, isActive: boolean, reason?: string) => {
  try {
    const action = isActive ? 'unblock' : 'block'
    const payload: any = { action }
    if (!isActive && reason) {
      payload.reason = reason
    }
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV][UsersAPI] POST /user/:id/block/ →', { id: userId, payload })
    }
    const response = await api.post(`/user/${userId}/block/`, payload)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV][UsersAPI] POST /user/:id/block/ ←', { status: response.status, data: response.data, error: response.error })
    }
    if (response.status === 200) {
      return {
        success: true,
        message: (response.data as any)?.message || (isActive ? 'Utilisateur débloqué avec succès' : 'Utilisateur bloqué avec succès')
      }
    }
    return {
      success: false,
      error: response.error || 'Erreur lors du changement de statut'
    }
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV][UsersAPI] POST /user/:id/block/ exception', error)
    }
    return {
      success: false,
      error: error.message || 'Erreur lors du changement de statut'
    }
  }
}

export interface UserStats {
  total_users: number
  active_users: number
  blocked_users: number
  blocked_users_list: Array<{
    id: number
    email: string
    first_name: string
    last_name: string
    date_joined: string
  }>
}

export const getUserStats = async (): Promise<ApiResponse<UserStats>> => {
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[DEV][UsersAPI] GET /users/stats/ →')
  }
  const response = await api.get<UserStats>('/users/stats/')
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[DEV][UsersAPI] GET /users/stats/ ←', { status: response.status, data: response.data, error: response.error })
  }
  return response
}

export const deleteUser = async (userId: number): Promise<ApiResponse<void>> => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV][UsersAPI] DELETE /user/:id →', { id: userId })
    }
    const response = await api.delete<void>(`/user/${userId}/`)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV][UsersAPI] DELETE /user/:id ←', { 
        status: response.status, 
        data: response.data, 
        error: response.error,
        hasData: response.data !== undefined,
        isSuccess: response.status === 204 || response.status === 200
      })
    }
    return response
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[DEV][UsersAPI] DELETE /user/:id exception', error)
    }
    return {
      status: 0,
      error: error.message || 'Erreur lors de la suppression de l\'utilisateur'
    }
  }
}
