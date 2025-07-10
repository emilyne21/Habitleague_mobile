import apiService from './api';
import { API_CONFIG } from '../config/api';
import { Evidence, EvidenceStats } from '../types';

export const evidenceService = {
  /**
   * Obtiene todas las evidencias del usuario actual
   */
  async getMyEvidences(): Promise<Evidence[]> {
    console.log('🔄 EvidenceService: Calling getMyEvidences');
    console.log('📍 Endpoint:', API_CONFIG.ENDPOINTS.MY_EVIDENCES);
    const response = await apiService.getJSON<Evidence[]>(API_CONFIG.ENDPOINTS.MY_EVIDENCES);
    console.log('✅ EvidenceService: Response:', JSON.stringify(response, null, 2));
    return response;
  },

  /**
   * Obtiene las evidencias de un challenge específico
   */
  async getEvidencesByChallenge(challengeId: number): Promise<Evidence[]> {
    console.log('🔄 EvidenceService: Calling getEvidencesByChallenge for challenge:', challengeId);
    const endpoint = `${API_CONFIG.ENDPOINTS.CHALLENGE_EVIDENCES}/${challengeId}`;
    console.log('📍 Endpoint:', endpoint);
    const response = await apiService.getJSON<Evidence[]>(endpoint);
    console.log('✅ EvidenceService: Response:', JSON.stringify(response, null, 2));
    return response;
  },

  /**
   * Obtiene las estadísticas de evidencias del usuario
   */
  async getMyEvidenceStats(): Promise<EvidenceStats> {
    console.log('🔄 EvidenceService: Calling getMyEvidenceStats');
    console.log('📍 Endpoint:', API_CONFIG.ENDPOINTS.EVIDENCE_STATS);
    const response = await apiService.getJSON<EvidenceStats>(API_CONFIG.ENDPOINTS.EVIDENCE_STATS);
    console.log('✅ EvidenceService: Response:', JSON.stringify(response, null, 2));
    return response;
  },
};

export default evidenceService; 