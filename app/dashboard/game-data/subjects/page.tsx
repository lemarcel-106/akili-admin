"use client"

import { useState, useEffect } from "react"
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Layers, 
  Search, 
  User, 
  TrendingUp, 
  Book,
  Clock,
  Activity,
  AlertTriangle,
  MoreVertical,
  Eye
} from "lucide-react"
import { dataAPI, Subject, Series } from "@/lib/data-api"
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
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    series: 0,
    name: '',
    description: '',
    coefficient: 1.0,
    is_active: 1
  })

  // Stats cards data dans le style de la page users
  const safeSubjects = Array.isArray(subjects) ? subjects : []
  const totalSubjects = safeSubjects.length
  const activeSubjects = safeSubjects.filter(s => s.is_active).length
  const uniqueSeries = [...new Set(safeSubjects.map(s => s.id_series?.id).filter(Boolean))].length
  const inactiveSubjects = totalSubjects - activeSubjects
  
  const statsCards = [
    {
      title: "Total Matières",
      subtitle: "Matières disponibles",
      value: totalSubjects,
      icon: Book,
      trend: "+7.8%",
      isPositive: true
    },
    {
      title: "Matières Actives", 
      subtitle: "Matières enseignées",
      value: activeSubjects,
      icon: CheckCircle,
      trend: "+11.4%",
      isPositive: true
    },
    {
      title: "Séries Couvertes",
      subtitle: "Séries avec matières",
      value: uniqueSeries,
      icon: Layers,
      trend: "+5.6%",
      isPositive: true
    },
    {
      title: "Matières Inactives",
      subtitle: "Matières désactivées",
      value: inactiveSubjects,
      icon: XCircle,
      trend: "-3.1%",
      isPositive: false
    }
  ]

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [subjectsResponse, seriesResponse] = await Promise.all([
        dataAPI.getSubjects(),
        dataAPI.getSeries()
      ])
      
      if (subjectsResponse.data) {
        // La réponse Django a la structure {status, count, data}
        const subjectsList = subjectsResponse.data.data || subjectsResponse.data
        setSubjects(Array.isArray(subjectsList) ? subjectsList : [])
      }
      if (seriesResponse.data) {
        // La réponse Django a la structure {status, count, data}
        const seriesList = seriesResponse.data.data || seriesResponse.data
        setSeries(Array.isArray(seriesList) ? seriesList : [])
      }
      if (subjectsResponse.error) {
        setError(subjectsResponse.error)
      }
    } catch (err) {
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubject = async () => {
    if (!formData.name || !formData.series) {
      setError('Les champs nom et série sont requis')
      return
    }

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await dataAPI.createSubject(formData)
      if (response.data) {
        setSuccess('Matière créée avec succès')
        setShowCreateModal(false)
        resetForm()
        await fetchData()
      } else if (response.error) {
        setError(response.error)
      }
    } catch (err) {
      setError('Erreur lors de la création de la matière')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditSubject = async () => {
    if (!selectedSubject || !formData.name || !formData.series) {
      setError('Les champs nom et série sont requis')
      return
    }

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await dataAPI.updateSubject(selectedSubject.id, {
        title: formData.name,
        description: formData.description,
        id_series: formData.series,
        is_active: formData.is_active
      })
      if (response.data) {
        setSuccess('Matière modifiée avec succès')
        setShowEditModal(false)
        setSelectedSubject(null)
        resetForm()
        await fetchData()
      } else if (response.error) {
        setError(response.error)
      }
    } catch (err) {
      setError('Erreur lors de la modification de la matière')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteSubject = async () => {
    if (!selectedSubject) return

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await dataAPI.deleteSubject(selectedSubject.id)
      if (response.status === 204 || response.status === 200) {
        setSuccess('Matière supprimée avec succès')
        setShowDeleteModal(false)
        setSelectedSubject(null)
        await fetchData()
      } else if (response.error) {
        setError(response.error)
      }
    } catch (err) {
      setError('Erreur lors de la suppression de la matière')
    } finally {
      setFormLoading(false)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (subject: Subject) => {
    setSelectedSubject(subject)
    setFormData({
      series: subject.id_series.id,
      name: subject.title,
      description: subject.description,
      coefficient: 1.0,
      is_active: subject.is_active
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (subject: Subject) => {
    setSelectedSubject(subject)
    setShowDeleteModal(true)
  }

  const openDetailsModal = (subject: Subject) => {
    setSelectedSubject(subject)
    setShowDetailsModal(true)
  }

  const resetForm = () => {
    setFormData({
      series: series[0]?.id || 0,
      name: '',
      description: '',
      coefficient: 1.0,
      is_active: 1
    })
  }

  const filteredSubjects = safeSubjects.filter(subject => {
    const title = (subject.title || '').toLowerCase()
    const description = (subject.description || '').toLowerCase()
    const q = (searchTerm || '').toLowerCase()

    const matchSearch = title.includes(q) || description.includes(q)
    const matchSeries = !selectedSeries || subject.id_series.id === selectedSeries
    return matchSearch && matchSeries
  })

  const getSubjectIcon = (title: string) => {
    const lowTitle = title.toLowerCase()
    if (lowTitle.includes('math')) return '🔢'
    if (lowTitle.includes('français') || lowTitle.includes('lettre')) return '📝'
    if (lowTitle.includes('physique') || lowTitle.includes('chimie')) return '⚗️'
    if (lowTitle.includes('svt') || lowTitle.includes('bio')) return '🧬'
    if (lowTitle.includes('histoire') || lowTitle.includes('géo')) return '🌍'
    if (lowTitle.includes('anglais') || lowTitle.includes('english')) return '🇬🇧'
    if (lowTitle.includes('philo')) return '💭'
    if (lowTitle.includes('sport') || lowTitle.includes('eps')) return '⚽'
    if (lowTitle.includes('info')) return '💻'
    return '📚'
  }

  if (!mounted) return null

  return (
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
                <Book className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Gestion des Matières
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Configurez les matières pour chaque série d&apos;examen
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
                onClick={openCreateModal}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Matière
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
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

        {/* Table des Matières */}
        <div>
          <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Book className="h-6 w-6 text-violet-600" />
                    Liste des Matières
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Matières disponibles avec leurs informations
                  </CardDescription>
                </div>

                {/* Recherche et filtres */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher une matière..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <Select value={selectedSeries?.toString() || 'all'} onValueChange={(value) => setSelectedSeries(value === 'all' ? null : parseInt(value))}>
                    <SelectTrigger className="w-60">
                      <SelectValue placeholder="Toutes les séries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les séries</SelectItem>
                      {series.map(serie => (
                        <SelectItem key={serie.id} value={serie.id.toString()}>
                          {serie.title} ({serie.id_exam?.title || "Examen inconnu"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge 
                    variant="secondary" 
                    className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                  >
                    {filteredSubjects.length} matières
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-bold">Matière</TableHead>
                      <TableHead className="font-bold">Description</TableHead>
                      <TableHead className="font-bold">Série</TableHead>
                      <TableHead className="font-bold">Examen</TableHead>
                      <TableHead className="font-bold">Statut</TableHead>
                      <TableHead className="font-bold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                        filteredSubjects.map((subject, index) => (
                          <tr
                            key={subject.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <TableCell className="font-medium">
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {subject.title}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                {subject.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className="border-violet-200 text-violet-700 bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-900/30"
                              >
                                {subject.id_series.title}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {subject.id_series.id_exam?.title ? 
                                `${subject.id_series.id_exam.title} (${subject.id_series.id_exam.id_country?.name || 'Pays inconnu'})` 
                                : 'N/A'
                              }
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {subject.is_active ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-green-700 dark:text-green-400 font-medium">Active</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-red-700 dark:text-red-400 font-medium">Inactive</span>
                                  </>
                                )}
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
                                  <DropdownMenuItem onClick={() => openDetailsModal(subject)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Voir détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEditModal(subject)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => openDeleteModal(subject)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </tr>
                        ))
                    )}
                  </TableBody>
                </Table>
                
                {!loading && filteredSubjects.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      Aucune matière trouvée
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Essayez d&apos;ajuster vos filtres de recherche
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Modal de création de matière */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-violet-600" />
                </div>
                Nouvelle Matière
              </DialogTitle>
              <DialogDescription>
                Créer une nouvelle matière pour une série.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="series">Série associée *</Label>
                <Select value={formData.series?.toString() || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, series: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une série" />
                  </SelectTrigger>
                  <SelectContent>
                    {series.map(seriesItem => (
                      <SelectItem key={seriesItem.id} value={seriesItem.id.toString()}>
                        {seriesItem.title} ({seriesItem.id_exam?.title || 'Examen inconnu'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la matière *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Mathématiques, Français"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500">{formData.name.length}/100</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coefficient">Coefficient</Label>
                  <Input
                    id="coefficient"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.coefficient}
                    onChange={(e) => setFormData(prev => ({ ...prev, coefficient: parseFloat(e.target.value) || 1.0 }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez le programme : objectifs pédagogiques, compétences développées"
                  className="w-full p-3 border rounded-md min-h-24 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">{formData.description.length}/500</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active === 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active" className="font-normal">Matière active</Label>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
                disabled={formLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateSubject}
                disabled={formLoading || !formData.name || !formData.series}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de modification */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Edit className="h-5 w-5 text-violet-600" />
                </div>
                Modifier la Matière
              </DialogTitle>
              <DialogDescription>
                Modifiez les informations de la matière {selectedSubject?.title}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_series">Série associée *</Label>
                <Select value={formData.series?.toString() || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, series: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une série" />
                  </SelectTrigger>
                  <SelectContent>
                    {series.map(seriesItem => (
                      <SelectItem key={seriesItem.id} value={seriesItem.id.toString()}>
                        {seriesItem.title} ({seriesItem.id_exam?.title || 'Examen inconnu'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_name">Nom de la matière *</Label>
                  <Input
                    id="edit_name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Mathématiques, Français"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500">{formData.name.length}/100</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_coefficient">Coefficient</Label>
                  <Input
                    id="edit_coefficient"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.coefficient}
                    onChange={(e) => setFormData(prev => ({ ...prev, coefficient: parseFloat(e.target.value) || 1.0 }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez le programme : objectifs pédagogiques, compétences développées"
                  className="w-full p-3 border rounded-md min-h-24 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">{formData.description.length}/500</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.is_active === 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked ? 1 : 0 }))}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit_is_active" className="font-normal">Matière active</Label>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
                disabled={formLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleEditSubject}
                disabled={formLoading || !formData.name || !formData.series}
                className="flex-1 bg-violet-600 hover:bg-violet-700"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Modification...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
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
                Supprimer la matière
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer définitivement la matière <strong>{selectedSubject?.title}</strong> ? Cette action supprimera également tous les chapitres et exercices associés.
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
                onClick={handleDeleteSubject}
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

        {/* Modal de détails */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="text-2xl">{selectedSubject && getSubjectIcon(selectedSubject.title)}</div>
                Détails de {selectedSubject?.title}
              </DialogTitle>
            </DialogHeader>
            
            {selectedSubject && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nom</Label>
                    <p className="font-medium">{selectedSubject.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Série</Label>
                    <Badge className="mt-1">{selectedSubject.id_series.title}</Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="font-medium">{selectedSubject.description}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Examen</Label>
                    <p className="font-medium">{selectedSubject.id_series.id_exam?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Pays</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded dark:bg-gray-800">
                        {selectedSubject.id_series.id_exam?.id_country?.code || 'N/A'}
                      </span>
                      <span className="text-sm">{selectedSubject.id_series.id_exam?.id_country?.name || 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Statut</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedSubject.is_active ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-600">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Créé par</Label>
                  <p className="font-medium">{selectedSubject.created_by || 'N/A'}</p>
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
  )
}