import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

class ApiService {
  private api: any;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: { 'Content-Type': 'application/json' },
      responseType: 'text',
    });

    this.api.interceptors.request.use(
      async (config: any) => {
        try {
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Enviando Authorization header:', `Bearer ${token.substring(0, 20)}...`);
          } else {
            console.warn('No se encontró token en AsyncStorage');
          }
        } catch (error) {
          console.error('Error getting token from AsyncStorage:', error);
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (res: any) => res,
      async (err: any) => {
        console.error('Error en respuesta API:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          url: err.config?.url
        });
        
        // Crear un error más descriptivo
        let errorMessage = 'An error occurred';
        
        if (err.response?.status === 401) {
          errorMessage = 'Invalid credentials. Please check your email and password.';
          try {
            await AsyncStorage.multiRemove(['authToken', 'user']);
          } catch (storageError) {
            console.error('Error clearing auth storage:', storageError);
          }
          // No redirigir automáticamente en login/register
          if (!err.config?.url?.includes('/auth/')) {
            // En mobile, podrías usar un contexto para manejar la navegación
            console.log('Token expired, should redirect to login');
          }
        } else if (err.response?.status === 403) {
          errorMessage = 'Access denied. Please log in again.';
        } else if (err.response?.status === 404) {
          errorMessage = 'Resource not found.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.response?.data) {
          try {
            const errorData = JSON.parse(err.response.data as string);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = err.response.data as string || errorMessage;
          }
        }
        
        const enhancedError = new Error(errorMessage);
        (enhancedError as any).status = err.response?.status;
        (enhancedError as any).originalError = err;
        
        return Promise.reject(enhancedError);
      }
    );
  }

  public async postText(url: string, data?: any): Promise<string> {
    const response = await this.api.post(url, data);
    return response.data;
  }

  public async getJSON<T>(url: string): Promise<T> {
    const resp = await this.api.get(url, { responseType: 'json' });
    return resp.data;
  }

  public async postJSON<T>(url: string, data?: any): Promise<T> {
    const resp = await this.api.post(url, data, { responseType: 'json' });
    return resp.data;
  }

  public async putJSON<T>(url: string, data?: any): Promise<T> {
    const resp = await this.api.put(url, data, { responseType: 'json' });
    return resp.data;
  }

  public async patchJSON<T>(url: string, data?: any): Promise<T> {
    const resp = await this.api.patch(url, data, { responseType: 'json' });
    return resp.data;
  }

  public async deleteJSON<T>(url: string): Promise<T> {
    const resp = await this.api.delete(url, { responseType: 'json' });
    return resp.data;
  }

  // Métodos de conveniencia para mantener compatibilidad
  public async get<T>(url: string, config?: any): Promise<T> {
    return this.getJSON<T>(url);
  }

  public async post<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.postJSON<T>(url, data);
  }

  public async put<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.putJSON<T>(url, data);
  }

  public async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.patchJSON<T>(url, data);
  }

  public async delete<T>(url: string, config?: any): Promise<T> {
    return this.deleteJSON<T>(url);
  }

  // Upload file para mobile
  public async upload<T>(url: string, formData: FormData, config?: any): Promise<T> {
    const resp = await this.api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
      responseType: 'json',
    });
    return resp.data;
  }
}

export const apiService = new ApiService();
export default apiService;
