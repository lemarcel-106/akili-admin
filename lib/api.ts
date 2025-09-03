import { auth } from './auth';
import { ApiResponse } from '@/types/common';

export { ApiResponse };

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'https://api.mobile.akili.guru') {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('[API] Request:', options.method || 'GET', url);
      
      const headers = {
        'Content-Type': 'application/json',
        ...auth.getAuthHeaders(),
        ...options.headers,
      };
      
      if (options.body) {
        console.log('[API] Request body:', options.body);
      }

      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Si le token est expiré, essayer de le rafraîchir
      if (response.status === 401) {
        const refreshed = await auth.refreshAccessToken();
        if (refreshed) {
          // Retry avec le nouveau token
          const newHeaders = {
            'Content-Type': 'application/json',
            ...auth.getAuthHeaders(),
            ...options.headers,
          };
          
          response = await fetch(url, {
            ...options,
            headers: newHeaders,
          });
        } else {
          // Échec du refresh, rediriger vers login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return {
            status: 401,
            error: 'Session expirée'
          };
        }
      }

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      console.log('[API] Response:', response.status, url, data);

      if (!response.ok) {
        console.error('[API] Error response:', response.status, data);
        return {
          status: response.status,
          error: data.message || data.error || `Erreur ${response.status}`,
          data
        };
      }

      return {
        status: response.status,
        data
      };
    } catch (error) {
      console.error('[API] Network error:', error);
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[DEV][ApiClient] makeRequest exception', error)
      }
      return {
        status: 0,
        error: 'Erreur de connexion au serveur'
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      let headers = auth.getAuthHeaders();
      // Remove Content-Type for FormData to let browser set it with boundary
      delete headers['Content-Type'];

      let response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      // Handle token refresh for file uploads
      if (response.status === 401) {
        const refreshed = await auth.refreshAccessToken();
        if (refreshed) {
          headers = auth.getAuthHeaders();
          delete headers['Content-Type'];
          
          response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
          });
        } else {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return {
            status: 401,
            error: 'Session expirée'
          };
        }
      }

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      console.log('[API] Upload Response:', response.status, url, data);

      if (!response.ok) {
        console.error('[API] Upload Error response:', response.status, data);
        return {
          status: response.status,
          error: data.message || data.error || `Erreur ${response.status}`,
          data
        };
      }

      return {
        status: response.status,
        data
      };
    } catch (error) {
      console.error('[API] Upload Network error:', error);
      return {
        status: 0,
        error: 'Erreur de connexion au serveur'
      };
    }
  }
}

export const api = new ApiClient();
export type { ApiResponse };