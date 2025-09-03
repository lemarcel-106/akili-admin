"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MathInput, MathInputLine } from "@/components/math-input"
import { 
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileQuestion,
  ListChecks,
  Hash,
  ToggleLeft,
  Link2,
  SortAsc,
  PenTool,
  Grid3x3,
  Save,
  Loader2,
  Info,
  AlertCircle,
  Eye,
  Monitor,
  Plus,
  Trash2,
  GripVertical,
  Check,
  List,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  FileText,
  Upload,
  ImageIcon,
  Code2,
  Copy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// Types de builders disponibles
const BUILDER_TYPES = [
  {
    id: 'VF',
    name: 'Vrai ou Faux',
    description: 'Question avec réponse vraie ou fausse',
    icon: ToggleLeft,
    color: 'bg-blue-500',
    structure: { correct_answer: false, explanation: '' }
  },
  {
    id: 'QCM_S',
    name: 'QCM Simple',
    description: 'Question à choix multiple avec une seule bonne réponse',
    icon: ListChecks,
    color: 'bg-green-500',
    structure: { options: [], explanation: '' }
  },
 
  {
    id: 'GRID',
    name: 'Grille',
    description: 'Sélectionner les intersections correctes dans la grille',
    icon: Grid3x3,
    color: 'bg-red-500',
    structure: { 
      grid: { rows: 3, cols: 3 }, 
      rowHeaders: [], 
      colHeaders: [], 
      intersections: [], 
      explanation: '' 
    }
  },
  
]

// Composant de prévisualisation pour chaque type de builder
const BuilderPreview = ({ builderId, formData }: { builderId: string | null, formData?: any }) => {
  if (!builderId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-600">
        <Monitor className="h-16 w-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">Aperçu de la question</p>
        <p className="text-sm text-center mt-2 max-w-sm">
          Sélectionnez un type de builder pour voir comment votre question apparaîtra aux utilisateurs
        </p>
      </div>
    )
  }

  const builder = BUILDER_TYPES.find(b => b.id === builderId)
  if (!builder) return null

  const Icon = builder.icon

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          builder.color,
          "bg-opacity-20"
        )}>
          <Icon className={cn(
            "h-5 w-5",
            builder.color.replace('bg-', 'text-')
          )} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {builder.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {builder.description}
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Aperçu de la question
        </h4>
        
        {/* Aperçus spécifiques selon le type de builder */}
        {builderId === 'VF' && (
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                L&apos;affirmation est-elle vraie ou fausse ?
              </p>
              <div className="flex gap-4">
                <button className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors",
                  formData?.correct_answer === true
                    ? "bg-green-100 text-green-700 border-2 border-green-500"
                    : "bg-gray-100 text-gray-600 border-2 border-gray-300"
                )}>
                  ✓ Vrai
                </button>
                <button className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-colors",
                  formData?.correct_answer === false
                    ? "bg-red-100 text-red-700 border-2 border-red-500"
                    : "bg-gray-100 text-gray-600 border-2 border-gray-300"
                )}>
                  ✗ Faux
                </button>
              </div>
            </div>
            {formData?.explanation && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Explication :</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{formData.explanation}</p>
              </div>
            )}
          </div>
        )}

        {builderId === 'QCM_S' && (
          <div className="space-y-4">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">?</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  Choisissez la bonne réponse
                </p>
              </div>
              <div className="space-y-3">
                {formData?.options?.length > 0 ? (
                  formData.options.map((option, index) => (
                    <div key={index} className={cn(
                      "relative flex items-center gap-4 p-4 rounded-xl transition-all duration-200",
                      option.is_correct
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-400 shadow-sm"
                        : "bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    )}>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        option.is_correct
                          ? "border-green-500 bg-green-500"
                          : "border-gray-400 dark:border-gray-500"
                      )}>
                        {option.is_correct && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <span className={cn(
                        "flex-1 text-base",
                        option.is_correct
                          ? "text-green-700 dark:text-green-300 font-semibold"
                          : "text-gray-700 dark:text-gray-300"
                      )}>
                        {option.text || `Option ${String.fromCharCode(65 + index)}`}
                      </span>
                      {option.is_correct && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <ListChecks className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Configurez les options de réponse</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {builderId === 'GRID' && (
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 mb-4 font-medium">
                Sélectionnez les bonnes intersections :
              </p>
              {formData?.grid?.rows && formData?.grid?.cols ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800"></th>
                        {Array.from({ length: formData.grid.cols }).map((_, colIdx) => (
                          <th key={colIdx} className="p-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                            {formData.colHeaders?.[colIdx] || `C${colIdx + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: formData.grid.rows }).map((_, rowIdx) => (
                        <tr key={rowIdx}>
                          <td className="p-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                            {formData.rowHeaders?.[rowIdx] || `L${rowIdx + 1}`}
                          </td>
                          {Array.from({ length: formData.grid.cols }).map((_, colIdx) => {
                            const isSelected = formData.intersections?.some(
                              inter => inter.row === rowIdx && inter.col === colIdx
                            )
                            return (
                              <td key={colIdx} className="p-2 border border-gray-300 dark:border-gray-600 text-center">
                                <div className={cn(
                                  "w-6 h-6 mx-auto rounded",
                                  isSelected
                                    ? "bg-emerald-500 flex items-center justify-center"
                                    : "bg-gray-200 dark:bg-gray-700"
                                )}>
                                  {isSelected && (
                                    <Check className="h-4 w-4 text-white" />
                                  )}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {formData.intersections && formData.intersections.length > 0 && (
                    <div className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {formData.intersections.length} intersection(s) correcte(s)
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic text-center">Configurez la grille...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant principal de configuration pour chaque type de builder
const BuilderConfigurationForm = ({ 
  builderId, 
  formData, 
  setFormData,
  draggedItemIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}: { 
  builderId: string | null, 
  formData: any, 
  setFormData: (data: any) => void,
  draggedItemIndex: number | null,
  onDragStart: (e: React.DragEvent, index: number) => void,
  onDragOver: (e: React.DragEvent) => void,
  onDrop: (e: React.DragEvent, dropIndex: number) => void,
  onDragEnd: () => void
}) => {
  // State for image handling - must be before any conditional returns
  const [imagePreview, setImagePreview] = useState<string | null>(formData?.image || null)
  
  if (!builderId) return null

  // Helper function to update nested form data
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Helper function to add items to arrays
  const addArrayItem = (field: string, defaultItem: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), defaultItem]
    }))
  }

  // Helper function to remove items from arrays
  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  // Helper function to update array item
  const updateArrayItem = (field: string, index: number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }
  
  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        updateFormData('image', result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Common sections for all builders
  const renderImageSection = () => (
    <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl border border-amber-200 dark:border-amber-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <ImageIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Image illustrative (optionnel)
        </h3>
      </div>
      
      <div className="space-y-4">
        {!imagePreview ? (
          <label className="block">
            <div className="flex items-center justify-center w-full h-48 bg-white dark:bg-gray-900 border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-amber-400 dark:text-amber-500 mb-3" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cliquez pour télécharger une image
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PNG, JPG, GIF jusqu&apos;à 10MB
                </p>
              </div>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        ) : (
          <div className="relative group">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-xl border-2 border-amber-200 dark:border-amber-700"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-4">
              <label className="cursor-pointer">
                <div className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                  <Upload className="h-5 w-5 text-gray-700" />
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
              <button
                onClick={() => {
                  setImagePreview(null)
                  updateFormData('image', null)
                }}
                className="p-3 bg-white rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </button>
            </div>
            <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-md">
              Image ajoutée
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderContentSection = () => (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-850 rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Contenu de la question <span className="text-red-500">*</span>
        </h3>
      </div>
      <MathInput
        value={formData.content || ''}
        onChange={(value) => updateFormData('content', value)}
        placeholder="Saisissez le contenu complet de la question. Utilisez le mode Math pour les formules mathématiques..."
        rows={6}
        required
      />
      {!formData.content && (
        <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Ce champ est obligatoire
        </p>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      {/* VF (Vrai/Faux) Form */}
      {builderId === 'VF' && (
        <div className="space-y-6">
          {/* Image Section */}
          {renderImageSection()}
          
          {/* Content Section */}
          {renderContentSection()}

          {/* Answer Format Section */}
          <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-2xl border border-violet-200 dark:border-violet-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <ToggleLeft className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Format de réponse
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Sélectionnez si l&apos;affirmation est vraie ou fausse
            </p>
            <RadioGroup
              value={formData.correct_answer?.toString() || 'false'}
              onValueChange={(value) => updateFormData('correct_answer', value === 'true')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-green-200 dark:border-green-700 hover:border-green-400 transition-colors">
                <RadioGroupItem value="true" id="true" className="border-green-500" />
                <Label htmlFor="true" className="text-green-600 font-medium cursor-pointer">✓ Vrai</Label>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-red-200 dark:border-red-700 hover:border-red-400 transition-colors">
                <RadioGroupItem value="false" id="false" className="border-red-500" />
                <Label htmlFor="false" className="text-red-600 font-medium cursor-pointer">✗ Faux</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}

      {/* QCM_S (QCM Simple) Form */}
      {builderId === 'QCM_S' && (
        <div className="space-y-6">
          {/* Image Section */}
          {renderImageSection()}
          
          {/* Content Section */}
          {renderContentSection()}
          
          {/* Answer Format Section */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-2xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ListChecks className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Format de réponse - Options
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Ajoutez les options et sélectionnez la bonne réponse (une seule)
            </p>
            <div className="space-y-3">
              {(formData.options || []).map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-start"
                >
                  <RadioGroup
                    value={formData.options?.findIndex(opt => opt.is_correct)?.toString() || ''}
                    onValueChange={(value) => {
                      const newOptions = formData.options.map((opt, i) => ({
                        ...opt,
                        is_correct: i === parseInt(value)
                      }))
                      updateFormData('options', newOptions)
                    }}
                  >
                    <RadioGroupItem value={index.toString()} />
                  </RadioGroup>
                  <MathInputLine
                    value={option.text || ''}
                    onChange={(value) => {
                      const newOptions = [...formData.options]
                      newOptions[index] = { ...newOptions[index], text: value }
                      updateFormData('options', newOptions)
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('options', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('options', { id: Date.now(), text: '', is_correct: false })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une option
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QRM (QCM Multiple) Form */}
      {builderId === 'QRM' && (
        <div className="space-y-6">
          {/* Image Section */}
          {renderImageSection()}
          
          {/* Content Section */}
          {renderContentSection()}
          
          {/* Answer Format Section */}
          <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <ListChecks className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Format de réponse - Options multiples
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Ajoutez les options et cochez toutes les bonnes réponses (plusieurs possibles)
            </p>
            <div className="space-y-3">
              {(formData.options || []).map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-start"
                >
                  <Checkbox
                    checked={option.is_correct || false}
                    onCheckedChange={(checked) => {
                      const newOptions = [...formData.options]
                      newOptions[index] = { ...newOptions[index], is_correct: checked }
                      updateFormData('options', newOptions)
                    }}
                  />
                  <MathInputLine
                    value={option.text || ''}
                    onChange={(value) => {
                      const newOptions = [...formData.options]
                      newOptions[index] = { ...newOptions[index], text: value }
                      updateFormData('options', newOptions)
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('options', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('options', { id: Date.now(), text: '', is_correct: false })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une option
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QCM_PA (QCM Par Activité) Form */}
      {builderId === 'QCM_PA' && (
        <div className="space-y-6">
          {/* Image Section */}
          {renderImageSection()}
          
          {/* Content Section */}
          {renderContentSection()}
          
          {/* Answer Format Section */}
          <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-2xl border border-violet-200 dark:border-violet-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <ListChecks className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Format de réponse - QCM Par Activité
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Configurez les options pour chaque colonne indépendamment
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Colonne Gauche */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                  Colonne Gauche
                </h4>
                {(formData.left_options || []).map((option: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 items-start"
                  >
                    <Checkbox
                      checked={option.is_correct || false}
                      onCheckedChange={(checked) => {
                        const newOptions = [...(formData.left_options || [])]
                        newOptions[index] = { ...newOptions[index], is_correct: checked }
                        updateFormData('left_options', newOptions)
                      }}
                    />
                    <MathInputLine
                      value={option.text || ''}
                      onChange={(value) => {
                        const newOptions = [...(formData.left_options || [])]
                        newOptions[index] = { ...newOptions[index], text: value }
                        updateFormData('left_options', newOptions)
                      }}
                      placeholder={`Option G${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('left_options', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('left_options', { id: Date.now(), text: '', is_correct: false })}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une option (Gauche)
                </Button>
              </div>

              {/* Colonne Droite */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                  Colonne Droite
                </h4>
                {(formData.right_options || []).map((option: any, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 items-start"
                  >
                    <Checkbox
                      checked={option.is_correct || false}
                      onCheckedChange={(checked) => {
                        const newOptions = [...(formData.right_options || [])]
                        newOptions[index] = { ...newOptions[index], is_correct: checked }
                        updateFormData('right_options', newOptions)
                      }}
                    />
                    <MathInputLine
                      value={option.text || ''}
                      onChange={(value) => {
                        const newOptions = [...(formData.right_options || [])]
                        newOptions[index] = { ...newOptions[index], text: value }
                        updateFormData('right_options', newOptions)
                      }}
                      placeholder={`Option D${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('right_options', index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('right_options', { id: Date.now(), text: '', is_correct: false })}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une option (Droite)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QCM_P (QCM par processus) Form */}
      {builderId === 'QCM_P' && (
        <div className="space-y-6">
          {/* Image Section */}
          {renderImageSection()}
          
          {/* Content Section */}
          {renderContentSection()}
          
          {/* Answer Format Section */}
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50/50 dark:from-indigo-950/20 dark:to-violet-950/20 rounded-2xl border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Hash className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Format de réponse - Assertions couplées
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="assertion_a" className="text-base font-medium mb-2 block">
                  Assertion A
                </Label>
                <MathInput
                  value={formData.assertion_a || ''}
                  onChange={(value) => updateFormData('assertion_a', value)}
                  placeholder="Première assertion (peut inclure des formules mathématiques)..."
                  rows={3}
                />
              </div>
          
              <div>
                <Label htmlFor="assertion_b" className="text-base font-medium mb-2 block">
                  Assertion B
                </Label>
                <MathInput
                  value={formData.assertion_b || ''}
                  onChange={(value) => updateFormData('assertion_b', value)}
                  placeholder="Deuxième assertion (peut inclure des formules mathématiques)..."
                  rows={3}
                />
              </div>
          
              <div>
                <Label className="text-base font-medium mb-2 block">Combinaison correcte</Label>
                <RadioGroup
              value={formData.correct_option?.toString() || '1'}
              onValueChange={(value) => updateFormData('correct_option', parseInt(value))}
              className="space-y-2 mt-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="opt1" />
                <Label htmlFor="opt1">A est vrai et B est vrai, et B est une conséquence de A</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2" id="opt2" />
                <Label htmlFor="opt2">A est vrai et B est vrai, mais B n&apos;est pas une conséquence de A</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="opt3" />
                <Label htmlFor="opt3">A est vrai et B est faux</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4" id="opt4" />
                <Label htmlFor="opt4">A est faux et B est vrai</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="opt5" />
                <Label htmlFor="opt5">A est faux et B est faux</Label>
              </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QAA (Appariement) Form */}
      {builderId === 'QAA' && (
        <div className="space-y-6">
          {/* Image Section */}
          {renderImageSection()}
          
          {/* Content Section */}
          {renderContentSection()}
          
          {/* Answer Format Section */}
          <div className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50/50 dark:from-cyan-950/20 dark:to-teal-950/20 rounded-2xl border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Link2 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Format de réponse - Appariement
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Créez des paires d&apos;éléments qui doivent être associés
            </p>
            <div className="space-y-3">
              {(formData.pairs || []).map((pair, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 items-center"
                >
                  <MathInputLine
                    value={pair.left || ''}
                    onChange={(value) => {
                      const newPairs = [...formData.pairs]
                      newPairs[index] = { ...newPairs[index], left: value }
                      updateFormData('pairs', newPairs)
                    }}
                    placeholder="Élément gauche"
                    className="flex-1"
                  />
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <MathInputLine
                    value={pair.right || ''}
                    onChange={(value) => {
                      const newPairs = [...formData.pairs]
                      newPairs[index] = { ...newPairs[index], right: value }
                      updateFormData('pairs', newPairs)
                    }}
                    placeholder="Élément droit"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('pairs', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('pairs', { left: '', right: '', is_match: true })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une paire
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ORD (Ordre) Form */}
      {builderId === 'ORD' && (
        <div className="space-y-6">
          {/* Image Section */}
          {renderImageSection()}
          
          {/* Content Section */}
          {renderContentSection()}
          
          {/* Answer Format Section */}
          <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <SortAsc className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Format de réponse - Éléments à ordonner
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Ajoutez les éléments dans le bon ordre (du premier au dernier)
            </p>
            <div className="space-y-3">
              {(formData.items || []).map((item, index) => (
                <motion.div
                  key={index}
                  draggable
                  onDragStart={(e) => onDragStart(e, index)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, index)}
                  onDragEnd={onDragEnd}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 items-center p-2 rounded-lg transition-all cursor-move ${
                    draggedItemIndex === index 
                      ? 'opacity-50 bg-orange-100 dark:bg-orange-900/30' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  style={{
                    transform: draggedItemIndex === index ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <div className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                      {index + 1}
                    </span>
                  </div>
                  <MathInputLine
                    value={item.text || ''}
                    onChange={(value) => {
                      const newItems = [...formData.items]
                      newItems[index] = { ...newItems[index], text: value, order: index + 1 }
                      updateFormData('items', newItems)
                    }}
                    placeholder={`Élément ${index + 1}`}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('items', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayItem('items', { text: '', order: (formData.items?.length || 0) + 1 })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un élément
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* LAC (Texte à trous) Form */}
      {builderId === 'LAC' && (
        <div className="space-y-6">
          {/* Image Section */}
          {renderImageSection()}
          
          {/* Content Section */}
          {renderContentSection()}
          
          {/* Answer Format Section */}
          <div className="p-6 bg-gradient-to-br from-rose-50 to-pink-50/50 dark:from-rose-950/20 dark:to-pink-950/20 rounded-2xl border border-rose-200 dark:border-rose-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <PenTool className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Format de réponse - Texte à trous
              </h3>
            </div>
            <div>
              <Label htmlFor="text_with_blanks" className="text-base font-medium mb-2 block">
                Texte avec espaces à compléter
              </Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Utilisez ${'{{}}'} pour marquer les espaces à remplir (exemple: Le ${'{{chat}}'} mange.)
              </p>
              <MathInput
                value={formData.text_with_blanks || ''}
                onChange={(value) => {
                  updateFormData('text_with_blanks', value)
                  // Auto-detect blanks with new syntax ${{}}
                  const regex = /\$\{\{([^}]*)\}\}/g
                  const matches = []
                  let match
                  while ((match = regex.exec(value)) !== null) {
                    matches.push(match[1])
                  }
                  
                  // Preserve existing answers and only update structure
                  const existingBlanks = formData.blanks || []
                  const blanks = matches.map((text, index) => {
                    // Try to find existing blank at this position
                    const existingBlank = existingBlanks[index]
                    return {
                      position: index + 1,
                      answer: existingBlank?.answer || text, // Keep existing answer if available
                      order: index,
                      placeholder: text // Store the original placeholder text
                    }
                  })
                  updateFormData('blanks', blanks)
                }}
                placeholder="Saisissez votre texte en utilisant ${'{{}}'} pour les trous. Exemple: Le ${'{{chat}}'} est sur le ${'{{tapis}}'}"
                rows={5}
              />
            </div>
            
            <div>
              <Label className="text-base font-medium mb-2 block">Réponses attendues</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {formData.blanks?.length || 0} espace(s) détecté(s)
              </p>
              <div className="space-y-3">
                {(formData.blanks || []).map((blank, index) => (
                  <div key={index} className="flex gap-3 items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                      Trou #{index + 1}
                    </span>
                    {blank.placeholder && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                        ${`{{${blank.placeholder}}}`}
                      </span>
                    )}
                    <Input
                      value={blank.answer || ''}
                      onChange={(e) => {
                        const newBlanks = [...formData.blanks]
                        newBlanks[index] = { ...newBlanks[index], answer: e.target.value }
                        updateFormData('blanks', newBlanks)
                      }}
                      placeholder={`Réponse pour: ${blank.placeholder || 'trou ' + (index + 1)}`}
                      className="flex-1 border-2 rounded-lg px-3 py-2 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GRID (Grille) Form */}
      {builderId === 'GRID' && (
        <div className="space-y-6">
          {/* Image Section */}
          {renderImageSection()}
          
          {/* Content Section */}
          {renderContentSection()}
          
          {/* Answer Format Section */}
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Grid3x3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Format de réponse - Grille d'intersections
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <Label htmlFor="rows">Nombre de lignes</Label>
                <Select
                  value={formData.grid?.rows?.toString() || '3'}
                  onValueChange={(value) => {
                    const newRows = parseInt(value)
                    updateFormData('grid', { ...formData.grid, rows: newRows })
                    // Initialize row headers if needed
                    const rowHeaders = formData.rowHeaders || []
                    while (rowHeaders.length < newRows) {
                      rowHeaders.push('')
                    }
                    updateFormData('rowHeaders', rowHeaders.slice(0, newRows))
                    updateFormData('intersections', [])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} lignes</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="cols">Nombre de colonnes</Label>
                <Select
                  value={formData.grid?.cols?.toString() || '3'}
                  onValueChange={(value) => {
                    const newCols = parseInt(value)
                    updateFormData('grid', { ...formData.grid, cols: newCols })
                    // Initialize column headers if needed
                    const colHeaders = formData.colHeaders || []
                    while (colHeaders.length < newCols) {
                      colHeaders.push('')
                    }
                    updateFormData('colHeaders', colHeaders.slice(0, newCols))
                    updateFormData('intersections', [])
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} colonnes</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* En-têtes de lignes */}
            <div className="mb-6">
              <Label className="text-base font-medium mb-2 block">En-têtes de lignes</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Définissez les éléments de la première colonne
              </p>
              <div className="space-y-2">
                {Array.from({ length: formData.grid?.rows || 3 }).map((_, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="text-sm text-gray-500 min-w-[60px]">Ligne {index + 1}:</span>
                    <MathInputLine
                      value={formData.rowHeaders?.[index] || ''}
                      onChange={(value) => {
                        const newHeaders = [...(formData.rowHeaders || [])]
                        newHeaders[index] = value
                        updateFormData('rowHeaders', newHeaders)
                      }}
                      placeholder={`Élément ligne ${index + 1}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* En-têtes de colonnes */}
            <div className="mb-6">
              <Label className="text-base font-medium mb-2 block">En-têtes de colonnes</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Définissez les éléments de la première ligne
              </p>
              <div className="space-y-2">
                {Array.from({ length: formData.grid?.cols || 3 }).map((_, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="text-sm text-gray-500 min-w-[80px]">Colonne {index + 1}:</span>
                    <MathInputLine
                      value={formData.colHeaders?.[index] || ''}
                      onChange={(value) => {
                        const newHeaders = [...(formData.colHeaders || [])]
                        newHeaders[index] = value
                        updateFormData('colHeaders', newHeaders)
                      }}
                      placeholder={`Élément colonne ${index + 1}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Grille d'intersections */}
            <div>
              <Label className="text-base font-medium mb-2 block">Intersections</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Cochez les cases pour marquer les intersections correctes entre les lignes et les colonnes
              </p>
              
              {/* Table with headers */}
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  <div className="border-2 border-emerald-200 dark:border-emerald-700 rounded-lg overflow-hidden">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-emerald-50 dark:bg-emerald-900/20">
                          <th className="p-3 border-r-2 border-b-2 border-emerald-200 dark:border-emerald-700 text-left">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Lignes / Colonnes
                            </span>
                          </th>
                          {Array.from({ length: formData.grid?.cols || 3 }).map((_, colIndex) => (
                            <th key={colIndex} className="p-3 border-b-2 border-emerald-200 dark:border-emerald-700 text-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {formData.colHeaders?.[colIndex] || `Col ${colIndex + 1}`}
                              </span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: formData.grid?.rows || 3 }).map((_, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="p-3 border-r-2 border-emerald-200 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {formData.rowHeaders?.[rowIndex] || `Ligne ${rowIndex + 1}`}
                              </span>
                            </td>
                            {Array.from({ length: formData.grid?.cols || 3 }).map((_, colIndex) => {
                              const isChecked = formData.intersections?.some(
                                inter => inter.row === rowIndex && inter.col === colIndex
                              ) || false
                              
                              return (
                                <td key={colIndex} className="p-3 text-center border-emerald-100 dark:border-emerald-800 border">
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        let newIntersections = formData.intersections || []
                                        if (checked) {
                                          newIntersections = [...newIntersections, { row: rowIndex, col: colIndex }]
                                        } else {
                                          newIntersections = newIntersections.filter(
                                            inter => !(inter.row === rowIndex && inter.col === colIndex)
                                          )
                                        }
                                        updateFormData('intersections', newIntersections)
                                      }}
                                      className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                    />
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Summary of selected intersections */}
              {formData.intersections && formData.intersections.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    <strong>{formData.intersections.length}</strong> intersection(s) sélectionnée(s)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Validation function for each builder type
const validateBuilderData = (builderId: string, formData: any) => {
  const errors: string[] = []

  // Common validation for all types - content is required
  if (!formData.content || formData.content.trim() === '') {
    errors.push('Le contenu de la question est obligatoire')
  }

  switch (builderId) {
    case 'VF':
      if (formData.correct_answer === undefined || formData.correct_answer === null) {
        errors.push('Veuillez sélectionner si l\'affirmation est vraie ou fausse')
      }
      break
    
    case 'QCM_S':
      if (!formData.options || formData.options.length < 2) {
        errors.push('Au moins 2 options sont requises pour un QCM simple')
      }
      if (formData.options && !formData.options.some(opt => opt.is_correct)) {
        errors.push('Au moins une option doit être marquée comme correcte')
      }
      break
    
    case 'QRM':
      if (!formData.options || formData.options.length < 2) {
        errors.push('Au moins 2 options sont requises pour un QCM multiple')
      }
      if (formData.options && !formData.options.some(opt => opt.is_correct)) {
        errors.push('Au moins une option doit être marquée comme correcte')
      }
      break
    
    case 'QCM_PA':
      if (!formData.left_options || formData.left_options.length < 2) {
        errors.push('Au moins 2 options sont requises dans la colonne gauche')
      }
      if (!formData.right_options || formData.right_options.length < 2) {
        errors.push('Au moins 2 options sont requises dans la colonne droite')
      }
      if (formData.left_options && !formData.left_options.some((opt: any) => opt.is_correct)) {
        errors.push('Au moins une option doit être marquée comme correcte dans la colonne gauche')
      }
      if (formData.right_options && !formData.right_options.some((opt: any) => opt.is_correct)) {
        errors.push('Au moins une option doit être marquée comme correcte dans la colonne droite')
      }
      break
    
    case 'QCM_P':
      if (!formData.assertion_a || formData.assertion_a.trim() === '') {
        errors.push('L\'assertion A est obligatoire')
      }
      if (!formData.assertion_b || formData.assertion_b.trim() === '') {
        errors.push('L\'assertion B est obligatoire')
      }
      if (!formData.correct_option) {
        errors.push('Veuillez sélectionner la relation correcte entre les assertions')
      }
      break
    
    case 'QAA':
      if (!formData.pairs || formData.pairs.length < 2) {
        errors.push('Au moins 2 paires d\'éléments sont requises')
      }
      if (formData.pairs) {
        formData.pairs.forEach((pair, index) => {
          if (!pair.left || !pair.right) {
            errors.push(`La paire ${index + 1} est incomplète`)
          }
        })
      }
      break
    
    case 'ORD':
      if (!formData.items || formData.items.length < 2) {
        errors.push('Au moins 2 éléments sont requis pour l\'ordre')
      }
      if (formData.items) {
        formData.items.forEach((item, index) => {
          if (!item.text || item.text.trim() === '') {
            errors.push(`L\'élément ${index + 1} est vide`)
          }
        })
      }
      break
    
    case 'LAC':
      if (!formData.text_with_blanks || formData.text_with_blanks.trim() === '') {
        errors.push('Le texte avec espaces est obligatoire')
      }
      if (!formData.blanks || formData.blanks.length === 0) {
        errors.push('Au moins un espace à compléter est requis')
      }
      break
    
    case 'GRID':
      if (!formData.rowHeaders || formData.rowHeaders.filter(h => h && h.trim()).length < 2) {
        errors.push('Au moins 2 en-têtes de lignes sont requis pour la grille')
      }
      if (!formData.colHeaders || formData.colHeaders.filter(h => h && h.trim()).length < 2) {
        errors.push('Au moins 2 en-têtes de colonnes sont requis pour la grille')
      }
      if (!formData.intersections || formData.intersections.length === 0) {
        errors.push('Au moins une intersection doit être sélectionnée')
      }
      break

    default:
      if (!builderId) errors.push('Type de builder non reconnu')
  }

  return errors
}

export default function QuestionConfigurationPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = params?.id as string
  
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedBuilder, setSelectedBuilder] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [showJSON, setShowJSON] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Drag and drop handlers for ORD builder
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedItem === null || draggedItem === dropIndex) return
    
    const items = [...(formData.items || [])]
    const draggedContent = items[draggedItem]
    
    // Remove the dragged item
    items.splice(draggedItem, 1)
    
    // Insert it at the new position
    items.splice(dropIndex, 0, draggedContent)
    
    // Update order values
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }))
    
    setFormData(prev => ({ ...prev, items: updatedItems }))
    setDraggedItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const handleBuilderSelect = (builderId: string) => {
    setSelectedBuilder(builderId)
    const builder = BUILDER_TYPES.find(b => b.id === builderId)
    if (builder) {
      setFormData(builder.structure)
    }
  }

  const handleNext = () => {
    if (currentStep === 1 && !selectedBuilder) {
      setError('Veuillez sélectionner un type de builder')
      return
    }
    if (currentStep === 2) {
      setCurrentStep(3)
    } else {
      setCurrentStep(2)
    }
    setError('')
  }

  const handleBack = () => {
    if (currentStep === 3) {
      setCurrentStep(2)
    } else {
      setCurrentStep(1)
    }
    setError('')
  }

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      router.push('/dashboard/management/questions')
    }, 300)
  }

  // Generate display JSON for external clients
  const generateDisplayJSON = (builderId: string, data: any) => {
    const baseJSON = {
      type: builderId,
      question: {
        content: data.content || '',
        image: data.image || null
      },
      timestamp: new Date().toISOString()
    }

    switch (builderId) {
      case 'VF':
        return {
          ...baseJSON,
          display: {
            type: 'true_false',
            correctAnswer: data.correct_answer,
            options: [
              { value: true, label: 'Vrai', order: 1 },
              { value: false, label: 'Faux', order: 2 }
            ]
          }
        }

      case 'QCM_S':
        return {
          ...baseJSON,
          display: {
            type: 'single_choice',
            options: (data.options || []).map((opt, idx) => ({
              id: idx + 1,
              text: opt.text,
              isCorrect: opt.is_correct || false,
              order: idx + 1
            }))
          }
        }

      case 'QRM':
        return {
          ...baseJSON,
          display: {
            type: 'multiple_choice',
            options: (data.options || []).map((opt, idx) => ({
              id: idx + 1,
              text: opt.text,
              isCorrect: opt.is_correct || false,
              order: idx + 1
            })),
            minSelections: 1,
            maxSelections: data.options?.filter(o => o.is_correct).length || 1
          }
        }

      case 'QCM_PA':
        return {
          ...baseJSON,
          display: {
            type: 'activity_mcq',
            left_column: {
              title: 'Colonne Gauche',
              options: (data.left_options || []).map((opt: any, idx: number) => ({
                id: `L${idx + 1}`,
                text: opt.text,
                isCorrect: opt.is_correct || false,
                order: idx + 1
              }))
            },
            right_column: {
              title: 'Colonne Droite',
              options: (data.right_options || []).map((opt: any, idx: number) => ({
                id: `R${idx + 1}`,
                text: opt.text,
                isCorrect: opt.is_correct || false,
                order: idx + 1
              }))
            }
          }
        }

      case 'QCM_P':
        return {
          ...baseJSON,
          display: {
            type: 'paired_assertions',
            assertionA: data.assertion_a,
            assertionB: data.assertion_b,
            correctOption: data.correct_option,
            options: [
              { id: 'A', label: 'A est vrai, B est vrai, et ils sont liés', order: 1 },
              { id: 'B', label: 'A est vrai, B est vrai, mais ils ne sont pas liés', order: 2 },
              { id: 'C', label: 'A est vrai, B est faux', order: 3 },
              { id: 'D', label: 'A est faux, B est vrai', order: 4 },
              { id: 'E', label: 'A est faux, B est faux', order: 5 }
            ]
          }
        }

      case 'QAA':
        const pairs = data.pairs || []
        const shuffledRight = pairs
          .map((p, idx) => ({ id: `R${idx + 1}`, text: p.right }))
          .sort(() => Math.random() - 0.5)
        
        return {
          ...baseJSON,
          display: {
            type: 'matching',
            leftColumn: pairs.map((pair, idx) => ({
              id: `L${idx + 1}`,
              text: pair.left,
              order: idx + 1
            })),
            rightColumn: shuffledRight,
            correctAssociations: pairs.map((pair, idx) => ({
              leftId: `L${idx + 1}`,
              rightId: `R${idx + 1}`,
              leftText: pair.left,
              rightText: pair.right
            })),
            instruction: 'Associez chaque élément de gauche avec son correspondant à droite'
          }
        }

      case 'ORD':
        return {
          ...baseJSON,
          display: {
            type: 'ordering',
            correctOrder: (data.items || []).map((item, idx) => ({
              id: idx + 1,
              text: item.text,
              position: idx + 1
            })),
            shuffledItems: (data.items || [])
              .map((item, idx) => ({ id: idx + 1, text: item.text }))
              .sort(() => Math.random() - 0.5)
          }
        }

      case 'LAC':
        return {
          ...baseJSON,
          display: {
            type: 'fill_in_blanks',
            textWithBlanks: data.text_with_blanks || '',
            blanks: (data.blanks || []).map((blank, idx) => ({
              id: idx + 1,
              position: blank.position || idx + 1,
              correctAnswer: blank.answer,
              placeholder: blank.placeholder || `blank_${idx + 1}`
            })),
            displayText: data.text_with_blanks?.replace(/\$\{\{[^}]*\}\}/g, '____') || ''
          }
        }

      case 'NUM':
        return {
          ...baseJSON,
          display: {
            type: 'numeric',
            correctAnswer: parseFloat(data.correct_answer) || 0,
            tolerance: parseFloat(data.tolerance) || 0,
            unit: data.unit || '',
            acceptedRange: {
              min: (parseFloat(data.correct_answer) || 0) - (parseFloat(data.tolerance) || 0),
              max: (parseFloat(data.correct_answer) || 0) + (parseFloat(data.tolerance) || 0)
            }
          }
        }

      case 'GRID':
        return {
          ...baseJSON,
          display: {
            type: 'grid_intersections',
            grid: {
              rows: data.grid?.rows || 3,
              cols: data.grid?.cols || 3
            },
            rowHeaders: (data.rowHeaders || []).map((header, idx) => ({
              index: idx,
              label: header || `Ligne ${idx + 1}`
            })),
            colHeaders: (data.colHeaders || []).map((header, idx) => ({
              index: idx,
              label: header || `Colonne ${idx + 1}`
            })),
            correctIntersections: (data.intersections || []).map(inter => ({
              rowIndex: inter.row,
              colIndex: inter.col,
              rowLabel: data.rowHeaders?.[inter.row] || `Ligne ${inter.row + 1}`,
              colLabel: data.colHeaders?.[inter.col] || `Colonne ${inter.col + 1}`
            })),
            instruction: 'Sélectionnez les intersections correctes entre les lignes et les colonnes'
          }
        }

      default:
        return baseJSON
    }
  }

  const handleSave = async () => {
    // Validate form data
    if (!selectedBuilder) {
      setError('Aucun builder sélectionné')
      return
    }

    const errors = validateBuilderData(selectedBuilder, formData)
    setValidationErrors(errors)
    
    if (errors.length > 0) {
      setError('Veuillez corriger les erreurs de validation')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setValidationErrors([])

    try {
      // TODO: Implémenter la sauvegarde via l'API
      console.log('Saving configuration:', {
        questionId,
        builderType: selectedBuilder,
        data: formData
      })
      
      setSuccess('Configuration sauvegardée avec succès!')
      setTimeout(() => {
        router.push('/dashboard/management/questions')
      }, 2000)
    } catch (err) {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isClosing ? 0 : 0.5 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black z-40"
        onClick={handleClose}
      />

      {/* Fullscreen Bottomsheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: isClosing ? '100%' : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col"
      >
        {/* Minimal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Configurations des données de la question
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 p-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="w-full">
              {/* Notifications */}
              {(success || error) && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6"
                  >
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
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        <AlertDescription className="text-red-800 dark:text-red-300 ml-2">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {/* Content */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-12 gap-6"
                  >
                    {/* Builder Selection - Left Panel 8/12 */}
                    <div className="col-span-12 lg:col-span-8">
                      <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900 h-fit">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                              <FileQuestion className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                Choisir le type de builder
                              </CardTitle>
                              <CardDescription className="text-gray-600 dark:text-gray-400">
                                Sélectionnez le format de question que vous souhaitez créer
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {BUILDER_TYPES.map((builder) => {
                            const Icon = builder.icon
                            return (
                              <motion.div
                                key={builder.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                              >
                                <Card
                                  className={cn(
                                    "cursor-pointer transition-all duration-300 hover:shadow-md border-2",
                                    selectedBuilder === builder.id
                                      ? "ring-2 ring-violet-600/20 border-violet-600 bg-violet-50 dark:bg-violet-950/20 shadow-md shadow-violet-600/10"
                                      : "hover:border-violet-300 dark:hover:border-violet-700 border-gray-200 dark:border-gray-700"
                                  )}
                                  onClick={() => handleBuilderSelect(builder.id)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                      <div className={cn(
                                        "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                                        builder.color,
                                        selectedBuilder === builder.id ? "bg-opacity-30" : "bg-opacity-20"
                                      )}>
                                        <Icon className={cn(
                                          "h-6 w-6 transition-all duration-300",
                                          builder.color.replace('bg-', 'text-'),
                                          selectedBuilder === builder.id ? "scale-110" : ""
                                        )} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                            {builder.name}
                                          </h3>
                                          {selectedBuilder === builder.id && (
                                            <motion.div
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            >
                                              <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Sélectionné
                                              </Badge>
                                            </motion.div>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                          {builder.description}
                                        </p>
                                      </div>
                                      <ArrowRight className={cn(
                                        "h-5 w-5 transition-all duration-300",
                                        selectedBuilder === builder.id 
                                          ? "text-violet-600 translate-x-1" 
                                          : "text-gray-400"
                                      )} />
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )
                          })}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Preview Panel - Right Panel 4/12 */}
                    <div className="col-span-12 lg:col-span-4">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="sticky top-6"
                      >
                        <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900 min-h-[500px]">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                              <Eye className="h-5 w-5 text-violet-600" />
                              Aperçu
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="h-full">
                            <BuilderPreview builderId={selectedBuilder} formData={formData} />
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2 - Configuration */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-12 gap-6"
                  >
                    {/* Configuration Form - Left Panel 8/12 */}
                    <div className="col-span-12 lg:col-span-8">
                      <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                              <PenTool className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                Configuration du contenu
                              </CardTitle>
                              <CardDescription className="text-gray-600 dark:text-gray-400">
                                Configurez le contenu et les réponses pour votre question
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Alert className="mb-6 border-violet-200 bg-violet-50 dark:bg-violet-950/20 dark:border-violet-800">
                            <Info className="h-4 w-4 text-violet-600" />
                            <AlertDescription className="text-violet-800 dark:text-violet-300">
                              Type sélectionné: <strong>{BUILDER_TYPES.find(b => b.id === selectedBuilder)?.name}</strong>
                            </AlertDescription>
                          </Alert>

                          {/* Validation Errors */}
                          {validationErrors.length > 0 && (
                            <Alert className="mb-6 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
                              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                              <AlertDescription className="text-red-800 dark:text-red-300">
                                <div className="space-y-1">
                                  <p className="font-medium">Erreurs de validation :</p>
                                  <ul className="list-disc list-inside space-y-1">
                                    {validationErrors.map((error, index) => (
                                      <li key={index} className="text-sm">{error}</li>
                                    ))}
                                  </ul>
                                </div>
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Configuration Form */}
                          <BuilderConfigurationForm 
                            builderId={selectedBuilder}
                            formData={formData}
                            setFormData={setFormData}
                            draggedItemIndex={draggedItem}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onDragEnd={handleDragEnd}
                          />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Preview Panel - Right Panel 4/12 */}
                    <div className="col-span-12 lg:col-span-4">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="sticky top-6"
                      >
                        <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900 min-h-[500px]">
                          <CardHeader className="pb-4">
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                              <Eye className="h-5 w-5 text-violet-600" />
                              Aperçu en direct
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="h-full">
                            <BuilderPreview builderId={selectedBuilder} formData={formData} />
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3 - Preview and Validation */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Final Preview Card */}
                    <Card className="shadow-lg rounded-2xl border-0 bg-white dark:bg-gray-900">
                      <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                              Aperçu et validation finale
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                              Vérifiez que votre question est configurée correctement avant de la sauvegarder
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Configuration Summary */}
                          <div className="space-y-6">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Résumé de la configuration
                              </h3>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Type de question</span>
                                  <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                                    {BUILDER_TYPES.find(b => b.id === selectedBuilder)?.name}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Question ID</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{questionId}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Statut</span>
                                  <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-900/20">
                                    Prêt à sauvegarder
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Validation Status */}
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Validation
                              </h3>
                              <div className="space-y-2">
                                {validateBuilderData(selectedBuilder || '', formData).length === 0 ? (
                                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-sm">Toutes les validations sont passées</span>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {validateBuilderData(selectedBuilder || '', formData).map((error, index) => (
                                      <div key={index} className="flex items-start gap-2 text-red-600 dark:text-red-400">
                                        <AlertCircle className="h-4 w-4 mt-0.5" />
                                        <span className="text-sm">{error}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Final Preview */}
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                              Aperçu final
                            </h3>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-800/50">
                              <BuilderPreview builderId={selectedBuilder} formData={formData} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Stepper */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-6">
                {/* Step 1 */}
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                    currentStep >= 1 
                      ? "bg-violet-600 text-white" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  )}>
                    {currentStep > 1 ? <CheckCircle className="h-3 w-3" /> : "1"}
                  </div>
                  <span className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    currentStep >= 1 ? "text-violet-600 dark:text-violet-400" : "text-gray-500 dark:text-gray-400"
                  )}>
                    Sélectionner le type de question
                  </span>
                </div>

                {/* Separator */}
                <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700">
                  <motion.div 
                    className="h-full bg-violet-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: currentStep >= 2 ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                    currentStep >= 2 
                      ? "bg-violet-600 text-white" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  )}>
                    {currentStep > 2 ? <CheckCircle className="h-3 w-3" /> : "2"}
                  </div>
                  <span className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    currentStep >= 2 ? "text-violet-600 dark:text-violet-400" : "text-gray-500 dark:text-gray-400"
                  )}>
                    Configurations
                  </span>
                </div>

                {/* Separator */}
                <div className="w-8 h-0.5 bg-gray-200 dark:bg-gray-700">
                  <motion.div 
                    className="h-full bg-violet-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: currentStep >= 3 ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300",
                    currentStep >= 3 
                      ? "bg-violet-600 text-white" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  )}>
                    3
                  </div>
                  <span className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    currentStep >= 3 ? "text-violet-600 dark:text-violet-400" : "text-gray-500 dark:text-gray-400"
                  )}>
                    Aperçu et validation
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="px-4 py-2"
                >
                  Précédent
                </Button>

                <div className="flex items-center gap-3">
                  {currentStep < 3 ? (
                    <Button
                      onClick={handleNext}
                      disabled={currentStep === 1 && !selectedBuilder}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2"
                    >
                      {currentStep === 1 ? "Continuer" : "Aperçu final"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={() => setShowJSON(true)}
                        variant="outline"
                        className="mr-3"
                        disabled={validateBuilderData(selectedBuilder || '', formData).length > 0}
                      >
                        <Code2 className="h-4 w-4 mr-2" />
                        Voir JSON
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={loading || validateBuilderData(selectedBuilder || '', formData).length > 0}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sauvegarde...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Sauvegarder
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* JSON Viewer Modal */}
      {showJSON && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] m-4 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    JSON d&apos;affichage
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Structure de données pour client externe
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowJSON(false)}
                variant="ghost"
                size="sm"
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <pre className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-sm font-mono overflow-x-auto">
                <code className="text-gray-800 dark:text-gray-200">
                  {JSON.stringify(
                    generateDisplayJSON(selectedBuilder || '', formData),
                    null,
                    2
                  )}
                </code>
              </pre>
            </div>
            
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Type: <span className="font-medium text-gray-700 dark:text-gray-300">
                  {selectedBuilder}
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    const json = JSON.stringify(
                      generateDisplayJSON(selectedBuilder || '', formData),
                      null,
                      2
                    )
                    navigator.clipboard.writeText(json)
                    // You might want to add a toast notification here
                  }}
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
                <Button
                  onClick={() => setShowJSON(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}