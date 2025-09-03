"use client"

import { useState, useEffect } from "react"
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Layers, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Search,  
  TrendingUp,
  Clock,
  Activity,
  AlertTriangle,
  MoreVertical,
  Eye
} from "lucide-react"
import { dataAPI, ExamOption, Exam } from "@/lib/data-api"
import { showSuccess, showError, showConfirm, showLoading, closeLoading } from "@/lib/sweetalert"
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

export default function ExamOptionsPage() {
  const [examOptions, setExamOptions] = useState<ExamOption[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExam, setSelectedExam] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  
  const [selectedOption, setSelectedOption] = useState<ExamOption | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    exam: 0,
    name: '',
    code: '',
    description: '',
    coefficient: 1.0,
    is_active: true
  })

  // Stats cards data dans le style de la page users
  const safeOptions = Array.isArray(examOptions) ? examOptions : []
  const totalOptions = safeOptions.length
  const activeOptions = safeOptions.filter(opt => opt.is_active).length
  const uniqueExams = [...new Set(safeOptions.map(opt => opt.examen?.id).filter(Boolean))].length
  const inactiveOptions = totalOptions - activeOptions
  
  const statsCards = [
    {
      title: "Total Options",
      subtitle: "Options d'examens",
      value: totalOptions,
      icon: Layers,
      trend: "+6.4%",
      isPositive: true
    },
    {
      title: "Options Actives", 
      subtitle: "Options disponibles",
      value: activeOptions,
      icon: CheckCircle,
      trend: "+9.2%",
      isPositive: true
    },
    {
      title: "Examens Couverts",
      subtitle: "Examens avec options",
      value: uniqueExams,
      icon: BookOpen,
      trend: "+4.7%",
      isPositive: true
    },
    {
      title: "Options Inactives",
      subtitle: "Options désactivées",
      value: inactiveOptions,
      icon: XCircle,
      trend: "-1.8%",
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
      const [optionsResponse, examsResponse] = await Promise.all([
        dataAPI.getExamOptions(),
        dataAPI.getExams()
      ])
      
      // Debug : aussi essayer un appel direct pour voir si l'endpoint fonctionne
      console.log('Test appel direct API options-examens...')
      try {
        const testResponse = await fetch('/options-examens/', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        })
        const testData = await testResponse.json()
        console.log('Réponse directe API options-examens:', testData)
      } catch (err) {
        console.log('Erreur appel direct:', err)
      }
      
      if (optionsResponse.data) {
        // Debug : voir la structure de la réponse
        console.log('Réponse options complète:', optionsResponse)
        console.log('Structure optionsResponse.data:', optionsResponse.data)
        
        // La réponse Django a la structure {status, count, data}
        const optionsList = optionsResponse.data.data || optionsResponse.data
        console.log('Liste options extraite:', optionsList)
        
        setExamOptions(Array.isArray(optionsList) ? optionsList : [])
      } else {
        console.log('Pas de données dans optionsResponse:', optionsResponse)
      }
      if (examsResponse.data) {
        // La réponse Django a la structure {status, count, data}
        const examsList = examsResponse.data.data || examsResponse.data
        setExams(Array.isArray(examsList) ? examsList : [])
      }
      if (optionsResponse.error) {
        setError(optionsResponse.error)
      }
    } catch (err) {
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOption = async () => {
    if (!formData.name || !formData.code || !formData.exam) {
      showError('Tous les champs requis doivent être remplis')
      return
    }

    showLoading('Création de l\'option d\'examen...')
    setFormLoading(true)

    try {
      const response = await dataAPI.createExamOption(formData)
      if (response.data) {
        closeLoading()
        await showSuccess('Option d\'examen créée avec succès')
        setShowCreateModal(false)
        resetForm()
        await fetchData()
      } else if (response.error) {
        closeLoading()
        showError(response.error)
      }
    } catch (err) {
      closeLoading()
      showError('Erreur lors de la création de l\'option d\'examen')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditOption = async () => {
    if (!selectedOption || !formData.name || !formData.code) {
      showError('Tous les champs requis doivent être remplis')
      return
    }

    showLoading('Modification de l\'option d\'examen...')
    setFormLoading(true)

    try {
      const response = await dataAPI.updateExamOption(selectedOption.id, formData)
      if (response.data) {
        closeLoading()
        await showSuccess('Option d\'examen modifiée avec succès')
        setShowEditModal(false)
        setSelectedOption(null)
        resetForm()
        await fetchData()
      } else if (response.error) {
        closeLoading()
        showError(response.error)
      }
    } catch (err) {
      closeLoading()
      showError('Erreur lors de la modification de l\'option d\'examen')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteOption = async () => {
    if (!selectedOption) return

    const result = await showConfirm(
      `Êtes-vous sûr de vouloir supprimer l'option "${selectedOption.nom}" ?`,
      'Confirmer la suppression',
      'Supprimer',
      'Annuler'
    )
    
    if (!result.isConfirmed) return

    showLoading('Suppression de l\'option d\'examen...')
    setFormLoading(true)

    try {
      const response = await dataAPI.deleteExamOption(selectedOption.id)
      if (response.status === 204 || response.status === 200) {
        closeLoading()
        await showSuccess('Option d\'examen supprimée avec succès')
        setShowDeleteModal(false)
        setSelectedOption(null)
        await fetchData()
      } else if (response.error) {
        closeLoading()
        showError(response.error)
      }
    } catch (err) {
      closeLoading()
      showError('Erreur lors de la suppression de l\'option d\'examen')
    } finally {
      setFormLoading(false)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (option: ExamOption) => {
    setSelectedOption(option)
    setFormData({
      exam: option.examen?.id || 0,
      name: option.nom,
      code: option.code,
      description: option.description,
      coefficient: option.coefficient,
      is_active: option.is_active
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (option: ExamOption) => {
    setSelectedOption(option)
    setShowDeleteModal(true)
  }

  const openDetailsModal = (option: ExamOption) => {
    setSelectedOption(option)
    setShowDetailsModal(true)
  }

  const resetForm = () => {
    setFormData({
      exam: exams[0]?.id || 0,
      name: '',
      code: '',
      description: '',
      coefficient: 1.0,
      is_active: true
    })
  }

  const filteredOptions = safeOptions.filter(opt => {
    const name = (opt.nom || '').toLowerCase()
    const description = (opt.description || '').toLowerCase()
    const code = (opt.code || '').toLowerCase()
    const q = (searchTerm || '').toLowerCase()

    const matchSearch = name.includes(q) || description.includes(q) || code.includes(q)
    const matchExam = !selectedExam || opt.examen?.id === selectedExam
    return matchSearch && matchExam
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
                <Layers className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Options d&apos;Examens
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Configurez les différentes options disponibles pour chaque examen
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
                Nouvelle Option
              </Button>
            </div>
          </div>
        </motion.div>


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

        {/* Table des Séries */}
        <div>
          <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Layers className="h-6 w-6 text-violet-600" />
                    Liste des Options
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Options d&apos;examens disponibles
                  </CardDescription>
                </div>

                {/* Recherche et filtres */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher une option..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <Select value={selectedExam?.toString() || 'all'} onValueChange={(value) => setSelectedExam(value === 'all' ? null : parseInt(value))}>
                    <SelectTrigger className="w-60">
                      <SelectValue placeholder="Tous les examens" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les examens</SelectItem>
                      {exams.map(exam => (
                        <SelectItem key={exam.id} value={exam.id.toString()}>
                          {exam.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge 
                    variant="secondary" 
                    className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                  >
                    {filteredOptions.length} options
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-bold">Option</TableHead>
                      <TableHead className="font-bold">Code</TableHead>
                      <TableHead className="font-bold">Description</TableHead>
                      <TableHead className="font-bold">Examen</TableHead>
                      <TableHead className="font-bold">Coefficient</TableHead>
                      <TableHead className="font-bold">Statut</TableHead>
                      <TableHead className="font-bold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                        filteredOptions.map((option, index) => (
                          <tr
                            key={option.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-violet-100 text-violet-600 text-xs font-bold">
                                    {option.nom.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="font-semibold text-gray-900 dark:text-gray-100">
                                  {option.nom}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="secondary"
                                className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                              >
                                {option.code}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                {option.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className="border-violet-200 text-violet-700 bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-900/30"
                              >
                                {option.examen?.title || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {option.coefficient}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {option.is_active ? (
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
                                  <DropdownMenuItem onClick={() => openDetailsModal(option)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Voir détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEditModal(option)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => openDeleteModal(option)}
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
                
                {!loading && filteredOptions.length === 0 && (
                  <div className="text-center py-12">
                    <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      Aucune option trouvée
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

        {/* Modal de création d'option d'examen */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-violet-600" />
                </div>
                Nouvelle Option d'Examen
              </DialogTitle>
              <DialogDescription>
                Créer une nouvelle option pour un examen.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="exam">Examen associé *</Label>
                <Select value={formData.exam?.toString() || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, exam: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un examen" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map(exam => (
                      <SelectItem key={exam.id} value={exam.id.toString()}>
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'option *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Série Scientifique, Littéraire"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500">{formData.name.length}/100</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="Ex: S, L, ES"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500">{formData.code.length}/10</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez cette option d'examen"
                  className="w-full p-3 border rounded-md min-h-24 resize-none"
                  maxLength={400}
                />
                <p className="text-xs text-gray-500">{formData.description.length}/400</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                
                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_active" className="font-normal">Option active</Label>
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
                onClick={handleCreateOption}
                disabled={formLoading || !formData.name || !formData.code || !formData.exam}
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
                Modifier l'Option
              </DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'option {selectedOption?.name}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_exam">Examen associé *</Label>
                <Select value={formData.exam?.toString() || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, exam: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un examen" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map(exam => (
                      <SelectItem key={exam.id} value={exam.id.toString()}>
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_name">Nom de l'option *</Label>
                  <Input
                    id="edit_name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Série Scientifique"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500">{formData.name.length}/100</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_code">Code *</Label>
                  <Input
                    id="edit_code"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="Ex: S, L, ES"
                    maxLength={10}
                  />
                  <p className="text-xs text-gray-500">{formData.code.length}/10</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez cette option d'examen"
                  className="w-full p-3 border rounded-md min-h-24 resize-none"
                  maxLength={400}
                />
                <p className="text-xs text-gray-500">{formData.description.length}/400</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
                
                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="edit_is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="edit_is_active" className="font-normal">Option active</Label>
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
                onClick={handleEditOption}
                disabled={formLoading || !formData.name || !formData.code}
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
                Supprimer l'option
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer définitivement l'option <strong>{selectedOption?.name}</strong> ?
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
                onClick={handleDeleteOption}
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
                    {selectedOption?.nom?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                Détails de {selectedOption?.nom}
              </DialogTitle>
            </DialogHeader>
            
            {selectedOption && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nom</Label>
                    <p className="font-medium">{selectedOption.nom}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Code</Label>
                    <Badge className="mt-1">{selectedOption.code}</Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Examen</Label>
                    <Badge className="mt-1">{selectedOption.examen?.title || 'N/A'}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Pays</Label>
                    <p className="font-medium">{selectedOption.examen?.pays?.nom || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="font-medium">{selectedOption.description || 'Aucune description'}</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Coefficient</Label>
                    <p className="font-medium">{selectedOption.coefficient}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Statut</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedOption.is_active ? (
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
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Créé le</Label>
                    <p className="font-medium text-sm">{new Date(selectedOption.created_at).toLocaleDateString('fr-FR')}</p>
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