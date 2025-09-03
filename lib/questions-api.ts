import { api } from './api'
import { ApiResponse } from '@/types/common'
import {
  MetadataBase,
  MetadataResponse,
  MetadataCompatible,
  AnswerStructureBase,
  AnswerStructureResponse,
  ResponseDataVF,
  ResponseDataQCMS,
  ResponseDataQRM,
  ResponseDataQCMP,
  ResponseDataQAA,
  ResponseDataORD,
  ResponseDataLAC,
  ResponseDataGRID,
  StructureVF,
  StructureQCMS,
  StructureQRM
} from '@/types/questions'

export interface StructureAP {
  id?: number
  metadata_id: number
  paires: Array<{
    element_gauche: string
    element_droit: string
  }>
}

export interface StructureTA {
  id?: number
  metadata_id: number
  texte: string
  mots_a_completer: string[]
  options_par_trou: Array<string[]>
}

export interface StructureOR {
  id?: number
  metadata_id: number
  elements: string[]
  ordre_correct: number[]
}

export interface StructureEXPR {
  id?: number
  metadata_id: number
  expression: string
  variables: Array<{
    nom: string
    min: number
    max: number
    step: number
  }>
  formule_solution: string
  tolerance: number
}

// Type pour une question complète
export interface QuestionComplete {
  id: number
  metadata: MetadataResponse
  structure: StructureVF | StructureQCMS | StructureQRM | StructureAP | StructureTA | StructureOR | StructureEXPR
  type_structure: string
  created_at: string
  updated_at: string
}

// Types pour les réponses utilisateur
export interface ReponseUtilisateur {
  question_id: number
  type_question: 'VF' | 'QCM_S' | 'QRM' | 'QCM_P' | 'QAA' | 'ORD' | 'LAC' | 'GRID'
  reponse: ReponseVF | ReponseQCMS | ReponseQRM | ReponseQCMP | ReponseQAA | ReponseORD | ReponseLAC | ReponseGRID
}

export interface ReponseQCMP {
  option_choisie: number
}

export interface ReponseQAA {
  paires: Array<{
    left: string
    right: string
  }>
}

export interface ReponseORD {
  ordre: number[]
}

export interface ReponseLAC {
  mots_choisis: string[]
}

export interface ReponseGRID {
  cellules_selectionnees: Array<{
    row: number
    col: number
  }>
}

export interface ReponseVF {
  valeur: boolean
}

export interface ReponseQCMS {
  option_choisie: number
}

export interface ReponseQRM {
  options_choisies: number[]
}

export interface ReponseAP {
  paires: Array<{
    element_gauche: string
    element_droit: string
  }>
}

export interface ReponseTA {
  mots_choisis: string[]
}

export interface ReponseEXPR {
  expression: string
  resultat: number
}

export interface ValidationResponse {
  est_correct: boolean
  score: number
  feedback: string
  details?: {
    elements_corrects?: string[]
    elements_incorrects?: string[]
  }
}

// API Functions V2

// Métadonnées
export const getMetadatas = async (): Promise<ApiResponse<MetadataResponse[]>> => {
  const response = await api.get<MetadataResponse[]>('/questions/v2/metadata/')
  return response
}

export const getMetadataById = async (id: number): Promise<ApiResponse<MetadataResponse>> => {
  const response = await api.get<MetadataResponse>(`/questions/v2/metadata/${id}/`)
  return response
}

export const createMetadata = async (data: MetadataBase): Promise<ApiResponse<MetadataResponse>> => {
  const response = await api.post<MetadataResponse>('/questions/v2/metadata/', data)
  return response
}

export const updateMetadata = async (id: number, data: Partial<MetadataBase>): Promise<ApiResponse<MetadataResponse>> => {
  const response = await api.patch<MetadataResponse>(`/questions/v2/metadata/${id}/`, data)
  return response
}

export const deleteMetadata = async (id: number): Promise<ApiResponse<void>> => {
  const response = await api.delete<void>(`/questions/v2/metadata/${id}/`)
  return response
}

// Fonction principale pour créer une structure de réponse (API V2)
export const createAnswerStructure = async (data: AnswerStructureBase): Promise<ApiResponse<AnswerStructureResponse>> => {
  const response = await api.post<AnswerStructureResponse>('/questions/v2/answer-structure/create/', data)
  return response
}

// Fonction compatibility pour l'ancien système
export const createMetadataCompatible = async (data: MetadataCompatible): Promise<ApiResponse<MetadataResponse>> => {
  // Convertir les données vers le format API V2
  const metadataV2: MetadataBase = {
    titre: data.titre,
    examen: 1, // Conversion nécessaire: string -> number
    matiere: 1, // Conversion nécessaire: string -> number  
    chapitre: 1, // Conversion nécessaire: string -> number
    niveau: data.niveau === 'facile' ? 1 : data.niveau === 'moyen' ? 2 : 3
  }
  
  const response = await api.post<MetadataResponse>('/questions/v2/metadata/', metadataV2)
  return response
}

// Structures VF
export const createStructureVF = async (data: StructureVF): Promise<ApiResponse<StructureVF>> => {
  const response = await api.post<StructureVF>('/questions/v2/structures/vf/', data)
  return response
}

export const updateStructureVF = async (id: number, data: Partial<StructureVF>): Promise<ApiResponse<StructureVF>> => {
  const response = await api.patch<StructureVF>(`/questions/v2/structures/vf/${id}/`, data)
  return response
}

// Structures QCM_S
export const createStructureQCMS = async (data: StructureQCMS): Promise<ApiResponse<StructureQCMS>> => {
  const response = await api.post<StructureQCMS>('/questions/v2/structures/qcm_s/', data)
  return response
}

export const updateStructureQCMS = async (id: number, data: Partial<StructureQCMS>): Promise<ApiResponse<StructureQCMS>> => {
  const response = await api.patch<StructureQCMS>(`/questions/v2/structures/qcm_s/${id}/`, data)
  return response
}

// Structures QRM
export const createStructureQRM = async (data: StructureQRM): Promise<ApiResponse<StructureQRM>> => {
  const response = await api.post<StructureQRM>('/questions/v2/structures/qrm/', data)
  return response
}

export const updateStructureQRM = async (id: number, data: Partial<StructureQRM>): Promise<ApiResponse<StructureQRM>> => {
  const response = await api.patch<StructureQRM>(`/questions/v2/structures/qrm/${id}/`, data)
  return response
}

// Structures AP
export const createStructureAP = async (data: StructureAP): Promise<ApiResponse<StructureAP>> => {
  const response = await api.post<StructureAP>('/questions/v2/structures/ap/', data)
  return response
}

export const updateStructureAP = async (id: number, data: Partial<StructureAP>): Promise<ApiResponse<StructureAP>> => {
  const response = await api.patch<StructureAP>(`/questions/v2/structures/ap/${id}/`, data)
  return response
}

// Structures TA
export const createStructureTA = async (data: StructureTA): Promise<ApiResponse<StructureTA>> => {
  const response = await api.post<StructureTA>('/questions/v2/structures/ta/', data)
  return response
}

export const updateStructureTA = async (id: number, data: Partial<StructureTA>): Promise<ApiResponse<StructureTA>> => {
  const response = await api.patch<StructureTA>(`/questions/v2/structures/ta/${id}/`, data)
  return response
}

// Structures OR
export const createStructureOR = async (data: StructureOR): Promise<ApiResponse<StructureOR>> => {
  const response = await api.post<StructureOR>('/questions/v2/structures/or/', data)
  return response
}

export const updateStructureOR = async (id: number, data: Partial<StructureOR>): Promise<ApiResponse<StructureOR>> => {
  const response = await api.patch<StructureOR>(`/questions/v2/structures/or/${id}/`, data)
  return response
}

// Structures EXPR
export const createStructureEXPR = async (data: StructureEXPR): Promise<ApiResponse<StructureEXPR>> => {
  const response = await api.post<StructureEXPR>('/questions/v2/structures/expr/', data)
  return response
}

export const updateStructureEXPR = async (id: number, data: Partial<StructureEXPR>): Promise<ApiResponse<StructureEXPR>> => {
  const response = await api.patch<StructureEXPR>(`/questions/v2/structures/expr/${id}/`, data)
  return response
}

// Questions complètes
export const getQuestions = async (params?: {
  type_question?: string
  niveau?: string
  tags?: string
  page?: number
  page_size?: number
}): Promise<ApiResponse<{
  count: number
  next: string | null
  previous: string | null
  results: QuestionComplete[]
}>> => {
  const queryString = params ? '?' + new URLSearchParams(params as any).toString() : ''
  const response = await api.get<any>(`/questions/v2/questions/${queryString}`)
  return response
}

export const getQuestionById = async (id: number): Promise<ApiResponse<QuestionComplete>> => {
  const response = await api.get<QuestionComplete>(`/questions/v2/questions/${id}/`)
  return response
}

export const getQuestionsByType = async (type: string): Promise<ApiResponse<QuestionComplete[]>> => {
  const response = await api.get<QuestionComplete[]>(`/questions/v2/questions/by-type/${type}/`)
  return response
}

export const deleteQuestion = async (id: number): Promise<ApiResponse<void>> => {
  const response = await api.delete<void>(`/questions/v2/questions/${id}/`)
  return response
}

// Validation des réponses
export const validateAnswer = async (data: ReponseUtilisateur): Promise<ApiResponse<ValidationResponse>> => {
  const response = await api.post<ValidationResponse>('/questions/v2/validate/', data)
  return response
}

// Helper pour créer une structure selon le type (API V2)
export const createStructureV2 = async (
  metadata_id: number,
  contenu: string,
  type: 'VF' | 'QCM_S' | 'QRM' | 'QCM_P' | 'QAA' | 'ORD' | 'LAC' | 'GRID',
  response_data: any,
  duration_seconds: number = 60,
  points: number = 1
): Promise<ApiResponse<AnswerStructureResponse>> => {
  const data: AnswerStructureBase = {
    metadata_id,
    contenu,
    type_reponse: type,
    response_data,
    duration_seconds,
    points
  }
  
  return createAnswerStructure(data)
}

// Helper pour créer une structure selon le type (Legacy)
export const createStructure = async (
  type: 'VF' | 'QCM_S' | 'QRM' | 'QCM_P' | 'QAA' | 'ORD' | 'LAC' | 'GRID',
  data: any
): Promise<ApiResponse<any>> => {
  switch (type) {
    case 'VF':
      return createStructureVF(data)
    case 'QCM_S':
      return createStructureQCMS(data)
    case 'QRM':
      return createStructureQRM(data)
    case 'QCM_P':
    case 'QAA':
    case 'ORD':
    case 'LAC':
    case 'GRID':
      throw new Error(`Type de question ${type} uniquement supporté via l'API V2`)
    default:
      throw new Error(`Type de question non supporté: ${type}`)
  }
}

// Helper pour mettre à jour une structure selon le type (Legacy)
export const updateStructure = async (
  type: 'VF' | 'QCM_S' | 'QRM' | 'QCM_P' | 'QAA' | 'ORD' | 'LAC' | 'GRID',
  id: number,
  data: any
): Promise<ApiResponse<any>> => {
  switch (type) {
    case 'VF':
      return updateStructureVF(id, data)
    case 'QCM_S':
      return updateStructureQCMS(id, data)
    case 'QRM':
      return updateStructureQRM(id, data)
    case 'QCM_P':
    case 'QAA':
    case 'ORD':
    case 'LAC':
    case 'GRID':
      throw new Error(`Type de question ${type} uniquement supporté via l'API V2`)
    default:
      throw new Error(`Type de question non supporté: ${type}`)
  }
}