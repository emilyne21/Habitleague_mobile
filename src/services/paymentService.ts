import apiService from './api';
import { API_CONFIG } from '../config/api';
import type { Payment, PaymentData } from '../types';

export const paymentService = {
  async getMyPayments(): Promise<Payment[]> {
    console.log('🔄 PaymentService: Calling getMyPayments');
    console.log('📍 Endpoint:', API_CONFIG.ENDPOINTS.MY_PAYMENTS);
    const response = await apiService.getJSON<Payment[]>(API_CONFIG.ENDPOINTS.MY_PAYMENTS);
    console.log('✅ PaymentService: Response:', JSON.stringify(response, null, 2));
    return response;
  },
  async processPayment(data: PaymentData): Promise<Payment> {
    return await apiService.postJSON<Payment>(API_CONFIG.ENDPOINTS.PROCESS_PAYMENT, data);
  },
  async getPaymentStatus(challengeId: string): Promise<{ hasPaid: boolean }> {
    return await apiService.getJSON<{ hasPaid: boolean }>(`${API_CONFIG.ENDPOINTS.PAYMENT_STATUS}/${challengeId}/status`);
  },
  async getPaymentByStripeId(stripePaymentId: string): Promise<Payment> {
    return await apiService.getJSON<Payment>(`${API_CONFIG.BASE_URL}/api/payments/stripe/${stripePaymentId}`);
  },
}; 