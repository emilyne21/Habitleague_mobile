import { apiService } from './api';
import { API_CONFIG } from '../config/api';
import * as Location from 'expo-location';
import type { Challenge } from '../types';

export interface SubmitEvidenceRequest {
  challengeId: number;
  imageUrl: string;
  latitude: number;
  longitude: number;
}

export interface DailySubmissionStatus {
  hasSubmittedToday: boolean;
  submissionDate?: string;
  nextSubmissionDate?: string;
}

export interface LocationValidation {
  isValid: boolean;
  distance: number;
  toleranceRadius: number;
}

export interface EvidenceSubmissionResponse {
  success: boolean;
  status: string;
  message: string;
  evidenceId?: number;
}

export const evidenceService = {
  /**
   * Obtiene el estado de envío diario para un challenge
   */
  async getDailySubmissionStatus(challengeId: number): Promise<DailySubmissionStatus> {
    try {
      const response = await apiService.getJSON<{ hasSubmittedToday: boolean }>(
        `/api/evidences/challenge/${challengeId}/daily-status`
      );
      return {
        hasSubmittedToday: response.hasSubmittedToday
      };
    } catch (error) {
      console.warn('Daily status not available, assuming no submission today');
      return { hasSubmittedToday: false };
    }
  },

  /**
   * Obtiene la ubicación actual del usuario
   */
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    try {
      // Verificar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error: any) {
      console.error('Error getting location:', error);
      throw new Error('Could not get your location. Please check location permissions and try again.');
    }
  },

  /**
   * Valida si la ubicación actual está dentro del rango del challenge
   */
  validateLocation(
    challenge: Challenge,
    userLatitude: number,
    userLongitude: number
  ): LocationValidation {
    if (!challenge.location) {
      // Si no hay ubicación específica, permitir cualquier ubicación
      return {
        isValid: true,
        distance: 0,
        toleranceRadius: 0,
      };
    }

    const { latitude: challengeLat, longitude: challengeLng, toleranceRadius = 100 } = challenge.location;

    // Calcular distancia usando fórmula de Haversine
    const R = 6371000; // Radio de la Tierra en metros
    const φ1 = (challengeLat * Math.PI) / 180;
    const φ2 = (userLatitude * Math.PI) / 180;
    const Δφ = ((userLatitude - challengeLat) * Math.PI) / 180;
    const Δλ = ((userLongitude - challengeLng) * Math.PI) / 180;

    const a = 
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distancia en metros

    return {
      isValid: distance <= toleranceRadius,
      distance,
      toleranceRadius,
    };
  },

  /**
   * Sube una imagen de evidencia
   */
  async uploadEvidenceImage(imageUri: string): Promise<string> {
    try {
      console.log('Uploading evidence image:', imageUri);
      
      // Crear FormData para la subida
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'evidence.jpg',
      } as any);

      // Intentar subir la imagen
      try {
        const response = await apiService.upload<{ imageUrl: string }>(
          '/api/evidences/upload',
          formData
        );
        return response.imageUrl;
      } catch (uploadError) {
        console.warn('Image upload failed, using local URI:', uploadError);
        return imageUri; // Fallback a URI local
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error('Error uploading image. Please try again.');
    }
  },

  /**
   * Envía evidencia para un challenge
   */
  async submitEvidence(request: SubmitEvidenceRequest): Promise<EvidenceSubmissionResponse> {
    try {
      console.log('Submitting evidence:', request);
      
      const response = await apiService.postJSON<any>(
        '/api/evidences',
        request
      );

      // Adaptar la respuesta al formato esperado
      return {
        success: true,
        status: 'SUBMITTED',
        message: 'Evidence submitted successfully',
        evidenceId: response.id
      };
    } catch (error: any) {
      console.error('Error submitting evidence:', error);
      throw new Error(error.message || 'Error submitting evidence');
    }
  },

  /**
   * Obtiene el historial de evidencias para un challenge
   */
  async getEvidenceHistory(challengeId: number): Promise<any[]> {
    try {
      const response = await apiService.getJSON<any[]>(
        `/api/evidences/challenge/${challengeId}`
      );
      return response;
    } catch (error: any) {
      console.error('Error fetching evidence history:', error);
      throw new Error(error.message || 'Error fetching evidence history');
    }
  },

  /**
   * Obtiene todas las evidencias del usuario
   */
  async getMyEvidences(): Promise<any[]> {
    try {
      const response = await apiService.getJSON<any[]>(
        '/api/evidences/my-evidences'
      );
      return response;
    } catch (error: any) {
      console.error('Error fetching my evidences:', error);
      throw new Error(error.message || 'Error fetching my evidences');
    }
  },

  /**
   * Obtiene estadísticas de evidencias del usuario
   */
  async getMyEvidenceStats(): Promise<any> {
    try {
      const response = await apiService.getJSON<any>(
        '/api/evidences/my-stats'
      );
      return response;
    } catch (error: any) {
      console.error('Error fetching evidence stats:', error);
      throw new Error(error.message || 'Error fetching evidence stats');
    }
  },

  /**
   * Obtiene una evidencia específica por ID
   */
  async getEvidenceById(evidenceId: number): Promise<any> {
    try {
      const response = await apiService.getJSON<any>(
        `/api/evidences/${evidenceId}`
      );
      return response;
    } catch (error: any) {
      console.error('Error fetching evidence by ID:', error);
      throw new Error(error.message || 'Error fetching evidence');
    }
  },
};

export default evidenceService; 