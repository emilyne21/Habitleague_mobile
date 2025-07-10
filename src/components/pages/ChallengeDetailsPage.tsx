import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import challengeService from '../../services/challenges';
import SafeScreen from '../common/SafeScreen';
import { Challenge } from '../../types';
import { Ionicons } from '@expo/vector-icons';

const ChallengeDetailsPage = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await challengeService.getChallengeById(id);
        setChallenge(data);
        // Convertir id a string para el endpoint de participantes
        const part = await challengeService.getChallengeParticipants(id.toString());
        setParticipants(part as any[]);
      } catch (err) {
        setError('Error loading challenge');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleJoinChallenge = () => {
    if (challenge) {
      navigation.navigate('JoinChallenge', { challenge });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return '#f39c12';
      case 'ONGOING': return '#27ae60';
      case 'COMPLETED': return '#3498db';
      case 'CANCELLED': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FITNESS': return 'fitness';
      case 'MINDFULNESS': return 'leaf';
      case 'PRODUCTIVITY': return 'trending-up';
      case 'CODING': return 'code-slash';
      case 'READING': return 'book';
      case 'HEALTH': return 'heart';
      default: return 'trophy';
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>;
  if (error) return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;
  if (!challenge) return <View style={styles.center}><Text style={styles.error}>Challenge not found</Text></View>;

  return (
    <SafeScreen style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Challenge Details</Text>
          {challenge.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={16} color="#fff" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>

        {/* Challenge Image */}
        <Image source={{ uri: challenge.imageUrl }} style={styles.headerImage} />
        
        {/* Challenge Name and Status */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{challenge.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(challenge.status) }]}>
            <Text style={styles.statusText}>{challenge.status}</Text>
          </View>
        </View>

        {/* Description */}
        <Text style={styles.description}>{challenge.description}</Text>

        {/* Info Cards - Centradas */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Ionicons name={getCategoryIcon(challenge.category)} size={24} color="#3498db" />
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{challenge.category}</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="calendar" size={24} color="#e74c3c" />
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{challenge.durationDays} Days</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="cash" size={24} color="#27ae60" />
            <Text style={styles.infoLabel}>Entry Fee</Text>
            <Text style={styles.infoValue}>${challenge.entryFee.toFixed(2)}</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="people" size={24} color="#9b59b6" />
            <Text style={styles.infoLabel}>Participants</Text>
            <Text style={styles.infoValue}>{challenge.participantCount}</Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.datesSection}>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <Text style={styles.dateValue}>{new Date(challenge.startDate).toLocaleDateString()}</Text>
          </View>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>End Date</Text>
            <Text style={styles.dateValue}>{new Date(challenge.endDate).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Rules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rules</Text>
          <Text style={styles.rulesText}>{challenge.rules}</Text>
        </View>

        {/* Creator Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Created by</Text>
          <View style={styles.creatorInfo}>
            <Ionicons name="person-circle" size={40} color="#95a5a6" />
            <View style={styles.creatorText}>
              <Text style={styles.creatorName}>{challenge.creatorName}</Text>
              <Text style={styles.creatorEmail}>{challenge.creatorEmail}</Text>
            </View>
          </View>
        </View>

        {/* Participants */}
        {participants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participants</Text>
            <FlatList
              data={participants}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.participantRow}>
                  <Ionicons name="person-circle" size={32} color="#95a5a6" />
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{item.name}</Text>
                    <Text style={styles.participantEmail}>{item.email}</Text>
                    <Text style={styles.participantJoinDate}>Joined: {new Date(item.joinedAt).toLocaleDateString()}</Text>
                  </View>
                </View>
              )}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Join Challenge Button */}
        <TouchableOpacity style={styles.joinButton} onPress={handleJoinChallenge}>
          <Text style={styles.joinButtonText}>Join Challenge</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flexGrow: 1, paddingBottom: 100 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: '#e74c3c', fontSize: 16, textAlign: 'center' },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f39c12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Centrar las cards
    paddingHorizontal: 8,
    marginTop: 16,
  },
  infoCard: {
    width: '42%', // Reducir un poco el ancho para mejor centrado
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  
  datesSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  dateItem: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  rulesText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorText: {
    marginLeft: 12,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  creatorEmail: {
    fontSize: 14,
    color: '#95a5a6',
  },
  
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  participantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  participantInfo: {
    marginLeft: 12,
  },
  participantName: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  participantEmail: {
    fontSize: 12,
    color: '#95a5a6',
  },
  participantJoinDate: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  
  joinButton: {
    backgroundColor: '#2c3e50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default ChallengeDetailsPage; 