"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  createStructureV2,
  getMetadataById,
  MetadataResponse,
  ResponseDataVF,
  ResponseDataQCMS,
  ResponseDataQRM,
  ResponseDataQCMP,
  ResponseDataQAA,
  ResponseDataORD,
  ResponseDataLAC,
  ResponseDataGRID
} from '@/lib/questions-api'
import { 
  Save, 
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  HelpCircle,
  ListOrdered,
  Hash,
  FileQuestion,
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"

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

export default function StructurePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const metadataId = searchParams.get('metadata_id')
  const questionType = searchParams.get('type') as keyof typeof questionTypeLabels

  const [metadata, setMetadata] = useState<MetadataResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states pour chaque type de question
  const [contenu, setContenu] = useState('')
  const [durationSeconds, setDurationSeconds] = useState(60)
  const [points, setPoints] = useState(1)

  // VF
  const [vfCorrectAnswer, setVfCorrectAnswer] = useState(true)
  const [vfExplanation, setVfExplanation] = useState('')

  // QCM_S et QRM
  const [qcmOptions, setQcmOptions] = useState([{ text: '', is_correct: false }])
  const [qcmExplanation, setQcmExplanation] = useState('')

  // QCM_P
  const [assertionA, setAssertionA] = useState('')
  const [assertionB, setAssertionB] = useState('')
  const [correctOption, setCorrectOption] = useState(1)
  const [qcmpExplanation, setQcmpExplanation] = useState('')

  // QAA
  const [qaaPairs, setQaaPairs] = useState([{ left: '', right: '' }])
  const [qaaExplanation, setQaaExplanation] = useState('')

  // ORD
  const [ordItems, setOrdItems] = useState([''])
  const [ordExplanation, setOrdExplanation] = useState('')

  // LAC
  const [lacTextWithBlanks, setLacTextWithBlanks] = useState('')
  const [lacBlanks, setLacBlanks] = useState([{ correct_answer: '', options: [] }])
  const [lacExplanation, setLacExplanation] = useState('')

  // GRID
  const [gridRows, setGridRows] = useState(2)
  const [gridCols, setGridCols] = useState(2)
  const [gridCells, setGridCells] = useState([])
  const [gridExplanation, setGridExplanation] = useState('')

  useEffect(() => {
    if (!metadataId || !questionType) {
      setError('Paramètres manquants')
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
        setContenu(response.data.enonce || '')
        setDurationSeconds(response.data.duree_estimee || 60)
        setPoints(response.data.points || 1)
      } else {
        setError('Impossible de charger les métadonnées')
      }
    } catch (err) {
      setError('Erreur lors du chargement des métadonnées')
    }
    setLoading(false)
  }

  const buildResponseData = () => {
    switch (questionType) {
      case 'VF':
        return {
          correct_answer: vfCorrectAnswer,
          explanation: vfExplanation
        } as ResponseDataVF

      case 'QCM_S':
      case 'QRM':
        return {
          options: qcmOptions,
          explanation: qcmExplanation
        } as ResponseDataQCMS | ResponseDataQRM

      case 'QCM_P':
        return {
          assertion_a: assertionA,
          assertion_b: assertionB,
          correct_option: correctOption,
          explanation: qcmpExplanation
        } as ResponseDataQCMP

      case 'QAA':
        return {
          pairs: qaaPairs,
          explanation: qaaExplanation
        } as ResponseDataQAA

      case 'ORD':
        return {
          items: ordItems.filter(item => item.trim()),
          explanation: ordExplanation
        } as ResponseDataORD

      case 'LAC':
        return {
          text_with_blanks: lacTextWithBlanks,
          blanks: lacBlanks,
          explanation: lacExplanation
        } as ResponseDataLAC

      case 'GRID':
        return {
          grid: { rows: gridRows, cols: gridCols },
          cells: gridCells,
          explanation: gridExplanation
        } as ResponseDataGRID

      default:
        throw new Error(`Type de question non supporté: ${questionType}`)
    }
  }

  const handleSave = async () => {
    if (!metadataId || !questionType) {
      setError('Paramètres manquants')
      return
    }

    if (!contenu.trim()) {
      setError('Le contenu est requis')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const responseData = buildResponseData()
      
      const response = await createStructureV2(
        parseInt(metadataId),
        contenu,
        questionType,
        responseData,
        durationSeconds,
        points
      )

      if (response.status === 201 || response.status === 200) {
        setSuccess('Structure de réponse créée avec succès')
        setTimeout(() => {
          router.push('/dashboard/questions')
        }, 2000)
      } else {
        setError(response.error || 'Erreur lors de la création')
      }
    } catch (err) {
      setError('Erreur lors de la création de la structure')
    } finally {
      setSaving(false)
    }
  }

  const addQcmOption = () => {
    setQcmOptions([...qcmOptions, { text: '', is_correct: false }])
  }

  const updateQcmOption = (index: number, field: 'text' | 'is_correct', value: string | boolean) => {
    const newOptions = [...qcmOptions]
    newOptions[index] = { ...newOptions[index], [field]: value }
    
    // Pour QCM_S, s'assurer qu'une seule option est correcte
    if (questionType === 'QCM_S' && field === 'is_correct' && value === true) {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.is_correct = false
      })
    }
    
    setQcmOptions(newOptions)
  }

  const removeQcmOption = (index: number) => {
    if (qcmOptions.length > 1) {
      setQcmOptions(qcmOptions.filter((_, i) => i !== index))
    }
  }

  const addQaaPair = () => {
    setQaaPairs([...qaaPairs, { left: '', right: '' }])
  }

  const updateQaaPair = (index: number, field: 'left' | 'right', value: string) => {
    const newPairs = [...qaaPairs]
    newPairs[index] = { ...newPairs[index], [field]: value }
    setQaaPairs(newPairs)
  }

  const removeQaaPair = (index: number) => {
    if (qaaPairs.length > 1) {
      setQaaPairs(qaaPairs.filter((_, i) => i !== index))
    }
  }

  const addOrdItem = () => {
    setOrdItems([...ordItems, ''])
  }

  const updateOrdItem = (index: number, value: string) => {
    const newItems = [...ordItems]
    newItems[index] = value
    setOrdItems(newItems)
  }

  const removeOrdItem = (index: number) => {
    if (ordItems.length > 1) {
      setOrdItems(ordItems.filter((_, i) => i !== index))
    }
  }

  const addLacBlank = () => {
    setLacBlanks([...lacBlanks, { correct_answer: '', options: [] }])
  }

  const updateLacBlank = (index: number, field: 'correct_answer', value: string) => {
    const newBlanks = [...lacBlanks]
    newBlanks[index] = { ...newBlanks[index], [field]: value }
    setLacBlanks(newBlanks)
  }

  const removeLacBlank = (index: number) => {
    if (lacBlanks.length > 1) {
      setLacBlanks(lacBlanks.filter((_, i) => i !== index))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!metadataId || !questionType || !metadata) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Paramètres manquants ou métadonnées non trouvées
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const Icon = questionTypeIcons[questionType]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/questions')}
                className="rounded-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Structure de Réponse
                  </h1>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      {questionTypeLabels[questionType]}
                    </Badge>
                    <p className="text-gray-600 dark:text-gray-400">
                      {metadata.titre}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl shadow-lg shadow-green-500/25 transition-all duration-200 px-6 py-2.5 font-semibold"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration générale */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Configuration
                </CardTitle>
                <CardDescription>
                  Paramètres généraux de la question
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="contenu" className="text-sm font-semibold">
                    Énoncé de la question
                  </Label>
                  <Textarea
                    id="contenu"
                    value={contenu}
                    onChange={(e) => setContenu(e.target.value)}
                    placeholder="Entrez l'énoncé de la question..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-semibold">
                      Durée (sec)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="10"
                      value={durationSeconds}
                      onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 60)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="points" className="text-sm font-semibold">
                      Points
                    </Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      step="0.1"
                      value={points}
                      onChange={(e) => setPoints(parseFloat(e.target.value) || 1)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Structure de réponse */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-blue-600" />
                  Structure: {questionTypeLabels[questionType]}
                </CardTitle>
                <CardDescription>
                  Définissez les réponses et options pour cette question
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Rendu conditionnel selon le type de question */}
                {questionType === 'VF' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Réponse correcte</Label>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="vf-true"
                            name="vf-answer"
                            checked={vfCorrectAnswer === true}
                            onChange={() => setVfCorrectAnswer(true)}
                            className="text-green-600"
                          />
                          <label htmlFor="vf-true" className="text-green-600 font-medium">Vrai</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="vf-false"
                            name="vf-answer"
                            checked={vfCorrectAnswer === false}
                            onChange={() => setVfCorrectAnswer(false)}
                            className="text-red-600"
                          />
                          <label htmlFor="vf-false" className="text-red-600 font-medium">Faux</label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vf-explanation" className="text-sm font-semibold">
                        Explication (optionnel)
                      </Label>
                      <Textarea
                        id="vf-explanation"
                        value={vfExplanation}
                        onChange={(e) => setVfExplanation(e.target.value)}
                        placeholder="Expliquez pourquoi cette réponse est correcte..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}

                {(questionType === 'QCM_S' || questionType === 'QRM') && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Options de réponse</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addQcmOption}
                        className="rounded-lg"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter option
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {qcmOptions.map((option, index) => (
                        <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Checkbox
                            checked={option.is_correct}
                            onCheckedChange={(checked) => updateQcmOption(index, 'is_correct', !!checked)}
                          />
                          <Input
                            value={option.text}
                            onChange={(e) => updateQcmOption(index, 'text', e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQcmOption(index)}
                            disabled={qcmOptions.length <= 1}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qcm-explanation" className="text-sm font-semibold">
                        Explication (optionnel)
                      </Label>
                      <Textarea
                        id="qcm-explanation"
                        value={qcmExplanation}
                        onChange={(e) => setQcmExplanation(e.target.value)}
                        placeholder="Expliquez les bonnes réponses..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}

                {questionType === 'QCM_P' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="assertion-a" className="text-sm font-semibold">
                          Assertion A
                        </Label>
                        <Textarea
                          id="assertion-a"
                          value={assertionA}
                          onChange={(e) => setAssertionA(e.target.value)}
                          placeholder="Première assertion..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assertion-b" className="text-sm font-semibold">
                          Assertion B
                        </Label>
                        <Textarea
                          id="assertion-b"
                          value={assertionB}
                          onChange={(e) => setAssertionB(e.target.value)}
                          placeholder="Deuxième assertion..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Option correcte</Label>
                        <Select value={correctOption.toString()} onValueChange={(value) => setCorrectOption(parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">A et B sont vraies</SelectItem>
                            <SelectItem value="2">A est vraie, B est fausse</SelectItem>
                            <SelectItem value="3">A est fausse, B est vraie</SelectItem>
                            <SelectItem value="4">A et B sont fausses</SelectItem>
                            <SelectItem value="5">Impossible de déterminer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qcmp-explanation" className="text-sm font-semibold">
                        Explication (optionnel)
                      </Label>
                      <Textarea
                        id="qcmp-explanation"
                        value={qcmpExplanation}
                        onChange={(e) => setQcmpExplanation(e.target.value)}
                        placeholder="Expliquez la relation entre les assertions..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}

                {questionType === 'QAA' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Paires à associer</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addQaaPair}
                        className="rounded-lg"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter paire
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {qaaPairs.map((pair, index) => (
                        <div key={index} className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Input
                            value={pair.left}
                            onChange={(e) => updateQaaPair(index, 'left', e.target.value)}
                            placeholder="Élément gauche"
                          />
                          <div className="flex gap-2">
                            <Input
                              value={pair.right}
                              onChange={(e) => updateQaaPair(index, 'right', e.target.value)}
                              placeholder="Élément droit"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQaaPair(index)}
                              disabled={qaaPairs.length <= 1}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="qaa-explanation" className="text-sm font-semibold">
                        Explication (optionnel)
                      </Label>
                      <Textarea
                        id="qaa-explanation"
                        value={qaaExplanation}
                        onChange={(e) => setQaaExplanation(e.target.value)}
                        placeholder="Expliquez les associations correctes..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}

                {questionType === 'ORD' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Éléments à ordonner</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOrdItem}
                        className="rounded-lg"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter élément
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {ordItems.map((item, index) => (
                        <div key={index} className="flex gap-3 items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Badge variant="outline" className="font-mono">
                            {index + 1}
                          </Badge>
                          <Input
                            value={item}
                            onChange={(e) => updateOrdItem(index, e.target.value)}
                            placeholder={`Élément ${index + 1}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOrdItem(index)}
                            disabled={ordItems.length <= 1}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ord-explanation" className="text-sm font-semibold">
                        Explication (optionnel)
                      </Label>
                      <Textarea
                        id="ord-explanation"
                        value={ordExplanation}
                        onChange={(e) => setOrdExplanation(e.target.value)}
                        placeholder="Expliquez l'ordre correct..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}

                {questionType === 'LAC' && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="lac-text" className="text-sm font-semibold">
                        Texte avec trous
                      </Label>
                      <Textarea
                        id="lac-text"
                        value={lacTextWithBlanks}
                        onChange={(e) => setLacTextWithBlanks(e.target.value)}
                        placeholder="Utilisez {{1}}, {{2}}, etc. pour marquer les trous..."
                        className="min-h-[100px]"
                      />
                      <p className="text-xs text-gray-500">
                        Exemple: "La {'{'}1{'}'} est {'{'}2{'}'}" pour créer deux trous à compléter
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Réponses pour les trous</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addLacBlank}
                          className="rounded-lg"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter trou
                        </Button>
                      </div>

                      {lacBlanks.map((blank, index) => (
                        <div key={index} className="flex gap-3 items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Badge variant="outline">
                            Trou {index + 1}
                          </Badge>
                          <Input
                            value={blank.correct_answer}
                            onChange={(e) => updateLacBlank(index, 'correct_answer', e.target.value)}
                            placeholder="Réponse correcte"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLacBlank(index)}
                            disabled={lacBlanks.length <= 1}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lac-explanation" className="text-sm font-semibold">
                        Explication (optionnel)
                      </Label>
                      <Textarea
                        id="lac-explanation"
                        value={lacExplanation}
                        onChange={(e) => setLacExplanation(e.target.value)}
                        placeholder="Expliquez les bonnes réponses..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}

                {questionType === 'GRID' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="grid-rows" className="text-sm font-semibold">
                          Nombre de lignes
                        </Label>
                        <Input
                          id="grid-rows"
                          type="number"
                          min="1"
                          max="10"
                          value={gridRows}
                          onChange={(e) => setGridRows(parseInt(e.target.value) || 2)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="grid-cols" className="text-sm font-semibold">
                          Nombre de colonnes
                        </Label>
                        <Input
                          id="grid-cols"
                          type="number"
                          min="1"
                          max="10"
                          value={gridCols}
                          onChange={(e) => setGridCols(parseInt(e.target.value) || 2)}
                        />
                      </div>
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        Fonctionnalité GRID en cours de développement. 
                        Pour l'instant, seule la configuration de base est disponible.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="grid-explanation" className="text-sm font-semibold">
                        Explication (optionnel)
                      </Label>
                      <Textarea
                        id="grid-explanation"
                        value={gridExplanation}
                        onChange={(e) => setGridExplanation(e.target.value)}
                        placeholder="Expliquez comment utiliser la grille..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}