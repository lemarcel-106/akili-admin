export interface Country {
  id: number;
  name: string;
  iso_code?: string;
  code?: string;
  created_by?: string;
  created_at?: string;
  is_active?: boolean;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  year?: number;
  image?: string | null;
  avatar_url?: string | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  is_active: boolean;
  id_country: number;
  pays?: { id: number; nom: string };
}

export interface Series {
  id: number;
  id_exam: number;
  title: string;
  description: string;
  examen?: {
    id: number;
    titre: string;
  };
  created_by: string;
  created_at: string;
  is_active: number;
}

export interface Subject {
  id: number;
  id_exam?: number;
  id_series?: {
    id: number;
    title: string;
    id_exam: {
      id: number;
      title: string;
      id_country: {
        id: number;
        name: string;
        code: string;
      };
    };
  };
  title: string;
  description: string;
  chapters_count?: number;
  created_by?: string;
  created_at?: string;
  is_active?: number | boolean;
}

export interface Chapter {
  id: number;
  id_subject?: number | {
    id: number;
    title: string;
    id_series?: {
      id: number;
      title: string;
    };
  };
  title: string;
  description: string;
  order?: number;
  created_by?: string;
  created_at?: string;
  is_active?: number | boolean;
}

export interface ExamOption {
  id: number;
  examen: {
    id: number;
    title: string;
    pays: {
      id: number;
      nom: string;
      code: string;
    };
  };
  nom: string;
  code: string;
  description: string;
  coefficient: number;
  created_by: string;
  created_at: string;
  is_active: boolean;
}

export interface QuestionLevel {
  id: number;
  niveau: number;
  description: string;
  points_min: number;
  points_max: number;
  created_at?: string;
  updated_at?: string;
}

export interface Question {
  id: number;
  title: string;
  content?: string;
  type_reponse?: string;
  id_niveau?: number;
  id_exam?: number;
  id_serie?: number;
  id_matiere?: number;
  id_chapitre?: number;
  points?: number;
  temps_reponse?: number;
  explication?: string;
  created_at?: string;
  created_by?: string;
  is_active?: boolean;
  niveau?: QuestionLevel;
  exam?: Exam;
  serie?: Series;
  matiere?: Subject;
  chapitre?: Chapter;
}