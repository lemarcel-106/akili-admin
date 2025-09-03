"use client"

import { useState, useEffect } from 'react'
import RoleGuard from '@/components/role-guard'
import { useRouter } from 'next/navigation'
import { getUsers, createUser, toggleUserStatus, deleteUser, getUserStats, User, CreateUserData, UserStats } from '@/lib/users-api'
import { useCountries } from '@/hooks/useCountries'
import { 
  Users, 
  Plus, 
  Trash2, 
  Shield, 
  ShieldOff, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  Eye,
  Loader2,
  AlertTriangle,
  MoreVertical,
  Globe,
  Activity,
  Clock,
  Flag,
  TrendingUp,
  ChevronDown
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function UsersManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const { countries } = useCountries()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState(countries[0] || { id: 1, name: "Maroc", code: "MA" })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showToggleModal, setShowToggleModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  
  const [createForm, setCreateForm] = useState<CreateUserData>({
    first_name: '',
    last_name: '',
    email: '',
    role: 'operateur_de_saisie',
    id_country: 1
  })

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchUsers()
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry])

  useEffect(() => {
    if (countries.length > 0) {
      if (!selectedCountry) {
        setSelectedCountry(countries[0])
      }
      // Mettre à jour le formulaire avec le premier pays disponible si c'est toujours 1
      if (createForm.id_country === 1 && countries[0]) {
        setCreateForm(prev => ({ ...prev, id_country: countries[0].id }))
      }
    }
  }, [countries, selectedCountry, createForm.id_country])

  const fetchStats = async () => {
    try {
      const response = await getUserStats()
      if (response.data) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    const result = await getUsers()
    if (result.success) {
      const list = Array.isArray(result.users) ? result.users : []
      setUsers(list)
    } else {
      if ((result as any).status === 401) {
        setError('Session expirée. Redirection vers la connexion...')
        setTimeout(() => router.push('/login'), 1200)
      } else {
        setError(result.error || 'Erreur lors de la récupération des utilisateurs')
      }
    }
    setLoading(false)
  }

  const handleCreateUser = async () => {
    if (!createForm.first_name || !createForm.last_name || !createForm.email) {
      setError('Tous les champs sont requis')
      return
    }

    setFormLoading(true)
    setError('')
    setSuccess('')

    // Debug: Vérifier les données envoyées
    console.log('📤 Données envoyées pour créer l\'utilisateur:', createForm)
    console.log('📤 ID du pays sélectionné:', createForm.id_country)

    try {
      const response = await createUser(createForm)
      
      if (response.data) {
        setSuccess('Utilisateur créé avec succès. Il recevra un email avec ses informations de connexion.')
        setShowCreateModal(false)
        // Réinitialiser le formulaire avec le bon pays par défaut
        const defaultCountryId = selectedCountry?.id || countries[0]?.id || 1
        setCreateForm({
          first_name: '',
          last_name: '',
          email: '',
          role: 'operateur_de_saisie',
          id_country: defaultCountryId
        })
        fetchUsers()
        fetchStats()
      } else if (response.error) {
        setError(response.error)
      }
    } catch (err) {
      setError("Erreur lors de la création de l'utilisateur")
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleUserStatus = async () => {
    if (!selectedUser) return

    setFormLoading(true)
    setError('')
    setSuccess('')

    const result = await toggleUserStatus(selectedUser.id, !selectedUser.is_actived)
    if (result.success) {
      setSuccess(result.message || 'Statut mis à jour avec succès')
      setShowToggleModal(false)
      setSelectedUser(null)
      fetchUsers()
      fetchStats()
    } else {
      setError(result.error || 'Erreur lors du changement de statut')
    }
    setFormLoading(false)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await deleteUser(selectedUser.id)
      
      if (response.status === 204 || response.status === 200) {
        setSuccess('Utilisateur supprimé avec succès')
        setShowDeleteModal(false)
        setSelectedUser(null)
        fetchUsers()
        fetchStats()
      } else if (response.status >= 200 && response.status < 300) {
        setSuccess('Utilisateur supprimé avec succès')
        setShowDeleteModal(false)
        setSelectedUser(null)
        fetchUsers()
        fetchStats()
      } else {
        setError(response.error || "Erreur lors de la suppression")
      }
    } catch (err) {
      setError("Erreur lors de la suppression de l'utilisateur")
    } finally {
      setFormLoading(false)
    }
  }

  const openToggleModal = (user: User) => {
    setSelectedUser(user)
    setShowToggleModal(true)
  }

  const openDeleteModal = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const openDetailsModal = (user: User) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  const sourceUsers = Array.isArray(users) ? users : []
  const filteredUsers = sourceUsers.filter(user => {
    const firstName = (user.first_name || '').toLowerCase()
    const lastName = (user.last_name || '').toLowerCase()
    const email = (user.email || '').toLowerCase()
    const q = (searchTerm || '').toLowerCase()

    const matchesSearch = firstName.includes(q) || lastName.includes(q) || email.includes(q)

    const role = user.role || ''
    const matchesRole = roleFilter === 'all' || role === roleFilter

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_actived) || 
      (statusFilter === 'blocked' && !user.is_actived)

    return matchesSearch && matchesRole && matchesStatus
  })

  const uniqueRoles = Array.from(
    new Set(
      users
        .map(user => user.role || '')
        .filter(Boolean)
    )
  )

  // Stats cards data dans le style de la page statistiques
  const statsCards = [
    {
      title: "Total Utilisateurs",
      subtitle: "Tous les utilisateurs",
      value: stats?.total_users || 0,
      icon: Users,
      trend: "+4.2%",
      isPositive: true
    },
    {
      title: "Utilisateurs Actifs", 
      subtitle: "Comptes actifs",
      value: stats?.active_users || 0,
      icon: UserCheck,
      trend: "+7.1%",
      isPositive: true
    },
    {
      title: "Utilisateurs Bloqués",
      subtitle: "Comptes suspendus",
      value: stats?.blocked_users || 0,
      icon: UserX,
      trend: "-2.3%",
      isPositive: false
    }
  ]

  if (!mounted) return null

  return (
    <RoleGuard requiredPath="/dashboard/settings/users">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-6 space-y-8">
        {/* Header principal */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Gestion des Utilisateurs
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Gérez les comptes et permissions par région
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">

              {/* Heure */}
              {mounted && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <Clock className="h-4 w-4 text-violet-600" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {currentTime.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}

              <Button
                onClick={() => {
                  // S'assurer que le pays est bien défini avant d'ouvrir le modal
                  const defaultCountryId = selectedCountry?.id || countries[0]?.id || 1
                  setCreateForm(prev => ({ ...prev, id_country: defaultCountryId }))
                  setShowCreateModal(true)
                }}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-200 px-6 py-2.5 font-semibold"
                size="default"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nouvel Utilisateur
              </Button>
            </div>
          </div>
        </motion.div>


        {/* Notifications */}
        {(success || error) && (
          <div className="space-y-4">
            {success && (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-300 ml-2">
                  {success}
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-300 ml-2">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Cards Statistiques */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCountry?.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {statsCards.map((metric, index) => {
              const Icon = metric.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group"
                >
                  <Card className="relative overflow-hidden bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl border-0">
                    <CardContent className="p-6 relative">
                      <div className="space-y-4 relative z-10">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                            {metric.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {metric.subtitle}
                          </p>
                        </div>

                        <div className="flex items-baseline justify-between">
                          <span className="text-4xl font-black text-gray-900 dark:text-gray-100">
                            {loading ? <Skeleton className="h-10 w-16" /> : metric.value}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                              <Activity className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                            </div>
                            <span className={`text-sm font-bold flex items-center gap-1 px-2 py-1 rounded-full ${metric.isPositive ? "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30" : "text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30"}`}>
                              <TrendingUp className={"h-3 w-3 " + (metric.isPositive ? '' : 'rotate-180')} />
                              {metric.trend}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Icône incrustée */}
                      <div className="absolute bottom-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
                        <Icon className="h-24 w-24 text-violet-600 dark:text-violet-400" />
                      </div>

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-950/20 dark:to-transparent rounded-2xl" />
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* Table des Utilisateurs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Users className="h-6 w-6 text-violet-600" />
                    Liste des Utilisateurs
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Liste des utilisateurs avec leurs rôles et statuts
                  </CardDescription>
                </div>

                {/* Filtres et recherche */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  {/* Recherche */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher utilisateur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64 border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  {/* Filtres rôle et statut */}
                  <div className="flex gap-2">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous rôles</SelectItem>
                        {uniqueRoles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="active">Actifs</SelectItem>
                        <SelectItem value="blocked">Bloqués</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Badge 
                  variant="secondary" 
                  className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                >
                  {filteredUsers.length} utilisateurs
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-bold">Utilisateur</TableHead>
                      <TableHead className="font-bold">Email</TableHead>
                      <TableHead className="font-bold">Rôle</TableHead>
                      <TableHead className="font-bold">Statut</TableHead>
                      <TableHead className="font-bold">Pays</TableHead>
                      <TableHead className="font-bold">Créé le</TableHead>
                      <TableHead className="font-bold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <AnimatePresence mode="wait">
                        {filteredUsers.map((user, index) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                                    {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                                    {user.first_name} {user.last_name}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                <Mail className="h-4 w-4" />
                                <span>{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={cn(
                                  "font-semibold",
                                  user.role === "admin" 
                                    ? "border-violet-200 text-violet-700 bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-900/30"
                                    : "border-violet-200 text-violet-700 bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-900/30"
                                )}
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {user.is_actived ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-green-700 dark:text-green-400 font-medium">Actif</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-red-700 dark:text-red-400 font-medium">Bloqué</span>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {countries.find(c => c.id === user.id_country)?.name || 'N/A'}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {user.date_joined ? new Date(user.date_joined).toLocaleDateString('fr-FR') : 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openDetailsModal(user)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Voir détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openToggleModal(user)}>
                                    {user.is_actived ? (
                                      <>
                                        <ShieldOff className="mr-2 h-4 w-4" />
                                        Bloquer
                                      </>
                                    ) : (
                                      <>
                                        <Shield className="mr-2 h-4 w-4" />
                                        Débloquer
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => openDeleteModal(user)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    )}
                  </TableBody>
                </Table>
                
                {!loading && filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      Aucun utilisateur trouvé
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Essayez d&apos;ajuster vos filtres de recherche
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de création d'utilisateur */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="pb-6 border-b border-gray-200 dark:border-gray-700">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Création d'un Nouvel Utilisateur
                </span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2 text-base">
                Remplissez les informations ci-dessous pour créer un nouveau compte utilisateur.
                Les identifiants de connexion seront automatiquement envoyés par email.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-8">
              {/* Section Informations Personnelles */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-6 h-[2px] bg-violet-500 rounded-full"></div>
                  Informations Personnelles
                </h3>
                <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Prénom <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="first_name"
                      value={createForm.first_name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Jean"
                      className="pl-4 pr-10 h-12 border-gray-300 dark:border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 rounded-lg"
                    />
                    {createForm.first_name && (
                      <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Nom <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="last_name"
                      value={createForm.last_name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Dupont"
                      className="pl-4 pr-10 h-12 border-gray-300 dark:border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 rounded-lg"
                    />
                    {createForm.last_name && (
                      <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
                </div>
              </div>
              
              {/* Section Contact */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-6 h-[2px] bg-violet-500 rounded-full"></div>
                  Contact
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Adresse Email <span className="text-red-500">*</span>
                  </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="jean.dupont@exemple.com"
                    className="pl-10 pr-10 h-12 border-gray-300 dark:border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 rounded-lg"
                  />
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  {createForm.email && createForm.email.includes('@') && (
                    <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                  )}
                </div>
                {createForm.email && !createForm.email.includes('@') && (
                  <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Veuillez entrer une adresse email valide
                  </p>
                )}
                </div>
              </div>
              
              {/* Section Configuration */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-6 h-[2px] bg-violet-500 rounded-full"></div>
                  Configuration du Compte
                </h3>
                <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Rôle Utilisateur <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={createForm.role} 
                    onValueChange={(value: string) => setCreateForm(prev => ({ ...prev, role: value as any }))}
                  >
                    <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-lg">
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="super_admin" className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500">
                            <Shield className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="font-medium">Super Administrateur</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin" className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-gradient-to-r from-violet-500 to-purple-500">
                            <Shield className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="font-medium">Administrateur</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="operateur_de_saisie" className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-gradient-to-r from-blue-500 to-cyan-500">
                            <Users className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="font-medium">Opérateur de Saisie</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Pays d'Affectation <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={createForm.id_country.toString()} 
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, id_country: parseInt(value) }))}
                  >
                    <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-lg">
                      <SelectValue placeholder="Sélectionner un pays" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id.toString()} className="py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-6 rounded overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                              <Globe className="h-4 w-4 text-gray-500" />
                            </div>
                            <span className="font-medium">{country.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                </div>
              </div>

              {/* Info box */}
              <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 rounded-xl">
                <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
                  L'utilisateur recevra ses identifiants de connexion par email. Assurez-vous que l'adresse email est correcte.
                </AlertDescription>
              </Alert>
            </div>
            
            <div className="flex gap-3 pt-6 mt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false)
                  // Réinitialiser le formulaire avec le bon pays
                  const defaultCountryId = selectedCountry?.id || countries[0]?.id || 1
                  setCreateForm({ first_name: '', last_name: '', email: '', role: 'operateur_de_saisie', id_country: defaultCountryId })
                }}
                className="flex-1 h-12 rounded-lg font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                disabled={formLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateUser}
                disabled={formLoading || !createForm.first_name || !createForm.last_name || !createForm.email || !createForm.email.includes('@')}
                className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 transition-all duration-200 rounded-lg font-semibold"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer l'utilisateur
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de toggle statut */}
        <Dialog open={showToggleModal} onOpenChange={setShowToggleModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedUser?.is_actived 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {selectedUser?.is_actived ? <ShieldOff className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                </div>
                {selectedUser?.is_actived ? 'Bloquer' : 'Débloquer'} l&apos;utilisateur
              </DialogTitle>
              <DialogDescription>
                {selectedUser?.is_actived 
                  ? `Êtes-vous sûr de vouloir bloquer l&apos;accès de ${selectedUser?.first_name} ${selectedUser?.last_name} ?`
                  : `Êtes-vous sûr de vouloir débloquer l&apos;accès de ${selectedUser?.first_name} ${selectedUser?.last_name} ?`
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowToggleModal(false)}
                className="flex-1"
                disabled={formLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleToggleUserStatus}
                disabled={formLoading}
                variant={selectedUser?.is_actived ? "destructive" : "default"}
                className={`flex-1 ${
                  !selectedUser?.is_actived ? 'bg-green-600 hover:bg-green-700' : ''
                }`}
              >
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    {selectedUser?.is_actived ? (
                      <>
                        <ShieldOff className="h-4 w-4 mr-2" />
                        Bloquer
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Débloquer
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de suppression */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                Supprimer l&apos;utilisateur
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer définitivement le compte de <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong> ? Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
                disabled={formLoading}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={formLoading}
                className="flex-1"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de détails utilisateur */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-violet-100 text-violet-600">
                    {selectedUser?.first_name?.charAt(0)}{selectedUser?.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                Détails de {selectedUser?.first_name} {selectedUser?.last_name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Rôle</Label>
                    <Badge className="mt-1">{selectedUser.role}</Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Statut</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedUser.is_actived ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Actif</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-600">Bloqué</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Pays</Label>
                    <p className="font-medium">
                      {countries.find(c => c.id === selectedUser.id_country)?.name || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Membre depuis</Label>
                  <p className="font-medium">
                    {selectedUser.date_joined ? new Date(selectedUser.date_joined).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setShowDetailsModal(false)}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        </div>
      </div>
    </RoleGuard>
  )
}