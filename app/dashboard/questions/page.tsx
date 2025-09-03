"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getMetadatas, 
  createMetadata, 
  deleteMetadata,
  MetadataBase,
  MetadataResponse
} from '@/lib/questions-api'
import { 
  Plus, 
  Trash2, 
  Edit, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  AlertTriangle,
  MoreVertical,
  Clock,
  Tag,
  BarChart,
  Image,
  Volume2,
  HelpCircle,
  FileQuestion,
  ListOrdered,
  Hash,
  Shuffle,
  Type,
  Calculator
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { dataAPI } from "@/lib/data-api"

const questionTypeIcons = {
  'VF': HelpCircle,
  'QCM_S': ListOrdered,
  'QRM': Hash,
  'QCM_P': FileQuestion,
  'QAA': Shuffle,
  'ORD': ListOrdered,
  'LAC': Type,
  'GRID': Calculator
}

const questionTypeLabels = {
  'VF': 'Vrai/Faux',
  'QCM_S': 'QCM Simple',
  'QRM': 'QCM Multiple',
  'QCM_P': 'Assertions',
  'QAA': 'Appariement',
  'ORD': 'Ordre',
  'LAC': 'Texte à trous',
  'GRID': 'Grille'
}

const niveauColors = {
  'facile': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'moyen': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  'difficile': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
}

export default function QuestionsPage() {
  const router = useRouter()
  const [metadatas, setMetadatas] = useState<MetadataResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [niveauFilter, setNiveauFilter] = useState('all')
  
  // Données dynamiques pour le formulaire
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [availableExams, setAvailableExams] = useState<any[]>([])
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([])
  const [availableChapters, setAvailableChapters] = useState<any[]>([])
  const [availableLevels, setAvailableLevels] = useState<any[]>([])
  const [loadingFormData, setLoadingFormData] = useState(false)
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedMetadata, setSelectedMetadata] = useState<MetadataResponse | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  
  const [createForm, setCreateForm] = useState<MetadataBase & { annee?: number }>({
    titre: '',
    annee: new Date().getFullYear(),
    examen: 0,
    matiere: 0,
    chapitre: 0,
    niveau: undefined
  })


  useEffect(() => {
    fetchMetadatas()
    fetchInitialFormData()
  }, [])
  
  // Charger les années et les niveaux au démarrage
  const fetchInitialFormData = async () => {
    try {
      console.log('🔍 Chargement initial des données du formulaire...')
      const [yearsRes, levelsRes] = await Promise.all([
        dataAPI.getExamYears(),
        dataAPI.getLevelsList()
      ])
      
      console.log('📅 Réponse années:', yearsRes)
      if (yearsRes.data) {
        setAvailableYears(yearsRes.data.years || [])
        console.log('✅ Années chargées:', yearsRes.data.years)
      }
      
      console.log('📊 Réponse niveaux:', levelsRes)
      if (levelsRes.data) {
        setAvailableLevels(levelsRes.data.levels || [])
        console.log('✅ Niveaux chargés:', levelsRes.data.levels)
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des données du formulaire:', err)
    }
  }
  
  // Charger les examens quand l'année change
  const fetchExamsByYear = async (year: number) => {
    setLoadingFormData(true)
    try {
      console.log(`🎓 Chargement des examens pour l'année ${year}...`)
      const response = await dataAPI.getExamsByYear(year)
      console.log('📋 Réponse examens:', response)
      
      if (response.data && response.data.results) {
        setAvailableExams(response.data.results || [])
        console.log('✅ Examens chargés:', response.data.results)
        // Réinitialiser les champs dépendants
        setAvailableSubjects([])
        setAvailableChapters([])
        setCreateForm(prev => ({ ...prev, examen: 0, matiere: 0, chapitre: 0 }))
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des examens:', err)
    }
    setLoadingFormData(false)
  }
  
  // Charger les matières quand l'examen change
  const fetchSubjectsByExam = async (year: number, examId: number) => {
    setLoadingFormData(true)
    try {
      console.log(`📚 Chargement des matières pour l'examen ${examId} (année ${year})...`)
      const response = await dataAPI.getSubjectsByYear(year, examId)
      console.log('📖 Réponse matières:', response)
      
      if (response.data && response.data.results) {
        const examData = response.data.results.find(r => r.exam_id === examId)
        console.log('🔎 Données de l\'examen trouvées:', examData)
        
        if (examData && examData.subjects) {
          setAvailableSubjects(examData.subjects || [])
          console.log('✅ Matières chargées:', examData.subjects)
          // Réinitialiser les chapitres
          setAvailableChapters([])
          setCreateForm(prev => ({ ...prev, matiere: 0, chapitre: 0 }))
        }
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des matières:', err)
    }
    setLoadingFormData(false)
  }
  
  // Charger les chapitres quand la matière change
  const fetchChaptersBySubject = async (subjectId: number) => {
    setLoadingFormData(true)
    try {
      console.log(`📝 Chargement des chapitres pour la matière ${subjectId}...`)
      const response = await dataAPI.getChaptersBySubject(subjectId.toString())
      console.log('📄 Réponse chapitres:', response)
      
      if (response.data && response.data.results) {
        const subjectData = response.data.results.find(r => r.subject_id === subjectId)
        console.log('🔎 Données de la matière trouvées:', subjectData)
        
        if (subjectData && subjectData.chapters) {
          setAvailableChapters(subjectData.chapters || [])
          console.log('✅ Chapitres chargés:', subjectData.chapters)
          setCreateForm(prev => ({ ...prev, chapitre: 0 }))
        }
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des chapitres:', err)
    }
    setLoadingFormData(false)
  }

  const fetchMetadatas = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getMetadatas()
      if (result.status === 200 && result.data) {
        setMetadatas(Array.isArray(result.data) ? result.data : [])
      } else {
        setError(result.error || 'Erreur lors de la récupération des questions')
      }
    } catch (err) {
      setError('Erreur lors de la récupération des questions')
    }
    setLoading(false)
  }

  const handleCreateMetadata = async () => {
    if (!createForm.titre) {
      setError('Le titre est requis')
      return
    }
    if (!createForm.matiere) {
      setError('La matière est requise')
      return
    }
    if (!createForm.chapitre) {
      setError('Le chapitre est requis')
      return
    }

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await createMetadata(createForm)
      
      if (response.status === 201 && response.data) {
        setSuccess('Métadonnées créées avec succès')
        setShowCreateModal(false)
        setCreateForm({
          titre: '',
          annee: new Date().getFullYear(),
          examen: 0,
          matiere: 0,
          chapitre: 0,
          niveau: undefined
        })
        fetchMetadatas()
        
        // Rediriger vers la page de sélection du type de question
        setTimeout(() => {
          router.push(`/dashboard/questions/type-selection?metadata_id=${response.data.id}`)
        }, 1000)
      } else {
        setError(response.error || 'Erreur lors de la création')
      }
    } catch (err) {
      setError("Erreur lors de la création des métadonnées")
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteMetadata = async () => {
    if (!selectedMetadata) return

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await deleteMetadata(selectedMetadata.id)
      
      if (response.status === 204 || response.status === 200) {
        setSuccess('Question supprimée avec succès')
        setShowDeleteModal(false)
        setSelectedMetadata(null)
        fetchMetadatas()
      } else {
        setError(response.error || "Erreur lors de la suppression")
      }
    } catch (err) {
      setError("Erreur lors de la suppression de la question")
    } finally {
      setFormLoading(false)
    }
  }


  const openDeleteModal = (metadata: MetadataResponse) => {
    setSelectedMetadata(metadata)
    setShowDeleteModal(true)
  }

  const openStructureEditor = (metadata: MetadataResponse) => {
    router.push(`/dashboard/questions/structure?metadata_id=${metadata.id}&type=${metadata.type_question}`)
  }

  const filteredMetadatas = metadatas.filter(metadata => {
    const matchesSearch = metadata.enonce.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          metadata.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = typeFilter === 'all' || metadata.type_question === typeFilter
    const matchesNiveau = niveauFilter === 'all' || metadata.niveau === niveauFilter

    return matchesSearch && matchesType && matchesNiveau
  })

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
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <FileQuestion className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Gestion des Questions
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Créez et gérez les questions et leurs réponses
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 px-6 py-2.5 font-semibold"
              size="default"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle Question
            </Button>
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

        {/* Table des Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FileQuestion className="h-6 w-6 text-blue-600" />
                    Liste des Questions
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Gérez les questions et leurs métadonnées
                  </CardDescription>
                </div>

                {/* Filtres et recherche */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  {/* Recherche */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64 border-gray-300 dark:border-gray-600"
                    />
                  </div>

                  {/* Filtres */}
                  <div className="flex gap-2">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous types</SelectItem>
                        {Object.entries(questionTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={niveauFilter} onValueChange={setNiveauFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="facile">Facile</SelectItem>
                        <SelectItem value="moyen">Moyen</SelectItem>
                        <SelectItem value="difficile">Difficile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Badge 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {filteredMetadatas.length} questions
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Énoncé</TableHead>
                      <TableHead className="font-bold">Niveau</TableHead>
                      <TableHead className="font-bold">Points</TableHead>
                      <TableHead className="font-bold">Durée</TableHead>
                      <TableHead className="font-bold">Tags</TableHead>
                      <TableHead className="font-bold">Ressources</TableHead>
                      <TableHead className="font-bold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <AnimatePresence mode="wait">
                        {filteredMetadatas.map((metadata, index) => {
                          const Icon = questionTypeIcons[metadata.type_question]
                          return (
                            <motion.tr
                              key={metadata.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            >
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4 text-blue-600" />
                                  <Badge variant="outline" className="text-xs">
                                    {questionTypeLabels[metadata.type_question]}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-md">
                                  <p className="truncate text-gray-900 dark:text-gray-100 font-medium">
                                    {metadata.enonce}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={cn("font-semibold", niveauColors[metadata.niveau])}>
                                  {metadata.niveau}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-600 dark:text-gray-400">
                                {metadata.points} pts
                              </TableCell>
                              <TableCell className="text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {metadata.duree_estimee}s
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1 flex-wrap max-w-xs">
                                  {metadata.tags?.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {metadata.tags && metadata.tags.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{metadata.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {metadata.image_url && (
                                    <Badge variant="outline" className="text-xs">
                                      <Image className="h-3 w-3 mr-1" />
                                      Image
                                    </Badge>
                                  )}
                                  {metadata.ressource_audio_url && (
                                    <Badge variant="outline" className="text-xs">
                                      <Volume2 className="h-3 w-3 mr-1" />
                                      Audio
                                    </Badge>
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
                                    <DropdownMenuItem onClick={() => openStructureEditor(metadata)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Éditer la structure
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Eye className="mr-2 h-4 w-4" />
                                      Voir détails
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => openDeleteModal(metadata)}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </motion.tr>
                          )
                        })}
                      </AnimatePresence>
                    )}
                  </TableBody>
                </Table>
                
                {!loading && filteredMetadatas.length === 0 && (
                  <div className="text-center py-12">
                    <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      Aucune question trouvée
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Créez votre première question pour commencer
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de création de métadonnées */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-6 border-b border-gray-200 dark:border-gray-700">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                  <FileQuestion className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Nouvelle Question
                </span>
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2 text-base">
                Configurez les paramètres de votre question pour l'examen
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 mt-8">
              {/* Titre */}
              <div className="space-y-2">
                <Label htmlFor="titre" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Titre de la question <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="titre"
                  value={createForm.titre}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, titre: e.target.value }))}
                  placeholder="Titre descriptif de la question"
                  className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
                />
              </div>

              {/* Année */}
              <div className="space-y-2">
                <Label htmlFor="annee" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Année <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={createForm.annee?.toString()} 
                  onValueChange={(value) => {
                    const year = parseInt(value);
                    setCreateForm(prev => ({ ...prev, annee: year }));
                    fetchExamsByYear(year);
                  }}
                  disabled={loadingFormData}
                >
                  <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg">
                    <SelectValue placeholder="Sélectionner une année" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {availableYears.length > 0 ? (
                      availableYears.map(year => (
                        <SelectItem key={year} value={year.toString()} className="py-2.5">
                          {year}
                        </SelectItem>
                      ))
                    ) : (
                      Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={year} value={year.toString()} className="py-2.5">
                            {year}
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Examen */}
              <div className="space-y-2">
                <Label htmlFor="examen" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Examen <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={createForm.examen.toString()} 
                  onValueChange={(value) => {
                    const examId = parseInt(value);
                    setCreateForm(prev => ({ ...prev, examen: examId }));
                    if (createForm.annee) {
                      fetchSubjectsByExam(createForm.annee, examId);
                    }
                  }}
                  disabled={!createForm.annee || loadingFormData || availableExams.length === 0}
                >
                  <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg">
                    <SelectValue placeholder={availableExams.length === 0 ? "Sélectionnez d'abord une année" : "Sélectionner un examen"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {availableExams.length > 0 ? (
                      availableExams.map(exam => (
                        <SelectItem key={exam.id} value={exam.id.toString()} className="py-2.5">
                          {exam.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="0" disabled className="py-2.5 text-gray-400">
                        Aucun examen disponible
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-5">
                {/* Matière */}
                <div className="space-y-2">
                  <Label htmlFor="matiere" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Matière <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={createForm.matiere.toString()} 
                    onValueChange={(value) => {
                      const subjectId = parseInt(value);
                      setCreateForm(prev => ({ ...prev, matiere: subjectId }));
                      fetchChaptersBySubject(subjectId);
                    }}
                    disabled={!createForm.examen || loadingFormData || availableSubjects.length === 0}
                  >
                    <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg">
                      <SelectValue placeholder={availableSubjects.length === 0 ? "Sélectionnez d'abord un examen" : "Sélectionner une matière"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {availableSubjects.length > 0 ? (
                        availableSubjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id.toString()} className="py-2.5">
                            {subject.title}
                            {subject.chapters_count && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({subject.chapters_count} chapitres)
                              </span>
                            )}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="0" disabled className="py-2.5 text-gray-400">
                          Aucune matière disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Chapitre */}
                <div className="space-y-2">
                  <Label htmlFor="chapitre" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Chapitre <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={createForm.chapitre.toString()} 
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, chapitre: parseInt(value) }))}
                    disabled={!createForm.matiere || loadingFormData || availableChapters.length === 0}
                  >
                    <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg">
                      <SelectValue placeholder={availableChapters.length === 0 ? "Sélectionnez d'abord une matière" : "Sélectionner un chapitre"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      {availableChapters.length > 0 ? (
                        availableChapters.map(chapter => (
                          <SelectItem key={chapter.id} value={chapter.id.toString()} className="py-2.5">
                            {chapter.title}
                            {chapter.order && (
                              <span className="ml-2 text-xs text-gray-500">
                                (Ordre: {chapter.order})
                              </span>
                            )}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="0" disabled className="py-2.5 text-gray-400">
                          Aucun chapitre disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Niveau */}
              <div className="space-y-2">
                <Label htmlFor="niveau" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Niveau de Difficulté (optionnel)
                </Label>
                <Select 
                  value={createForm.niveau?.toString() || ''} 
                  onValueChange={(value) => setCreateForm(prev => ({ ...prev, niveau: value ? parseInt(value) : undefined }))}
                >
                  <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg">
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {availableLevels.length > 0 ? (
                      availableLevels.map(level => (
                        <SelectItem key={level.id} value={level.id.toString()} className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              level.title.toLowerCase() === 'facile' ? 'bg-green-500' :
                              level.title.toLowerCase() === 'moyen' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}></div>
                            <span className="font-medium">{level.title}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="1" className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="font-medium">Facile</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="2" className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span className="font-medium">Moyen</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="3" className="py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="font-medium">Difficile</span>
                          </div>
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>


              {/* Info box */}
              <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 rounded-xl">
                <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
                  Cette étape configure les métadonnées de base. Ensuite vous pourrez choisir le type de question et définir la structure de réponse.
                </AlertDescription>
              </Alert>
            </div>
            
            <div className="flex gap-3 pt-6 mt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateForm({
                    titre: '',
                    annee: new Date().getFullYear(),
                    examen: 0,
                    matiere: 0,
                    chapitre: 0,
                    niveau: undefined
                  })
                }}
                className="flex-1 h-12 rounded-lg font-medium"
                disabled={formLoading}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateMetadata}
                disabled={formLoading || !createForm.titre || !createForm.annee || !createForm.examen || !createForm.matiere || !createForm.chapitre}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/25 transition-all duration-200 rounded-lg font-semibold"
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
                Êtes-vous sûr de vouloir supprimer cette question ? Cette action est irréversible.
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
                onClick={handleDeleteMetadata}
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

      </div>
    </div>
  )
}