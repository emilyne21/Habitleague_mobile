import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  StyleSheet 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePaymentContext } from '../../context/PaymentContext';
import { PaymentStatus } from '../../types';
import type { Payment } from '../../types';

interface PaymentWithStatus extends Payment {
  challengeStatus?: {
    hasPaid: boolean;
    challengeId: number;
  };
}

const PaymentsPage: React.FC = () => {
  const { payments, loading, error, fetchPayments, checkPaymentStatus } = usePaymentContext();
  
  // Debug function to manually refresh
  const debugRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    console.log('📍 Current payments count:', payments.length);
    await fetchPayments();
  };
  const [statusLoading, setStatusLoading] = useState<{ [key: number]: boolean }>({});
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchPayments();
  }, []);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPayments();
    });

    return unsubscribe;
  }, [navigation]);

  const handleFetchPaymentStatus = async (challengeId: number) => {
    setStatusLoading(prev => ({ ...prev, [challengeId]: true }));
    try {
      console.log(`🔄 Checking status for challenge ${challengeId}...`);
      await checkPaymentStatus(challengeId);
      console.log(`✅ Status checked for challenge ${challengeId}`);
    } catch (err: any) {
      console.error(`❌ Error fetching status for challenge ${challengeId}:`, err);
    } finally {
      setStatusLoading(prev => ({ ...prev, [challengeId]: false }));
    }
  };

  const getStatusColor = (hasPaid: boolean) => {
    return hasPaid ? '#16a34a' : '#dc2626';
  };

  const getStatusText = (hasPaid: boolean) => {
    return hasPaid ? 'Paid' : 'Pending';
  };

  const getStatusIcon = (hasPaid: boolean) => {
    return hasPaid ? '✅' : '⏳';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const handleViewChallenge = (challengeId: number) => {
    navigation.navigate('ChallengeDetails', { challengeId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          onPress={fetchPayments}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Payments</Text>
        <Text style={styles.subtitle}>
          Track all your challenge payments and their status
        </Text>
        <TouchableOpacity 
          onPress={debugRefresh}
          style={styles.debugButton}
        >
          <Text style={styles.debugButtonText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {payments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>No payments yet</Text>
            <Text style={styles.emptySubtitle}>
              You haven't made any payments yet. Join a challenge to see your payment history here.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Challenges')}
              style={styles.browseButton}
            >
              <Text style={styles.browseButtonText}>Browse Challenges</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.paymentsList}>
            {payments.map((payment) => (
              <View key={payment.id} style={styles.paymentCard}>
                {/* Payment Header */}
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentIconContainer}>
                    <Text style={styles.paymentIcon}>💳</Text>
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>Challenge Payment</Text>
                    <Text style={styles.paymentId}>
                      ID: {payment.stripePaymentId || payment.id}
                    </Text>
                  </View>
                  <View style={styles.paymentAmount}>
                    <Text style={styles.amountText}>
                      {formatCurrency(payment.amount, payment.currency)}
                    </Text>
                    <Text style={styles.currencyText}>{payment.currency}</Text>
                  </View>
                </View>

                {/* Payment Details */}
                <View style={styles.paymentDetails}>
                  <Text style={styles.detailsTitle}>Payment Details</Text>
                  <View style={styles.detailsList}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Challenge ID:</Text>
                      <Text style={styles.detailValue}>{payment.challengeId}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Payment Method:</Text>
                      <Text style={styles.detailValue}>
                        {payment.cardBrand} •••• {payment.cardLast4}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(payment.createdAt)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <Text style={[
                        styles.detailValue,
                        { color: payment.status === PaymentStatus.COMPLETED ? '#16a34a' : '#dc2626' }
                      ]}>
                        {payment.status}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {payment.challengeId && (
                    <TouchableOpacity
                      onPress={() => handleFetchPaymentStatus(payment.challengeId!)}
                      disabled={statusLoading[payment.challengeId]}
                      style={[
                        styles.actionButton,
                        styles.checkStatusButton,
                        statusLoading[payment.challengeId] && styles.buttonDisabled
                      ]}
                    >
                      {statusLoading[payment.challengeId] ? (
                        <View style={styles.loadingButton}>
                          <ActivityIndicator size="small" color="#fff" />
                          <Text style={styles.buttonText}>Checking...</Text>
                        </View>
                      ) : (
                        <Text style={styles.buttonText}>Check Challenge Status</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => handleViewChallenge(payment.challengeId!)}
                    style={[styles.actionButton, styles.viewChallengeButton]}
                  >
                    <Text style={styles.buttonText}>View Challenge</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Summary */}
        {payments.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Payment Summary</Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryNumber}>{payments.length}</Text>
                <Text style={styles.summaryLabel}>Total Payments</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={[styles.summaryNumber, { color: '#16a34a' }]}>
                  {payments.filter(p => p.status === PaymentStatus.COMPLETED).length}
                </Text>
                <Text style={styles.summaryLabel}>Completed</Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryNumber}>
                  {formatCurrency(
                    payments.reduce((sum, p) => sum + p.amount, 0),
                    payments[0]?.currency || 'USD'
                  )}
                </Text>
                <Text style={styles.summaryLabel}>Total Amount</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
  },
  browseButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  paymentsList: {
    gap: 16,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIcon: {
    fontSize: 20,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  paymentId: {
    fontSize: 12,
    color: '#6b7280',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  currencyText: {
    fontSize: 12,
    color: '#6b7280',
  },
  paymentDetails: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  detailsList: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkStatusButton: {
    backgroundColor: '#2563eb',
  },
  viewChallengeButton: {
    backgroundColor: '#6b7280',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  debugButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PaymentsPage; 