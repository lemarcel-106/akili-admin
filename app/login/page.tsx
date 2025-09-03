"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import DigitInput from "@/components/digit-input"

export default function LoginPage() {
  const router = useRouter()
  const { login, sendVerificationCode, isAuthenticated } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)  // Étape 1: email + password, Étape 2: code de vérification
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [verificationMessage, setVerificationMessage] = useState("")
  const [isResendingCode, setIsResendingCode] = useState(false)
  const [requiresGoogleAuth, setRequiresGoogleAuth] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  // ÉTAPE 1 : Vérifier email + mot de passe et gérer les différents scénarios
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation et nettoyage des champs
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    
    if (!trimmedEmail || !trimmedPassword) {
      setError("Veuillez remplir tous les champs")
      setLoading(false)
      return
    }

    console.log('Attempting login with:', { email: trimmedEmail, passwordLength: trimmedPassword.length })

    try {
      // D'abord, déterminer la stratégie de vérification
      const strategyResponse = await fetch('https://api.mobile.akili.guru/verification/send-code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword })
      });

      if (strategyResponse.ok) {
        const strategy = await strategyResponse.json();
        console.log('Verification strategy:', strategy);
        
        // Si 2FA est activé
        if (strategy.code_2fa === true) {
          setStep(2)
          setRequiresGoogleAuth(true)
          setVerificationMessage('Entrez le code de Google Authenticator')
          setError("")
          return
        } else if (strategy.code_2fa === false) {
          // Code envoyé par email
          setStep(2)
          setRequiresGoogleAuth(false)
          setVerificationMessage('Un code de vérification a été envoyé à votre email')
          setError("")
          return
        }
      }

      // Si la stratégie échoue, essayer une connexion directe
      const loginResult = await login(trimmedEmail, trimmedPassword)
      
      if (loginResult.success) {
        // Email déjà vérifié, connexion réussie
        // Utiliser replace pour éviter l'historique et window.location pour une redirection immédiate
        window.location.href = '/dashboard'
      } else if (loginResult.requiresCode) {
        setStep(2)
        if (loginResult.codeType === '2fa') {
          // 2FA avec Google Authenticator
          setRequiresGoogleAuth(true)
          setVerificationMessage('Entrez le code de Google Authenticator')
        } else {
          // Email non vérifié, code envoyé automatiquement
          setVerificationMessage(loginResult.message || 'Code de vérification envoyé à votre email')
        }
        setError("")
      } else {
        // Erreur d'identifiants
        setError(loginResult.message || 'Identifiants invalides')
      }
    } catch (error) {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  // ÉTAPE 2 : Vérification du code (email ou Google Authenticator)
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const trimmedCode = verificationCode.trim()
    if (!trimmedCode) {
      setError("Veuillez entrer le code de vérification")
      setLoading(false)
      return
    }

    try {
      const result = await login(email.trim(), password.trim(), trimmedCode)
      
      if (result.success) {
        // CONNEXION RÉUSSIE
        // Utiliser window.location pour une redirection immédiate après OTP
        window.location.href = '/dashboard'
      } else {
        // Erreurs de connexion ou code invalide
        setError(result.message || "Code de vérification invalide ou expiré")
        if (result.message?.includes('code')) {
          setVerificationCode("")  // Vider le code invalide
        }
      }
    } catch (error) {
      setError("Erreur de connexion au serveur")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setStep(1)
    setVerificationCode("")
    setError("")
    setVerificationMessage("")
    setRequiresGoogleAuth(false)
  }

  const handleResendCode = async () => {
    if (requiresGoogleAuth) {
      setError("Utilisez votre application Google Authenticator")
      return
    }
    
    setIsResendingCode(true)
    setError("")
    
    try {
      const result = await sendVerificationCode(email, password)
      
      if (result.success) {
        setVerificationMessage("Nouveau code envoyé !")
        setTimeout(() => setVerificationMessage(result.message), 3000)
      } else {
        setError(result.message || "Erreur lors du renvoi du code")
      }
    } catch (error) {
      setError("Erreur lors du renvoi du code")
    } finally {
      setIsResendingCode(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/login-pattern.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#f8fafc"
      }}
      suppressHydrationWarning
    >
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-white/95 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/95" suppressHydrationWarning></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-secondary/5 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-primary/10 rounded-full blur-lg"></div>
      
      {/* Main container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo section in white card */}
        <div className="text-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 inline-block">
            <Image 
              src="/images/logo.png"
              alt="AKILI Logo" 
              width={96}
              height={96}
              className="object-contain mx-auto"
              priority
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {step === 1 ? "Connexion" : "Vérification"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {step === 1 
                ? "Connectez-vous à votre compte"
                : verificationMessage || "Saisissez le code de vérification"}
            </p>
            {step === 2 && (
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">
                🔑 Étape {step}/2 - Connexion sécurisée
              </div>
            )}
          </div>
          
          {step === 1 ? (
            // ÉTAPE 1 : Email + Password
            <form onSubmit={handleStep1Submit} className="space-y-6">
              {/* Email field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Password field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-4 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
              
              {/* Info sur la sécurité */}
              <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 px-4 py-3 rounded-2xl text-sm">
                <div className="font-medium mb-1">🔒 Connexion sécurisée</div>
                <div className="text-xs">
                  Vos identifiants sont vérifiés avant l&apos;envoi d&apos;un code de vérification.
                </div>
              </div>
            </form>
          ) : (
            // ÉTAPE 2 : Code de vérification
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {requiresGoogleAuth ? (
                    <>Utilisez Google Authenticator<br/>
                    <span className="font-semibold text-primary">{email}</span></>
                  ) : (
                    <>Code envoyé à<br/>
                    <span className="font-semibold text-primary">{email}</span></>
                  )}
                </p>
              </div>

              {/* Verification code input */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center block">
                  {requiresGoogleAuth ? "Code Google Authenticator (6 chiffres)" : "Code de vérification (6 chiffres)"}
                </label>
                <div className="flex justify-center">
                  <DigitInput
                    length={6}
                    value={verificationCode}
                    onChange={setVerificationCode}
                    disabled={loading}
                    className="gap-2 sm:gap-3"
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-4 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Vérification...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Vérifier le code
                  </>
                )}
              </button>
              
              {/* Resend code button - only for email verification */}
              {!requiresGoogleAuth && (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading || isResendingCode}
                  className="w-full py-3 text-primary hover:text-primary/80 transition-colors duration-200 font-medium disabled:opacity-50"
                >
                  {isResendingCode ? (
                    <>
                      <div className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mr-2"></div>
                      Renvoi en cours...
                    </>
                  ) : (
                    "Renvoyer le code"
                  )}
                </button>
              )}
              
              <button
                type="button"
                onClick={handleBackToLogin}
                disabled={loading}
                className="w-full py-3 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200 font-medium"
              >
                ← Retour à la connexion
              </button>
            </form>
          )}
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
          © 2024 AKILI Mobile Administration. Tous droits réservés.
        </div>
      </div>
    </div>
  )
}