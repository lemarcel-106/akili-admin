export interface LoginResult {
  success: boolean;
  token?: string;
  user?: {
    email: string;
    prenom: string;
    nom: string;
    role: string;
  };
  requiresCode?: boolean;
  codeType?: 'email' | '2fa';
  message?: string;
}

export interface VerificationStrategyResponse {
  email: string;
  password: string;
  code_2fa: boolean;
}

export interface EmailVerificationResult {
  success: boolean;
  message: string;
  emailExists?: boolean;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  email_verified: boolean;
  google_auth_is_active: boolean;
  is_actived: boolean;
  id_country: {
    id: number;
    name: string;
    iso_code: string;
  };
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  verifyEmailAndSendCode: (email: string, password: string) => Promise<EmailVerificationResult>;
  login: (email: string, password: string, code?: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  sendVerificationCode: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}