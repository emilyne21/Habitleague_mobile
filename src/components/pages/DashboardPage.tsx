import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import challengeService from '../../services/challenges';
import { API_CONFIG } from '../../config/api';
import type { Challenge } from '../../types';

const { width } = Dimensions.get('window');

const DashboardPage: React.FC = () => {
  const { user, token, isLoading: authLoading } = useAuth();
  const navigation = useNavigation<any>();

  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchMyChallenges();
    }
  }, [token]);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      console.log('🎯 Dashboard focused - refreshing challenges');
      if (token) {
        // Add a small delay to ensure the screen is fully loaded
        setTimeout(() => {
          fetchMyChallenges();
        }, 100);
      }
    });

    return unsubscribe;
  }, [navigation, token]);

  // Also refresh when the component mounts and token changes
  useEffect(() => {
    if (token) {
      console.log('🎯 Dashboard mounted/updated - refreshing challenges');
      fetchMyChallenges();
    }
  }, [token]);

  // Auto-refresh every 30 seconds when screen is active
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      console.log('⏰ Auto-refreshing challenges...');
      fetchMyChallenges();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [token]);

  const fetchMyChallenges = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Fetching my challenges...');
      console.log('📍 Endpoint:', API_CONFIG.ENDPOINTS.MY_CHALLENGES);
      console.log('🔑 Token:', token.substring(0, 20) + '...');
      
      const data = await challengeService.getMyChallenges();
      console.log('✅ My challenges response:', JSON.stringify(data, null, 2));
      
      setMyChallenges(data as Challenge[]);
      console.log('📊 Set challenges count:', (data as Challenge[]).length);
    } catch (err: any) {
      console.error('❌ Error fetching my challenges:', err);
      setError(err.message || 'Error loading your challenges');
    } finally {
      setLoading(false);
    }
  };

  // Force refresh function that can be called from other components
  const forceRefresh = async () => {
    console.log('🚀 Force refreshing challenges...');
    await fetchMyChallenges();
  };

  // Debug function to test different endpoints
  const testEndpoints = async () => {
    console.log('🧪 Testing different endpoints...');
    
    try {
      // Test current endpoint
      console.log('📍 Testing current endpoint:', API_CONFIG.ENDPOINTS.MY_CHALLENGES);
      const currentData = await challengeService.getMyChallenges();
      console.log('✅ Current endpoint response:', currentData);
      
      // Test alternative endpoints
      const endpoints = [
        '/api/challenges/my-challenges',
        '/api/challenges/my',
        '/my-challenges',
        '/api/my-challenges'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`📍 Testing endpoint: ${endpoint}`);
          const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          console.log(`✅ ${endpoint} response:`, data);
        } catch (err) {
          console.log(`❌ ${endpoint} failed:`, err);
        }
      }
    } catch (err) {
      console.error('❌ Test failed:', err);
    }
  };

  const handleUploadEvidence = (challenge: Challenge) => {
    navigation.navigate('SubmitEvidence', { challengeId: challenge.id });
  };


  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Checking authentication…</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Please log in to continue.</Text>
      </View>
    );
  }

  const firstName = user.firstName?.split(' ')[0];
  const emailName = user.email?.split('@')[0];
  const displayName = firstName || emailName || 'there';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Saludo */}
        <View style={styles.header}>
          <Text style={styles.title}>Hi {displayName}!</Text>
          <Text style={styles.subtitle}>Stay committed to your vision!</Text>
        </View>

        {/* My Challenges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Challenges</Text>
            <View style={styles.debugButtons}>
              <TouchableOpacity 
                onPress={forceRefresh}
                style={[styles.debugButton, { backgroundColor: '#059669' }]}
              >
                <Text style={styles.debugButtonText}>🚀 Force Refresh</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={fetchMyChallenges}
                style={styles.debugButton}
              >
                <Text style={styles.debugButtonText}>🔄 Refresh</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={testEndpoints}
                style={[styles.debugButton, { backgroundColor: '#dc2626', marginLeft: 8 }]}
              >
                <Text style={styles.debugButtonText}>🧪 Test</Text>
              </TouchableOpacity>
            </View>
          </View>

          {loading && (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Loading challenges…</Text>
              <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
            </View>
          )}

          {error && (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && myChallenges.length === 0 && (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                Aún no te has inscrito a ningún challenge. ¡Explora y únete a uno para comenzar tu aventura!
              </Text>
            </View>
          )}

          {!loading && !error && myChallenges.length > 0 && (
            <View style={styles.challengesGrid}>
              {myChallenges.map((challenge) => (
                <TouchableOpacity
                  key={challenge.id}
                  style={styles.challengeCard}
                >
                  <Image
                    source={{ uri: challenge.imageUrl }}
                    style={styles.challengeImage}
                    resizeMode="cover"
                  />
                  <View style={styles.challengeContent}>
                    <Text style={styles.challengeTitle}>{challenge.name}</Text>
                    <Text style={styles.challengeDescription} numberOfLines={2}>
                      {challenge.description}
                    </Text>
                    <View style={styles.challengeFooter}>
                      <Text style={styles.challengeDuration}>
                        {challenge.durationDays} days
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleUploadEvidence(challenge)}
                        style={styles.evidenceButton}
                      >
                        <Ionicons name="camera" size={16} color="#fff" />
                        <Text style={styles.evidenceButtonText}>
                          Subir Evidencia
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    marginTop: 16,
  },
  challengesGrid: {
    gap: 16,
  },
  challengeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  challengeImage: {
    width: '100%',
    height: 120,
  },
  challengeContent: {
    padding: 16,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeDuration: {
    fontSize: 12,
    color: '#9ca3af',
  },
  evidenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  evidenceButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  debugButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debugButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default DashboardPage; 