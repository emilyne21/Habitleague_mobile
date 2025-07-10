import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePaymentContext } from '../../context/PaymentContext';

const PaymentForm: React.FC = () => {
  const { processPayment } = usePaymentContext();
  const [challengeId, setChallengeId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const handleSubmit = async () => {
    setError(null);
    const challengeIdNum = Number(challengeId);
    const amountNum = Number(amount);
    if (challengeIdNum <= 0 || amountNum <= 0) {
      setError('Debes indicar un challengeId y un monto válidos');
      return;
    }
    setLoading(true);
    try {
      const resp = await processPayment({
        challengeId: challengeIdNum,
        amount: amountNum,
        currency: 'USD',
        paymentMethodId: 'card',
        cardLast4: '1234',
        cardBrand: 'Visa',
      });
      navigation.navigate('PaymentStatus', { stripePaymentId: resp.stripePaymentId });
    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Proceso de Pago</Text>
        {error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.label}>Challenge ID</Text>
        <TextInput
          style={styles.input}
          value={challengeId}
          onChangeText={setChallengeId}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Monto</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Pagar</Text>}
        </TouchableOpacity>
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
  form: {
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F3F4F6',
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  error: {
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default PaymentForm; 