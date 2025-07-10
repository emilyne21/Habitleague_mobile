import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  Image,
  FlatList,
  Dimensions
} from 'react-native';
import SafeScreen from '../common/SafeScreen';
import { useNavigation } from '@react-navigation/native';
import evidenceService from '../../services/evidences';
import challengeService from '../../services/challenges';
import { Evidence, EvidenceStats, Challenge } from '../../types';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const EvidencesPage: React.FC = () => {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [stats, setStats] = useState<EvidenceStats | null>(null);
  const [challenges, setChallenges] = useState<{ [key: number]: Challenge }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchData();
  }, []);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [evidencesData, statsData] = await Promise.all([
        evidenceService.getMyEvidences(),
        evidenceService.getMyEvidenceStats()
      ]);
      
      setEvidences(evidencesData);
      setStats(statsData);

      // Obtener información de challenges únicos
      const uniqueChallengeIds = Array.from(new Set(evidencesData.map(e => e.challengeId)));
      const challengePromises = uniqueChallengeIds.map(id => 
        challengeService.getChallengeById(id).catch(() => null)
      );
      
      const challengeResults = await Promise.all(challengePromises);
      const challengeMap: { [key: number]: Challenge } = {};
      
      challengeResults.forEach((challenge, index) => {
        if (challenge) {
          challengeMap[uniqueChallengeIds[index]] = challenge;
        }
      });
      
      setChallenges(challengeMap);
    } catch (err: any) {
      setError(err.message || 'Error loading evidences');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (validated: boolean) => {
    return validated ? '#27ae60' : '#e74c3c';
  };

  const getStatusIcon = (validated: boolean) => {
    return validated ? 'checkmark-circle' : 'close-circle';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupedEvidences = evidences.reduce((acc, evidence) => {
    const challengeId = evidence.challengeId;
    if (!acc[challengeId]) {
      acc[challengeId] = [];
    }
    acc[challengeId].push(evidence);
    return acc;
  }, {} as { [key: number]: Evidence[] });

  const renderStatCard = (title: string, value: string | number, icon: string, color: string, subtitle?: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderEvidenceItem = ({ item }: { item: Evidence }) => (
    <View style={styles.evidenceItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.evidenceImage} />
      <View style={styles.evidenceInfo}>
        <View style={styles.evidenceHeader}>
          <Text style={styles.evidenceDate}>{formatDate(item.submittedAt)}</Text>
          <View style={styles.validationBadges}>
            <View style={[styles.badge, { backgroundColor: getStatusColor(item.aiValidated) }]}>
              <Ionicons 
                name={getStatusIcon(item.aiValidated)} 
                size={12} 
                color="#fff" 
              />
              <Text style={styles.badgeText}>AI</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: getStatusColor(item.locationValid) }]}>
              <Ionicons 
                name={getStatusIcon(item.locationValid)} 
                size={12} 
                color="#fff" 
              />
              <Text style={styles.badgeText}>LOC</Text>
            </View>
          </View>
        </View>
        <Text style={styles.evidenceChallenge}>{item.challengeName}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Cargando evidencias...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeScreen style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Evidencias</Text>
        <Text style={styles.subtitle}>
          Revisa tus evidencias enviadas y estadísticas de validación
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        {stats && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Estadísticas</Text>
            <View style={styles.statsGrid}>
              {renderStatCard(
                'Total Evidencias',
                stats.statistics.totalEvidences,
                'images',
                '#3498db'
              )}
              {renderStatCard(
                'IA Validadas',
                `${stats.statistics.aiValidated}`,
                'checkmark-done-circle',
                '#27ae60',
                `${(stats.statistics.successRates.ai * 100).toFixed(0)}% tasa de éxito`
              )}
              {renderStatCard(
                'Ubicación Válida',
                `${stats.statistics.locationValid}`,
                'location',
                '#9b59b6',
                `${(stats.statistics.successRates.location * 100).toFixed(0)}% tasa de éxito`
              )}
              {renderStatCard(
                'Ambas Válidas',
                `${stats.statistics.bothValid}`,
                'trophy',
                '#f39c12',
                `${(stats.statistics.successRates.overall * 100).toFixed(0)}% tasa de éxito`
              )}
            </View>

            {/* Interpretations */}
            <View style={styles.interpretationSection}>
              <Text style={styles.sectionTitle}>Retroalimentación</Text>
              <View style={styles.interpretationCard}>
                <View style={styles.interpretationItem}>
                  <Ionicons name="bulb" size={20} color="#3498db" />
                  <Text style={styles.interpretationLabel}>IA:</Text>
                  <Text style={styles.interpretationText}>{stats.interpretation.ai}</Text>
                </View>
                <View style={styles.interpretationItem}>
                  <Ionicons name="location" size={20} color="#9b59b6" />
                  <Text style={styles.interpretationLabel}>Ubicación:</Text>
                  <Text style={styles.interpretationText}>{stats.interpretation.location}</Text>
                </View>
                <View style={styles.interpretationItem}>
                  <Ionicons name="analytics" size={20} color="#f39c12" />
                  <Text style={styles.interpretationLabel}>General:</Text>
                  <Text style={styles.interpretationText}>{stats.interpretation.overall}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Evidences by Challenge */}
        <View style={styles.evidencesSection}>
          <Text style={styles.sectionTitle}>Evidencias por Challenge</Text>
          
          {evidences.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📸</Text>
              <Text style={styles.emptyTitle}>No hay evidencias</Text>
              <Text style={styles.emptySubtitle}>
                Aún no has enviado evidencias. Únete a un challenge y comienza a enviar evidencias.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Challenges')}
                style={styles.browseButton}
              >
                <Text style={styles.browseButtonText}>Explorar Challenges</Text>
              </TouchableOpacity>
            </View>
          ) : (
            Object.entries(groupedEvidences).map(([challengeId, challengeEvidences]) => (
              <View key={challengeId} style={styles.challengeSection}>
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeTitle}>
                    {challenges[parseInt(challengeId)]?.name || challengeEvidences[0]?.challengeName || `Challenge ${challengeId}`}
                  </Text>
                  <Text style={styles.evidenceCount}>
                    {challengeEvidences.length} evidencia{challengeEvidences.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                
                <FlatList
                  data={challengeEvidences}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={renderEvidenceItem}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 8,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 10,
    color: '#95a5a6',
  },
  interpretationSection: {
    marginTop: 20,
  },
  interpretationCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
  },
  interpretationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  interpretationLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 70,
  },
  interpretationText: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
    lineHeight: 20,
  },
  evidencesSection: {
    margin: 16,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#2c3e50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  challengeSection: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  evidenceCount: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  evidenceItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  evidenceImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  evidenceInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  evidenceDate: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  validationBadges: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  evidenceChallenge: {
    fontSize: 12,
    color: '#95a5a6',
  },
});

export default EvidencesPage; 