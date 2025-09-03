"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

interface ExamFormData {
  title: string
  officialName: string
  description: string
  studentInfo: string
  id_country: number
  eduSystem: string
  is_active: boolean
}

interface Country {
  id: number
  name: string
  iso_code: string
}

interface ExamFormProps {
  isOpen: boolean
  isEditing: boolean
  formData: ExamFormData
  countries: Country[]
  selectedFile: File | null
  previewUrl: string | null

  loading: boolean
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  onFormDataChange: (data: ExamFormData) => void
  onFileChange: (file: File | null) => void
}

export function ExamForm({
  isOpen,
  isEditing,
  formData,
  countries,
  selectedFile,
  previewUrl,

  loading,
  onSubmit,
  onCancel,
  onFormDataChange,
  onFileChange
}: ExamFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showImagePreview, setShowImagePreview] = useState(false)

  const preview = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : previewUrl), [selectedFile, previewUrl])

  const MAX_DESC = 800
  const MAX_STUDENT_INFO = 400

  function validate() {
    const e: Record<string, string> = {}
    if (!formData.title.trim()) e.title = "Le titre est requis."
    if (!formData.id_country) e.country = "Le pays d'origine est requis."
    if (formData.description.length > MAX_DESC) e.description = `La description dépasse ${MAX_DESC} caractères.`
    if (formData.studentInfo.length > MAX_STUDENT_INFO) e.studentInfo = `Les informations visibles dépassent ${MAX_STUDENT_INFO} caractères.`
    if (selectedFile) {
      const okType = ["image/jpeg", "image/png", "image/gif"].includes(selectedFile.type)
      const okSize = selectedFile.size <= 5 * 1024 * 1024 // 5MB
      if (!okType) e.file = "Formats acceptés : JPG, PNG, GIF."
      if (!okSize) e.file = "Taille maximale : 5 Mo."
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    onSubmit(ev)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Modal */}
      <div className="modal modal-open" role="dialog" aria-label={isEditing ? "Modifier l&apos;examen" : "Créer un nouvel examen"}>
        <div className="modal-box w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
          
          <h3 className="text-xl font-bold mb-6">
            {isEditing ? "Modifier l&apos;examen" : "Créer un nouvel examen"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pays d'origine */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Pays d&apos;origine</span>
                <span className="label-text-alt text-error">*</span>
              </label>
              <select
                className="select select-bordered w-full h-12 text-base"
                value={formData.id_country}
                onChange={(e) => onFormDataChange({ ...formData, id_country: parseInt(e.target.value) })}
                aria-label="Pays d'origine"
                required
              >
                <option value={0}>Sélectionnez un pays</option>
                {countries.map(country => (
                  <option key={country.id} value={country.id}>
                    {country.name} ({country.iso_code})
                  </option>
                ))}
              </select>
              {errors.country && <span className="text-error text-sm mt-1">{errors.country}</span>}
              <label className="label">
                <span className="label-text-alt">Pays associé à cet examen</span>
              </label>
            </div>

            {/* Titre */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Titre de l&apos;examen</span>
                <span className="label-text-alt text-error">*</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full h-12 text-base"
                placeholder="Ex: Baccalauréat, BEPC, Probatoire"
                value={formData.title}
                onChange={(e) => onFormDataChange({ ...formData, title: e.target.value })}
                maxLength={100}
                required
              />
              {errors.title && <span className="text-error text-sm mt-1">{errors.title}</span>}
              <label className="label">
                <span className="label-text-alt">Nom officiel de l&apos;examen</span>
                <span className="label-text-alt">{formData.title.length}/100</span>
              </label>
            </div>

            {/* Logo */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Logo de l&apos;examen</span>
              </label>
              <input
                type="file"
                className="file-input file-input-bordered w-full"
                accept="image/png, image/jpeg, image/gif"
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              />
              {errors.file && <span className="text-error text-sm mt-1">{errors.file}</span>}
              <label className="label">
                <span className="label-text-alt">JPG, PNG, GIF • Max 5 Mo</span>
              </label>
              
              {preview && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-16 h-16 rounded bg-base-200 flex items-center justify-center overflow-hidden">
                    <img src={preview} alt="Aperçu" className="object-cover w-full h-full" />
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => setShowImagePreview(true)}
                  >
                    Voir l&apos;aperçu
                  </button>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24 text-base leading-relaxed resize-none"
                placeholder="Décrivez l&apos;examen : objectifs, niveau requis, importance"
                value={formData.description}
                onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
                maxLength={MAX_DESC}
              />
              {errors.description && <span className="text-error text-sm mt-1">{errors.description}</span>}
              <label className="label">
                <span className="label-text-alt">Description pour les étudiants</span>
                <span className="label-text-alt">{formData.description.length}/{MAX_DESC}</span>
              </label>
            </div>

            <div className="divider my-6"></div>

            {/* Statut */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4 p-4 bg-base-200 rounded-lg">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={formData.is_active}
                  onChange={(e) => onFormDataChange({ ...formData, is_active: e.target.checked })}
                  aria-label="Visible par les apprenants"
                />
                <div className="flex-1">
                  <span className="label-text font-semibold">Examen actif</span>
                  <p className="text-sm text-base-content/60">
                    L&apos;examen sera visible dans l&apos;application mobile
                  </p>
                </div>
              </label>
            </div>

            <div className="divider"></div>

            {/* Actions */}
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onCancel}
                aria-label="Annuler"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditing ? "Modification..." : "Création..."}
                  </>
                ) : (
                  <>
                    {isEditing ? "Modifier" : "Créer"}
                  </>
                )}
              </button>
            </div>
          </form>
          
          <button 
            className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 hover:bg-error/10 hover:text-error transition-all duration-200" 
            onClick={onCancel} 
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
        <div className="modal-backdrop" onClick={onCancel}></div>
      </div>

      {/* Modal Preview Image */}
      {showImagePreview && preview && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl p-0">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Aperçu de l&apos;image</h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost" 
                onClick={() => setShowImagePreview(false)}
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex justify-center">
              <img src={preview} alt="Aperçu plein écran" className="max-w-full max-h-[70vh] object-contain" />
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowImagePreview(false)}></div>
        </div>
      )}
    </>
  )
}