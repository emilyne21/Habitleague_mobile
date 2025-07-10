import apiService from './api';
import { API_CONFIG } from '../config/api';

export interface ProcessPaymentPayload {
  challengeId: number;
  amount: number;
  currency: string;
  paymentMethodId: string;
  cardLast4: string;
  cardBrand: string;
}

export interface ProcessPaymentResponse {
  stripePaymentId: string;
}

export interface PaymentStatusResponse {
  id: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
}

export const paymentsService = {
  async processPayment(payload: ProcessPaymentPayload): Promise<ProcessPaymentResponse> {
    const response = await apiService.postJSON<ProcessPaymentResponse>(`${API_CONFIG.BASE_URL}/api/payments`, payload);
    return response;
  },

  async getPaymentByStripeId(stripePaymentId: string): Promise<PaymentStatusResponse> {
    const response = await apiService.getJSON<PaymentStatusResponse>(`${API_CONFIG.BASE_URL}/api/payments/stripe/${stripePaymentId}`);
    return response;
  },
};

export default paymentsService; 