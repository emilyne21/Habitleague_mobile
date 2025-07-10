import apiService from './api';
import { API_CONFIG } from '../config/api';
import { Challenge, ChallengeParticipant } from '../types';

export const challengeService = {
  /**
   * Obtiene los challenges del usuario actual
   */
  async getMyChallenges(): Promise<Challenge[]> {
    console.log('🔄 ChallengeService: Calling getMyChallenges');
    console.log('📍 Endpoint:', API_CONFIG.ENDPOINTS.MY_CHALLENGES);
    const response = await apiService.getJSON<Challenge[]>(API_CONFIG.ENDPOINTS.MY_CHALLENGES);
    console.log('✅ ChallengeService: Response:', JSON.stringify(response, null, 2));
    return response;
  },

  /**
   * Obtiene todos los challenges disponibles
   */
  async getAllChallenges(): Promise<Challenge[]> {
    const response = await apiService.getJSON<Challenge[]>(API_CONFIG.ENDPOINTS.CHALLENGES);
    return response;
  },

  /**
   * Obtiene un challenge específico por ID
   */
  async getChallengeById(id: number): Promise<Challenge> {
    const response = await apiService.getJSON<Challenge>(`${API_CONFIG.ENDPOINTS.CHALLENGES}/${id}`);
    return response;
  },

  /**
   * Obtiene challenges por categoría
   */
  async getChallengesByCategory(category: string): Promise<Challenge[]> {
    const response = await apiService.getJSON<Challenge[]>(`${API_CONFIG.ENDPOINTS.CHALLENGES}/category/${category}`);
    return response;
  },

  /**
   * Obtiene challenges populares
   */
  async getPopularChallenges(limit: number = 5): Promise<Challenge[]> {
    const response = await apiService.getJSON<Challenge[]>(`${API_CONFIG.ENDPOINTS.CHALLENGES}/popular?limit=${limit}`);
    return response;
  },

  /**
   * Obtiene participantes de un challenge
   */
  async getChallengeParticipants(challengeId: string): Promise<ChallengeParticipant[]> {
    const response = await apiService.getJSON<ChallengeParticipant[]>(`${API_CONFIG.ENDPOINTS.CHALLENGES}/${challengeId}/participants`);
    return response;
  },

  /**
   * Se une a un challenge
   */
  async joinChallenge(challengeId: string, payload: any): Promise<void> {
    await apiService.postText(`${API_CONFIG.ENDPOINTS.CHALLENGES}/${challengeId}/join`, payload);
  },

  /**
   * Abandona un challenge
   */
  async leaveChallenge(challengeId: string): Promise<void> {
    await apiService.deleteJSON(`${API_CONFIG.ENDPOINTS.CHALLENGES}/${challengeId}/join`);
  },

  /**
   * Crea un nuevo challenge
   */
  async createChallenge(payload: any): Promise<void> {
    await apiService.postText(API_CONFIG.ENDPOINTS.CHALLENGES, payload);
  },
};

export default challengeService; 