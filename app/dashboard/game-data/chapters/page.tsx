"use client"

import { useState, useEffect } from "react"
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Library, 
  Search, 
  User, 
  Calendar, 
  TrendingUp,
  Clock,
  Activity,
  AlertTriangle,
  MoreVertical,
  Eye
} from "lucide-react"
import { dataAPI, Chapter, Subject } from "@/lib/data-api"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    id_subject: 0,
    title: '',
    description: '',
    is_active: 1
  })

  // Stats cards data dans le style de la page users
  const safeChapters = Array.isArray(chapters) ? chapters : []
  const safeSubjects = Array.isArray(subjects) ? subjects : []
  const totalChapters = safeChapters.length
  const activeChapters = safeChapters.filter(c => c.is_active).length
  const uniqueSubjects = [...new Set(safeChapters.map(c => c.id_subject?.id).filter(Boolean))].length
  const averageChapters = safeSubjects.length > 0 ? Math.round(totalChapters / safeSubjects.length) : 0
  
  const statsCards = [
    {
      title: "Total Chapitres",
      subtitle: "Contenus pédagogiques",
      value: totalChapters,
      icon: Library,
      trend: "+9.5%",
      isPositive: true
    },
    {
      title: "Chapitres Actifs", 
      subtitle: "Contenus accessibles",
      value: activeChapters,
      icon: CheckCircle,
      trend: "+13.2%",
      isPositive: true
    },
    {
      title: "Matières Couvertes",
      subtitle: "Matières avec contenu",
      value: uniqueSubjects,
      icon: BookOpen,
      trend: "+6.8%",
      isPositive: true
    },
    {
      title: "Moyenne par Matière",
      subtitle: "Chapitres par matière",
      value: averageChapters,
      icon: TrendingUp,
      trend: "+1.4%",
      isPositive: true
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
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (selectedSubjectId) {
      fetchChapters(selectedSubjectId)
    } else {
      setChapters([])
    }
  }, [selectedSubjectId])

  const fetchInitialData = async () => {
    setLoading(true)
    setError('')
    try {
      const subjectsResponse = await dataAPI.getSubjects()
      
      if (subjectsResponse.data) {
        // La réponse Django a la structure {status, count, data}
        const subjectsList = subjectsResponse.data.data || subjectsResponse.data
        const safeSubjectsList = Array.isArray(subjectsList) ? subjectsList : []
        setSubjects(safeSubjectsList)
        if (safeSubjectsList.length > 0) {
          setSelectedSubjectId(safeSubjectsList[0].id)
        }
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

  const fetchChapters = async (subjectId: number) => {
    setLoading(true)
    setError('')
    try {
      const response = await dataAPI.getChapters({ id_subject: subjectId })
      if (response.data) {
        // La réponse Django a la structure {status, count, data}
        const chaptersList = response.data.data || response.data
        setChapters(Array.isArray(chaptersList) ? chaptersList : [])
      } else if (response.error) {
        setError(response.error)
      }
    } catch (err) {
      setError('Erreur lors du chargement des chapitres')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChapter = async () => {
    if (!formData.title || !formData.description || !formData.id_subject) {
      setError('Tous les champs requis doivent être remplis')
      return
    }

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await dataAPI.createChapter(formData)
      if (response.data) {
        setSuccess('Chapitre créé avec succès')
        setShowCreateModal(false)
        resetForm()
        if (selectedSubjectId) {
          await fetchChapters(selectedSubjectId)
        }
      } else if (response.error) {
        setError(response.error)
      }
    } catch (err) {
      setError('Erreur lors de la création du chapitre')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditChapter = async () => {
    if (!selectedChapter || !formData.title || !formData.description || !formData.id_subject) {
      setError('Tous les champs requis doivent être remplis')
      return
    }

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await dataAPI.updateChapter(selectedChapter.id, formData)
      if (response.data) {
        setSuccess('Chapitre modifié avec succès')
        setShowEditModal(false)
        setSelectedChapter(null)
        resetForm()
        if (selectedSubjectId) {
          await fetchChapters(selectedSubjectId)
        }
      } else if (response.error) {
        setError(response.error)
      }
    } catch (err) {
      setError('Erreur lors de la modification du chapitre')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteChapter = async () => {
    if (!selectedChapter) return

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await dataAPI.deleteChapter(selectedChapter.id)
      if (response.status === 204 || response.status === 200) {
        setSuccess('Chapitre supprimé avec succès')
        setShowDeleteModal(false)
        setSelectedChapter(null)
        if (selectedSubjectId) {
          await fetchChapters(selectedSubjectId)
        }
      } else if (response.error) {
        setError(response.error)
      }
    } catch (err) {
      setError('Erreur lors de la suppression du chapitre')
    } finally {
      setFormLoading(false)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setFormData({
      id_subject: chapter.id_subject?.id || 0,
      title: chapter.title,
      description: chapter.description,
      is_active: chapter.is_active
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setShowDeleteModal(true)
  }

  const openDetailsModal = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setShowDetailsModal(true)
  }

  const resetForm = () => {
    setFormData({
      id_subject: selectedSubjectId || subjects[0]?.id || 0,
      title: '',
      description: '',
      is_active: 1
    })
  }

  const filteredChapters = safeChapters.filter(chapter => {
    const title = (chapter.title || '').toLowerCase()
    const description = (chapter.description || '').toLowerCase()
    const q = (searchTerm || '').toLowerCase()

    return title.includes(q) || description.includes(q)
  })

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
                <Library className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Gestion des Chapitres
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Organisez le contenu pédagogique par chapitres
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
                disabled={subjects.length === 0}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Chapitre
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

        {/* Table des Chapitres */}
        <div>
          <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Library className="h-6 w-6 text-violet-600" />
                    Liste des Chapitres
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Contenu pédagogique organisé par chapitres
                  </CardDescription>
                </div>

                {/* Recherche et filtres */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher un chapitre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <Select value={selectedSubjectId?.toString() || 'all'} onValueChange={(value) => setSelectedSubjectId(value === 'all' ? null : parseInt(value))}>
                    <SelectTrigger className="w-60">
                      <SelectValue placeholder="Toutes les matières" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les matières</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.title} ({subject.id_series?.title || 'Série inconnue'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge 
                    variant="secondary" 
                    className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                  >
                    {filteredChapters.length} chapitres
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-bold">Chapitre</TableHead>
                      <TableHead className="font-bold">Description</TableHead>
                      <TableHead className="font-bold">Matière</TableHead>
                      <TableHead className="font-bold">Série</TableHead>
                      <TableHead className="font-bold">Créé par</TableHead>
                      <TableHead className="font-bold">Date création</TableHead>
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
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                        filteredChapters.map((chapter, index) => (
                          <tr
                            key={chapter.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-violet-100 text-violet-600 text-sm font-bold">
                                    Ch
                                  </AvatarFallback>
                                </Avatar>
                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                  {chapter.title}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                {chapter.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className="border-violet-200 text-violet-700 bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-900/30"
                              >
                                {chapter.id_subject?.title || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              {chapter.id_subject?.id_series?.title || 'N/A'}
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {chapter.created_by || 'N/A'}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(chapter.created_at).toLocaleDateString('fr-FR')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {chapter.is_active ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-green-700 dark:text-green-400 font-medium">Actif</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-red-700 dark:text-red-400 font-medium">Inactif</span>
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
                                  <DropdownMenuItem onClick={() => openDetailsModal(chapter)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Voir détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEditModal(chapter)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => openDeleteModal(chapter)}
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
                
                {!loading && filteredChapters.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      {selectedSubjectId ? "Aucun chapitre trouvé" : "Sélectionnez une matière pour voir ses chapitres"}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {selectedSubjectId && "Essayez d'ajuster votre recherche"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal de création de chapitre */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-violet-600" />
                </div>
                Nouveau Chapitre
              </DialogTitle>
              <DialogDescription>
                Créer un nouveau chapitre pour organiser le contenu pédagogique.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Matière d&apos;enseignement *</Label>
                <Select value={formData.id_subject?.toString() || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, id_subject: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une matière" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.title} ({subject.id_series?.title || 'Série inconnue'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Titre du chapitre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Les nombres relatifs, L'équation chimique"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500">{formData.title.length}/100</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez le contenu du chapitre, les notions principales et objectifs pédagogiques"
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
                <Label htmlFor="is_active" className="font-normal">Chapitre actif</Label>
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
                onClick={handleCreateChapter}
                disabled={formLoading || !formData.title || !formData.description || !formData.id_subject}
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
                Modifier le Chapitre
              </DialogTitle>
              <DialogDescription>
                Modifiez les informations du chapitre {selectedChapter?.title}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_subject">Matière d&apos;enseignement *</Label>
                <Select value={formData.id_subject?.toString() || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, id_subject: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une matière" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.title} ({subject.id_series?.title || 'Série inconnue'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_title">Titre du chapitre *</Label>
                <Input
                  id="edit_title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Les nombres relatifs, L'équation chimique"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500">{formData.title.length}/100</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description *</Label>
                <textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez le contenu du chapitre, les notions principales et objectifs pédagogiques"
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
                <Label htmlFor="edit_is_active" className="font-normal">Chapitre actif</Label>
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
                onClick={handleEditChapter}
                disabled={formLoading || !formData.title || !formData.description || !formData.id_subject}
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
                Supprimer le chapitre
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer définitivement le chapitre <strong>{selectedChapter?.title}</strong> ? Cette action supprimera également tous les exercices et contenus pédagogiques associés.
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
                onClick={handleDeleteChapter}
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
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-violet-100 text-violet-600">
                    Ch
                  </AvatarFallback>
                </Avatar>
                Détails de {selectedChapter?.title}
              </DialogTitle>
            </DialogHeader>
            
            {selectedChapter && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Titre</Label>
                    <p className="font-medium">{selectedChapter.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Matière</Label>
                    <Badge className="mt-1">{selectedChapter.id_subject?.title || 'N/A'}</Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="font-medium">{selectedChapter.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Statut</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedChapter.is_active ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Actif</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-red-600">Inactif</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Série</Label>
                    <p className="font-medium">{selectedChapter.id_subject?.id_series?.title || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Créé par</Label>
                    <p className="font-medium">{selectedChapter.created_by || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Date de création</Label>
                    <p className="font-medium">
                      {new Date(selectedChapter.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
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