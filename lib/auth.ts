

import { LoginResult, VerificationStrategyResponse, EmailVerificationResult, UserProfile } from '@/types/auth';

class AkiliAuth {
  private baseUrl: string;
  private accessToken: string | null;
  // NOTE: Refresh token non disponible avec l'API actuelle (problème de serializer)

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'https://api.mobile.akili.guru') {
    this.baseUrl = baseUrl;
    this.accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  }

  // Déterminer la stratégie de vérification (2FA ou email)
  async determineVerificationStrategy(email: string, password: string): Promise<VerificationStrategyResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/verification/send-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        // La réponse indique si 2FA est activé ou non
        return data as VerificationStrategyResponse;
      }
      
      return null;
    } catch (error) {
      console.error('Error determining verification strategy:', error);
      return null;
    }
  }

  // Vérifier l'email et mot de passe, puis déclencher l'envoi du code si nécessaire
  async verifyEmailAndSendCode(email: string, password: string): Promise<EmailVerificationResult> {
    try {
      const strategy = await this.determineVerificationStrategy(email, password);
      
      if (strategy) {
        if (strategy.code_2fa) {
          // 2FA activé - pas d'email envoyé
          return {
            success: true,
            emailExists: true,
            message: 'Authentification à deux facteurs activée. Utilisez Google Authenticator.'
          };
        } else {
          // Email de vérification envoyé
          return {
            success: true,
            emailExists: true,
            message: 'Code de vérification envoyé à votre email.'
          };
        }
      }
      
      return {
        success: false,
        emailExists: false,
        message: 'Identifiants invalides ou compte désactivé.'
      };
    } catch (error) {
      return {
        success: false,
        emailExists: false,
        message: 'Erreur de connexion au serveur'
      };
    }
  }

  // Connexion avec gestion des scénarios (2FA, email non vérifié, email vérifié)
  async login(email: string, password: string, code?: string): Promise<LoginResult> {
    try {
      // Vérifier que email et password ne sont pas vides
      if (!email || !password) {
        return {
          success: false,
          message: 'Email et mot de passe requis.'
        };
      }

      const payload: any = { email, password };
      if (code) {
        payload.code = code;
      }

      console.log('Login attempt with payload:', { email, passwordLength: password?.length });

      const response = await fetch(`${this.baseUrl}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        // CONNEXION RÉUSSIE - Format de réponse selon la nouvelle doc
        // L'API retourne token_access et pas de refresh token (problème identifié dans la doc)
        this.accessToken = data.token_access;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', this.accessToken || '');
          // Pas de refresh token à stocker pour le moment
          localStorage.removeItem('refresh_token');
          
          localStorage.setItem('user_info', JSON.stringify({
            email: data.email,
            prenom: data.prenom,
            nom: data.nom,
            role: data.role
          }));
          
          // Token JWT : access = 3 jours (pas de refresh disponible)
          document.cookie = `access_token=${this.accessToken}; path=/; max-age=${3 * 24 * 60 * 60}`;
          document.cookie = `isAuthenticated=true; path=/; max-age=${3 * 24 * 60 * 60}`;
        }

        return { 
          success: true, 
          token: data.token_access,
          user: {
            email: data.email,
            prenom: data.prenom,
            nom: data.nom,
            role: data.role
          }
        };
      } else {
        // Gestion des cas d'erreur selon la nouvelle stratégie
        if (data.message && data.message.includes('Code de vérification envoyé')) {
          // Email non vérifié, code envoyé automatiquement
          return { 
            success: false, 
            requiresCode: true,
            codeType: 'email',
            message: 'Un code de vérification a été envoyé à votre email.'
          };
        } else if (data.error && data.error.includes('Code de vérification')) {
          // Code invalide ou expiré
          return { 
            success: false, 
            requiresCode: true,
            codeType: 'email',
            message: data.error
          };
        } else if (data.error && data.error.includes('Code requis')) {
          // 2FA requis
          return { 
            success: false, 
            requiresCode: true,
            codeType: '2fa',
            message: 'Veuillez entrer votre code Google Authenticator'
          };
        } else if (response.status === 401) {
          // Identifiants invalides ou compte désactivé
          console.error('401 Error details:', data);
          
          const errorMessage = data.error || 
                              data.message || 
                              data.non_field_errors?.[0] || 
                              data.detail ||
                              'Identifiants invalides ou compte désactivé.';
          
          return { 
            success: false, 
            message: errorMessage
          };
        } else if (response.status === 400) {
          // Paramètres manquants ou invalides
          console.error('400 Error details:', data);
          
          // Vérifier différents formats d'erreur possibles
          const errorMessage = data.error || 
                              data.message || 
                              data.non_field_errors?.[0] || 
                              data.detail ||
                              'Email et mot de passe requis.';
          
          return { 
            success: false, 
            message: errorMessage
          };
        }
        
        // Traitement des erreurs non gérées
        const errorMessage = data.error || 
                            data.message || 
                            data.non_field_errors?.[0] || 
                            data.detail ||
                            'Erreur de connexion';
        
        return { 
          success: false, 
          message: errorMessage
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Erreur de connexion au serveur' 
      };
    }
  }

  async sendVerificationCode(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/verification/send-code/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message || 'Code de vérification envoyé avec succès.' };
      } else if (response.status === 401) {
        return { success: false, message: data.error || 'Identifiants invalides ou compte désactivé.' };
      } else if (response.status === 400) {
        return { success: false, message: data.error || 'Email et mot de passe requis.' };
      } else {
        return { success: false, message: data.error || 'Erreur lors de l\'envoi du code' };
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }

  async verifyEmail(email: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/verify-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || 'Code de vérification invalide' };
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }

  async getProfile(): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (response.status === 401) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          return this.getProfile();
        }
        return null;
      }

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async updateProfile(data: Partial<UserProfile>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/update/`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        return { success: true, message: result.message };
      } else {
        return { success: false, message: 'Erreur lors de la mise à jour du profil' };
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }

  async generate2FASecret(): Promise<{ secret?: string; qr_code?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-2fa-secret/`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        return await response.json();
      } else {
        return { error: 'Erreur lors de la génération du secret 2FA' };
      }
    } catch (error) {
      return { error: 'Erreur de connexion au serveur' };
    }
  }

  async activate2FA(code: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/active-2fa/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ code })
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || 'Erreur lors de l\'activation 2FA' };
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }

  async disable2FA(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/disable-2fa/`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: 'Erreur lors de la désactivation 2FA' };
      }
    } catch (error) {
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    // NOTE: L'API actuelle ne retourne pas de refresh token
    // Cette fonctionnalité n'est pas disponible tant que le serializer n'est pas corrigé
    console.warn('Refresh token not available - API serializer issue');
    
    // Pour le moment, on ne peut pas rafraîchir le token
    // L'utilisateur devra se reconnecter après expiration (3 jours)
    return null;
  }

  async logout(): Promise<void> {
    // Nettoyer immédiatement les tokens côté client
    if (typeof window !== 'undefined') {
      // Supprimer d'abord les tokens pour empêcher toute utilisation ultérieure
      this.accessToken = null;
      
      // Nettoyer le localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      
      // Nettoyer les cookies
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'isAuthenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      
      // Forcer la redirection immédiate vers la page de login
      window.location.href = '/login';
    }
    
    // Tentative de logout côté serveur (non bloquant)
    try {
      // NOTE: L'endpoint /logout/ n'est pas mappé dans les URLs de l'API
      console.warn('Server-side logout not available - endpoint not mapped in API');
    } catch (error) {
      console.warn('Erreur lors de la déconnexion côté serveur:', error);
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAuthHeaders(): { [key: string]: string } {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }
  
  // Nouvelle méthode pour créer un utilisateur (Admin only)
  async createUser(userData: {
    email: string;
    first_name: string;
    last_name: string;
    role: 'super_admin' | 'admin' | 'data_entry_operator';
    id_country?: number;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/user/create/`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        return { 
          success: true, 
          message: 'Utilisateur créé avec succès. Un email avec le mot de passe a été envoyé.',
          data 
        };
      } else if (response.status === 403) {
        return { 
          success: false, 
          message: 'Permissions insuffisantes. Seuls les admins peuvent créer des utilisateurs.' 
        };
      } else {
        return { 
          success: false, 
          message: data.error || 'Erreur lors de la création de l\'utilisateur' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Erreur de connexion au serveur' 
      };
    }
  }

  getUserInfo(): any {
    if (typeof window !== 'undefined') {
      const userInfo = localStorage.getItem('user_info');
      return userInfo ? JSON.parse(userInfo) : null;
    }
    return null;
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers
    };

    let response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        const newHeaders = {
          ...this.getAuthHeaders(),
          ...options.headers
        };
        response = await fetch(url, {
          ...options,
          headers: newHeaders
        });
      }
    }

    return response;
  }
}

// Export the getAuthHeaders function for external use
export async function getAuthHeaders(): Promise<{ [key: string]: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

export const auth = new AkiliAuth();