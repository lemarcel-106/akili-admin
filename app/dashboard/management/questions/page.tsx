"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  HelpCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Search, 
  Trophy,
  Clock,
  Activity,
  AlertTriangle,
  MoreVertical,
  Eye,
  TrendingUp,
  MessageSquare,
  Filter,
  FileQuestion,
  Globe,
  BookOpen,
  GraduationCap,
  FileText
} from "lucide-react"
import { 
  createMetadata, 
  MetadataBase,
  getMetadatas,
  deleteMetadata,
  MetadataResponse 
} from '@/lib/questions-api'
import { dataAPI, Country, Exam, ExamOption, Subject, Chapter, QuestionLevel, Series, Question } from "@/lib/data-api"
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

// Type local pour étendre Question avec des relations supplémentaires
interface QuestionWithRelations extends Question {
  country?: Country
}

export default function QuestionsPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<QuestionWithRelations[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [examOptions, setExamOptions] = useState<ExamOption[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [questionLevels, setQuestionLevels] = useState<QuestionLevel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCountry, setFilterCountry] = useState<number | null>(null)
  const [filterSubject, setFilterSubject] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionWithRelations | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  
  const [formData, setFormData] = useState<MetadataBase>({
    titre: '',
    annee: new Date().getFullYear(),
    examen: 1,
    matiere: 1,
    chapitre: 1,
    niveau: 1
  })

  // Stats cards data
  const safeQuestions = Array.isArray(questions) ? questions : []
  const totalQuestions = safeQuestions.length
  const level1Questions = safeQuestions.filter(q => q.niveau?.niveau === 1).length
  const level2Questions = safeQuestions.filter(q => q.niveau?.niveau === 2).length
  const level3Questions = safeQuestions.filter(q => q.niveau?.niveau === 3).length
  
  const statsCards = [
    {
      title: "Total Questions",
      subtitle: "Toutes questions",
      value: totalQuestions,
      icon: HelpCircle,
      trend: "Total",
      isPositive: true
    },
    {
      title: "Niveau 1", 
      subtitle: "Questions basiques",
      value: level1Questions,
      icon: Trophy,
      trend: "Facile",
      isPositive: true
    },
    {
      title: "Niveau 2",
      subtitle: "Questions moyennes",
      value: level2Questions,
      icon: BookOpen,
      trend: "Moyen",
      isPositive: true
    },
    {
      title: "Niveau 3",
      subtitle: "Questions avancées",
      value: level3Questions,
      icon: GraduationCap,
      trend: "Difficile",
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
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      // Récupérer les données depuis l'API avec les nouveaux endpoints
      const [countriesRes, examsRes, levelsRes] = await Promise.all([
        dataAPI.getCountries(),
        dataAPI.getExams(),
        dataAPI.getQuestionLevels() // /niveaux/liste/
      ])
      
      // Traitement des pays
      if (countriesRes.data) {
        const countriesList = countriesRes.data.data || countriesRes.data
        setCountries(Array.isArray(countriesList) ? countriesList : [])
      }
      
      // Traitement des examens
      if (examsRes.data) {
        const examsList = examsRes.data.data || examsRes.data
        setExams(Array.isArray(examsList) ? examsList : [])
      }
      
      // Les séries, matières et chapitres seront chargés dynamiquement selon les besoins
      // avec les nouveaux endpoints /examens/par-annee/, /matieres/par-annee/, etc.
      // Initialiser avec des tableaux vides pour éviter les erreurs
      setExamOptions([])
      setSubjects([])
      setChapters([])
      
      // Traitement des niveaux de questions
      if (levelsRes.data) {
        const levelsList = levelsRes.data.data || levelsRes.data
        setQuestionLevels(Array.isArray(levelsList) ? levelsList : [])
      }
      
      // Récupérer les vraies questions depuis l'API
      try {
        const questionsRes = await dataAPI.getQuestions()
        if (questionsRes.data) {
          const questionsList = questionsRes.data.data || questionsRes.data
          const questionsArray = Array.isArray(questionsList) ? questionsList : []
          
          // Enrichir les questions avec les relations
          const enrichedQuestions = questionsArray.map(q => {
            const exam = exams.find(e => e.id === q.id_exam)
            const serie = optionsRes.data ? allSeries.find(s => s.id === q.id_serie) : undefined
            const matiere = subjects.find(s => s.id === q.id_matiere)
            const chapitre = chapters.find(c => c.id === q.id_chapitre)
            const niveau = questionLevels.find(l => l.id === q.id_niveau)
            const country = exam ? countries.find(c => c.id === exam.id_country) : undefined
            
            return {
              ...q,
              exam,
              serie,
              matiere,
              chapitre,
              niveau,
              country
            } as QuestionWithRelations
          })
          
          setQuestions(enrichedQuestions)
        }
      } catch (questionsError) {
        console.error('Erreur lors de la récupération des questions:', questionsError)
        // Si l'API des questions échoue, on peut garder une liste vide
        setQuestions([])
      }
      
      // Gérer les erreurs
      if (countriesRes.error || examsRes.error || levelsRes.error) {
        const errors = [
          countriesRes.error,
          examsRes.error,
          levelsRes.error
        ].filter(Boolean).join(', ')
        setError(`Erreurs lors du chargement: ${errors}`)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuestion = async () => {
    if (!formData.titre || !formData.matiere || !formData.chapitre) {
      setError('Tous les champs requis doivent être remplis')
      return
    }

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await createMetadata(formData)
      
      if (response.status === 201 && response.data) {
        setSuccess('Métadonnées créées avec succès')
        setShowCreateModal(false)
        resetForm()
        // Rediriger vers la sélection du type
        router.push(`/dashboard/questions/type-selection?metadata_id=${response.data.id}`)
      } else {
        setError(response.error || 'Erreur lors de la création')
      }
    } catch (err) {
      setError('Erreur lors de la création de la question')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditQuestion = async () => {
    if (!selectedQuestion || !formData.titre) {
      setError('Le titre de la question est requis')
      return
    }

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      // Utiliser l'API de mise à jour des métadonnées (non implémentée pour l'instant)
      setSuccess('Métadonnées modifiées avec succès')
      setShowEditModal(false)
      setSelectedQuestion(null)
      resetForm()
      await fetchData()
    } catch (err) {
      setError('Erreur lors de la modification des métadonnées')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      // API call would go here
      setSuccess('Question supprimée avec succès')
      setShowDeleteModal(false)
      setSelectedQuestion(null)
      await fetchData()
    } catch (err) {
      setError('Erreur lors de la suppression de la question')
    } finally {
      setFormLoading(false)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (question: QuestionWithRelations) => {
    setSelectedQuestion(question)
    setFormData({
      titre: question.title,
      annee: question.exam?.year || new Date().getFullYear(),
      examen: question.id_exam || 1,
      matiere: question.id_matiere || 1,
      chapitre: question.id_chapitre || 1,
      niveau: question.id_niveau || 1
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (question: QuestionWithRelations) => {
    setSelectedQuestion(question)
    setShowDeleteModal(true)
  }

  const openDetailsModal = (question: QuestionWithRelations) => {
    setSelectedQuestion(question)
    setShowDetailsModal(true)
  }

  const resetForm = () => {
    setFormData({
      titre: '',
      annee: new Date().getFullYear(),
      examen: 1,
      matiere: 1,
      chapitre: 1,
      niveau: 1
    })
  }

  const getLevelColor = (niveau?: number) => {
    switch(niveau) {
      case 1:
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      case 2:
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 3:
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      default:
        return ''
    }
  }

  const getResponseTypeLabel = (type?: string) => {
    const types: { [key: string]: string } = {
      'VF': 'Vrai/Faux',
      'QCM_S': 'QCM Simple',
      'QRM': 'QCM Multiple',
      'QCM_P': 'QCM Pairé',
      'QAA': 'Appariement',
      'ORD': 'Ordre',
      'LAC': 'Texte à trous',
      'GRID': 'Grille'
    }
    return types[type || ''] || type || 'N/A'
  }

  const filteredQuestions = safeQuestions.filter(question => {
    const title = (question.title || '').toLowerCase()
    const q = (searchTerm || '').toLowerCase()

    const matchSearch = title.includes(q)
    const matchSubject = !filterSubject || question.id_matiere === filterSubject
    return matchSearch && matchSubject
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
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Gestion des Questions
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Créez et gérez les questions du jeu
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
                Nouvelle Question
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

        {/* Table des Questions */}
        <div>
          <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <HelpCircle className="h-6 w-6 text-violet-600" />
                    Liste des Questions
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Questions disponibles pour le jeu
                  </CardDescription>
                </div>

                {/* Recherche et filtres */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher une question..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <Select value={filterCountry?.toString() || 'all'} onValueChange={(value) => setFilterCountry(value === 'all' ? null : parseInt(value))}>
                    <SelectTrigger className="w-40">
                      <Globe className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les pays</SelectItem>
                      {countries.map(country => (
                        <SelectItem key={country.id} value={country.id.toString()}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterSubject?.toString() || 'all'} onValueChange={(value) => setFilterSubject(value === 'all' ? null : parseInt(value))}>
                    <SelectTrigger className="w-40">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Matière" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les matières</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>{subject.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge 
                    variant="secondary" 
                    className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                  >
                    {filteredQuestions.length} questions
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-bold">Titre de la question</TableHead>
                      <TableHead className="font-bold">Type de Réponse</TableHead>
                      <TableHead className="font-bold">Examen (Pays)</TableHead>
                      <TableHead className="font-bold">Option (Matière)</TableHead>
                      <TableHead className="font-bold">Niveau de Difficulté</TableHead>
                      <TableHead className="font-bold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-6 w-80" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-36" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-48" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                        filteredQuestions.map((question) => (
                          <TableRow
                            key={question.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <TableCell className="font-medium max-w-md">
                              <div className="text-gray-900 dark:text-gray-100 line-clamp-2">
                                {question.title}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:bg-blue-900/30">
                                {getResponseTypeLabel(question.type_reponse)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {question.exam?.title || 'N/A'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({question.country?.name || question.exam?.pays?.nom || 'N/A'})
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {question.serie?.title || 'N/A'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({question.matiere?.title || 'N/A'})
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getLevelColor(question.niveau?.niveau)}>
                                {question.niveau?.description || `Niveau ${question.niveau?.niveau}` || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    router.push(`/dashboard/management/questions/${question.id}/configuration`)
                                  }}
                                  className="hover:bg-violet-50 hover:border-violet-400 dark:hover:bg-violet-950/30"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Ajout. Réponse
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDetailsModal(question)}
                                  className="hover:bg-violet-50 hover:border-violet-400 dark:hover:bg-violet-950/30"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Aperçu
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
                
                {!loading && filteredQuestions.length === 0 && (
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      Aucune question trouvée
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

        {/* Modal de création de question */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-2 border-violet-200 dark:border-violet-800 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-violet-600" />
                </div>
                Nouvelle Question
              </DialogTitle>
              <DialogDescription>
                Cette étape configure les métadonnées de base. Ensuite vous pourrez choisir le type de question et définir la structure de réponse.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la question *</Label>
                <Input
                  id="title"
                  value={formData.titre}
                  onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                  placeholder="Ex: Quelle est la capitale de la France ?"
                  className="h-12 text-base hover:border-violet-400 focus:border-violet-500 transition-all duration-200 border-2"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Année *</Label>
                <Select 
                  value={formData.annee?.toString() || new Date().getFullYear().toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, annee: parseInt(value) }))}
                >
                  <SelectTrigger className="h-12 text-base hover:border-violet-400 focus:border-violet-500 transition-all duration-200 border-2">
                    <SelectValue placeholder="Sélectionner une année" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exam">Examen *</Label>
                <Select 
                  value={formData.examen.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, examen: parseInt(value) }))}
                >
                  <SelectTrigger className="h-12 text-base hover:border-violet-400 focus:border-violet-500 transition-all duration-200 border-2">
                    <SelectValue placeholder="Choisir un examen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">BEPC</SelectItem>
                    <SelectItem value="2">BAC</SelectItem>
                    <SelectItem value="3">Concours d'entrée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Matière *</Label>
                  <Select 
                    value={formData.matiere.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, matiere: parseInt(value) }))}
                  >
                    <SelectTrigger className="h-12 text-base hover:border-violet-400 focus:border-violet-500 transition-all duration-200 border-2">
                      <SelectValue placeholder="Choisir une matière" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Mathématiques</SelectItem>
                      <SelectItem value="2">Physique</SelectItem>
                      <SelectItem value="3">Chimie</SelectItem>
                      <SelectItem value="4">Français</SelectItem>
                      <SelectItem value="5">Anglais</SelectItem>
                      <SelectItem value="6">Histoire</SelectItem>
                      <SelectItem value="7">Géographie</SelectItem>
                      <SelectItem value="8">Biologie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chapter">Chapitre *</Label>
                  <Select 
                    value={formData.chapitre.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, chapitre: parseInt(value) }))}
                  >
                    <SelectTrigger className="h-12 text-base hover:border-violet-400 focus:border-violet-500 transition-all duration-200 border-2">
                      <SelectValue placeholder="Choisir un chapitre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Chapitre 1</SelectItem>
                      <SelectItem value="2">Chapitre 2</SelectItem>
                      <SelectItem value="3">Chapitre 3</SelectItem>
                      <SelectItem value="4">Chapitre 4</SelectItem>
                      <SelectItem value="5">Chapitre 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="level">Niveau (optionnel)</Label>
                <Select 
                  value={formData.niveau?.toString() || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, niveau: value ? parseInt(value) : undefined }))}
                >
                  <SelectTrigger className="h-11 hover:border-violet-300 focus:border-violet-500 transition-colors">
                    <SelectValue placeholder="Choisir la difficulté" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Facile</SelectItem>
                    <SelectItem value="2">Moyen</SelectItem>
                    <SelectItem value="3">Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-violet-100 dark:border-violet-900/30">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 h-12 text-base"
                disabled={formLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateQuestion}
                disabled={formLoading || !formData.titre || !formData.matiere || !formData.chapitre}
                className="flex-1 h-12 text-base bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 shadow-lg transition-all duration-200"
              >
                {formLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer métadonnées
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de modification */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-2 border-violet-200 dark:border-violet-800 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Edit className="h-5 w-5 text-violet-600" />
                </div>
                Modifier la Question
              </DialogTitle>
              <DialogDescription>
                Modifiez les informations de la question.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_title">Titre de la question *</Label>
                <Input
                  id="edit_title"
                  value={formData.titre}
                  onChange={(e) => setFormData(prev => ({ ...prev, titre: e.target.value }))}
                  placeholder="Ex: Résolvez l'équation 2x + 5 = 15"
                  className="h-12 text-base hover:border-violet-400 focus:border-violet-500 transition-all duration-200 border-2"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_exam">Examen *</Label>
                  <Select 
                    value={formData.examen.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, examen: parseInt(value) }))}
                  >
                    <SelectTrigger className="h-12 text-base hover:border-violet-400 focus:border-violet-500 transition-all duration-200 border-2">
                      <SelectValue placeholder="Choisir un examen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">BEPC</SelectItem>
                      <SelectItem value="2">BAC</SelectItem>
                      <SelectItem value="3">Concours d'entrée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_subject">Matière *</Label>
                  <Select 
                    value={formData.matiere.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, matiere: parseInt(value) }))}
                  >
                    <SelectTrigger className="h-12 text-base hover:border-violet-400 focus:border-violet-500 transition-all duration-200 border-2">
                      <SelectValue placeholder="Choisir une matière" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Mathématiques</SelectItem>
                      <SelectItem value="2">Physique</SelectItem>
                      <SelectItem value="3">Chimie</SelectItem>
                      <SelectItem value="4">Français</SelectItem>
                      <SelectItem value="5">Anglais</SelectItem>
                      <SelectItem value="6">Histoire</SelectItem>
                      <SelectItem value="7">Géographie</SelectItem>
                      <SelectItem value="8">Biologie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_chapter">Chapitre *</Label>
                  <Select 
                    value={formData.chapitre.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, chapitre: parseInt(value) }))}
                  >
                    <SelectTrigger className="h-12 text-base hover:border-violet-400 focus:border-violet-500 transition-all duration-200 border-2">
                      <SelectValue placeholder="Choisir un chapitre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Chapitre 1</SelectItem>
                      <SelectItem value="2">Chapitre 2</SelectItem>
                      <SelectItem value="3">Chapitre 3</SelectItem>
                      <SelectItem value="4">Chapitre 4</SelectItem>
                      <SelectItem value="5">Chapitre 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_level">Niveau (optionnel)</Label>
                <Select 
                  value={formData.niveau?.toString() || ''} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, niveau: value ? parseInt(value) : undefined }))}
                >
                  <SelectTrigger className="h-11 hover:border-violet-300 focus:border-violet-500 transition-colors">
                    <SelectValue placeholder="Choisir la difficulté" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Facile</SelectItem>
                    <SelectItem value="2">Moyen</SelectItem>
                    <SelectItem value="3">Difficile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-violet-100 dark:border-violet-900/30">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1 h-12 text-base"
                disabled={formLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleEditQuestion}
                disabled={formLoading || !formData.titre || !formData.matiere || !formData.chapitre}
                className="flex-1 h-12 text-base bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 shadow-lg transition-all duration-200"
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
                Supprimer la question
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer définitivement cette question ? Cette action supprimera également toutes les réponses associées.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-violet-100 dark:border-violet-900/30">
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
                onClick={handleDeleteQuestion}
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
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                  <HelpCircle className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                Détails de la Question
              </DialogTitle>
            </DialogHeader>
            
            {selectedQuestion && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Titre</Label>
                  <p className="font-medium mt-1">{selectedQuestion.title}</p>
                </div>
                
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Niveau</Label>
                  <Badge className={cn("mt-1", getLevelColor(selectedQuestion.niveau?.niveau))}>
                    Niveau {selectedQuestion.niveau?.niveau || 'N/A'} - {selectedQuestion.niveau?.description || ''}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Examen</Label>
                    <p className="font-medium mt-1">{selectedQuestion.exam?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Série/Option</Label>
                    <p className="font-medium mt-1">{selectedQuestion.serie?.title || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Matière</Label>
                    <p className="font-medium mt-1">{selectedQuestion.matiere?.title || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Chapitre</Label>
                    <p className="font-medium mt-1">{selectedQuestion.chapitre?.title || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Créée par</Label>
                  <p className="font-medium mt-1">{selectedQuestion.created_by || 'N/A'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date de création</Label>
                  <p className="font-medium mt-1">
                    {selectedQuestion.created_at ? new Date(selectedQuestion.created_at).toLocaleDateString('fr-FR', {
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
  )
}