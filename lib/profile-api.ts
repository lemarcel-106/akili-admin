import { api } from './api'

export interface UserProfile {
  id: number
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  avatar?: string
  is_email_verified: boolean
  two_factor_enabled: boolean
  country?: {
    id: number
    name: string
    code: string
  }
  date_joined: string
  last_login: string
}

export interface ProfileUpdateData {
  first_name?: string
  last_name?: string
  phone_number?: string
  id_country?: number
}

export interface PasswordChangeData {
  current_password: string
  new_password: string
  confirm_password: string
}

// Helper function to format error messages
function formatErrorMessage(response: any, defaultMessage: string): string {
  // Si c'est une string directe
  if (typeof response === 'string') return response
  
  // Si c'est une erreur avec details (validation errors)
  if (response?.data?.details) {
    const fieldErrors = Object.entries(response.data.details)
      .map(([field, messages]: [string, any]) => {
        const messageArray = Array.isArray(messages) ? messages : [messages]
        return `${field}: ${messageArray.join(', ')}`
      })
      .join('; ')
    
    if (fieldErrors) return fieldErrors
  }
  
  // Essayer différentes propriétés pour le message d'erreur
  return response?.data?.error || 
         response?.data?.message || 
         response?.error || 
         response?.message || 
         defaultMessage
}

export interface Enable2FAResponse {
  qr_code: string
  secret_key: string
  backup_codes: string[]
  message: string
}

// Validation helpers
function validateProfileData(data: ProfileUpdateData): string | null {
  if (data.first_name && (data.first_name.length < 2 || data.first_name.length > 50)) {
    return 'Le prénom doit contenir entre 2 et 50 caractères'
  }
  
  if (data.last_name && (data.last_name.length < 2 || data.last_name.length > 50)) {
    return 'Le nom doit contenir entre 2 et 50 caractères'
  }
  
  if (data.phone_number && data.phone_number.length > 0) {
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(data.phone_number)) {
      return 'Le numéro de téléphone doit être au format international (+33...)'
    }
  }
  
  return null
}

function validatePasswordData(data: PasswordChangeData): string | null {
  if (!data.current_password) {
    return 'Le mot de passe actuel est requis'
  }
  
  if (!data.new_password) {
    return 'Le nouveau mot de passe est requis'
  }
  
  if (data.new_password.length < 8) {
    return 'Le nouveau mot de passe doit contenir au moins 8 caractères'
  }
  
  if (data.new_password !== data.confirm_password) {
    return 'Les mots de passe ne correspondent pas'
  }
  
  return null
}

// Récupérer le profil
export async function getProfile() {
  try {
    const response = await api.get<{success: boolean, data: UserProfile, message?: string}>('/users/profile/')
    console.log('Get profile response:', { status: response.status, data: response.data, error: response.error })
    
    if (response.status === 200 && response.data) {
      return { success: true, data: response.data.data }
    }
    return { success: false, error: formatErrorMessage(response, 'Erreur lors de la récupération du profil') }
  } catch (error) {
    console.error('Get profile exception:', error)
    return { success: false, error: formatErrorMessage(error, 'Erreur de connexion au serveur') }
  }
}

// Fonction de test pour vérifier l'authentification
export async function testAuth() {
  try {
    console.log('Testing authentication...')
    const response = await api.get<any>('/users/profile/')
    console.log('Auth test response:', {
      status: response.status,
      hasData: !!response.data,
      error: response.error
    })
    return {
      authenticated: response.status === 200,
      status: response.status,
      error: response.error
    }
  } catch (error) {
    console.error('Auth test failed:', error)
    return {
      authenticated: false,
      status: 0,
      error: 'Connection failed'
    }
  }
}

// Mettre à jour le profil
export async function updateProfile(profileData: ProfileUpdateData) {
  // Validation côté client
  const validationError = validateProfileData(profileData)
  if (validationError) {
    return { success: false, error: validationError }
  }

  // Tentative 1: nouvelle API (`/users/profile/`) telle quelle
  try {
    if (process.env.NODE_ENV !== 'production') {
      // Log de debug pour suivre l'endpoint et la charge utile
      console.debug('[DEV] updateProfile → /users/profile/', {
        payloadKeys: Object.keys(profileData || {}),
      })
    }
    const response = await api.put<any>('/users/profile/', profileData)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV] updateProfile ← /users/profile/ response', {
        status: response.status,
        hasData: !!response.data,
        error: response.error,
      })
    }
    if (response.status === 200 && response.data) {
      return { success: true, message: response.data.message || 'Profil mis à jour avec succès' }
    }

    // Si endpoint introuvable/non autorisé, tenter l'API legacy
    if (response.status === 404 || response.status === 405) {
      throw new Error('Endpoint /users/profile/ indisponible, tentative legacy...')
    }

    // Autre erreur: continuer vers fallback avec mapping des champs
  } catch (e) {
    // Passer au fallback
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV] updateProfile /users/profile/ exception', e)
    }
  }

  // Tentative 2: API legacy (`/profile/update/`) avec mapping éventuel du champ téléphone
  try {
    const legacyPayload: any = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
    }
    if (profileData.phone_number) {
      legacyPayload.phone = profileData.phone_number
    }
    if (profileData.id_country) {
      legacyPayload.id_country = profileData.id_country
    }
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV] updateProfile → /profile/update/', {
        payloadKeys: Object.keys(legacyPayload || {}),
      })
    }
    const legacyResponse = await api.put<any>('/profile/update/', legacyPayload)
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV] updateProfile ← /profile/update/ response', {
        status: legacyResponse.status,
        hasData: !!legacyResponse.data,
        error: legacyResponse.error,
      })
    }
    if (legacyResponse.status === 200 && legacyResponse.data) {
      return { success: true, message: legacyResponse.data.message || 'Profil mis à jour avec succès' }
    }
    return { success: false, error: formatErrorMessage(legacyResponse, 'Erreur lors de la mise à jour du profil') }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV] updateProfile /profile/update/ exception', error)
    }
    return { success: false, error: formatErrorMessage(error, 'Erreur de connexion au serveur') }
  }
}

// Changer le mot de passe
export async function changePassword(passwordData: PasswordChangeData) {
  // Validation côté client
  const validationError = validatePasswordData(passwordData)
  if (validationError) {
    return { success: false, error: validationError }
  }
  
  try {
    console.log('Sending password change request with new API...')
    
    // Essayer d'abord la nouvelle API avec les bons paramètres
    const response = await api.post<any>('/users/password/', {
      old_password: passwordData.current_password,
      new_password: passwordData.new_password,
      confirm_password: passwordData.confirm_password
    })
    
    console.log('Password change response:', {
      status: response.status,
      data: response.data,
      error: response.error
    })
    
    // Si succès avec la nouvelle API
    if (response.status === 200) {
      if (response.data?.success !== false) {
        return { success: true, message: response.data?.message || 'Mot de passe modifié avec succès' }
      }
    }
    
    // Si erreur 404 (endpoint n'existe pas), essayer l'ancienne API
    if (response.status === 404) {
      console.log('New API endpoint not found, trying legacy API...')
      return await changePasswordLegacy(passwordData)
    }
    
    // Autres erreurs
    const errorMessage = response.data?.error || response.error || 'Erreur lors du changement de mot de passe'
    console.error('Password change failed:', errorMessage)
    return { success: false, error: formatErrorMessage(response, errorMessage) }
    
  } catch (error: any) {
    console.error('Password change exception:', error)
    
    // En cas d'erreur de connexion, essayer aussi l'ancienne API
    console.log('Trying legacy API due to exception...')
    try {
      return await changePasswordLegacy(passwordData)
    } catch (legacyError) {
      return { success: false, error: formatErrorMessage(error, 'Erreur de connexion au serveur') }
    }
  }
}

// Fonction de fallback utilisant l'ancienne API si la nouvelle n'existe pas encore
async function changePasswordLegacy(passwordData: PasswordChangeData) {
  try {
    console.log('Using legacy password change API...')
    
    // Utilisation directe de l'auth existant comme fallback
    const { auth } = await import('@/lib/auth')
    
    // Créer une requête directe comme dans l'ancienne API
    const baseUrl = 'https://api.mobile.akili.guru'
    const headers = auth.getAuthHeaders()
    
    const response = await fetch(`${baseUrl}/profile/change-password/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      })
    })
    
    const data = await response.json()
    
    console.log('Legacy API response:', { status: response.status, data })
    
    if (response.ok) {
      return { success: true, message: data.message || 'Mot de passe modifié avec succès' }
    } else {
      return { success: false, error: data.error || data.message || 'Erreur lors du changement de mot de passe' }
    }
    
  } catch (error: any) {
    console.error('Legacy API error:', error)
    return { success: false, error: 'Erreur de connexion au serveur' }
  }
}

// Upload d'avatar
export async function uploadAvatar(file: File) {
  // Validation du fichier
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  
  if (file.size > maxSize) {
    return { success: false, error: 'La taille du fichier ne doit pas dépasser 10MB' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP' }
  }
  
  try {
    const formData = new FormData()
    formData.append('avatar', file)

    const endpoints = [
      '/users/avatar/',
      '/profile/avatar/',
      '/profile/upload-avatar/'
    ]

    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV] uploadAvatar start', {
        file: { name: (file as any)?.name, type: file.type, size: file.size },
        endpoints
      })
    }

    for (const endpoint of endpoints) {
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[DEV] uploadAvatar →', endpoint)
        }
        const response = await api.upload<any>(endpoint, formData)
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[DEV] uploadAvatar ←', endpoint, {
            status: response.status,
            hasData: !!response.data,
            error: response.error
          })
        }
        if (response.status === 200 && response.data) {
          const data = (response.data as any).data || response.data
          const message = (response.data as any).message || 'Avatar mis à jour avec succès'
          return { success: true, data, message }
        }
      } catch (innerError) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('[DEV] uploadAvatar endpoint failed', endpoint, innerError)
        }
        // Essayer l'endpoint suivant
      }
    }

    return { success: false, error: 'Erreur lors de l\'upload de l\'avatar (endpoints testés indisponibles)' }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[DEV] uploadAvatar exception', error)
    }
    return { success: false, error: formatErrorMessage(error, 'Erreur de connexion au serveur') }
  }
}

// Activer 2FA - première étape (obtenir QR code)
export async function enable2FA() {
  try {
    const response = await api.get<{
      message: string
      qr_code: string
      secret: string
    }>('/generate-2fa-secret/')
    
    if (response.status === 200 && response.data) {
      return { 
        success: true, 
        data: {
          qr_code: response.data.qr_code,
          secret_key: response.data.secret
        },
        message: response.data.message || 'Scannez le QR code avec Google Authenticator et confirmez avec le code généré.'
      }
    }
    return { success: false, error: formatErrorMessage(response, 'Erreur lors de l\'activation du 2FA') }
  } catch (error) {
    return { success: false, error: formatErrorMessage(error, 'Erreur de connexion au serveur') }
  }
}

// Confirmer 2FA - deuxième étape (confirmer avec code TOTP)
export async function confirm2FA(verificationCode: string) {
  if (!verificationCode || verificationCode.length !== 6) {
    return { success: false, error: 'Le code de vérification doit contenir 6 chiffres' }
  }
  
  try {
    const response = await api.post<{message: string}>('/active-2fa/', { 
      code: verificationCode 
    })
    
    if (response.status === 200 && response.data) {
      return { success: true, message: response.data.message || '2FA activé avec succès' }
    }
    return { success: false, error: formatErrorMessage(response, 'Code de vérification invalide') }
  } catch (error) {
    return { success: false, error: formatErrorMessage(error, 'Erreur de connexion au serveur') }
  }
}

// Désactiver 2FA
export async function disable2FA() {
  try {
    const response = await api.post<{message: string}>('/disable-2fa/')
    
    if (response.status === 200 && response.data) {
      return { success: true, message: response.data.message || '2FA désactivé avec succès' }
    }
    return { success: false, error: formatErrorMessage(response, 'Erreur lors de la désactivation du 2FA') }
  } catch (error) {
    return { success: false, error: formatErrorMessage(error, 'Erreur de connexion au serveur') }
  }
}

// Envoyer email de vérification
export async function sendVerificationEmail() {
  const response = await api.post<{success: boolean, data: {email: string, expires_in: string}, message: string}>('/users/email/verify/')
  if (response.status === 200 && response.data) {
    return { success: true, data: response.data.data, message: response.data.message || 'Email de vérification envoyé' }
  }
  return { success: false, error: response.error || 'Erreur lors de l\'envoi de l\'email de vérification' }
}

// Vérifier email avec token
export async function verifyEmailToken(token: string) {
  const response = await api.get<{success: boolean, message: string}>(`/users/email/verify/${token}/`)
  if (response.status === 200 && response.data) {
    return { success: true, message: response.data.message || 'Email vérifié avec succès' }
  }
  return { success: false, error: response.error || 'Erreur lors de la vérification de l\'email' }
}
