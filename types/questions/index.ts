export interface MetadataBase {
  id?: number;
  titre: string;
  annee?: number;
  examen: number;
  serie?: number;
  matiere: number;
  chapitre: number;
  niveau?: number;
}

export interface MetadataResponse extends MetadataBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface MetadataCompatible {
  id?: number;
  titre: string;
  examen: string;
  matiere: string;
  chapitre: string;
  type_question: 'VF' | 'QCM_S' | 'QRM' | 'QCM_P' | 'QAA' | 'ORD' | 'LAC' | 'GRID';
  enonce: string;
  niveau: 'facile' | 'moyen' | 'difficile';
  duree_estimee: number;
  points: number;
  tags?: string[];
  image_url?: string;
  ressource_audio_url?: string;
}

export interface AnswerStructureBase {
  metadata_id: number;
  contenu: string;
  type_reponse: 'VF' | 'QCM_S' | 'QRM' | 'QCM_P' | 'QAA' | 'ORD' | 'LAC' | 'GRID';
  response_data: ResponseDataVF | ResponseDataQCMS | ResponseDataQRM | ResponseDataQCMP | ResponseDataQAA | ResponseDataORD | ResponseDataLAC | ResponseDataGRID;
  duration_seconds: number;
  points: number;
}

export interface AnswerStructureResponse {
  id: number;
  metadata_id: number;
  contenu: string;
  type_reponse: string;
  response_data: any;
  duration_seconds: number;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface ResponseDataVF {
  correct_answer: boolean;
  explanation?: string;
}

export interface ResponseDataQCMS {
  options: Array<{
    text: string;
    is_correct: boolean;
  }>;
  explanation?: string;
}

export interface ResponseDataQRM {
  options: Array<{
    text: string;
    is_correct: boolean;
  }>;
  explanation?: string;
}

export interface ResponseDataQCMP {
  assertion_a: string;
  assertion_b: string;
  correct_option: number;
  explanation?: string;
}

export interface ResponseDataQAA {
  pairs: Array<{
    left: string;
    right: string;
  }>;
  explanation?: string;
}

export interface ResponseDataORD {
  items: string[];
  explanation?: string;
}

export interface ResponseDataLAC {
  text_with_blanks: string;
  blanks: Array<{
    correct_answer: string;
    options?: string[];
  }>;
  explanation?: string;
}

export interface ResponseDataGRID {
  grid: {
    rows: number;
    cols: number;
  };
  cells: Array<{
    row: number;
    col: number;
    value: string;
    is_correct: boolean;
  }>;
  explanation?: string;
}

export interface StructureVF {
  id?: number;
  metadata_id: number;
  reponse_correcte: boolean;
  explication: string;
}

export interface StructureQCMS {
  id?: number;
  metadata_id: number;
  options: Array<{
    texte: string;
    est_correct: boolean;
  }>;
  explication: string;
}

export interface StructureQRM {
  id?: number;
  metadata_id: number;
  options: Array<{
    texte: string;
    est_correct: boolean;
  }>;
  explication: string;
}