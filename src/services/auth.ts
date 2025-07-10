import apiService from './api';
import { API_CONFIG } from '../config/api';
import type { UserRegistration, UserLogin } from '../types';

export interface RegisterResponse {
  token: string;
}

export interface LoginResponse {
  token: string;
}

export const authService = {
  /**
   * Registra un nuevo usuario. POST /api/auth/register
   * Devuelve el JWT en texto plano.
   */
  async register(userData: UserRegistration): Promise<RegisterResponse> {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });

      console.log('status', res.status, res.headers.get('content-type'));

      const raw = await res.text();
      console.log('raw body →', raw);

      if (res.headers.get('content-type')?.includes('application/json')) {
        const data = JSON.parse(raw);
        return { token: data.token || data.accessToken || data.access_token || raw };
      } else {
        // Si no es JSON, asumimos que es el token directo
        return { token: raw };
      }
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  },

  /**
   * Autentica un usuario existente. POST /api/auth/login
   * Devuelve el JWT en texto plano.
   */
  async login(credentials: UserLogin): Promise<LoginResponse> {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });

      console.log('status', res.status, res.headers.get('content-type'));

      const raw = await res.text();
      console.log('raw body →', raw);

      if (res.headers.get('content-type')?.includes('application/json')) {
        const data = JSON.parse(raw);
        return { token: data.token || data.accessToken || data.access_token || raw };
      } else {
        // Si no es JSON, asumimos que es el token directo
        return { token: raw };
      }
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  },

  /**
   * Crea o actualiza el perfil del usuario. POST /api/auth/profile
   */
  async createProfile(token: string, profile: { firstName: string; lastName: string; bio: string; avatarUrl?: string; }) {
    const response = await apiService.postJSON(
      API_CONFIG.ENDPOINTS.PROFILE,
      profile
    );
    return response;
  },

  /**
   * Obtiene el perfil del usuario. GET /api/user/profile
   */
  async getProfile() {
    const response = await apiService.getJSON(
      API_CONFIG.ENDPOINTS.USER_PROFILE
    );
    return response;
  },

  // Para llamadas GET/JSON: apiService.getJSON<T>(API_CONFIG.ENDPOINTS.XYZ)
};

export default authService; 