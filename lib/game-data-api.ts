import { api, ApiResponse } from './api';
import {
  GameCountry,
  GameSubject,
  GameExam,
  GameExamOption,
  GameChapter,
  DashboardStats,
  SearchResult,
  CreateGameCountryData,
  CreateGameSubjectData,
  CreateGameExamData,
  CreateGameExamOptionData,
  CreateGameChapterData,
  CountryFilters,
  SubjectFilters,
  ExamFilters,
  ExamOptionFilters,
  ChapterFilters,
  SearchFilters
} from './game-data-types';

class GameDataAPI {
  private buildQueryParams(filters: Record<string, any>): string {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return params.toString() ? `?${params.toString()}` : '';
  }

  // COUNTRIES API
  async getCountries(filters?: CountryFilters): Promise<ApiResponse<GameCountry[]>> {
    const queryString = filters ? this.buildQueryParams(filters) : '';
    return api.get<GameCountry[]>(`/game-data/countries${queryString}`);
  }

  async getCountry(id: number): Promise<ApiResponse<GameCountry>> {
    return api.get<GameCountry>(`/game-data/countries/${id}/`);
  }

  async createCountry(data: CreateGameCountryData): Promise<ApiResponse<GameCountry>> {
    return api.post<GameCountry>('/game-data/countries/', data);
  }

  async updateCountry(id: number, data: Partial<CreateGameCountryData>): Promise<ApiResponse<GameCountry>> {
    return api.put<GameCountry>(`/game-data/countries/${id}/`, data);
  }

  async deleteCountry(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/game-data/countries/${id}/`);
  }

  async uploadCountryFlag(id: number, file: File): Promise<ApiResponse<GameCountry>> {
    const formData = new FormData();
    formData.append('flag', file);
    return api.upload<GameCountry>(`/game-data/countries/${id}/upload-flag/`, formData);
  }

  // SUBJECTS API
  async getSubjects(filters?: SubjectFilters): Promise<ApiResponse<GameSubject[]>> {
    const queryString = filters ? this.buildQueryParams(filters) : '';
    return api.get<GameSubject[]>(`/game-data/subjects${queryString}`);
  }

  async getSubject(id: number): Promise<ApiResponse<GameSubject>> {
    return api.get<GameSubject>(`/game-data/subjects/${id}/`);
  }

  async createSubject(data: CreateGameSubjectData): Promise<ApiResponse<GameSubject>> {
    return api.post<GameSubject>('/game-data/subjects/', data);
  }

  async updateSubject(id: number, data: Partial<CreateGameSubjectData>): Promise<ApiResponse<GameSubject>> {
    return api.put<GameSubject>(`/game-data/subjects/${id}/`, data);
  }

  async deleteSubject(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/game-data/subjects/${id}/`);
  }

  async uploadSubjectIcon(id: number, file: File): Promise<ApiResponse<GameSubject>> {
    const formData = new FormData();
    formData.append('icon', file);
    return api.upload<GameSubject>(`/game-data/subjects/${id}/upload-icon/`, formData);
  }

  async reorderSubjects(subjects: Array<{ id: number; order_position: number }>): Promise<ApiResponse<void>> {
    return api.put<void>('/game-data/subjects/reorder/', { subjects });
  }

  // EXAMS API
  async getExams(filters?: ExamFilters): Promise<ApiResponse<GameExam[]>> {
    const queryString = filters ? this.buildQueryParams(filters) : '';
    return api.get<GameExam[]>(`/game-data/exams${queryString}`);
  }

  async getExam(id: number): Promise<ApiResponse<GameExam>> {
    return api.get<GameExam>(`/game-data/exams/${id}/`);
  }

  async createExam(data: CreateGameExamData): Promise<ApiResponse<GameExam>> {
    return api.post<GameExam>('/game-data/exams/', data);
  }

  async updateExam(id: number, data: Partial<CreateGameExamData>): Promise<ApiResponse<GameExam>> {
    return api.put<GameExam>(`/game-data/exams/${id}/`, data);
  }

  async deleteExam(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/game-data/exams/${id}/`);
  }

  async getExamStatistics(id: number): Promise<ApiResponse<any>> {
    return api.get<any>(`/game-data/exams/${id}/statistics/`);
  }

  // EXAM OPTIONS API
  async getExamOptions(filters?: ExamOptionFilters): Promise<ApiResponse<GameExamOption[]>> {
    const queryString = filters ? this.buildQueryParams(filters) : '';
    return api.get<GameExamOption[]>(`/game-data/exam-options${queryString}`);
  }

  async getExamOption(id: number): Promise<ApiResponse<GameExamOption>> {
    return api.get<GameExamOption>(`/game-data/exam-options/${id}/`);
  }

  async createExamOption(data: CreateGameExamOptionData): Promise<ApiResponse<GameExamOption>> {
    return api.post<GameExamOption>('/game-data/exam-options/', data);
  }

  async updateExamOption(id: number, data: Partial<CreateGameExamOptionData>): Promise<ApiResponse<GameExamOption>> {
    return api.put<GameExamOption>(`/game-data/exam-options/${id}/`, data);
  }

  async deleteExamOption(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/game-data/exam-options/${id}/`);
  }

  // CHAPTERS API
  async getChapters(filters?: ChapterFilters): Promise<ApiResponse<GameChapter[]>> {
    const queryString = filters ? this.buildQueryParams(filters) : '';
    return api.get<GameChapter[]>(`/game-data/chapters${queryString}`);
  }

  async getChapter(id: number): Promise<ApiResponse<GameChapter>> {
    return api.get<GameChapter>(`/game-data/chapters/${id}/`);
  }

  async createChapter(data: CreateGameChapterData): Promise<ApiResponse<GameChapter>> {
    return api.post<GameChapter>('/game-data/chapters/', data);
  }

  async updateChapter(id: number, data: Partial<CreateGameChapterData>): Promise<ApiResponse<GameChapter>> {
    return api.put<GameChapter>(`/game-data/chapters/${id}/`, data);
  }

  async deleteChapter(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/game-data/chapters/${id}/`);
  }

  // DASHBOARD & STATISTICS
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return api.get<DashboardStats>('/game-data/dashboard/stats/');
  }

  // SEARCH
  async search(filters: SearchFilters): Promise<ApiResponse<SearchResult>> {
    const queryString = this.buildQueryParams(filters);
    return api.get<SearchResult>(`/game-data/search${queryString}`);
  }

  // UTILITY METHODS
  async getGameDataHierarchy(countryId?: number): Promise<{
    countries: GameCountry[];
    subjects: GameSubject[];
    exams: GameExam[];
    chapters: GameChapter[];
  }> {
    const hierarchy = {
      countries: [] as GameCountry[],
      subjects: [] as GameSubject[],
      exams: [] as GameExam[],
      chapters: [] as GameChapter[]
    };

    try {
      // Fetch countries
      const countriesResponse = await this.getCountries();
      if (countriesResponse.data) {
        hierarchy.countries = countriesResponse.data;
      }

      // Fetch subjects
      const subjectsFilters: SubjectFilters = {};
      if (countryId) subjectsFilters.country_id = countryId;
      
      const subjectsResponse = await this.getSubjects(subjectsFilters);
      if (subjectsResponse.data) {
        hierarchy.subjects = subjectsResponse.data;
      }

      // Fetch exams
      const examsFilters: ExamFilters = {};
      if (countryId) examsFilters.country_id = countryId;
      
      const examsResponse = await this.getExams(examsFilters);
      if (examsResponse.data) {
        hierarchy.exams = examsResponse.data;
      }

      // Fetch chapters
      const chaptersFilters: ChapterFilters = {};
      if (countryId) chaptersFilters.country_id = countryId;
      
      const chaptersResponse = await this.getChapters(chaptersFilters);
      if (chaptersResponse.data) {
        hierarchy.chapters = chaptersResponse.data;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la hiérarchie game data:', error);
    }

    return hierarchy;
  }

  // Utility method to get all active countries for dropdowns
  async getActiveCountries(): Promise<GameCountry[]> {
    try {
      const response = await this.getCountries({ is_active: true });
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des pays actifs:', error);
      return [];
    }
  }

  // Utility method to get subjects by country
  async getSubjectsByCountry(countryId: number): Promise<GameSubject[]> {
    try {
      const response = await this.getSubjects({ country_id: countryId, is_active: true });
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des matières par pays:', error);
      return [];
    }
  }

  // Utility method to get exams by country
  async getExamsByCountry(countryId: number): Promise<GameExam[]> {
    try {
      const response = await this.getExams({ country_id: countryId, is_active: true });
      return response.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des examens par pays:', error);
      return [];
    }
  }
}

export const gameDataAPI = new GameDataAPI();