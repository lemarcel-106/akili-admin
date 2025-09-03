// Types de questions BEPC Cameroun
export const QUESTION_TYPES = {
  QCM_RMA: 'QCM_RMA',
  QCM_APP: 'QCM_APP',
  VF: 'VF',
  QCM_PROC: 'QCM_PROC',
  QCM_S: 'QCM_S',
  QCM_ARR: 'QCM_ARR'
} as const

export type QuestionTypeCode = keyof typeof QUESTION_TYPES

// Interface de base pour toutes les questions
export interface BaseQuestion {
  id: number
  id_question_type: number
  type_code: QuestionTypeCode
  question_text: string
  duration_seconds: number
  points?: number
  created_at?: string
  created_by?: string
  is_active?: boolean
}

// 1. QCM_RMA - QCM à Réponse Multiple et Appariement
export interface SubQuestion {
  id: number
  label: string
  options: Array<{
    id: string
    content: string
  }> | 'same_as_above'
  correct_answers: string[]
}

export interface QCM_RMA extends BaseQuestion {
  type_code: 'QCM_RMA'
  sub_questions: SubQuestion[]
}

// 2. QCM_APP - QCM Appariement
export interface QCM_APP extends BaseQuestion {
  type_code: 'QCM_APP'
  left_items: Array<{
    id: string
    content: string
    type?: 'text' | 'image'
  }>
  right_items: Array<{
    id: string
    content: string
  }>
  correct_matches: Record<string, string>
}

// 3. VF - Vrai ou Faux
export interface VF extends BaseQuestion {
  type_code: 'VF'
  correct_answer: boolean
  question_explanation?: string
}

// 4. QCM_PROC - QCM Processus
export interface QCM_PROC extends BaseQuestion {
  type_code: 'QCM_PROC'
  formula_template: string
  available_elements: Array<{
    id: string
    content: string
    type: 'operator' | 'coefficient' | 'element' | 'subscript' | 'superscript'
  }>
  correct_sequences: string[][]
  step_validation?: boolean
}

// 5. QCM_S - QCM Simple
export interface QCM_S extends BaseQuestion {
  type_code: 'QCM_S'
  options: Array<{
    id: number
    content: string
  }>
  correct_answer_id: number
  calculation_context?: string
}

// 6. QCM_ARR - QCM Arrangement
export interface QCM_ARR extends BaseQuestion {
  type_code: 'QCM_ARR'
  items: Array<{
    id: string
    content: string
    correct_position: number
  }>
}

// Type union pour toutes les questions
export type Question = QCM_RMA | QCM_APP | VF | QCM_PROC | QCM_S | QCM_ARR

// Métadonnées des types de questions
export const QUESTION_TYPE_META = {
  QCM_RMA: {
    name: 'QCM à Réponse Multiple et Appariement',
    description: 'Question hybride combinant sélection multiple et appariement',
    icon: 'CheckSquare',
    color: 'violet'
  },
  QCM_APP: {
    name: 'QCM Appariement',
    description: 'Association simple entre éléments de deux listes',
    icon: 'GitMerge',
    color: 'blue'
  },
  VF: {
    name: 'Vrai ou Faux',
    description: 'Question binaire Vrai/Faux',
    icon: 'ToggleLeft',
    color: 'green'
  },
  QCM_PROC: {
    name: 'QCM Processus',
    description: 'Construction progressive d\'expressions ou formules',
    icon: 'Layers',
    color: 'orange'
  },
  QCM_S: {
    name: 'QCM Simple',
    description: 'Question à choix unique parmi plusieurs propositions',
    icon: 'RadioButton',
    color: 'purple'
  },
  QCM_ARR: {
    name: 'QCM Arrangement',
    description: 'Ordonner des éléments dans la séquence correcte',
    icon: 'ArrowUpDown',
    color: 'indigo'
  }
} as const

// Helper functions
export function getQuestionTypeName(code: QuestionTypeCode): string {
  return QUESTION_TYPE_META[code].name
}

export function getQuestionTypeDescription(code: QuestionTypeCode): string {
  return QUESTION_TYPE_META[code].description
}

export function getQuestionTypeIcon(code: QuestionTypeCode): string {
  return QUESTION_TYPE_META[code].icon
}

export function getQuestionTypeColor(code: QuestionTypeCode): string {
  return QUESTION_TYPE_META[code].color
}

// Validation helpers
export function validateQCM_RMA(question: QCM_RMA): boolean {
  if (!question.sub_questions || question.sub_questions.length === 0) return false
  
  return question.sub_questions.every(sq => {
    return sq.label && 
           sq.correct_answers && 
           sq.correct_answers.length > 0 &&
           (sq.options === 'same_as_above' || (Array.isArray(sq.options) && sq.options.length > 0))
  })
}

export function validateQCM_APP(question: QCM_APP): boolean {
  return question.left_items.length > 0 && 
         question.right_items.length > 0 && 
         Object.keys(question.correct_matches).length > 0
}

export function validateVF(question: VF): boolean {
  return typeof question.correct_answer === 'boolean'
}

export function validateQCM_PROC(question: QCM_PROC): boolean {
  return question.formula_template && 
         question.available_elements.length > 0 && 
         question.correct_sequences.length > 0
}

export function validateQCM_S(question: QCM_S): boolean {
  return question.options.length >= 2 && 
         question.correct_answer_id !== undefined &&
         question.options.some(opt => opt.id === question.correct_answer_id)
}

export function validateQCM_ARR(question: QCM_ARR): boolean {
  if (!question.items || question.items.length < 2) return false
  
  const positions = question.items.map(item => item.correct_position)
  const uniquePositions = new Set(positions)
  
  return uniquePositions.size === positions.length && 
         Math.min(...positions) === 1 && 
         Math.max(...positions) === positions.length
}

// Validation générale
export function validateQuestion(question: Question): boolean {
  switch (question.type_code) {
    case 'QCM_RMA':
      return validateQCM_RMA(question as QCM_RMA)
    case 'QCM_APP':
      return validateQCM_APP(question as QCM_APP)
    case 'VF':
      return validateVF(question as VF)
    case 'QCM_PROC':
      return validateQCM_PROC(question as QCM_PROC)
    case 'QCM_S':
      return validateQCM_S(question as QCM_S)
    case 'QCM_ARR':
      return validateQCM_ARR(question as QCM_ARR)
    default:
      return false
  }
}