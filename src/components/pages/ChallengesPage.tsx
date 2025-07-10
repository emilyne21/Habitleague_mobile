import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import SafeScreen from '../common/SafeScreen';
import { Ionicons } from '@expo/vector-icons';
import challengeService from '../../services/challenges';
import { Challenge } from '../../types';
import { ChallengeCategory, ChallengeParticipant } from '../../types';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

// Categories with images
const categories = [
  { key: 'ALL', label: 'All', img: null },
  { key: ChallengeCategory.MINDFULNESS, label: 'Mindfulness', img: require('../../../assets/mind.jpg') },
  { key: ChallengeCategory.FITNESS, label: 'Fitness', img: require('../../../assets/fit.jpg') },
  { key: ChallengeCategory.PRODUCTIVITY, label: 'Productivity', img: require('../../../assets/productive.jpg') },
  { key: ChallengeCategory.LIFESTYLE, label: 'Lifestyle', img: require('../../../assets/livestyle.jpg') },
  { key: ChallengeCategory.HEALTH, label: 'Health', img: require('../../../assets/health.jpg') },
  { key: ChallengeCategory.CODING, label: 'Coding', img: require('../../../assets/coding.jpg') },
  { key: ChallengeCategory.READING, label: 'Reading', img: require('../../../assets/reading.jpg') },
  { key: ChallengeCategory.FINANCE, label: 'Finance', img: require('../../../assets/finance.jpg') },
  { key: ChallengeCategory.LEARNING, label: 'Learning', img: require('../../../assets/learning.jpg') },
  { key: ChallengeCategory.WRITING, label: 'Writing', img: require('../../../assets/writing.jpg') },
  { key: ChallengeCategory.CREATIVITY, label: 'Creativity', img: require('../../../assets/creativity.jpg') },
];

const ChallengesPage: React.FC = ({ navigation }: any) => {
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Popular challenges
  const [popularChallenges, setPopularChallenges] = useState<Challenge[]>([]);
  const [popularLoading, setPopularLoading] = useState(false);
  const [popularError, setPopularError] = useState<string | null>(null);



  // Join challenge modal
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [joinFormData, setJoinFormData] = useState({
    currency: 'USD',
    paymentMethodId: '',
    cardLast4: '',
    cardBrand: ''
  });
  const [joinFormError, setJoinFormError] = useState<string | null>(null);
  const [joinFormLoading, setJoinFormLoading] = useState(false);

  // Participants modal
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedChallengeForParticipants, setSelectedChallengeForParticipants] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);

  // Fetch popular challenges and all challenges on mount
  useEffect(() => {
    fetchPopularChallenges();
    fetchAllChallenges();
  }, []);

  // Filter challenges when category changes
  useEffect(() => {
    if (selectedCat === 'ALL') {
      setChallenges(allChallenges);
    } else {
      const filtered = allChallenges.filter(challenge => challenge.category === selectedCat);
      setChallenges(filtered);
    }
  }, [selectedCat, allChallenges]);

  const fetchPopularChallenges = async () => {
    setPopularLoading(true);
    setPopularError(null);
    try {
      const data = await challengeService.getPopularChallenges(5);
      setPopularChallenges(data);
    } catch (err: any) {
      setPopularError(err.message || 'Error loading popular challenges');
    } finally {
      setPopularLoading(false);
    }
  };

  const fetchAllChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all challenges - you might need to create this method in challengeService
      const data = await challengeService.getAllChallenges();
      setAllChallenges(data);
      setChallenges(data);
    } catch (err: any) {
      setError(err.message || 'Error loading challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleViewParticipants = async (challenge: Challenge) => {
    setSelectedChallengeForParticipants(challenge);
    setShowParticipantsModal(true);
    setParticipantsLoading(true);
    setParticipantsError(null);

    try {
      const data = await challengeService.getChallengeParticipants(challenge.id.toString());
      setParticipants(data);
    } catch (err: any) {
      setParticipantsError(err.message || 'Error loading participants');
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleJoinChallenge = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setJoinFormData({
      currency: 'USD',
      paymentMethodId: '',
      cardLast4: '',
      cardBrand: ''
    });
    setJoinFormError(null);
    setShowJoinModal(true);
  };

  const handleJoinSubmit = async () => {
    if (!selectedChallenge) return;

    setJoinFormError(null);

    // Validations
    if (!joinFormData.paymentMethodId.trim()) {
      setJoinFormError('Payment method ID is required');
      return;
    }
    if (!joinFormData.cardLast4.trim() || joinFormData.cardLast4.length !== 4) {
      setJoinFormError('Please enter the last 4 digits of your card');
      return;
    }
    if (!joinFormData.cardBrand.trim()) {
      setJoinFormError('Please select a card brand');
      return;
    }
    if (!joinFormData.currency.trim()) {
      setJoinFormError('Currency is required');
      return;
    }

    setJoinFormLoading(true);
    try {
      const locationData = selectedChallenge.location || {
        latitude: 19.4326,
        longitude: -99.1332,
        locationName: "Mi Gimnasio Local",
        toleranceRadius: 100.0
      };

      const payload = {
        payment: {
          challengeId: selectedChallenge.id,
          amount: selectedChallenge.entryFee,
          currency: joinFormData.currency.trim(),
          paymentMethodId: joinFormData.paymentMethodId.trim(),
          cardLast4: joinFormData.cardLast4.trim(),
          cardBrand: joinFormData.cardBrand.trim()
        },
        location: {
          challengeId: selectedChallenge.id,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          locationName: locationData.locationName,
          toleranceRadius: locationData.toleranceRadius
        }
      };

      console.log('Sending join payload to backend:', JSON.stringify(payload, null, 2));
      await challengeService.joinChallenge(selectedChallenge.id.toString(), payload);

      Alert.alert('Success', 'Successfully joined the challenge!');

      setShowJoinModal(false);
      setSelectedChallenge(null);
      setJoinFormData({
        currency: 'USD',
        paymentMethodId: '',
        cardLast4: '',
        cardBrand: ''
      });

      // Refresh challenges list
      await fetchAllChallenges();

      // Navigate to Dashboard to see the new challenge
      navigation?.navigate('Home');
      
      // Force refresh of Dashboard after a short delay
      setTimeout(() => {
        navigation?.navigate('Home');
      }, 500);
      
      // Also navigate to Payments to see the new payment
      setTimeout(() => {
        navigation?.navigate('Payment');
      }, 1000);
    } catch (err: any) {
      setJoinFormError(err.message || 'Error joining challenge');
    } finally {
      setJoinFormLoading(false);
    }
  };

  const renderChallengeCard = (challenge: Challenge, isPopular: boolean = false) => (
    <TouchableOpacity 
      key={challenge.id} 
      style={[styles.challengeCard, isPopular && styles.popularChallengeCard]}
      onPress={() => navigation?.navigate('ChallengeDetails', { id: challenge.id })}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: challenge.imageUrl }}
        style={[styles.challengeImage, isPopular && styles.popularChallengeImage]}
      />
      <View style={styles.challengeContent}>
        <Text style={[styles.challengeName, isPopular && styles.popularChallengeName]}>
          {challenge.name}
        </Text>
        <Text style={[styles.challengeDescription, isPopular && styles.popularChallengeDescription]}>
          {challenge.description}
        </Text>
        <View style={styles.challengeMeta}>
          <Text style={styles.challengeDuration}>{challenge.durationDays} days</Text>
          <TouchableOpacity onPress={(e) => {
            e.stopPropagation();
            handleViewParticipants(challenge);
          }}>
            <Text style={styles.participantsText}>
              {challenge.participantCount || challenge.participantsCount || 0} participants
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.entryFeeText}>${challenge.entryFee?.toFixed(2) || '0.00'}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryPill = (cat: any) => (
    <TouchableOpacity
      key={cat.key}
      style={[styles.categoryPill, selectedCat === cat.key && styles.categoryPillSelected]}
      onPress={() => setSelectedCat(cat.key)}
    >
      <Text style={[styles.categoryPillText, selectedCat === cat.key && styles.categoryPillTextSelected]}>
        {cat.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeScreen style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Popular Challenges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Challenges</Text>
            
            {popularLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000000" />
                <Text style={styles.loadingText}>Loading popular challenges...</Text>
              </View>
            )}
            
            {popularError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{popularError}</Text>
              </View>
            )}
            
            {!popularLoading && !popularError && popularChallenges.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No popular challenges available.</Text>
              </View>
            )}
            
            {!popularLoading && !popularError && popularChallenges.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularScroll}>
                {popularChallenges.map(challenge => renderChallengeCard(challenge, true))}
              </ScrollView>
            )}
          </View>

          {/* Categories Pills */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.categoriesPillsScroll}
              contentContainerStyle={styles.categoriesPillsContainer}
            >
              {categories.map(renderCategoryPill)}
            </ScrollView>
          </View>

          {/* All Challenges / Filtered Challenges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedCat === 'ALL' ? 'All Challenges' : `${categories.find(c => c.key === selectedCat)?.label} Challenges`}
            </Text>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000000" />
                <Text style={styles.loadingText}>Loading challenges...</Text>
              </View>
            )}
            
            {error && <Text style={styles.errorText}>{error}</Text>}

            {!loading && !error && (
              <View style={styles.challengesGrid}>
                {challenges.length > 0
                  ? challenges.map(challenge => renderChallengeCard(challenge))
                  : <Text style={styles.emptyText}>
                      {selectedCat === 'ALL' 
                        ? 'No challenges available.' 
                        : 'No challenges found in this category.'
                      }
                    </Text>
                }
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Create Challenge Button */}
        <TouchableOpacity
          style={styles.floatingCreateButton}
          onPress={() => navigation?.navigate('CreateChallenge')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Join Challenge Modal */}
        <Modal
          visible={showJoinModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowJoinModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Join Challenge: {selectedChallenge?.name}
                </Text>
                <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                <View style={styles.challengeDetails}>
                  <Text style={styles.detailTitle}>Challenge Details</Text>
                  <Text style={styles.detailText}>Entry Fee: ${selectedChallenge?.entryFee}</Text>
                  <Text style={styles.detailText}>Duration: {selectedChallenge?.durationDays} days</Text>
                  <Text style={styles.detailText}>Category: {selectedChallenge?.category}</Text>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="Payment Method ID"
                  value={joinFormData.paymentMethodId}
                  onChangeText={(text) => setJoinFormData(prev => ({ ...prev, paymentMethodId: text }))}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Card Last 4 Digits"
                  value={joinFormData.cardLast4}
                  onChangeText={(text) => setJoinFormData(prev => ({ ...prev, cardLast4: text.replace(/\D/g, '').slice(0, 4) }))}
                  maxLength={4}
                  keyboardType="numeric"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Card Brand"
                  value={joinFormData.cardBrand}
                  onChangeText={(text) => setJoinFormData(prev => ({ ...prev, cardBrand: text }))}
                />

                {joinFormError && <Text style={styles.errorText}>{joinFormError}</Text>}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowJoinModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.confirmButton, joinFormLoading && styles.confirmButtonDisabled]}
                    onPress={handleJoinSubmit}
                    disabled={joinFormLoading}
                  >
                    {joinFormLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.confirmButtonText}>Join Challenge</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Participants Modal */}
        <Modal
          visible={showParticipantsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowParticipantsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Participants: {selectedChallengeForParticipants?.name}
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowParticipantsModal(false);
                  setSelectedChallengeForParticipants(null);
                  setParticipants([]);
                }}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {participantsLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000000" />
                    <Text style={styles.loadingText}>Loading participants...</Text>
                  </View>
                ) : participantsError ? (
                  <Text style={styles.errorText}>{participantsError}</Text>
                ) : participants.length === 0 ? (
                  <Text style={styles.emptyText}>No participants yet.</Text>
                ) : (
                  <View style={styles.participantsGrid}>
                    {participants.map((participant, index) => {
                      const profileSrc = participant.profilePhotoUrl
                        ? { uri: participant.profilePhotoUrl }
                        : participant.avatarId === 'FEMALE'
                          ? require('../../../assets/FEMALE.png')
                          : require('../../../assets/MALE.png');

                      return (
                        <View key={participant.id || index} style={styles.participantCard}>
                          <Image source={profileSrc} style={styles.participantImage} />
                          <View style={styles.participantInfo}>
                            <Text style={styles.participantName}>
                              {participant.firstName} {participant.lastName}
                            </Text>
                            <Text style={styles.participantEmail}>{participant.email}</Text>
                            {participant.joinedAt && (
                              <Text style={styles.participantDate}>
                                Joined: {new Date(participant.joinedAt).toLocaleDateString()}
                              </Text>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    marginTop: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  popularScroll: {
    marginBottom: 16,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 16,
    width: 280,
  },
  popularChallengeCard: {
    width: 200,
  },
  challengeImage: {
    height: 160,
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  popularChallengeImage: {
    height: 128,
  },
  challengeContent: {
    padding: 16,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  popularChallengeName: {
    fontSize: 14,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  popularChallengeDescription: {
    fontSize: 12,
  },
  challengeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  challengeDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  participantsText: {
    fontSize: 12,
    color: '#2563EB',
  },
  entryFeeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
    marginTop: 8,
  },
  joinButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  challengesGrid: {
    gap: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  modalScroll: {
    padding: 20,
  },
  challengeDetails: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  participantsGrid: {
    gap: 12,
  },
  participantCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
  },
  participantImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  participantEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  participantDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  categoryPill: {
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  categoryPillSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryPillTextSelected: {
    color: '#FFFFFF',
  },
  categoriesPillsScroll: {
    marginBottom: 16,
  },
  categoriesPillsContainer: {
    paddingHorizontal: 5,
  },
  floatingCreateButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#000000',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },

});

export default ChallengesPage; 