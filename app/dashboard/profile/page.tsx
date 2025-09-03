"use client"

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import TwoFactorSetup from '@/components/two-factor-setup'
import { useCountries } from '@/hooks/useCountries'
import { 
  Mail, Shield, Edit2, X, 
  CheckCircle, AlertCircle, Camera, Key,
  MapPin, Phone, Award,
  UserCheck
} from 'lucide-react'
import { 
  updateProfile, 
  changePassword, 
  uploadAvatar, 
  sendVerificationEmail
} from '@/lib/profile-api'
import { getFullAvatarUrl } from '@/lib/utils'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    id_country: 0,
  })
  
  const { countries } = useCountries()
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (user) {
      const countryId = user.id_country?.id || (user as any).country?.id || 0
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone || (user as any).phone_number || '',
        id_country: countryId,
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const profileData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        id_country: formData.id_country || undefined
      }
      
      const result = await updateProfile(profileData)
      
      if (result.success) {
        setSuccess(result.message || 'Profil mis à jour avec succès')
        await refreshProfile()
        setIsEditing(false)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Erreur lors de la mise à jour du profil')
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la mise à jour du profil')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (!passwordData.current_password || !passwordData.new_password) {
      setError('Tous les champs sont requis')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await changePassword(passwordData)
      
      if (result.success) {
        setSuccess('message' in result ? result.message : 'Mot de passe modifié avec succès')
        setShowPasswordModal(false)
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: ''
        })
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const errorMessage = 'error' in result ? result.error : 'Erreur lors du changement de mot de passe'
        setError(errorMessage)
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('La taille du fichier ne doit pas dépasser 10MB')
        return
      }
      
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return

    setUploadingAvatar(true)
    setError('')
    setSuccess('')

    try {
      const result = await uploadAvatar(avatarFile)
      if (result.success) {
        setSuccess('Photo de profil mise à jour avec succès')
        await refreshProfile()
        setAvatarFile(null)
        setAvatarPreview(null)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Erreur lors de l\'upload de la photo')
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'upload de la photo')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSendVerificationEmail = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await sendVerificationEmail()
      if (result.success) {
        setSuccess(result.message || 'Email de vérification envoyé')
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(result.error || 'Erreur lors de l\'envoi de l\'email')
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'envoi de l\'email')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      const countryId = user.id_country?.id || (user as any).country?.id || 0
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone || (user as any).phone_number || '',
        id_country: countryId,
      })
    }
    setIsEditing(false)
    setError('')
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const handle2FAToggle = async () => {
    await refreshProfile()
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    )
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const avatarUrl = avatarPreview || (getFullAvatarUrl((user as any)?.avatar) || (user as any)?.avatar) || null
  const userInitials = user ? getInitials(user.first_name, user.last_name) : ''

  const profileCompletion = () => {
    let score = 0
    if (user?.first_name) score += 25
    if (user?.last_name) score += 25
    if (user?.email_verified) score += 25
    if (user?.phone) score += 25
    return score
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full p-6">
        {/* Profile Header Card */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            {/* Cover Gradient */}
            <div className="h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            <div className="px-8 pb-8">
              <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 -mt-16">
                {/* Avatar */}
                <div className="relative group">
                  <div className="relative">
                    <Avatar className="w-32 h-32 border-4 border-white dark:border-gray-800 shadow-2xl">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="icon"
                    className="absolute -bottom-2 -right-2 rounded-full shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 border-4 border-white dark:border-gray-800 hover:scale-110 transition-transform"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {user.first_name} {user.last_name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">{user.email}</p>
                  
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-4">
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1">
                      <Award className="h-3 w-3 mr-1" />
                      {user.role?.toUpperCase()}
                    </Badge>
                    {user.email_verified && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Email vérifié
                      </Badge>
                    )}
                    {user.google_auth_is_active && (
                      <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 px-3 py-1">
                        <Shield className="h-3 w-3 mr-1" />
                        2FA actif
                      </Badge>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6 max-w-sm">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400">Profil complété</span>
                      <span className="font-bold text-gray-900 dark:text-white">{profileCompletion()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500 relative overflow-hidden"
                        style={{ width: `${profileCompletion()}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <div>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    className={isEditing 
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-lg" 
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"}
                    size="lg"
                  >
                    {isEditing ? (
                      <>
                        <X className="h-5 w-5 mr-2" />
                        Annuler
                      </>
                    ) : (
                      <>
                        <Edit2 className="h-5 w-5 mr-2" />
                        Modifier le profil
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Avatar Upload Actions */}
              {avatarFile && (
                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                        <Camera className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium">Nouvelle photo sélectionnée</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cliquez sur appliquer pour confirmer</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                      >
                        {uploadingAvatar ? 'Upload...' : 'Appliquer'}
                      </Button>
                      <Button
                        onClick={() => {
                          setAvatarFile(null)
                          setAvatarPreview(null)
                        }}
                        variant="outline"
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        {(success || error) && (
          <div className="mb-6">
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Personal Information */}
          <Card className="h-fit shadow-xl border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">Informations personnelles</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                {/* First Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Prénom</Label>
                  {isEditing ? (
                    <div className="relative">
                      <Input
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        placeholder="Votre prénom"
                        className="pl-10 h-12 border-2 focus:border-indigo-500 transition-colors"
                      />
                      <UserCheck className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl border border-gray-200 dark:border-gray-700">
                      <UserCheck className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">{user.first_name || 'Non renseigné'}</span>
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nom</Label>
                  {isEditing ? (
                    <div className="relative">
                      <Input
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        placeholder="Votre nom"
                        className="pl-10 h-12 border-2 focus:border-indigo-500 transition-colors"
                      />
                      <UserCheck className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl border border-gray-200 dark:border-gray-700">
                      <UserCheck className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">{user.last_name || 'Non renseigné'}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Adresse Email</Label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <span className="font-medium flex-1">{user.email}</span>
                    {!user.email_verified && (
                      <Button
                        onClick={handleSendVerificationEmail}
                        size="sm"
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                      >
                        Vérifier
                      </Button>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Téléphone</Label>
                  {isEditing ? (
                    <div className="relative">
                      <Input
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        placeholder="+33 6 12 34 56 78"
                        className="pl-10 h-12 border-2 focus:border-indigo-500 transition-colors"
                      />
                      <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl border border-gray-200 dark:border-gray-700">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">{user.phone || 'Non renseigné'}</span>
                    </div>
                  )}
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pays</Label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-xl border border-gray-200 dark:border-gray-700">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{user.id_country?.name || 'Non renseigné'}</span>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={handleCancel} 
                    variant="outline" 
                    className="flex-1 h-12 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={loading} 
                    className="flex-1 h-12 font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Security */}
          <Card className="h-fit shadow-xl border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl">Sécurité du compte</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* 2FA */}
              <div className="group hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-violet-50 to-violet-50 dark:from-violet-900/20 dark:to-violet-900/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Authentification 2FA</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {user.google_auth_is_active 
                          ? '✅ Protection activée' 
                          : '⚠️ Protection désactivée'}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShow2FAModal(true)}
                    className={user.google_auth_is_active 
                      ? 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600' 
                      : 'bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white shadow-lg'}
                  >
                    {user.google_auth_is_active ? 'Gérer' : 'Activer'}
                  </Button>
                </div>
              </div>

              {/* Password */}
              <div className="group hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Key className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Mot de passe</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        Dernière modification il y a 30 jours
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowPasswordModal(true)} 
                    className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                  >
                    Modifier
                  </Button>
                </div>
              </div>

              {/* Email Verification */}
              <div className="group hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Vérification Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {user.email_verified 
                          ? '✅ Email confirmé' 
                          : '⚠️ En attente de confirmation'}
                      </p>
                    </div>
                  </div>
                  {user.email_verified ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-4 py-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Vérifié
                    </Badge>
                  ) : (
                    <Button 
                      onClick={handleSendVerificationEmail} 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                    >
                      Vérifier
                    </Button>
                  )}
                </div>
              </div>

              {/* Activity History */}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le mot de passe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Mot de passe actuel</Label>
              <Input
                type="password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                placeholder="Entrez votre mot de passe actuel"
              />
            </div>
            <div>
              <Label>Nouveau mot de passe</Label>
              <Input
                type="password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                placeholder="Entrez le nouveau mot de passe"
              />
            </div>
            <div>
              <Label>Confirmer le mot de passe</Label>
              <Input
                type="password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                placeholder="Confirmez le nouveau mot de passe"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowPasswordModal(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handlePasswordSubmit} disabled={loading} className="flex-1">
                {loading ? 'Changement...' : 'Changer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <TwoFactorSetup
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        userHas2FA={user.google_auth_is_active}
        onToggle2FA={handle2FAToggle}
      />
    </div>
  )
}