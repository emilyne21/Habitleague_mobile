import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { paymentService } from '../services/paymentService';
import type { Payment, PaymentData } from '../types';

interface PaymentContextType {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  fetchPayments: () => Promise<void>;
  processPayment: (data: PaymentData) => Promise<Payment>;
  checkPaymentStatus: (challengeId: number) => Promise<boolean>;
  getPaymentByStripeId: (stripePaymentId: string) => Promise<Payment>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 PaymentContext: Fetching payments...');
      const data = (await paymentService.getMyPayments()) as Payment[];
      console.log('✅ PaymentContext: Payments response:', JSON.stringify(data, null, 2));
      setPayments(data);
      console.log('📊 PaymentContext: Set payments count:', data.length);
    } catch (err: any) {
      console.error('❌ PaymentContext: Error fetching payments:', err);
      setError(err.message || 'Error cargando pagos');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (req: PaymentData): Promise<Payment> => {
    return (await paymentService.processPayment(req)) as Payment;
  };

  const checkPaymentStatus = async (challengeId: number) => {
    try {
      const res = await paymentService.getPaymentStatus(challengeId.toString());
      return res.hasPaid;
    } catch {
      return false;
    }
  };

  const getPaymentByStripeId = async (stripePaymentId: string): Promise<Payment> => {
    return (await paymentService.getPaymentByStripeId(stripePaymentId)) as Payment;
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <PaymentContext.Provider
      value={{
        payments,
        loading,
        error,
        fetchPayments,
        processPayment,
        checkPaymentStatus,
        getPaymentByStripeId,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePaymentContext = (): PaymentContextType => {
  const ctx = useContext(PaymentContext);
  if (!ctx) {
    throw new Error('usePaymentContext debe usarse dentro de <PaymentProvider>');
  }
  return ctx;
}; 