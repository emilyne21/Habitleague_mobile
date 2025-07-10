import apiService from './api';
import { API_CONFIG } from '../config/api';
import { Achievement, UserAchievement, AchievementStats, AchievementType } from '../types';

export const achievementService = {
  /**
   * Obtiene todos los achievements disponibles en el sistema
   */
  async getAllAchievements(): Promise<Achievement[]> {
    const response = await apiService.getJSON<Achievement[]>(API_CONFIG.ENDPOINTS.ACHIEVEMENTS);
    return response;
  },

  /**
   * Obtiene los achievements desbloqueados por el usuario actual
   */
  async getMyAchievements(): Promise<UserAchievement[]> {
    const response = await apiService.getJSON<UserAchievement[]>(API_CONFIG.ENDPOINTS.MY_ACHIEVEMENTS);
    
    // Transformar la respuesta para agregar campos adicionales para la UI
    return response.map(userAchievement => ({
      ...userAchievement,
      isUnlocked: true, // Si está en my-achievements, está desbloqueado
      // Se pueden agregar más campos para UI según sea necesario
    }));
  },

  /**
   * Obtiene estadísticas de achievements del usuario actual
   */
  async getMyStats(): Promise<AchievementStats> {
    const response = await apiService.getJSON<AchievementStats>(API_CONFIG.ENDPOINTS.MY_ACHIEVEMENT_STATS);
    return response;
  },

  /**
   * Obtiene achievements combinados (desbloqueados y disponibles) para mostrar en UI
   */
  async getAchievementsForProfile(): Promise<UserAchievement[]> {
    try {
      // Obtener achievements desbloqueados y todos los disponibles
      const [myAchievements, allAchievements] = await Promise.all([
        this.getMyAchievements(),
        this.getAllAchievements()
      ]);

      // Crear un mapa de achievements desbloqueados por ID
      const unlockedMap = new Map(
        myAchievements.map(ua => [ua.achievement.id, ua])
      );

      // Combinar todos los achievements con estado de desbloqueo
      const combinedAchievements: UserAchievement[] = allAchievements.map(achievement => {
        const unlocked = unlockedMap.get(achievement.id);
        
        if (unlocked) {
          return unlocked;
        } else {
          // Achievement no desbloqueado
          return {
            id: 0, // Temporal, no tiene registro en UserAchievement
            userId: 0, // Temporal
            achievement,
            unlockedAt: '',
            isUnlocked: false,
            progress: 0,
            maxProgress: 1,
          };
        }
      });

      return combinedAchievements;
    } catch (error) {
      console.error('Error getting achievements for profile:', error);
      // En caso de error, al menos devolver achievements desbloqueados
      return this.getMyAchievements();
    }
  },

  /**
   * Verifica si el usuario tiene un achievement específico
   */
  async hasAchievement(achievementType: AchievementType): Promise<boolean> {
    try {
      const myAchievements = await this.getMyAchievements();
      return myAchievements.some(ua => ua.achievement.type === achievementType);
    } catch (error) {
      console.error('Error checking achievement:', error);
      return false;
    }
  },
};

export default achievementService; 