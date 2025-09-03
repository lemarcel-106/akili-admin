// Système de gestion des permissions basé sur les rôles

export type UserRole = 'ADMIN' | 'OPERATEUR_DE_SAISIE' | 'MANAGER' | 'USER' | 'admin' | 'super_admin' | 'data_entry_operator' | 'operateur_de_saisie'

export interface Permission {
  path: string
  label: string
  icon?: any
  subItems?: Permission[]
}

// Définition des permissions par rôle
export const rolePermissions: Record<string, string[]> = {
  // Formats pour opérateur de saisie (tous les formats possibles)
  'OPERATEUR_DE_SAISIE': [
    '/dashboard/management',           // Questions/Réponses (racine)
    '/dashboard/management/questions', // Questions
    '/dashboard/management/answers',   // Réponses  
    '/dashboard/profile',              // Mon profil seulement
  ],
  'operateur_de_saisie': [
    '/dashboard/management',           // Questions/Réponses (racine)
    '/dashboard/management/questions', // Questions
    '/dashboard/management/answers',   // Réponses  
    '/dashboard/profile',              // Mon profil seulement
  ],
  'data_entry_operator': [
    '/dashboard/management',           // Questions/Réponses (racine)
    '/dashboard/management/questions', // Questions
    '/dashboard/management/answers',   // Réponses  
    '/dashboard/profile',              // Mon profil seulement
  ],
  
  // Formats pour administrateurs (tous les formats possibles)
  'ADMIN': ['*'], // Accès total
  'admin': ['*'], // Accès total
  'super_admin': ['*'], // Accès total
  'SUPER_ADMIN': ['*'], // Accès total
  
  // Autres rôles
  'MANAGER': ['*'], // Accès total
  'manager': ['*'], // Accès total
  'USER': ['*'],     // Par défaut, accès total (à ajuster selon vos besoins)
  'user': ['*']      // Par défaut, accès total (à ajuster selon vos besoins)
}

// Fonction pour vérifier si un utilisateur a accès à une route
export function hasAccess(userRole: string, path: string): boolean {
  const role = userRole as UserRole
  const permissions = rolePermissions[role] || []
  
  // Si l'utilisateur a accès total
  if (permissions.includes('*')) {
    return true
  }
  
  // Vérifier si le chemin exact est autorisé
  if (permissions.includes(path)) {
    return true
  }
  
  // Vérifier si un chemin parent est autorisé
  return permissions.some(permission => 
    path.startsWith(permission + '/') || path === permission
  )
}

// Fonction pour déterminer si un rôle est un opérateur de saisie
function isDataEntryOperator(userRole: string): boolean {
  return ['OPERATEUR_DE_SAISIE', 'operateur_de_saisie', 'data_entry_operator'].includes(userRole)
}

// Fonction pour filtrer les éléments de menu selon le rôle
export function filterMenuByRole(menuItems: any[], userRole: string): any[] {
  // Si OPERATEUR_DE_SAISIE (tous formats), appliquer les restrictions
  if (isDataEntryOperator(userRole)) {
    return menuItems
      .filter(item => {
        // Autoriser Questions/Réponses
        if (item.href === '/dashboard/management') {
          return true
        }
        // Autoriser Paramètres mais seulement avec Mon Profil
        if (item.href === '/dashboard/settings') {
          return true
        }
        return false
      })
      .map(item => {
        // Filtrer les sous-éléments de Paramètres
        if (item.href === '/dashboard/settings' && item.subItems) {
          return {
            ...item,
            subItems: item.subItems.filter((sub: any) => 
              sub.href === '/dashboard/profile'
            )
          }
        }
        return item
      })
  }
  
  // Pour tous les autres rôles, retourner tous les éléments
  return menuItems
}

// Fonction pour obtenir la page de redirection selon le rôle
export function getDefaultRoute(userRole: string): string {
  if (isDataEntryOperator(userRole)) {
    return '/dashboard/management/questions'
  }
  
  return '/dashboard'
}

// Fonction pour vérifier si l'utilisateur peut accéder au dashboard principal
export function canAccessMainDashboard(userRole: string): boolean {
  return !isDataEntryOperator(userRole)
}