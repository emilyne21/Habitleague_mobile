import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import challengeService from '../../services/challenges';
import { Challenge } from '../../types';
import { ChallengeCategory, ChallengeParticipant } from '../../types';
import { Picker } from '@react-native-picker/picker';

const { width } = Dimensions.get('window');

// Categories with images
const categories = [
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
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Popular challenges
  const [popularChallenges, setPopularChallenges] = useState<Challenge[]>([]);
  const [popularLoading, setPopularLoading] = useState(false);
  const [popularError, setPopularError] = useState<string | null>(null);

  // Create challenge form
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ChallengeCategory | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState('');
  const [rules, setRules] = useState('');
  const [entryFee, setEntryFee] = useState<string>('');
  const [duration, setDuration] = useState<number>(21);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [toleranceRadius, setToleranceRadius] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [cardLast4, setCardLast4] = useState<string>('');
  const [cardBrand, setCardBrand] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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

  // New selectors
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Fetch popular challenges on mount
  useEffect(() => {
    fetchPopularChallenges();
  }, []);

  // Fetch challenges by category
  useEffect(() => {
    if (!selectedCat) return;
    fetchByCategory();
  }, [selectedCat]);

  // Calculate duration automatically when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      const daysDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0) {
        setDuration(daysDiff);
      }
    }
  }, [startDate, endDate]);

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

  const fetchByCategory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await challengeService.getChallengesByCategory(selectedCat!);
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
      if (selectedCat) {
        const updated = await challengeService.getChallengesByCategory(selectedCat);
        setChallenges(updated);
      }

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

  const handleCreate = async () => {
    setFormError(null);

    // Basic validations
    if (!name.trim()) {
      setFormError('Challenge name is required');
      return;
    }
    if (!description.trim()) {
      setFormError('Description is required');
      return;
    }
    if (!imageUrl.trim()) {
      setFormError('Image URL is required');
      return;
    }
    if (!startDate) {
      setFormError('Start date is required');
      return;
    }
    if (!endDate) {
      setFormError('End date is required');
      return;
    }
    if (!location.trim()) {
      setFormError('Location name is required');
      return;
    }
    if (!latitude.trim()) {
      setFormError('Latitude is required');
      return;
    }
    if (!longitude.trim()) {
      setFormError('Longitude is required');
      return;
    }
    if (!toleranceRadius.trim()) {
      setFormError('Tolerance radius is required');
      return;
    }
    if (!rules.trim()) {
      setFormError('Rules are required');
      return;
    }
    if (duration < 21 || duration > 30) {
      setFormError('Duration must be between 21 and 30 days');
      return;
    }
    if (!entryFee.trim()) {
      setFormError('Entry fee is required');
      return;
    }
    if (!paymentMethodId.trim()) {
      setFormError('Payment method ID is required');
      return;
    }
    if (!cardLast4.trim() || cardLast4.length !== 4) {
      setFormError('Please enter the last 4 digits of your card');
      return;
    }
    if (!cardBrand.trim()) {
      setFormError('Please select a card brand');
      return;
    }
    if (!currency.trim()) {
      setFormError('Currency is required');
      return;
    }

    setFormLoading(true);
    try {
      const locationData = {
        challengeId: null,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        locationName: location.trim(),
        toleranceRadius: parseFloat(toleranceRadius)
      };

      const paymentData = {
        challengeId: null,
        amount: parseFloat(entryFee),
        currency: currency.trim(),
        paymentMethodId: paymentMethodId.trim(),
        cardLast4: cardLast4.trim(),
        cardBrand: cardBrand.trim()
      };

      const payload = {
        name: name.trim(),
        description: description.trim(),
        category: category!,
        imageUrl: imageUrl.trim(),
        rules: rules.trim(),
        durationDays: duration,
        entryFee: parseFloat(entryFee),
        startDate,
        endDate,
        payment: paymentData,
        location: locationData
      };

      console.log('Sending payload to backend:', JSON.stringify(payload, null, 2));
      await challengeService.createChallenge(payload);

      Alert.alert('Success', 'Challenge created successfully!');

      // Reset form
      setName('');
      setDescription('');
      setCategory(undefined);
      setImageUrl('');

      setRules('');
      setEntryFee('');
      setDuration(21);
      setStartDate('');
      setEndDate('');
      setLocation('');
      setLatitude('');
      setLongitude('');
      setToleranceRadius('');
      setCurrency('USD');
      setPaymentMethodId('');
      setCardLast4('');
      setCardBrand('');
      setShowForm(false);

      // Refresh challenges list
      if (selectedCat === category) {
        const updated = await challengeService.getChallengesByCategory(category);
        setChallenges(updated);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error creating challenge');
    } finally {
      setFormLoading(false);
    }
  };

  const renderChallengeCard = (challenge: Challenge, isPopular: boolean = false) => (
    <View key={challenge.id} style={[styles.challengeCard, isPopular && styles.popularChallengeCard]}>
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
          <TouchableOpacity onPress={() => handleViewParticipants(challenge)}>
            <Text style={styles.participantsText}>
              {challenge.participantsCount} {challenge.participantsCount === 1 ? 'participant' : 'participants'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleJoinChallenge(challenge)}
        >
          <Text style={styles.joinButtonText}>Join Challenge</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryItem = (cat: any) => (
    <TouchableOpacity
      key={cat.key}
      style={[styles.categoryItem, selectedCat === cat.key && styles.categoryItemSelected]}
      onPress={() => setSelectedCat(cat.key)}
    >
      <Image source={cat.img} style={styles.categoryImage} />
      <Text style={[styles.categoryLabel, selectedCat === cat.key && styles.categoryLabelSelected]}>
        {cat.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
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

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {categories.map(renderCategoryItem)}
            </ScrollView>

            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowForm(!showForm)}
            >
              <Text style={styles.createButtonText}>Create a Challenge</Text>
            </TouchableOpacity>
          </View>

          {/* Create Challenge Form */}
          {showForm && (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Create your own</Text>
              <ScrollView style={styles.formScroll} contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
                <TextInput
                  style={styles.input}
                  placeholder="Challenge Name"
                  value={name}
                  onChangeText={setName}
                />
                
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Description"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Image URL"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Rules"
                  value={rules}
                  onChangeText={setRules}
                  multiline
                  numberOfLines={4}
                />
                
                <View style={{ marginBottom: 12 }}>
                  <Picker
                    selectedValue={category}
                    onValueChange={(itemValue: ChallengeCategory | undefined) => setCategory(itemValue)}
                    style={{ backgroundColor: '#F9FAFB', borderRadius: 8 }}
                  >
                    <Picker.Item label="Selecciona una categoría..." value={undefined} />
                    {Object.values(ChallengeCategory).map((cat) => (
                      <Picker.Item key={cat} label={cat.charAt(0) + cat.slice(1).toLowerCase()} value={cat} />
                    ))}
                  </Picker>
                </View>
                
                <TextInput
                  style={styles.input}
                  placeholder="Entry Fee"
                  value={entryFee}
                  onChangeText={setEntryFee}
                  keyboardType="numeric"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Location Name"
                  value={location}
                  onChangeText={setLocation}
                />
                
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Latitude"
                    value={latitude}
                    onChangeText={setLatitude}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.input, styles.halfInput]}
                    placeholder="Longitude"
                    value={longitude}
                    onChangeText={setLongitude}
                    keyboardType="numeric"
                  />
                </View>
                
                <TextInput
                  style={styles.input}
                  placeholder="Tolerance Radius"
                  value={toleranceRadius}
                  onChangeText={setToleranceRadius}
                  keyboardType="numeric"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Payment Method ID"
                  value={paymentMethodId}
                  onChangeText={setPaymentMethodId}
                />
                
                <View style={{ marginBottom: 12 }}>
                  <Picker
                    selectedValue={cardBrand}
                    onValueChange={(itemValue: string) => setCardBrand(itemValue)}
                    style={{ backgroundColor: '#F9FAFB', borderRadius: 8 }}
                  >
                    <Picker.Item label="Selecciona una marca de tarjeta..." value="" />
                    <Picker.Item label="Visa" value="Visa" />
                    <Picker.Item label="Mastercard" value="Mastercard" />
                    <Picker.Item label="American Express" value="American Express" />
                    <Picker.Item label="Discover" value="Discover" />
                    <Picker.Item label="Otra" value="Otra" />
                  </Picker>
                </View>
                
                {/* Fecha de inicio */}
                <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                  <TextInput
                    style={styles.input}
                    placeholder="Start Date (YYYY-MM-DD)"
                    value={startDate}
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
                {showStartDatePicker && (
                  <Modal
                    visible={showStartDatePicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowStartDatePicker(false)}
                  >
                    <View style={styles.modalOverlay}>
                      <View style={styles.datePickerModal}>
                        <View style={styles.datePickerHeader}>
                          <Text style={styles.datePickerTitle}>Select Start Date</Text>
                          <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.datePickerContent}>
                          <TextInput
                            style={styles.dateInput}
                            placeholder="YYYY-MM-DD"
                            value={startDate}
                            onChangeText={(text) => {
                              // Simple validation for date format
                              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                              if (text === '' || dateRegex.test(text)) {
                                setStartDate(text);
                              }
                            }}
                            keyboardType="numeric"
                            maxLength={10}
                          />
                          <Text style={styles.datePickerHint}>Enter date in YYYY-MM-DD format</Text>
                        </View>
                        <View style={styles.datePickerButtons}>
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowStartDatePicker(false)}
                          >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={() => setShowStartDatePicker(false)}
                          >
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                )}
                {/* Fecha de fin */}
                <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                  <TextInput
                    style={styles.input}
                    placeholder="End Date (YYYY-MM-DD)"
                    value={endDate}
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
                {showEndDatePicker && (
                  <Modal
                    visible={showEndDatePicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowEndDatePicker(false)}
                  >
                    <View style={styles.modalOverlay}>
                      <View style={styles.datePickerModal}>
                        <View style={styles.datePickerHeader}>
                          <Text style={styles.datePickerTitle}>Select End Date</Text>
                          <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                          </TouchableOpacity>
                        </View>
                        <View style={styles.datePickerContent}>
                          <TextInput
                            style={styles.dateInput}
                            placeholder="YYYY-MM-DD"
                            value={endDate}
                            onChangeText={(text) => {
                              // Simple validation for date format
                              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                              if (text === '' || dateRegex.test(text)) {
                                setEndDate(text);
                              }
                            }}
                            keyboardType="numeric"
                            maxLength={10}
                          />
                          <Text style={styles.datePickerHint}>Enter date in YYYY-MM-DD format</Text>
                        </View>
                        <View style={styles.datePickerButtons}>
                          <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setShowEndDatePicker(false)}
                          >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={() => setShowEndDatePicker(false)}
                          >
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                )}
                {/* Días calculados */}
                <TextInput
                  style={[styles.input, { backgroundColor: '#E5E7EB' }]}
                  placeholder="Duration (days)"
                  value={duration ? duration.toString() : ''}
                  editable={false}
                />
                
                {formError && <Text style={styles.errorText}>{formError}</Text>}
                <TouchableOpacity
                  style={[styles.submitButton, formLoading && styles.submitButtonDisabled]}
                  onPress={handleCreate}
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Create Challenge</Text>
                  )}
                </TouchableOpacity>
                <View style={{ height: 32 }} />
              </ScrollView>
            </View>
          )}

          {/* Category Results */}
          {selectedCat && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {categories.find(c => c.key === selectedCat)?.label} Challenges
              </Text>

              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#000000" />
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              )}
              
              {error && <Text style={styles.errorText}>{error}</Text>}

              {!loading && !error && (
                <View style={styles.challengesGrid}>
                  {challenges.length > 0
                    ? challenges.map(challenge => renderChallengeCard(challenge))
                    : <Text style={styles.emptyText}>No challenges found in this category.</Text>
                  }
                </View>
              )}
            </View>
          )}
        </ScrollView>

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
    </SafeAreaView>
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
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryItemSelected: {
    borderWidth: 2,
    borderColor: '#000000',
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  categoryLabelSelected: {
    color: '#000000',
  },
  createButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  formScroll: {
    // maxHeight: 400, // Eliminado para permitir scroll completo
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
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
  // Date picker styles
  datePickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  datePickerContent: {
    padding: 20,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  datePickerHint: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  datePickerButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default ChallengesPage; 