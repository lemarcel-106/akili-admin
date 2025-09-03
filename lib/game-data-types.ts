// Types pour l'API Game Data

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  pagination?: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface GameCountry {
  id: number
  name: string
  code: string
  iso_code: string
  flag_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  stats: {
    total_users: number
    total_exams: number
    total_subjects: number
  }
}

export interface GameSubject {
  id: number
  name: string
  code: string
  description: string
  icon_url: string | null
  color: string
  country: {
    id: number
    name: string
    code: string
  }
  is_active: boolean
  order_position: number
  created_at: string
  updated_at: string
  stats: {
    total_exams: number
    total_chapters: number
    total_questions: number
  }
}

export type GameLevel = 
  | "6EME" 
  | "5EME" 
  | "4EME" 
  | "3EME" 
  | "2NDE" 
  | "1ERE" 
  | "TERMINALE" 
  | "BAC" 
  | "BEPC" 
  | "UNIVERSITAIRE"

export interface GameExam {
  id: number
  name: string
  code: string
  description: string
  level: GameLevel
  duration_minutes: number
  passing_score: number
  max_score: number
  country: {
    id: number
    name: string
    code: string
  }
  subjects: Array<{
    id: number
    name: string
    code: string
    coefficient: number
  }>
  is_active: boolean
  created_at: string
  updated_at: string
  stats: {
    total_participants: number
    total_questions: number
    success_rate: number
  }
}

export interface GameExamOption {
  id: number
  name: string
  code: string
  description: string
  exam: {
    id: number
    name: string
    code: string
  }
  subject: {
    id: number
    name: string
    code: string
  }
  coefficient: number
  duration_minutes: number
  is_mandatory: boolean
  prerequisites: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  stats: {
    total_participants: number
    average_score: number
    success_rate: number
  }
}

export type ChapterDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"
export type ResourceType = "PDF" | "VIDEO" | "AUDIO" | "IMAGE" | "LINK"

export interface GameChapter {
  id: number
  title: string
  slug: string
  description: string
  content: string
  level: GameLevel
  order_position: number
  estimated_duration_minutes: number
  difficulty: ChapterDifficulty
  subject: {
    id: number
    name: string
    code: string
    color: string
  }
  country: {
    id: number
    name: string
    code: string
  }
  tags: string[]
  learning_objectives: string[]
  prerequisites: Array<{
    id: number
    title: string
    is_completed: boolean
  }>
  resources: Array<{
    id: number
    title: string
    type: ResourceType
    file_url: string
    size_mb?: number
    duration_minutes?: number
  }>
  is_active: boolean
  created_at: string
  updated_at: string
  stats: {
    total_views: number
    total_completions: number
    average_completion_time: number
    satisfaction_rate: number
  }
}

export interface DashboardStats {
  countries: {
    total: number
    active: number
  }
  subjects: {
    total: number
    active: number
  }
  exams: {
    total: number
    active: number
  }
  exam_options: {
    total: number
    active: number
  }
  chapters: {
    total: number
    active: number
  }
  recent_activity: Array<{
    type: string
    title: string
    user: string
    timestamp: string
  }>
}

export interface SearchResult {
  query: string
  total_results: number
  results: Array<{
    type: "country" | "subject" | "exam" | "chapter"
    id: number
    title: string
    description: string
    url: string
  }>
}

// Types pour les formulaires de création/modification
export type CreateGameCountryData = Omit<GameCountry, 'id' | 'flag_url' | 'created_at' | 'updated_at' | 'stats'>

export type CreateGameSubjectData = {
  name: string
  code: string
  description: string
  color: string
  country_id: number
  is_active: boolean
  order_position?: number
}

export type CreateGameExamData = {
  name: string
  code: string
  description: string
  level: GameLevel
  duration_minutes: number
  passing_score: number
  max_score: number
  country_id: number
  subjects: Array<{
    subject_id: number
    coefficient: number
  }>
  is_active: boolean
}

export type CreateGameExamOptionData = {
  name: string
  code: string
  description: string
  exam_id: number
  subject_id: number
  coefficient: number
  duration_minutes: number
  is_mandatory: boolean
  prerequisites: string[]
  is_active: boolean
}

export type CreateGameChapterData = {
  title: string
  description: string
  content: string
  level: GameLevel
  estimated_duration_minutes: number
  difficulty: ChapterDifficulty
  subject_id: number
  country_id: number
  tags: string[]
  learning_objectives: string[]
  is_active: boolean
}

// Types pour les filtres
export interface CountryFilters {
  page?: number
  per_page?: number
  search?: string
  is_active?: boolean
}

export interface SubjectFilters {
  page?: number
  per_page?: number
  country_id?: number
  is_active?: boolean
  search?: string
}

export interface ExamFilters {
  page?: number
  per_page?: number
  country_id?: number
  subject_id?: number
  level?: GameLevel
  is_active?: boolean
  search?: string
}

export interface ExamOptionFilters {
  page?: number
  per_page?: number
  exam_id?: number
  country_id?: number
  is_active?: boolean
}

export interface ChapterFilters {
  page?: number
  per_page?: number
  subject_id?: number
  country_id?: number
  level?: GameLevel
  is_active?: boolean
  search?: string
}

export interface SearchFilters {
  q: string
  type?: "country" | "subject" | "exam" | "chapter"
  limit?: number
}