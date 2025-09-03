'use client'

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { LoginResult, UserProfile, EmailVerificationResult, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      if (auth.isAuthenticated()) {
        // Charger d'abord les infos basiques depuis le localStorage
        const userInfo = auth.getUserInfo();
        if (userInfo) {
          const basicProfile: UserProfile = {
            id: 0,
            email: userInfo.email,
            first_name: userInfo.prenom,
            last_name: userInfo.nom,
            role: userInfo.role,
            phone: '',
            email_verified: true,
            google_auth_is_active: false,
            is_actived: true,
            id_country: { id: 0, name: '', iso_code: '' }
          };
          setUser(basicProfile);
          setIsAuthenticated(true);
          setLoading(false); // Terminer le chargement imm\u00e9diatement
          
          // Puis charger le profil complet en arri\u00e8re-plan
          try {
            const { getProfile } = await import('@/lib/profile-api');
            const response = await getProfile();
            if (response.success && response.data) {
              const roleFromBackend = (response.data as any).role || userInfo.role || 'user';
              const mapped: UserProfile = {
                id: response.data.id,
                email: response.data.email,
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                role: roleFromBackend,
                phone: (response.data as any).phone || (response.data as any).phone_number || '',
                email_verified: (response.data as any).email_verified ?? (response.data as any).is_email_verified ?? false,
                google_auth_is_active: (response.data as any).google_auth_is_active ?? (response.data as any).two_factor_enabled ?? false,
                is_actived: true,
                id_country: response.data.country ? {
                  id: response.data.country.id,
                  name: response.data.country.name,
                  iso_code: response.data.country.code
                } : (response.data as any).id_country ? {
                  id: (response.data as any).id_country.id,
                  name: (response.data as any).id_country.name,
                  iso_code: (response.data as any).id_country.iso_code || (response.data as any).id_country.code || ''
                } : { id: 0, name: '', iso_code: '' }
              }
              ;(mapped as any).avatar = (response.data as any).avatar || (response.data as any).avatar_url || null
              ;(mapped as any).last_login = (response.data as any).last_login || null
              setUser(mapped);
            } else {
              // Si le profil n'est pas r\u00e9cup\u00e9rable, d\u00e9connecter
              localStorage.removeItem('access_token');
              localStorage.removeItem('user_info');
              setUser(null);
              setIsAuthenticated(false);
            }
          } catch (e) {
            console.log('Erreur lors de la r\u00e9cup\u00e9ration du profil complet:', e);
          }
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const verifyEmailAndSendCode = async (email: string, password: string): Promise<EmailVerificationResult> => {
    return await auth.verifyEmailAndSendCode(email, password);
  };

  const login = async (email: string, password: string, code?: string): Promise<LoginResult> => {
    const result = await auth.login(email, password, code);

    if (result.success && result.token) {
      // Stocker immédiatement les infos basiques de l'utilisateur
      if (result.user) {
        const basicProfile: UserProfile = {
          id: 0, // Sera mis à jour après
          email: result.user.email,
          first_name: result.user.prenom,
          last_name: result.user.nom,
          role: result.user.role,
          phone: '',
          email_verified: true, // Si on est arrivé ici, l'email est vérifié
          google_auth_is_active: false,
          is_actived: true,
          id_country: { id: 0, name: '', iso_code: '' }
        };
        setUser(basicProfile);
        setIsAuthenticated(true);
        
        // Récupérer le profil complet en arrière-plan (non bloquant)
        setTimeout(async () => {
          try {
            const { getProfile } = await import('@/lib/profile-api');
            const response = await getProfile();
            if (response.success && response.data) {
              const finalRole = result.user?.role || (response.data as any).role || 'user';
              const mapped: UserProfile = {
                id: response.data.id,
                email: response.data.email,
                first_name: response.data.first_name,
                last_name: response.data.last_name,
                role: finalRole,
                phone: (response.data as any).phone_number || (response.data as any).phone || '',
                email_verified: (response.data as any).is_email_verified === true,
                google_auth_is_active: (response.data as any).two_factor_enabled === true,
                is_actived: true,
                id_country: response.data.country ? {
                  id: response.data.country.id,
                  name: response.data.country.name,
                  iso_code: response.data.country.code
                } : { id: 0, name: '', iso_code: '' }
              }
              ;(mapped as any).avatar = (response.data as any).avatar || (response.data as any).avatar_url || null
              setUser(mapped);
            }
          } catch (e) {
            console.log('Erreur lors de la récupération du profil complet:', e);
          }
        }, 100);
      }
    }

    return result;
  };

  const logout = async () => {
    // Nettoyer imm\u00e9diatement l'\u00e9tat local
    setUser(null);
    setIsAuthenticated(false);
    
    // Appeler auth.logout() qui g\u00e8re la redirection
    await auth.logout();
  };

  const sendVerificationCode = async (email: string, password: string) => {
    return await auth.sendVerificationCode(email, password);
  };

  const verifyEmail = async (email: string, code: string) => {
    return await auth.verifyEmail(email, code);
  };

  const refreshProfile = async () => {
    if (auth.isAuthenticated()) {
      try {
        // Utiliser la nouvelle API backend pour récupérer le profil
        const { getProfile } = await import('@/lib/profile-api');
        const response = await getProfile();
        
        if (response.success && response.data) {
          // Adapter le format de la réponse backend au format attendu
          const updatedUser: UserProfile = {
            id: response.data.id,
            email: response.data.email,
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            role: (response.data as any).role || user?.role || 'user',
            phone: (response.data as any).phone || (response.data as any).phone_number || '',
            email_verified: (response.data as any).email_verified ?? (response.data as any).is_email_verified ?? false,
            google_auth_is_active: (response.data as any).google_auth_is_active ?? (response.data as any).two_factor_enabled ?? false,
            is_actived: true, // Assumé actif si connecté
            id_country: (response.data as any).country ? {
              id: (response.data as any).country.id,
              name: (response.data as any).country.name,
              iso_code: (response.data as any).country.code
            } : (response.data as any).id_country ? {
              id: (response.data as any).id_country.id,
              name: (response.data as any).id_country.name,
              iso_code: (response.data as any).id_country.iso_code || (response.data as any).id_country.code || ''
            } : user?.id_country || { id: 0, name: '', iso_code: '' }
          };
          ;(updatedUser as any).avatar = (response.data as any).avatar || (response.data as any).avatar_url || null
          ;(updatedUser as any).last_login = (response.data as any).last_login || null
          
          setUser(updatedUser);
        } else {
          throw new Error(response.error || 'Erreur lors de la récupération du profil');
        }
      } catch (error) {
        console.error('Erreur lors du rafraîchissement du profil:', error);
        // Fallback sur l'ancienne méthode si la nouvelle échoue
        const profile = await auth.getProfile();
        if (profile) {
          setUser(profile);
        }
      }
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    verifyEmailAndSendCode,
    login,
    logout,
    sendVerificationCode,
    verifyEmail,
    refreshProfile,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
