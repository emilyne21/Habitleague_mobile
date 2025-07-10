// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG } from '../config/api';
import authService from '../services/auth';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePhotoUrl?: string;
  bio?: string;
  avatarId?: 'MALE' | 'FEMALE';
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio?: string;
}

interface DecodedToken {
  userId: string;
  email: string;
  exp: number;
  // añade aquí otros campos que tu JWT incluya, p.ej. firstName, lastName, etc.
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = API_CONFIG.BASE_URL;

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('user');
        if (storedToken && storedUser) {
          const { exp } = jwtDecode<DecodedToken>(storedToken);
          if (exp > Date.now() / 1000) {
            setToken(storedToken);
            const userData = JSON.parse(storedUser);
            console.log('LOADED FROM ASYNC STORAGE:', JSON.stringify(userData, null, 2));
            setUser(userData);
            
            // Intentar obtener perfil actualizado
            try {
              const profileData = await authService.getProfile() as Partial<User>;
              console.log('PROFILE DATA ON APP START:', JSON.stringify(profileData, null, 2));
              
              const updatedUserData: User = {
                ...userData,
                ...profileData,
                id: userData.id,
                email: userData.email || profileData.email || '', // Usar email del JWT como respaldo
                firstName: profileData.firstName || userData.firstName,
                lastName: profileData.lastName || userData.lastName,
              };
              
              console.log('UPDATED USER DATA ON APP START:', JSON.stringify(updatedUserData, null, 2));
              await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
              setUser(updatedUserData);
            } catch (profileError) {
              console.warn('Could not fetch updated profile on app start:', profileError);
            }
          } else {
            await AsyncStorage.multiRemove(['authToken', 'user']);
          }
        }
      } catch (e) {
        console.error('Error loading auth:', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const raw = await res.text();
    const ct = res.headers.get('content-type') || '';

    // Manejo de error HTTP
    if (!res.ok) {
      let errorMsg = raw;
      if (ct.includes('application/json')) {
        try {
          const errJson = JSON.parse(raw);
          errorMsg = errJson.message || errJson.error || raw;
        } catch {}
      }
      throw new Error(errorMsg);
    }

    // Intentar parsear JSON; si falla, tratar raw como JWT
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    let authToken: string;
    let userData: User;

    if (parsed && typeof parsed === 'object' && parsed.token) {
      // Caso JSON { token, user }
      authToken = parsed.token;
      userData = parsed.user;
      console.log('USER DATA FROM JSON RESPONSE:', JSON.stringify(userData, null, 2));
    } else {
      // Caso texto plano: raw es el JWT
      authToken = raw.trim();
      const decoded = jwtDecode<DecodedToken>(authToken);
      console.log('DECODED JWT:', JSON.stringify(decoded, null, 2));
      userData = {
        id: decoded.userId,
        email: decoded.email,
        firstName: (decoded as any).firstName || '',
        lastName: (decoded as any).lastName || '',
      };
      console.log('USER DATA FROM JWT:', JSON.stringify(userData, null, 2));
      // Si tienes endpoint /me, descomenta y ajusta:
      // const perfilRes = await fetch(`${API_URL}/api/auth/me`, {
      //   headers: { Authorization: `Bearer ${authToken}` }
      // });
      // if (!perfilRes.ok) throw new Error('No se pudo cargar perfil');
      // userData = await perfilRes.json();
    }

    // Guardar token temporalmente
    await AsyncStorage.setItem('authToken', authToken);
    setToken(authToken);

    // Obtener perfil completo del usuario
    try {
      const profileData = await authService.getProfile() as Partial<User>;
      console.log('PROFILE DATA FROM API:', JSON.stringify(profileData, null, 2));
      
      const completeUserData: User = {
        ...userData,
        ...profileData,
        // Asegurar que los campos básicos no se sobrescriban
        id: userData.id,
        email: userData.email || profileData.email || '', // Usar email del JWT como respaldo
        firstName: profileData.firstName || userData.firstName,
        lastName: profileData.lastName || userData.lastName,
      };
      
      console.log('COMPLETE USER DATA:', JSON.stringify(completeUserData, null, 2));
      
      // Guardar usuario completo
      console.log('SAVING TO ASYNC STORAGE:', JSON.stringify(completeUserData, null, 2));
      await AsyncStorage.setItem('user', JSON.stringify(completeUserData));
      setUser(completeUserData);
    } catch (profileError) {
      console.warn('Could not fetch complete profile, using basic data:', profileError);
      // Si falla obtener el perfil completo, usar los datos básicos
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const register = async (userData: RegisterData) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const raw = await res.text();
    let data: any = null;
    try { data = JSON.parse(raw); } catch {}

    if (!res.ok) {
      const msg = data?.message || data?.error || raw || 'Registration failed';
      throw new Error(msg);
    }

    // Después del registro exitoso, hacer logout para ir a la pantalla de login
    await logout();
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['authToken', 'user']);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    AsyncStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
