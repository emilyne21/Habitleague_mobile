import apiService from './api';
import { API_CONFIG } from '../config/api';

export interface UserAchievement {
  id: number;
  name: string;
  description: string;
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
  points?: number;
}

export const achievementService = {
  /**
   * Obtiene los achievements del usuario actual
   */
  async getMyAchievements(): Promise<UserAchievement[]> {
    const response = await apiService.getJSON<UserAchievement[]>(API_CONFIG.ENDPOINTS.MY_ACHIEVEMENTS);
    return response;
  },

  /**
   * Obtiene todos los achievements disponibles
   */
  async getAllAchievements(): Promise<UserAchievement[]> {
    const response = await apiService.getJSON<UserAchievement[]>(API_CONFIG.ENDPOINTS.ACHIEVEMENTS);
    return response;
  },

  /**
   * Obtiene un achievement específico por ID
   */
  async getAchievementById(id: number): Promise<UserAchievement> {
    const response = await apiService.getJSON<UserAchievement>(`${API_CONFIG.ENDPOINTS.ACHIEVEMENTS}/${id}`);
    return response;
  },
};

export default achievementService; 