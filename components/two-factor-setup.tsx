"use client"

import { useState } from 'react'
import { Shield, QrCode, Copy, Check, X, Lock, AlertTriangle, Smartphone } from 'lucide-react'
import { enable2FA, confirm2FA, disable2FA } from '@/lib/profile-api'
import DigitInput from '@/components/digit-input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TwoFactorSetupProps {
  isOpen: boolean
  onClose: () => void
  userHas2FA: boolean
  onToggle2FA: () => void
}

export default function TwoFactorSetup({ isOpen, onClose, userHas2FA, onToggle2FA }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'password'>('setup')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)

  const generate2FASecret = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await enable2FA()
      if (result.success && result.data) {
        setSecret(result.data.secret_key)
        setQrCode(result.data.qr_code)
        setStep('verify')
      } else {
        setError(result.error || 'Erreur lors de la génération du secret')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const activate2FA = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await confirm2FA(verificationCode)
      if (result.success) {
        setSuccess(result.message || '2FA activé avec succès')
        onToggle2FA()
        setTimeout(() => {
          onClose()
          resetState()
        }, 2000)
      } else {
        setError(result.error || 'Code de vérification invalide')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!password || !verificationCode) {
      setError('Mot de passe et code de vérification requis')
      return
    }
    
    setLoading(true)
    setError('')
    
    console.log('Attempting to disable 2FA with:', {
      password: password ? '***' : 'empty',
      verificationCode: verificationCode
    })
    
    try {
      const result = await disable2FA()
      console.log('2FA disable result:', result)
      
      if (result.success) {
        setSuccess(result.message || '2FA désactivé avec succès')
        onToggle2FA()
        setTimeout(() => {
          onClose()
          resetState()
        }, 2000)
      } else {
        console.error('Disable 2FA failed:', result)
        setError(result.error || 'Erreur lors de la désactivation')
      }
    } catch (error) {
      console.error('Disable 2FA exception:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erreur lors de la copie:', error)
    }
  }

  const resetState = () => {
    setStep('setup')
    setQrCode('')
    setSecret('')
    setVerificationCode('')
    setPassword('')
    setError('')
    setSuccess('')
    setCopied(false)
  }

  const handleClose = () => {
    onClose()
    resetState()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-xl font-bold">Authentification 2FA</div>
              <div className="text-sm font-normal text-muted-foreground">
                {userHas2FA ? 'Gérer votre authentification' : 'Sécurisez votre compte'}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <X className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {!userHas2FA ? (
            // Activation du 2FA
            <>
              {step === 'setup' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-start gap-3">
                      <Smartphone className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900 mb-1">Protection renforcée</h4>
                        <p className="text-sm text-green-800 leading-relaxed">
                          L&apos;authentification à deux facteurs ajoute une couche de sécurité supplémentaire 
                          en demandant un code généré par votre téléphone.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Mot de passe actuel
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Entrez votre mot de passe"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Requis pour confirmer l&apos;activation
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={generate2FASecret}
                      disabled={loading || !password}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-solid border-current border-r-transparent animate-spin rounded-full mr-2" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <QrCode className="h-4 w-4 mr-2" />
                          Générer QR Code
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {step === 'verify' && (
                <div className="space-y-4">
                  {/* QR Code Section */}
                  <div className="bg-gradient-to-r from-violet-50 to-violet-50 rounded-lg p-4 border border-violet-200">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <QrCode className="h-5 w-5 text-violet-600" />
                        <h4 className="font-medium text-violet-900">Scannez le QR Code</h4>
                      </div>
                      <p className="text-sm text-violet-800 mb-4">
                        Utilisez <strong>Google Authenticator</strong> ou une autre app 2FA
                      </p>
                      <div className="flex justify-center">
                        <div className="bg-white p-3 rounded-xl shadow-sm border">
                          <img src={qrCode} alt="QR Code" className="w-36 h-36" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Manual Secret Key */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <Label className="text-sm font-medium mb-2 block">
                      Clé secrète manuelle (optionnel)
                    </Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-background p-2 rounded border font-mono break-all">
                        {secret}
                      </code>
                      <Button
                        onClick={copySecret}
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Verification Code Input */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Code de vérification (6 chiffres)
                    </Label>
                    <div className="flex justify-center">
                      <DigitInput
                        length={6}
                        value={verificationCode}
                        onChange={setVerificationCode}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Entrez le code généré par votre application 2FA
                    </p>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep('setup')}
                      className="flex-1"
                    >
                      Retour
                    </Button>
                    <Button
                      onClick={activate2FA}
                      disabled={loading || verificationCode.length !== 6}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-solid border-current border-r-transparent animate-spin rounded-full mr-2" />
                          Activation...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Activer 2FA
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
          </>
          ) : (
            // Désactivation du 2FA
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-4 border border-violet-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-violet-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-violet-900 mb-1">
                      Désactiver l&apos;authentification 2FA
                    </h4>
                    <p className="text-sm text-violet-800 leading-relaxed">
                      Cette action réduira la sécurité de votre compte. Vous devez fournir 
                      votre mot de passe et un code 2FA valide.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="disable_password" className="text-sm font-medium">
                    Mot de passe actuel
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="disable_password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe"
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Code 2FA (6 chiffres)</Label>
                  <div className="flex justify-center">
                    <DigitInput
                      length={6}
                      value={verificationCode}
                      onChange={setVerificationCode}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Code généré par votre application 2FA
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisable2FA}
                  disabled={loading || !password || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-solid border-current border-r-transparent animate-spin rounded-full mr-2" />
                      Désactivation...
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Désactiver 2FA
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}