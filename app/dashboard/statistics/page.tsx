"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Award,
  Medal,
  MessageSquare,
  Users,
  BookOpen,
  GraduationCap,
  Globe,
  ChevronDown,
  Eye,
  Clock,
  Activity,
  Zap,
  TrendingUp,
  Flag
} from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

// Données simulées pour les pays
const countries = [
  { code: "MA", name: "Maroc", flag: "🇲🇦" },
  { code: "TN", name: "Tunisie", flag: "🇹🇳" },
  { code: "DZ", name: "Algérie", flag: "🇩🇿" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" }
]

// Données simulées par pays
const getCountryStats = (countryCode: string) => {
  const baseStats = {
    "MA": { licenses: 12450, excellence: 890, qr: 5670, ambassadors: 234, exams: 45, subjects: 78 },
    "TN": { licenses: 8930, excellence: 567, qr: 4230, ambassadors: 189, exams: 38, subjects: 62 },
    "DZ": { licenses: 15670, excellence: 1200, qr: 6890, ambassadors: 298, exams: 52, subjects: 89 },
    "SN": { licenses: 6780, excellence: 445, qr: 3210, ambassadors: 156, exams: 34, subjects: 56 },
    "CI": { licenses: 9340, excellence: 678, qr: 4560, ambassadors: 201, exams: 41, subjects: 67 },
    "CM": { licenses: 7890, excellence: 534, qr: 3890, ambassadors: 178, exams: 36, subjects: 58 }
  }
  return baseStats[countryCode as keyof typeof baseStats] || baseStats["MA"]
}

const getCountryQuestions = (countryCode: string) => {
  const questions = [
    { id: 1, question: "Quelle est la capitale du Maroc ?", type: "QCM", subject: "Géographie", chapter: "Capitales", created: "2024-01-15" },
    { id: 2, question: "Résoudre l'équation 2x + 5 = 15", type: "Numérique", subject: "Mathématiques", chapter: "Équations", created: "2024-01-14" },
    { id: 3, question: "Qui a écrit 'L'Étranger' ?", type: "QCM", subject: "Littérature", chapter: "Auteurs", created: "2024-01-13" },
    { id: 4, question: "La photosynthèse se produit dans...", type: "QCM", subject: "Sciences", chapter: "Biologie", created: "2024-01-12" },
    { id: 5, question: "Calculer l'aire d'un cercle de rayon 5cm", type: "Numérique", subject: "Mathématiques", chapter: "Géométrie", created: "2024-01-11" }
  ]
  
  // Simuler des variations par pays
  return questions.map(q => ({
    ...q,
    question: q.question.replace("Maroc", countries.find(c => c.code === countryCode)?.name || "Maroc")
  }))
}

export default function StatisticsPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const stats = getCountryStats(selectedCountry.code)
  const questions = getCountryQuestions(selectedCountry.code)

  const metrics = [
    {
      title: "To. Licences",
      subtitle: "Licences achetées",
      value: stats.licenses.toLocaleString(),
      icon: Award,
      trend: "+15.2%",
      isPositive: true
    },
    {
      title: "To. Codes Excellence",
      subtitle: "Codes en cours",
      value: stats.excellence.toLocaleString(),
      icon: Medal,
      trend: "+8.7%",
      isPositive: true
    },
    {
      title: "To. Questions/Réponses",
      subtitle: "Q&R créées",
      value: stats.qr.toLocaleString(),
      icon: MessageSquare,
      trend: "+12.4%",
      isPositive: true
    },
    {
      title: "To. Ambassadeurs",
      subtitle: "Ambassadeurs actifs",
      value: stats.ambassadors.toLocaleString(),
      icon: Users,
      trend: "+6.8%",
      isPositive: true
    },
    {
      title: "To. Examens/Options",
      subtitle: "Examens disponibles",
      value: stats.exams.toLocaleString(),
      icon: GraduationCap,
      trend: "+3.2%",
      isPositive: true
    },
    {
      title: "To. Matières/Chapitres",
      subtitle: "Contenus éducatifs",
      value: stats.subjects.toLocaleString(),
      icon: BookOpen,
      trend: "+9.1%",
      isPositive: true
    }
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-6 space-y-8">
        {/* Header avec sélecteur de pays */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 shadow-lg">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Statistiques par Pays
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Analyse détaillée des performances par région
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Dropdown de sélection du pays */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-violet-200 dark:border-violet-700 hover:border-violet-400 dark:hover:border-violet-500 rounded-xl min-w-[200px] justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{selectedCountry.flag}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {selectedCountry.name}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-violet-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {countries.map((country) => (
                    <DropdownMenuItem 
                      key={country.code}
                      onClick={() => setSelectedCountry(country)}
                      className="cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-950/30 flex items-center gap-3"
                    >
                      <span className="text-xl">{country.flag}</span>
                      <span>{country.name}</span>
                      {selectedCountry.code === country.code && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-violet-600" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

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
            </div>
          </div>
        </motion.div>

        {/* Indicateur du pays sélectionné */}
        <motion.div
          key={selectedCountry.code}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl shadow-lg"
        >
          <Flag className="h-5 w-5" />
          <span className="font-semibold">
            Données pour : {selectedCountry.flag} {selectedCountry.name}
          </span>
        </motion.div>

        {/* Cards Statistiques */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCountry.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {metrics.map((metric, index) => {
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
                            {metric.value}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                              <Zap className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                            </div>
                            <span className="text-sm font-bold flex items-center gap-1 px-2 py-1 rounded-full text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30">
                              <TrendingUp className="h-3 w-3" />
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

        {/* Tableau des Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-violet-600" />
                    Questions Créées - {selectedCountry.flag} {selectedCountry.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Liste des questions disponibles avec type de réponse
                  </CardDescription>
                </div>
                <Badge 
                  variant="secondary" 
                  className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                >
                  {questions.length} questions
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                      <TableHead className="font-bold">Question</TableHead>
                      <TableHead className="font-bold">Type</TableHead>
                      <TableHead className="font-bold">Matière</TableHead>
                      <TableHead className="font-bold">Chapitre</TableHead>
                      <TableHead className="font-bold">Créée le</TableHead>
                      <TableHead className="font-bold text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="wait">
                      {questions.map((question, index) => (
                        <motion.tr
                          key={`${selectedCountry.code}-${question.id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >
                          <TableCell className="font-medium max-w-md">
                            <div className="truncate" title={question.question}>
                              {question.question}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={cn(
                                "font-semibold",
                                question.type === "QCM" 
                                  ? "border-violet-200 text-violet-700 bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:bg-violet-900/30"
                                  : "border-green-200 text-green-700 bg-green-50 dark:border-green-700 dark:text-green-300 dark:bg-green-900/30"
                              )}
                            >
                              {question.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {question.subject}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            {question.chapter}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {new Date(question.created).toLocaleDateString('fr-FR')}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:border-violet-300 dark:hover:border-violet-700"
                            >
                              <Eye className="h-4 w-4" />
                              Prévisualiser
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}