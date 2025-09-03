"use client"

import { useState, useEffect } from "react"
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Image, 
  Calendar, 
  User, 
  CheckCircle, 
  XCircle, 
  GraduationCap, 
  Search, 
  Globe, 
  Trophy,
  Clock,
  Activity,
  AlertTriangle,
  MoreVertical,
  Eye,
  TrendingUp
} from "lucide-react"
import { dataAPI, Exam, Country } from "@/lib/data-api"
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

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCountry, setFilterCountry] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('')
  
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    id_country: 0,
    is_active: true,
    image: '',
    avatar_url: ''
  })

  // Stats cards data dans le style de la page users
  const safeExams = Array.isArray(exams) ? exams : []
  const totalExams = safeExams.length
  const activeExams = safeExams.filter(e => e.is_active).length
  const uniqueCountries = [...new Set(safeExams.map(e => e.id_country).filter(Boolean))].length
  const inactiveExams = totalExams - activeExams
  
  const statsCards = [
    {
      title: "Total Examens",
      subtitle: "Examens enregistrés",
      value: totalExams,
      icon: GraduationCap,
      trend: "+8.2%",
      isPositive: true
    },
    {
      title: "Examens Actifs", 
      subtitle: "Examens disponibles",
      value: activeExams,
      icon: CheckCircle,
      trend: "+12.5%",
      isPositive: true
    },
    {
      title: "Pays Couverts",
      subtitle: "Couverture géographique",
      value: uniqueCountries,
      icon: Globe,
      trend: "+3.1%",
      isPositive: true
    },
    {
      title: "Examens Inactifs",
      subtitle: "Examens désactivés",
      value: inactiveExams,
      icon: XCircle,
      trend: "-2.3%",
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

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [selectedFile])

  useEffect(() => {
    if (selectedAvatarFile) {
      const url = URL.createObjectURL(selectedAvatarFile)
      setAvatarPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
  }, [selectedAvatarFile])

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [examsResponse, countriesResponse] = await Promise.all([
        dataAPI.getExams(),
        dataAPI.getCountries()
      ])
      
      if (examsResponse.data) {
        // La réponse Django a la structure {status, count, data}
        const examsList = examsResponse.data.data || examsResponse.data
        setExams(Array.isArray(examsList) ? examsList : [])
      }
      if (countriesResponse.data) {
        const countriesList = countriesResponse.data.data || countriesResponse.data
        setCountries(Array.isArray(countriesList) ? countriesList : [])
      }
      if (examsResponse.error) {
        setError(examsResponse.error)
      }
    } catch (err) {
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExam = async () => {
    if (!formData.title || !formData.description || !formData.id_country || !formData.year) {
      setError('Tous les champs requis doivent être remplis')
      return
    }

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      if (selectedFile || selectedAvatarFile) {
        const formDataToSend = new FormData()
        formDataToSend.append('title', formData.title)
        formDataToSend.append('description', formData.description)
        formDataToSend.append('year', formData.year.toString())
        formDataToSend.append('id_country', formData.id_country.toString())
        formDataToSend.append('is_active', formData.is_active.toString())
        
        if (selectedFile) {
          formDataToSend.append('image', selectedFile)
        }
        if (selectedAvatarFile) {
          formDataToSend.append('avatar_url', selectedAvatarFile)
        }

        const response = await dataAPI.createExam(formDataToSend)
        if (response.data) {
          setSuccess('Examen créé avec succès')
          setShowCreateModal(false)
          resetForm()
          await fetchData()
        } else if (response.error) {
          setError(response.error)
        }
      } else {
        const examData = {
          title: formData.title,
          description: formData.description,
          year: formData.year,
          id_country: formData.id_country,
          is_active: formData.is_active,
          image: '',
          avatar_url: ''
        }
        
        const response = await dataAPI.createExamJson(examData)
        if (response.data) {
          setSuccess('Examen créé avec succès')
          setShowCreateModal(false)
          resetForm()
          await fetchData()
        } else if (response.error) {
          setError(response.error)
        }
      }
    } catch (err) {
      setError('Erreur lors de la création de l\'examen')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditExam = async () => {
    if (!selectedExam || !formData.title || !formData.description || !formData.id_country || !formData.year) {
      setError('Tous les champs requis doivent être remplis')
      return
    }

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      if (selectedFile || selectedAvatarFile) {
        const formDataToSend = new FormData()
        formDataToSend.append('title', formData.title)
        formDataToSend.append('description', formData.description)
        formDataToSend.append('year', formData.year.toString())
        formDataToSend.append('id_country', formData.id_country.toString())
        formDataToSend.append('is_active', formData.is_active.toString())
        
        if (selectedFile) {
          formDataToSend.append('image', selectedFile)
        }
        if (selectedAvatarFile) {
          formDataToSend.append('avatar_url', selectedAvatarFile)
        }

        const response = await dataAPI.updateExamWithImage(selectedExam.id, formDataToSend)
        if (response.data) {
          setSuccess('Examen modifié avec succès')
          setShowEditModal(false)
          setSelectedExam(null)
          resetForm()
          await fetchData()
        } else if (response.error) {
          setError(response.error)
        }
      } else {
        const examData = {
          title: formData.title,
          description: formData.description,
          year: formData.year,
          id_country: formData.id_country,
          is_active: formData.is_active,
          image: selectedExam.image || '',
          avatar_url: selectedExam.avatar_url || ''
        }
        
        const response = await dataAPI.updateExam(selectedExam.id, examData)
        if (response.data) {
          setSuccess('Examen modifié avec succès')
          setShowEditModal(false)
          setSelectedExam(null)
          resetForm()
          await fetchData()
        } else if (response.error) {
          setError(response.error)
        }
      }
    } catch (err) {
      setError('Erreur lors de la modification de l\'examen')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteExam = async () => {
    if (!selectedExam) return

    setFormLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await dataAPI.deleteExam(selectedExam.id)
      if (response.status === 204 || response.status === 200) {
        setSuccess('Examen supprimé avec succès')
        setShowDeleteModal(false)
        setSelectedExam(null)
        await fetchData()
      } else if (response.error) {
        setError(response.error)
      }
    } catch (err) {
      setError('Erreur lors de la suppression de l\'examen')
    } finally {
      setFormLoading(false)
    }
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (exam: Exam) => {
    setSelectedExam(exam)
    setFormData({
      title: exam.title,
      description: exam.description,
      year: exam.year || new Date().getFullYear(),
      id_country: exam.id_country,
      is_active: exam.is_active,
      image: exam.image || '',
      avatar_url: exam.avatar_url || ''
    })
    if (exam.image) {
      setPreviewUrl(exam.image)
    }
    if (exam.avatar_url) {
      setAvatarPreviewUrl(exam.avatar_url)
    }
    setShowEditModal(true)
  }

  const openDeleteModal = (exam: Exam) => {
    setSelectedExam(exam)
    setShowDeleteModal(true)
  }

  const openDetailsModal = (exam: Exam) => {
    setSelectedExam(exam)
    setShowDetailsModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      year: new Date().getFullYear(),
      id_country: countries[0]?.id || 0,
      is_active: true,
      image: '',
      avatar_url: ''
    })
    setSelectedFile(null)
    setSelectedAvatarFile(null)
    setPreviewUrl(null)
    setAvatarPreviewUrl(null)
  }

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setShowImageModal(true)
  }

  const filteredExams = safeExams.filter(exam => {
    const title = (exam.title || '').toLowerCase()
    const description = (exam.description || '').toLowerCase()
    const q = (searchTerm || '').toLowerCase()

    const matchSearch = title.includes(q) || description.includes(q)
    const matchCountry = !filterCountry || exam.id_country === filterCountry
    return matchSearch && matchCountry
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
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Gestion des Examens
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Configurez les examens et leurs paramètres
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
                Nouvel Examen
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

        {/* Table des Examens */}
        <div>
          <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
            <CardHeader className="pb-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-violet-600" />
                    Liste des Examens
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Examens disponibles avec leurs informations
                  </CardDescription>
                </div>

                {/* Recherche et filtres */}
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher un examen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <Select value={filterCountry?.toString() || 'all'} onValueChange={(value) => setFilterCountry(value === 'all' ? null : parseInt(value))}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Tous les pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les pays</SelectItem>
                      {countries.map(country => (
                        <SelectItem key={country.id} value={country.id.toString()}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge 
                    variant="secondary" 
                    className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                  >
                    {filteredExams.length} examens
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-bold">Image</TableHead>
                      <TableHead className="font-bold">Examen</TableHead>
                      <TableHead className="font-bold">Description</TableHead>
                      <TableHead className="font-bold">Année</TableHead>
                      <TableHead className="font-bold">Pays</TableHead>
                      <TableHead className="font-bold">Statut</TableHead>
                      <TableHead className="font-bold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-12 w-12 rounded" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                        filteredExams.map((exam, index) => (
                          <tr
                            key={exam.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <TableCell>
                              {exam.image ? (
                                <Avatar 
                                  className="h-12 w-12 cursor-pointer"
                                  onClick={() => openImageModal(exam.image!)}
                                >
                                  <AvatarImage src={exam.image} alt={exam.title} />
                                  <AvatarFallback>
                                    <Image className="h-6 w-6" />
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <Avatar className="h-12 w-12">
                                  <AvatarFallback className="bg-violet-100 text-violet-600">
                                    <Image className="h-6 w-6" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {exam.title}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                {exam.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                                {exam.year || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className="border-violet-200 text-violet-700 bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-900/30"
                              >
                                {exam.pays?.nom || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {exam.is_active ? (
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
                                  <DropdownMenuItem onClick={() => openDetailsModal(exam)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Voir détails
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openEditModal(exam)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => openDeleteModal(exam)}
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
                
                {!loading && filteredExams.length === 0 && (
                  <div className="text-center py-12">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      Aucun examen trouvé
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

        {/* Modal pour voir l&apos;image */}
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Aperçu de l&apos;image</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img src={selectedImage} alt="Exam" className="max-w-full max-h-96 rounded-lg" />
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de création d'examen */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-5 w-5 text-violet-600" />
                </div>
                Configuration de l'Examen
              </DialogTitle>
              <DialogDescription>
                Configurer les paramètres de l'examen (BEPC).
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'examen *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre descriptif de l'examen"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exam_type">Examen *</Label>
                  <Input
                    id="exam_type"
                    value="BEPC"
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Année *</Label>
                  <Input
                    id="year"
                    type="number"
                    min="2000"
                    max="2100"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                    placeholder="Ex: 2024"
                  />
                </div>
              </div>
              
              {/* Matière et Chapitre */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Matière *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une matière" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maths">Mathématiques</SelectItem>
                      <SelectItem value="physics">Physique</SelectItem>
                      <SelectItem value="chemistry">Chimie</SelectItem>
                      <SelectItem value="french">Français</SelectItem>
                      <SelectItem value="english">Anglais</SelectItem>
                      <SelectItem value="history">Histoire</SelectItem>
                      <SelectItem value="geography">Géographie</SelectItem>
                      <SelectItem value="biology">Biologie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chapter">Chapitre *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un chapitre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ch1">Chapitre 1</SelectItem>
                      <SelectItem value="ch2">Chapitre 2</SelectItem>
                      <SelectItem value="ch3">Chapitre 3</SelectItem>
                      <SelectItem value="ch4">Chapitre 4</SelectItem>
                      <SelectItem value="ch5">Chapitre 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Niveau et Pays */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Niveau *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facile">Facile</SelectItem>
                      <SelectItem value="moyen">Moyen</SelectItem>
                      <SelectItem value="difficile">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Pays *</Label>
                  <Select value={formData.id_country.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, id_country: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country.id} value={country.id.toString()}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Statut */}
              <div className="space-y-2">
                <Label htmlFor="is_active_check">Statut</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active_check"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_active_check" className="font-normal">Examen actif</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de l&apos;examen..."
                  className="w-full p-3 border rounded-md min-h-24 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Image principale (optionnel)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  {previewUrl && (
                    <div className="mt-2">
                      <img src={previewUrl} alt="Preview" className="max-w-32 max-h-32 rounded-lg border" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatar_url">Avatar (optionnel)</Label>
                  <Input
                    id="avatar_url"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedAvatarFile(e.target.files?.[0] || null)}
                  />
                  {avatarPreviewUrl && (
                    <div className="mt-2">
                      <img src={avatarPreviewUrl} alt="Avatar Preview" className="max-w-32 max-h-32 rounded-lg border" />
                    </div>
                  )}
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
                onClick={handleCreateExam}
                disabled={formLoading || !formData.title || !formData.description || !formData.id_country || !formData.year}
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
                Modifier l&apos;Examen
              </DialogTitle>
              <DialogDescription>
                Modifiez les informations de l&apos;examen {selectedExam?.title}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_title">Titre de l'examen *</Label>
                <Input
                  id="edit_title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre descriptif de l'examen"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_exam_type">Examen *</Label>
                  <Input
                    id="edit_exam_type"
                    value="BEPC"
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_year">Année *</Label>
                  <Input
                    id="edit_year"
                    type="number"
                    min="2000"
                    max="2100"
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                    placeholder="Ex: 2024"
                  />
                </div>
              </div>
              
              {/* Matière et Chapitre */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_subject">Matière *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une matière" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maths">Mathématiques</SelectItem>
                      <SelectItem value="physics">Physique</SelectItem>
                      <SelectItem value="chemistry">Chimie</SelectItem>
                      <SelectItem value="french">Français</SelectItem>
                      <SelectItem value="english">Anglais</SelectItem>
                      <SelectItem value="history">Histoire</SelectItem>
                      <SelectItem value="geography">Géographie</SelectItem>
                      <SelectItem value="biology">Biologie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_chapter">Chapitre *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un chapitre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ch1">Chapitre 1</SelectItem>
                      <SelectItem value="ch2">Chapitre 2</SelectItem>
                      <SelectItem value="ch3">Chapitre 3</SelectItem>
                      <SelectItem value="ch4">Chapitre 4</SelectItem>
                      <SelectItem value="ch5">Chapitre 5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Niveau et Pays */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_level">Niveau *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un niveau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facile">Facile</SelectItem>
                      <SelectItem value="moyen">Moyen</SelectItem>
                      <SelectItem value="difficile">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_country">Pays *</Label>
                  <Select value={formData.id_country.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, id_country: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country.id} value={country.id.toString()}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Statut */}
              <div className="space-y-2">
                <Label htmlFor="edit_is_active_check">Statut</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_is_active_check"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="edit_is_active_check" className="font-normal">Examen actif</Label>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description *</Label>
                <textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de l&apos;examen..."
                  className="w-full p-3 border rounded-md min-h-24 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_image">Image principale (optionnel)</Label>
                  <Input
                    id="edit_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  {previewUrl && (
                    <div className="mt-2">
                      <img src={previewUrl} alt="Preview" className="max-w-32 max-h-32 rounded-lg border" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_avatar_url">Avatar (optionnel)</Label>
                  <Input
                    id="edit_avatar_url"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedAvatarFile(e.target.files?.[0] || null)}
                  />
                  {avatarPreviewUrl && (
                    <div className="mt-2">
                      <img src={avatarPreviewUrl} alt="Avatar Preview" className="max-w-32 max-h-32 rounded-lg border" />
                    </div>
                  )}
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
                onClick={handleEditExam}
                disabled={formLoading || !formData.title || !formData.description || !formData.id_country || !formData.year}
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
                Supprimer l&apos;examen
              </DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer définitivement l&apos;examen <strong>{selectedExam?.title}</strong> ? Cette action supprimera également toutes les matières et chapitres associés.
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
                onClick={handleDeleteExam}
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
                  <GraduationCap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                Détails de {selectedExam?.title}
              </DialogTitle>
            </DialogHeader>
            
            {selectedExam && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Titre</Label>
                    <p className="font-medium">{selectedExam.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Année</Label>
                    <Badge variant="secondary" className="mt-1">{selectedExam.year || 'N/A'}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Pays</Label>
                    <Badge className="mt-1">{selectedExam.pays?.nom || 'N/A'}</Badge>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Description</Label>
                  <p className="font-medium">{selectedExam.description}</p>
                </div>
                
                {selectedExam.image && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Image</Label>
                    <img src={selectedExam.image} alt={selectedExam.title} className="max-w-48 max-h-48 rounded-lg border mt-2" />
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Statut</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedExam.is_active ? (
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
                    <Label className="text-sm font-medium text-gray-500">Créé par</Label>
                    <p className="font-medium">{selectedExam.created_by || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date de création</Label>
                  <p className="font-medium">
                    {new Date(selectedExam.created_at).toLocaleDateString('fr-FR', {
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