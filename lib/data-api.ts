import { api } from './api';
import { ApiResponse } from '@/types/common';
import { Country, Exam, Series, Subject, Chapter, ExamOption, QuestionLevel, Question } from '@/types/data';

class DataAPI {
  async getCountries(): Promise<ApiResponse<Country[]>> {
    return api.get<Country[]>('/pays/');
  }

  async getCountry(id: number): Promise<ApiResponse<Country>> {
    return api.get<Country>(`/pays/${id}/`);
  }

  async createCountry(data: Omit<Country, 'id' | 'created_by' | 'created_at'>): Promise<ApiResponse<Country>> {
    return api.post<Country>('/pays/creer/', data);
  }

  async updateCountry(id: number, data: Partial<Country>): Promise<ApiResponse<Country>> {
    return api.put<Country>(`/pays/${id}/`, data);
  }

  async deleteCountry(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/pays/${id}/`);
  }

  async getExams(filters?: { id_country?: number; is_active?: boolean }): Promise<ApiResponse<Exam[]>> {
    const params = new URLSearchParams();
    if (filters?.id_country) params.append('id_country', filters.id_country.toString());
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get<Exam[]>(`/examens/${queryString}`);
  }

  async getExam(id: number): Promise<ApiResponse<Exam>> {
    return api.get<Exam>(`/examens/${id}/`);
  }

  async createExam(data: FormData): Promise<ApiResponse<Exam>> {
    return api.upload<Exam>('/examens/create/', data);
  }

  async createExamJson(data: {
    title: string;
    description: string;
    id_country: number;
    is_active: boolean;
  }): Promise<ApiResponse<Exam>> {
    return api.post<Exam>('/examens/create/', data);
  }

  async updateExam(id: number, data: { title?: string; description?: string; id_country?: number; is_active?: boolean; }): Promise<ApiResponse<Exam>> {
    return api.put<Exam>(`/examens/${id}/`, data);
  }

  async updateExamWithImage(id: number, data: FormData): Promise<ApiResponse<Exam>> {
    return api.upload<Exam>(`/examens/${id}/`, data);
  }

  async deleteExam(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/examens/${id}/`);
  }

  async getSeries(filters?: { id_exam?: number }): Promise<ApiResponse<Series[]>> {
    // NOTE: L'endpoint /series/ n'existe plus dans la nouvelle API
    // Les séries ne sont plus utilisées, les matières sont directement liées aux examens
    console.warn('⚠️ getSeries est déprécié. Utilisez getSubjects avec exam_id à la place');
    return { 
      status: 200, 
      data: [],
      error: undefined
    };
  }

  async getSeriesById(id: number): Promise<ApiResponse<Series>> {
    return api.get<Series>(`/series/${id}/`);
  }

  async createSeries(data: {
    id_exam: number;
    title: string;
    description: string;
    is_active: number;
  }): Promise<ApiResponse<Series>> {
    return api.post<Series>('/series/create/', data);
  }

  async updateSeries(id: number, data: { id_exam?: number; title?: string; description?: string; is_active?: number; }): Promise<ApiResponse<Series>> {
    return api.put<Series>(`/series/${id}/`, data);
  }

  async deleteSeries(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/series/${id}/`);
  }

  async getSubjects(filters?: { id_series?: number; id_exam?: number; year?: number; is_active?: number }): Promise<ApiResponse<Subject[]>> {
    // IMPORTANT: Toujours utiliser le nouvel endpoint avec des filtres
    // Ne jamais appeler /matieres/ sans paramètres car cela provoque une erreur 500
    
    if (!filters || (!filters.year && !filters.id_exam)) {
      // Retourner un tableau vide si pas de filtres appropriés
      console.warn('⚠️ getSubjects appelé sans filtres appropriés. Utilisez les nouveaux endpoints avec year ou exam_id');
      return { 
        status: 200, 
        data: [],
        error: undefined
      };
    }
    
    // Utiliser le nouvel endpoint /matieres/par-annee/
    const params = new URLSearchParams();
    if (filters.year) params.append('year', filters.year.toString());
    if (filters.id_exam) params.append('exam_id', filters.id_exam.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    // Récupérer via le nouvel endpoint et aplatir la structure
    const response = await api.get<any>(`/matieres/par-annee/${queryString}`);
    if (response.data?.results) {
      const subjects: Subject[] = [];
      response.data.results.forEach((examGroup: any) => {
        examGroup.subjects?.forEach((subject: any) => {
          subjects.push({
            ...subject,
            id_exam: examGroup.exam_id
          });
        });
      });
      return { ...response, data: subjects };
    }
    return response;
  }

  async getSubject(id: number): Promise<ApiResponse<Subject>> {
    return api.get<Subject>(`/matieres/${id}/`);
  }

  async createSubject(data: {
    name: string;
    series: number;
    description?: string;
    coefficient?: number;
  }): Promise<ApiResponse<Subject>> {
    return api.post<Subject>('/matieres/create/', data);
  }

  async updateSubject(id: number, data: { title?: string; description?: string; id_series?: number; is_active?: number; }): Promise<ApiResponse<Subject>> {
    return api.put<Subject>(`/matieres/${id}/`, data);
  }

  async deleteSubject(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/matieres/${id}/`);
  }

  async getChapters(filters?: { id_subject?: number; id_exam?: number; is_active?: number }): Promise<ApiResponse<Chapter[]>> {
    // IMPORTANT: Toujours utiliser le nouvel endpoint avec des filtres
    // Ne jamais appeler /chapitres/ sans paramètres car cela provoque une erreur 500
    
    if (!filters || !filters.id_subject) {
      // Retourner un tableau vide si pas de filtres appropriés
      console.warn('⚠️ getChapters appelé sans filtres appropriés. Utilisez les nouveaux endpoints avec subject_id');
      return { 
        status: 200, 
        data: [],
        error: undefined
      };
    }
    
    // Utiliser le nouvel endpoint /chapitres/par-matiere/
    const params = new URLSearchParams();
    params.append('subject_id', filters.id_subject.toString());
    if (filters.id_exam) params.append('exam_id', filters.id_exam.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    // Récupérer via le nouvel endpoint et aplatir la structure
    const response = await api.get<any>(`/chapitres/par-matiere/${queryString}`);
    if (response.data?.results) {
      const chapters: Chapter[] = [];
      response.data.results.forEach((subjectGroup: any) => {
        subjectGroup.chapters?.forEach((chapter: any) => {
          chapters.push({
            ...chapter,
            id_subject: subjectGroup.subject_id
          });
        });
      });
      return { ...response, data: chapters };
    }
    return response;
  }

  async getChapter(id: number): Promise<ApiResponse<Chapter>> {
    return api.get<Chapter>(`/chapitres/${id}/`);
  }

  async createChapter(data: {
    id_subject: number;
    title: string;
    description: string;
    is_active: number;
  }): Promise<ApiResponse<Chapter>> {
    return api.post<Chapter>('/chapitres/create/', data);
  }

  async updateChapter(id: number, data: { id_subject?: number; title?: string; description?: string; is_active?: number; }): Promise<ApiResponse<Chapter>> {
    return api.put<Chapter>(`/chapitres/${id}/`, data);
  }

  async deleteChapter(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/chapitres/${id}/`);
  }

  async getExamOptions(filters?: { examen_id?: number; is_active?: boolean }): Promise<ApiResponse<ExamOption[]>> {
    const params = new URLSearchParams();
    if (filters?.examen_id) params.append('examen', filters.examen_id.toString());
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get<ExamOption[]>(`/options-examens/${queryString}`);
  }

  async getExamOption(id: number): Promise<ApiResponse<ExamOption>> {
    return api.get<ExamOption>(`/options-examens/${id}/`);
  }

  async createExamOption(data: {
    exam: number;
    name: string;
    code: string;
    description?: string;
    coefficient?: number;
    is_active?: boolean;
  }): Promise<ApiResponse<ExamOption>> {
    const optionData = {
      examen: data.exam,
      nom: data.name,
      code: data.code,
      description: data.description || '',
      coefficient: data.coefficient || 1,
      is_active: data.is_active ?? true
    };
    return api.post<ExamOption>('/options-examens/creer/', optionData);
  }

  async updateExamOption(id: number, data: { name?: string; code?: string; description?: string; coefficient?: number; is_active?: boolean; }): Promise<ApiResponse<ExamOption>> {
    const optionData: any = {};
    if (data.name) optionData.nom = data.name;
    if (data.code) optionData.code = data.code;
    if (data.description !== undefined) optionData.description = data.description;
    if (data.coefficient !== undefined) optionData.coefficient = data.coefficient;
    if (data.is_active !== undefined) optionData.is_active = data.is_active;
    return api.put<ExamOption>(`/options-examens/${id}/`, optionData);
  }

  async deleteExamOption(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/options-examens/${id}/`);
  }

  async getQuestionLevels(): Promise<ApiResponse<QuestionLevel[]>> {
    // Utiliser le nouvel endpoint /niveaux/liste/
    const response = await api.get<any>('/niveaux/liste/');
    
    // Si la réponse contient un objet avec un champ 'levels'
    if (response.data?.levels) {
      // Mapper les données au format attendu
      const levels: QuestionLevel[] = response.data.levels.map((level: any) => ({
        id: level.id,
        niveau: level.id, // Utiliser l'id comme niveau pour compatibilité
        description: level.description || level.title,
        points_min: 0, // Valeurs par défaut
        points_max: 10,
        created_at: level.created_at,
        updated_at: level.updated_at
      }));
      return { ...response, data: levels };
    }
    
    // Fallback sur l'ancien endpoint
    return api.get<QuestionLevel[]>('/niveaux-questions/');
  }

  // Nouveaux endpoints pour le filtrage dynamique
  async getExamYears(): Promise<ApiResponse<{ count: number; years: number[]; filtered_by_country?: { id: number; name: string } }>> {
    return api.get('/examens/annees/');
  }

  async getExamsByYear(year?: number, countryId?: number): Promise<ApiResponse<{
    count: number;
    stats: { year: string; total_exams: number; by_country: Record<string, number> };
    results: Exam[];
  }>> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (countryId) params.append('country_id', countryId.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/examens/par-annee/${queryString}`);
  }

  async getSubjectsByYear(year?: number, examId?: number, countryId?: number): Promise<ApiResponse<{
    count: number;
    total_exams: number;
    year_filter?: string;
    results: Array<{
      exam_id: number;
      exam_title: string;
      exam_year: number;
      subjects: Array<{
        id: number;
        title: string;
        description: string;
        chapters_count: number;
      }>;
    }>;
  }>> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (examId) params.append('exam_id', examId.toString());
    if (countryId) params.append('country_id', countryId.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/matieres/par-annee/${queryString}`);
  }

  async getChaptersBySubject(subjectIds?: string, examId?: number): Promise<ApiResponse<{
    count: number;
    total_subjects: number;
    subject_filter?: string;
    results: Array<{
      subject_id: number;
      subject_title: string;
      exam_title: string;
      chapters: Array<{
        id: number;
        title: string;
        description: string;
        order: number;
      }>;
    }>;
  }>> {
    const params = new URLSearchParams();
    if (subjectIds) params.append('subject_id', subjectIds);
    if (examId) params.append('exam_id', examId.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get(`/chapitres/par-matiere/${queryString}`);
  }

  async getLevelsList(): Promise<ApiResponse<{
    count: number;
    levels: Array<{
      id: number;
      title: string;
      description: string;
      created_by: string;
      is_active: number;
    }>;
  }>> {
    return api.get('/niveaux/liste/');
  }

  async getQuestionLevel(id: number): Promise<ApiResponse<QuestionLevel>> {
    return api.get<QuestionLevel>(`/niveaux-questions/${id}/`);
  }

  // Questions
  async getQuestions(filters?: { 
    id_exam?: number;
    id_serie?: number;
    id_matiere?: number;
    id_chapitre?: number;
    id_niveau?: number;
    type_reponse?: string;
    is_active?: boolean;
  }): Promise<ApiResponse<Question[]>> {
    const params = new URLSearchParams();
    if (filters?.id_exam) params.append('id_exam', filters.id_exam.toString());
    if (filters?.id_serie) params.append('id_serie', filters.id_serie.toString());
    if (filters?.id_matiere) params.append('id_matiere', filters.id_matiere.toString());
    if (filters?.id_chapitre) params.append('id_chapitre', filters.id_chapitre.toString());
    if (filters?.id_niveau) params.append('id_niveau', filters.id_niveau.toString());
    if (filters?.type_reponse) params.append('type_reponse', filters.type_reponse);
    if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return api.get<Question[]>(`/questions/${queryString}`);
  }

  async getQuestion(id: number): Promise<ApiResponse<Question>> {
    return api.get<Question>(`/questions/${id}/`);
  }

  async createQuestion(data: Partial<Question>): Promise<ApiResponse<Question>> {
    return api.post<Question>('/questions/create/', data);
  }

  async updateQuestion(id: number, data: Partial<Question>): Promise<ApiResponse<Question>> {
    return api.put<Question>(`/questions/${id}/`, data);
  }

  async deleteQuestion(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/questions/${id}/`);
  }

  async getFullHierarchy(countryId?: number): Promise<{
    countries: Country[];
    exams: Exam[];
    series: Series[];
    subjects: Subject[];
    chapters: Chapter[];
    examOptions: ExamOption[];
  }> {
    const hierarchy: {countries: Country[], exams: Exam[], series: Series[], subjects: Subject[], chapters: Chapter[], examOptions: ExamOption[]} = {
      countries: [],
      exams: [],
      series: [],
      subjects: [],
      chapters: [],
      examOptions: []
    };

    try {
      const countriesResponse = await this.getCountries();
      if (countriesResponse.data) {
        hierarchy.countries = countriesResponse.data;
      }

      const examsResponse = countryId 
        ? await this.getExams({ id_country: countryId })
        : await this.getExams();
      
      if (examsResponse.data) {
        hierarchy.exams = examsResponse.data;

        for (const exam of examsResponse.data) {
          // Récupérer les options d'examen
          const examOptionsResponse = await this.getExamOptions({ examen_id: exam.id });
          if (examOptionsResponse.data) {
            const optionsList = examOptionsResponse.data.data || examOptionsResponse.data;
            const safeOptions = Array.isArray(optionsList) ? optionsList : [];
            hierarchy.examOptions.push(...safeOptions);
          }

          // Nouvelle approche : r\u00e9cup\u00e9rer les mati\u00e8res directement li\u00e9es \u00e0 l'examen (sans passer par les s\u00e9ries)
          const subjectsResponse = await this.getSubjects({ id_exam: exam.id });
          if (subjectsResponse.data) {
            hierarchy.subjects.push(...subjectsResponse.data);

            for (const subject of subjectsResponse.data) {
              const chaptersResponse = await this.getChapters({ id_subject: subject.id, id_exam: exam.id });
              if (chaptersResponse.data) {
                hierarchy.chapters.push(...chaptersResponse.data);
              }
            }
          }
          
          // Garder la compatibilit\u00e9 avec les s\u00e9ries si n\u00e9cessaire (peut \u00eatre retir\u00e9 plus tard)
          try {
            const seriesResponse = await this.getSeries({ id_exam: exam.id });
            if (seriesResponse.data) {
              hierarchy.series.push(...seriesResponse.data);
            }
          } catch (seriesError) {
            // Ignorer l'erreur si l'endpoint /series/ n'existe plus
            console.log('Endpoint /series/ non disponible, utilisation des nouveaux endpoints');
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la hiérarchie:', error);
    }

    return hierarchy;
  }
}

export const dataAPI = new DataAPI();