"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getMetadataById, MetadataResponse } from '@/lib/questions-api'
import { 
  ArrowLeft,
  HelpCircle,
  ListOrdered,
  Hash,
  FileQuestion,
  Shuffle,
  Type,
  Calculator,
  ChevronRight,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

const questionTypes = [
  {
    id: 'VF',
    label: 'Vrai/Faux',
    description: 'Question avec réponse vraie ou fausse',
    icon: HelpCircle,
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'QCM_S',
    label: 'QCM Simple',
    description: 'Questions à choix multiple avec une seule bonne réponse',
    icon: ListOrdered,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'QRM',
    label: 'QCM Multiple',
    description: 'Questions à choix multiple avec plusieurs bonnes réponses',
    icon: Hash,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'QCM_P',
    label: 'Assertions',
    description: 'Questions avec assertions A et B à évaluer',
    icon: FileQuestion,
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'QAA',
    label: 'Appariement',
    description: 'Association d\'éléments entre deux colonnes',
    icon: Shuffle,
    color: 'from-cyan-500 to-cyan-600'
  },
  {
    id: 'ORD',
    label: 'Ordre',
    description: 'Remise en ordre d\'éléments',
    icon: ListOrdered,
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'LAC',
    label: 'Texte à trous',
    description: 'Complétion de texte avec des mots manquants',
    icon: Type,
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'GRID',
    label: 'Grille',
    description: 'Sélection dans une grille de cellules',
    icon: Calculator,
    color: 'from-red-500 to-red-600'
  }
]

export default function TypeSelectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const metadataId = searchParams.get('metadata_id')

  const [metadata, setMetadata] = useState<MetadataResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!metadataId) {
      setError('ID des métadonnées manquant')
      setLoading(false)
      return
    }

    fetchMetadata()
  }, [metadataId])

  const fetchMetadata = async () => {
    if (!metadataId) return

    try {
      const response = await getMetadataById(parseInt(metadataId))
      if (response.status === 200 && response.data) {
        setMetadata(response.data)
      } else {
        setError('Impossible de charger les métadonnées')
      }
    } catch (err) {
      setError('Erreur lors du chargement des métadonnées')
    }
    setLoading(false)
  }

  const handleTypeSelection = (typeId: string) => {
    router.push(`/dashboard/questions/structure?metadata_id=${metadataId}&type=${typeId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!metadataId || !metadata || error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Paramètres manquants ou métadonnées non trouvées'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/questions')}
              className="rounded-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Étape 2: Type de question
            </Badge>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Choisir le Type de Question
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Pour la question: <span className="font-semibold">{metadata.titre}</span>
            </p>
          </div>
        </motion.div>

        {/* Grid des types de questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {questionTypes.map((type, index) => {
            const Icon = type.icon
            
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer h-full hover:shadow-lg transition-all duration-200 border-0 shadow-md group"
                  onClick={() => handleTypeSelection(type.id)}
                >
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} shadow-lg mb-3 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
                      {type.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {type.description}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
                        {type.id}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Info */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800 max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            Sélectionnez le type de question qui correspond le mieux à vos besoins. 
            Vous pourrez ensuite configurer la structure de réponse spécifique à ce type.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}