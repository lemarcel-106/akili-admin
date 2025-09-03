/**
 * Utilitaires pour l'application Akili Admin
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

const API_BASE_URL = 'https://api.mobile.akili.guru'

/**
 * Convertit une URL relative ou incomplète en URL complète avec l'host API
 * @param imageUrl - URL de l'image (peut être relative ou complète)
 * @returns URL complète avec l'host API
 */
export function getFullImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null
  
  // Si l'URL est déjà complète (commence par http:// ou https://), la retourner telle quelle
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // Si l'URL commence par '/', c'est une URL relative depuis la racine
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`
  }
  
  // Sinon, considérer que c'est un chemin relatif et ajouter un '/' si nécessaire
  return `${API_BASE_URL}/${imageUrl}`
}

/**
 * Convertit une URL d'avatar en URL complète
 * @param avatarUrl - URL de l'avatar
 * @returns URL complète de l'avatar
 */
export function getFullAvatarUrl(avatarUrl: string | null | undefined): string | null {
  return getFullImageUrl(avatarUrl)
}

/**
 * Convertit une URL d'image de jeu/examen/chapitre en URL complète
 * @param gameImageUrl - URL de l'image
 * @returns URL complète de l'image
 */
export function getFullGameImageUrl(gameImageUrl: string | null | undefined): string | null {
  return getFullImageUrl(gameImageUrl)
}

/**
 * Combine classes avec clsx et tailwind-merge pour shadcn/ui
 * @param inputs - Classes CSS à combiner
 * @returns String de classes CSS optimisées
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatage des dates en français
 * @param date - Date à formater
 * @returns Date formatée en français
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Formatage des dates avec heure en français
 * @param date - Date à formater
 * @returns Date et heure formatées en français
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Validation d'email
 * @param email - Email à valider
 * @returns true si l'email est valide
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validation de numéro de téléphone international
 * @param phone - Numéro à valider
 * @returns true si le numéro est valide
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/
  return phoneRegex.test(phone)
}

/**
 * Génération d'un ID unique simple
 * @returns ID unique
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

/**
 * Nettoyage des chaînes HTML
 * @param html - Chaîne HTML à nettoyer
 * @returns Texte sans HTML
 */
export function stripHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}