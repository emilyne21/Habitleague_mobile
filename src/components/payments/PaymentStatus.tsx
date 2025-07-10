import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { usePaymentContext } from '../../context/PaymentContext';

const PaymentStatus: React.FC = () => {
  const route = useRoute<any>();
  const { stripePaymentId } = route.params || {};
  const { getPaymentByStripeId } = usePaymentContext();
  const [status, setStatus] = useState<'paid' | 'pending' | 'failed' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stripePaymentId) return;
    getPaymentByStripeId(stripePaymentId)
      .then(res => {
        let mapped: 'paid' | 'pending' | 'failed';
        switch (res.status) {
          case 'COMPLETED':
            mapped = 'paid';
            break;
          case 'PENDING':
            mapped = 'pending';
            break;
          case 'FAILED':
          case 'REFUNDED':
            mapped = 'failed';
            break;
          default:
            mapped = 'failed';
        }
        setStatus(mapped);
      })
      .catch(err => {
        setError(err.message || 'No se pudo obtener el estado');
      })
      .finally(() => setLoading(false));
  }, [stripePaymentId, getPaymentByStripeId]);

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={styles.loadingText}>Cargando estado…</Text>
    </SafeAreaView>
  );
  if (error) return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.error}>{error}</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusBox}>
        <Text style={styles.title}>Estado del Pago</Text>
        <Text style={styles.label}>ID de pago:</Text>
        <Text style={styles.value}>{stripePaymentId}</Text>
        <Text style={styles.label}>Estado:</Text>
        <Text style={styles.value}>
          {status === 'paid'
            ? '✅ Pagado'
            : status === 'pending'
            ? '⏳ Pendiente'
            : '❌ Fallido'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBox: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  error: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default PaymentStatus; 