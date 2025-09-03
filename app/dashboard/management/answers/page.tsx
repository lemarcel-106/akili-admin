"use client"

import { useState, useEffect } from "react"
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
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
  Check,
  X,
  HelpCircle
} from "lucide-react"
import { dataAPI } from "@/lib/data-api"
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

interface Answer {
  id: number
  text: string
  is_correct: boolean
  question_id: number
  points: number
  explanation?: string
  is_active: boolean
  created_at: string
  created_by?: string
  question?: any
}

export default function AnswersPage() {
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCorrect, setFilterCorrect] = useState<string>('all')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    text: '',
    is_correct: false,
    question_id: 0,
    points: 0,
    explanation: '',
    is_active: true
  })

  // Stats cards data
  const safeAnswers = Array.isArray(answers) ? answers : []
  const totalAnswers = safeAnswers.length
  const activeAnswers = safeAnswers.filter(a => a.is_active).length
  const correctAnswers = safeAnswers.filter(a => a.is_correct).length
  const incorrectAnswers = safeAnswers.filter(a => !a.is_correct).length
  
  const statsCards = [
    {
      title: "Total Réponses",
      subtitle: "Réponses enregistrées",
      value: totalAnswers,
      icon: MessageSquare,
      trend: "+6.2%",
      isPositive: true
    },
    {
      title: "Réponses Actives", 
      subtitle: "Réponses disponibles",
      value: activeAnswers,
      icon: CheckCircle,
      trend: "+10.5%",
      isPositive: true
    },
    {
      title: "Réponses Correctes",
      subtitle: "Bonnes réponses",
      value: correctAnswers,
      icon: Check,
      trend: "+4.1%",
      isPositive: true
    },
    {
      title: "Réponses Incorrectes",
      subtitle: "Mauvaises réponses",
      value: incorrectAnswers,
      icon: X,
      trend: "+7.3%",
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
      // Simulated data for now since API endpoint might not exist yet
      setAnswers([
        {
          id: 1,
          text: "Paris",
          is_correct: true,
          question_id: 1,
          points: 10,
          explanation: "Paris est la capitale de la France",
          is_active: true,
          created_at: new Date().toISOString(),
          created_by: 'Admin'
        },
        {
          id: 2,
          text: "Lyon",
          is_correct: false,
          question_id: 1,
          points: 0,
          explanation: "Lyon est la deuxième ville de France",
          is_active: true,
          created_at: new Date().toISOString(),
          created_by: 'Admin'
        },
        {
          id: 3,
          text: "x = 5",
          is_correct: true,
          question_id: 2,
          points: 20,
          explanation: "2x + 5 = 15 => 2x = 10 => x = 5",
          is_active: true,
          created_at: new Date().toISOString(),
          created_by: 'Admin'
        },
        {
          id: 4,
          text: "x = 10",
          is_correct: false,
          question_id: 2,
          points: 0,
          explanation: "2(10) + 5 = 25 ≠ 15",
          is_active: true,
          created_at: new Date().toISOString(),
          created_by: 'Admin'
        }
      ])
    } catch (err) {
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAnswer = async () => {
    if (!formData.text) {
      setError('Le texte de la réponse est requis')
      return
    }

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      // API call would go here
      setSuccess('Réponse créée avec succès')
      setShowCreateModal(false)
      resetForm()
      await fetchData()
    } catch (err) {
      setError('Erreur lors de la création de la réponse')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditAnswer = async () => {
    if (!selectedAnswer || !formData.text) {
      setError('Le texte de la réponse est requis')
      return
    }

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      // API call would go here
      setSuccess('Réponse modifiée avec succès')
      setShowEditModal(false)
      setSelectedAnswer(null)
      resetForm()
      await fetchData()
    } catch (err) {
      setError('Erreur lors de la modification de la réponse')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteAnswer = async () => {
    if (!selectedAnswer) return

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      // API call would go here
      setSuccess('Réponse supprimée avec succès')
      setShowDeleteModal(false)
      setSelectedAnswer(null)
      await fetchData()
    } catch (err) {
      setError('Erreur lors de la suppression de la réponse')
    } finally {
      setFormLoading(false)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (answer: Answer) => {
    setSelectedAnswer(answer)
    setFormData({
      text: answer.text,
      is_correct: answer.is_correct,
      question_id: answer.question_id,
      points: answer.points,
      explanation: answer.explanation || '',
      is_active: answer.is_active
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (answer: Answer) => {
    setSelectedAnswer(answer)
    setShowDeleteModal(true)
  }

  const openDetailsModal = (answer: Answer) => {
    setSelectedAnswer(answer)
    setShowDetailsModal(true)
  }

  const resetForm = () => {
    setFormData({
      text: '',
      is_correct: false,
      question_id: 0,
      points: 0,
      explanation: '',
      is_active: true
    })
  }

  const filteredAnswers = safeAnswers.filter(answer => {
    const text = (answer.text || '').toLowerCase()
    const q = (searchTerm || '').toLowerCase()

    const matchSearch = text.includes(q)
    const matchCorrect = filterCorrect === 'all' || 
                         (filterCorrect === 'correct' && answer.is_correct) ||
                         (filterCorrect === 'incorrect' && !answer.is_correct)
    return matchSearch && matchCorrect
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
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Gestion des Réponses
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Créez et gérez les réponses aux questions
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
                Nouvelle Réponse
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

        {/* Table des Réponses */}
        <div>
          <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-violet-600" />
                    Liste des Réponses
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Réponses disponibles pour les questions
                  </CardDescription>
                </div>

                {/* Recherche et filtres */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher une réponse..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <Select value={filterCorrect} onValueChange={setFilterCorrect}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="correct">Correctes</SelectItem>
                      <SelectItem value="incorrect">Incorrectes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge 
                    variant="secondary" 
                    className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                  >
                    {filteredAnswers.length} réponses
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-bold">Réponse</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Points</TableHead>
                      <TableHead className="font-bold">Question ID</TableHead>
                      <TableHead className="font-bold">Statut</TableHead>
                      <TableHead className="font-bold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-6 w-64" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                        filteredAnswers.map((answer) => (
                          <TableRow
                            key={answer.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <TableCell className="font-medium max-w-md">
                              <div className="text-gray-900 dark:text-gray-100 line-clamp-2">
                                {answer.text}
                              </div>
                            </TableCell>
                            <TableCell>
                              {answer.is_correct ? (
                                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                  <Check className="h-3 w-3 mr-1" />
                                  Correcte
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                  <X className="h-3 w-3 mr-1" />
                                  Incorrecte
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-violet-200 text-violet-700 bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-900/30">
                                {answer.points} pts
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                Q{answer.question_id}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {answer.is_active ? (
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
                                  <DropdownMenuItem onClick={() => openDetailsModal(answer)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Voir détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEditModal(answer)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => openDeleteModal(answer)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
                
                {!loading && filteredAnswers.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      Aucune réponse trouvée
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

        {/* Modal de création de réponse */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-violet-600" />
                </div>
                Nouvelle Réponse
              </DialogTitle>
              <DialogDescription>
                Créer une nouvelle réponse pour une question.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="text">Texte de la réponse *</Label>
                <Input
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Entrez le texte de la réponse..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="explanation">Explication (optionnel)</Label>
                <textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explication de la réponse..."
                  className="w-full p-3 border rounded-md min-h-24 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="question_id">Question ID *</Label>
                  <Input
                    id="question_id"
                    type="number"
                    value={formData.question_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, question_id: parseInt(e.target.value) || 0 }))}
                    placeholder="1"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_correct"
                    checked={formData.is_correct}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_correct: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_correct" className="font-normal">Réponse correcte</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_active" className="font-normal">Réponse active</Label>
                </div>
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
                onClick={handleCreateAnswer}
                disabled={formLoading || !formData.text || !formData.question_id}
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
                Modifier la Réponse
              </DialogTitle>
              <DialogDescription>
                Modifiez les informations de la réponse.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_text">Texte de la réponse *</Label>
                <Input
                  id="edit_text"
                  value={formData.text}
                  onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Entrez le texte de la réponse..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_explanation">Explication (optionnel)</Label>
                <textarea
                  id="edit_explanation"
                  value={formData.explanation}
                  onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explication de la réponse..."
                  className="w-full p-3 border rounded-md min-h-24 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_question_id">Question ID *</Label>
                  <Input
                    id="edit_question_id"
                    type="number"
                    value={formData.question_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, question_id: parseInt(e.target.value) || 0 }))}
                    placeholder="1"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_points">Points</Label>
                  <Input
                    id="edit_points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_is_correct"
                    checked={formData.is_correct}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_correct: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="edit_is_correct" className="font-normal">Réponse correcte</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="edit_is_active" className="font-normal">Réponse active</Label>
                </div>
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
                onClick={handleEditAnswer}
                disabled={formLoading || !formData.text || !formData.question_id}
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
                Supprimer la réponse
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer définitivement cette réponse ?
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
                onClick={handleDeleteAnswer}
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
                  <MessageSquare className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                Détails de la Réponse
              </DialogTitle>
            </DialogHeader>
            
            {selectedAnswer && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Réponse</Label>
                  <p className="font-medium mt-1">{selectedAnswer.text}</p>
                </div>
                
                {selectedAnswer.explanation && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Explication</Label>
                    <p className="font-medium mt-1">{selectedAnswer.explanation}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Type</Label>
                    <div className="mt-1">
                      {selectedAnswer.is_correct ? (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          <Check className="h-3 w-3 mr-1" />
                          Correcte
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                          <X className="h-3 w-3 mr-1" />
                          Incorrecte
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Points</Label>
                    <Badge variant="outline" className="mt-1 border-violet-200 text-violet-700 bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-900/30">
                      {selectedAnswer.points} points
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Question ID</Label>
                    <Badge variant="secondary" className="mt-1">
                      Q{selectedAnswer.question_id}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Statut</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedAnswer.is_active ? (
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
                  <Label className="text-sm font-medium text-gray-500">Date de création</Label>
                  <p className="font-medium mt-1">
                    {new Date(selectedAnswer.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
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