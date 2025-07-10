import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import SafeScreen from '../common/SafeScreen';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import challengeService from '../../services/challenges';
import evidenceService from '../../services/evidenceService';
import type { Challenge, SubmitEvidenceRequest, DailySubmissionStatus } from '../../types';
import type { LocationValidation, EvidenceSubmissionResponse } from '../../services/evidenceService';

const { width } = Dimensions.get('window');

interface RouteParams {
  challengeId?: number;
}

const SubmitEvidencePage: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { challengeId } = (route.params as RouteParams) || {};
  const { user } = useAuth();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [dailyStatus, setDailyStatus] = useState<DailySubmissionStatus | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);

  useEffect(() => {
    if (!challengeId) {
      loadMyChallenges();
      return;
    }
    
    loadChallengeData();
  }, [challengeId]);

  const loadMyChallenges = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading user challenges for evidence submission...');
      const response = await challengeService.getMyChallenges();
      const data = Array.isArray(response) ? response : (response as any).data || [];
      
      const normalizedChallenges = data.map((challenge: any) => ({
        ...challenge,
        id: challenge.id || challenge.challengeId
      }));
      
      console.log('✅ User challenges loaded:', normalizedChallenges);
      setMyChallenges(normalizedChallenges);
    } catch (err: any) {
      console.error('❌ Error loading user challenges:', err);
      setError(err.message || 'Error loading your challenges');
    } finally {
      setLoading(false);
    }
  };

  const loadChallengeData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading challenge data for evidence submission...');
      
      const challengeIdNum = challengeId!;
      
      // Cargar challenge y estado diario en paralelo
      const [challengeData, statusData] = await Promise.all([
        challengeService.getChallengeById(challengeIdNum),
        evidenceService.getDailySubmissionStatus(challengeIdNum)
      ]);

      console.log('✅ Challenge data loaded:', { challenge: challengeData, status: statusData });
      
      setChallenge(challengeData as Challenge);
      setDailyStatus(statusData);

      // Si ya envió evidencia hoy, mostrar mensaje
      if (statusData.hasSubmittedToday) {
        setError('You have already submitted evidence for today. Come back tomorrow!');
      }
    } catch (err: any) {
      console.error('❌ Error loading challenge data:', err);
      setError(err.message || 'Error loading challenge data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelection = () => {
    Alert.alert(
      'Seleccionar Imagen',
      'Elige una opción para agregar evidencia',
      [
        {
          text: 'Cámara',
          onPress: takePhotoWithCamera
        },
        {
          text: 'Galería',
          onPress: pickImageFromGallery
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  const takePhotoWithCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a la cámara.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al tomar la foto.');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a la galería de fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al seleccionar la imagen.');
    }
  };

  const handleGetLocation = async () => {
    setLocationError(null);
    
    try {
      console.log('📍 Getting current location...');
      const currentLocation = await evidenceService.getCurrentLocation();
      setLocation(currentLocation);
      console.log('✅ Location obtained:', currentLocation);
    } catch (err: any) {
      console.error('❌ Error getting location:', err);
      setLocationError('Could not get your location. Please enable location services and try again.');
    }
  };

  const handleSubmit = async () => {
    const currentChallengeId = challengeId || selectedChallengeId;
    
    if (!currentChallengeId || !selectedImageUri || !location) {
      setError('Please select a challenge, take a photo, and get your location before submitting.');
      return;
    }

    if (!challenge) {
      setError('Challenge data not loaded. Please try again.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log('🔄 Submitting evidence...');
      
      // Validar ubicación usando la tolerancia del challenge
      const locationValidation = evidenceService.validateLocation(
        challenge,
        location.latitude,
        location.longitude
      );

      if (!locationValidation.isValid) {
        setError(
          `Location validation failed! You are ${locationValidation.distance.toFixed(0)}m away from the challenge location. ` +
          `The tolerance radius is ${locationValidation.toleranceRadius}m. ` +
          `Please move closer to ${challenge.location?.locationName || 'the challenge location'}.`
        );
        setSubmitting(false);
        return;
      }

      console.log('✅ Location validation passed:', locationValidation);
      
      // Subir imagen
      const imageUrl = await evidenceService.uploadEvidenceImage(selectedImageUri);
      
      // Preparar request
      const request: SubmitEvidenceRequest = {
        challengeId: currentChallengeId,
        imageUrl,
        latitude: location.latitude,
        longitude: location.longitude
      };

      console.log('📤 Submitting evidence request:', request);
      
      // Enviar evidencia
      const response = await evidenceService.submitEvidence(request);
      
      console.log('✅ Evidence submitted successfully:', response);
      
      // Mostrar resultado y navegar
      if (response.success) {
        Alert.alert(
          'Éxito',
          `Evidence submitted successfully! Status: ${response.status}\n\n` +
          `Location validation: ✅ Passed (${locationValidation.distance.toFixed(0)}m within ${locationValidation.toleranceRadius}m tolerance)\n` +
          `${response.message}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ChallengeProof', { id: currentChallengeId })
            }
          ]
        );
      } else {
        setError(response.message || 'Failed to submit evidence');
      }
    } catch (err: any) {
      console.error('❌ Error submitting evidence:', err);
      setError(err.message || 'Error submitting evidence');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleChallengeSelect = async (challengeId: number) => {
    setSelectedChallengeId(challengeId);
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading data for selected challenge:', challengeId);
      
      const [challengeData, statusData] = await Promise.all([
        challengeService.getChallengeById(challengeId),
        evidenceService.getDailySubmissionStatus(challengeId)
      ]);

      console.log('✅ Challenge data loaded:', { challenge: challengeData, status: statusData });
      
      setChallenge(challengeData as Challenge);
      setDailyStatus(statusData);

      if (statusData.hasSubmittedToday) {
        setError('You have already submitted evidence for today. Come back tomorrow!');
      }
    } catch (err: any) {
      console.error('❌ Error loading challenge data:', err);
      setError(err.message || 'Error loading challenge data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeScreen style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your challenges...</Text>
        </View>
      </SafeScreen>
    );
  }

  // Si no hay challengeId y no hay challenge seleccionado, mostrar selección de challenges
  if (!challengeId && !challenge) {
    return (
      <SafeScreen style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#666" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            
            <Text style={styles.title}>Submit Daily Evidence</Text>
            <Text style={styles.subtitle}>Select a challenge to submit evidence for</Text>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Select a Challenge</Text>
            
            {myChallenges.length === 0 ? (
              <View style={styles.centerContainer}>
                <View style={styles.emptyIconContainer}>
                  <Text style={styles.emptyIcon}>🏆</Text>
                </View>
                <Text style={styles.emptyTitle}>No challenges joined</Text>
                <Text style={styles.emptyText}>
                  You need to join a challenge before you can submit evidence.
                </Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => navigation.navigate('Challenges')}
                >
                  <Text style={styles.primaryButtonText}>Browse Challenges</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.challengesList}>
                {myChallenges.map((challenge) => (
                  <TouchableOpacity
                    key={challenge.id}
                    style={styles.challengeSelectCard}
                    onPress={() => handleChallengeSelect(challenge.id!)}
                  >
                    <View style={styles.challengeCardContent}>
                      <View style={styles.challengeIconContainer}>
                        <Text style={styles.challengeIcon}>📸</Text>
                      </View>
                      <View style={styles.challengeInfo}>
                        <Text style={styles.challengeName}>{challenge.name}</Text>
                        <Text style={styles.challengeDesc} numberOfLines={2}>
                          {challenge.description}
                        </Text>
                        <View style={styles.challengeMeta}>
                          <Text style={styles.challengeMetaText}>{challenge.durationDays} days</Text>
                          <Text style={styles.challengeMetaText}>${challenge.entryFee}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeScreen>
    );
  }

  if (!challenge) {
    return (
      <SafeScreen style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Challenge not found</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={handleBack}>
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  if (dailyStatus?.hasSubmittedToday) {
    return (
      <SafeScreen style={styles.container}>
        <View style={styles.centerContainer}>
          <View style={styles.successCard}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✅</Text>
            </View>
            <Text style={styles.successTitle}>Already Submitted Today</Text>
            <Text style={styles.successText}>
              You have already submitted your daily evidence for this challenge. Come back tomorrow!
            </Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleBack}>
                <Text style={styles.primaryButtonText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('ChallengeDetails', { id: challengeId })}
              >
                <Text style={styles.secondaryButtonText}>View Challenge</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#666" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Submit Daily Evidence</Text>
          <Text style={styles.subtitle}>Challenge: {challenge.name}</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.card}>
          {/* Challenge Info */}
          <View style={styles.challengeInfoSection}>
            <Text style={styles.sectionTitle}>{challenge.name}</Text>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
            <View style={styles.challengeMetaSection}>
              <Text style={styles.challengeMetaText}>Duration: {challenge.durationDays} days</Text>
              <Text style={styles.challengeMetaText}>Entry Fee: ${challenge.entryFee}</Text>
            </View>
            
            {/* Location Requirements */}
            {challenge.location && (
              <View style={styles.locationRequirements}>
                <Text style={styles.locationTitle}>📍 Location Requirements</Text>
                <Text style={styles.locationText}>
                  <Text style={styles.bold}>Required Location:</Text> {challenge.location.locationName}
                </Text>
                <Text style={styles.locationText}>
                  <Text style={styles.bold}>Coordinates:</Text> {challenge.location.latitude.toFixed(6)}, {challenge.location.longitude.toFixed(6)}
                </Text>
                <Text style={styles.locationText}>
                  <Text style={styles.bold}>Tolerance Radius:</Text> {challenge.location.toleranceRadius}m
                </Text>
                <Text style={styles.locationHint}>
                  💡 You must be within {challenge.location.toleranceRadius}m of this location to submit evidence
                </Text>
              </View>
            )}
          </View>

          {/* Image Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Take a Photo</Text>
            
            {!selectedImageUri ? (
              <TouchableOpacity style={styles.imageUploadArea} onPress={handleImageSelection}>
                <View style={styles.uploadIconContainer}>
                  <Text style={styles.uploadIcon}>📸</Text>
                </View>
                <Text style={styles.uploadText}>Take a photo showing your challenge activity</Text>
                <View style={styles.uploadButton}>
                  <Text style={styles.uploadButtonText}>Take Photo</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.imagePreviewContainer}>
                <View style={styles.imageContainer}>
                  <Image source={{ uri: selectedImageUri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImageUri(null)}
                  >
                    <Ionicons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.retakeButton} onPress={handleImageSelection}>
                  <Text style={styles.retakeButtonText}>Retake Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Verify Location</Text>
            
            {!location ? (
              <TouchableOpacity style={styles.locationArea} onPress={handleGetLocation}>
                <View style={styles.locationIconContainer}>
                  <Text style={styles.locationIcon}>📍</Text>
                </View>
                <Text style={styles.locationText}>
                  We need to verify you're at your registered location
                </Text>
                <View style={styles.locationButton}>
                  <Text style={styles.locationButtonText}>Get My Location</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.locationVerified}>
                <View style={styles.locationVerifiedHeader}>
                  <Ionicons name="checkmark-circle" size={20} color="#059669" />
                  <Text style={styles.locationVerifiedText}>Location verified</Text>
                </View>
                <Text style={styles.locationCoords}>
                  Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                </Text>
                <TouchableOpacity onPress={handleGetLocation}>
                  <Text style={styles.updateLocationText}>Update location</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {locationError && (
              <View style={styles.locationErrorContainer}>
                <Text style={styles.locationErrorText}>{locationError}</Text>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedImageUri || !location || submitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!selectedImageUri || !location || submitting}
            >
              {submitting ? (
                <View style={styles.submittingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Submit Evidence</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={handleBack}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Important Reminders:</Text>
            <Text style={styles.instructionItem}>• Submit evidence daily to avoid penalties</Text>
            <Text style={styles.instructionItem}>• Take clear photos showing your challenge activity</Text>
            <Text style={styles.instructionItem}>
              • Make sure you're at your registered location (within {challenge.location?.toleranceRadius || 'specified'}m tolerance)
            </Text>
            <Text style={styles.instructionItem}>• Evidence submission window: 00:00 - 23:59 daily</Text>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  challengesList: {
    gap: 16,
  },
  challengeSelectCard: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  challengeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengeIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  challengeIcon: {
    fontSize: 20,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  challengeDesc: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  challengeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  challengeMetaText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#f3f4f6',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    maxWidth: 400,
    width: '100%',
  },
  successIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#d1fae5',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 32,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonGroup: {
    gap: 12,
  },
  challengeInfoSection: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 24,
  },
  challengeDescription: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  challengeMetaSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationRequirements: {
    padding: 16,
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e40af',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#1e3a8a',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '600',
  },
  locationHint: {
    fontSize: 12,
    color: '#2563eb',
    marginTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  imageUploadArea: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#f3f4f6',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadIcon: {
    fontSize: 32,
  },
  uploadText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    gap: 16,
  },
  imageContainer: {
    position: 'relative',
    alignSelf: 'center',
  },
  previewImage: {
    width: width - 80,
    height: (width - 80) * 0.75,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#dc2626',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retakeButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },

  locationArea: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 20,
  },
  locationButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  locationVerified: {
    padding: 16,
    backgroundColor: '#d1fae5',
    borderColor: '#a7f3d0',
    borderWidth: 1,
    borderRadius: 8,
  },
  locationVerifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationVerifiedText: {
    color: '#065f46',
    fontWeight: '500',
    marginLeft: 8,
  },
  locationCoords: {
    color: '#047857',
    fontSize: 14,
    marginBottom: 8,
  },
  updateLocationText: {
    color: '#047857',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  locationErrorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  locationErrorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  submitSection: {
    gap: 12,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  submittingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
  },
  instructions: {
    padding: 16,
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e40af',
    marginBottom: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#1e3a8a',
    marginBottom: 4,
  },
});

export default SubmitEvidencePage; 