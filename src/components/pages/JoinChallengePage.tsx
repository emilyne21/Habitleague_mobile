import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import SafeScreen from '../common/SafeScreen';
import challengeService from '../../services/challenges';
import { Challenge, ChallengeJoin } from '../../types';

const { width, height } = Dimensions.get('window');

const JoinChallengePage: React.FC<any> = ({ route, navigation }) => {
  const { challenge } = route.params;

  // Location state
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: -12.1353,
    longitude: -77.0223,
    locationName: 'Mi Gimnasio Local',
    toleranceRadius: 100.0,
  });
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [locationPermission, setLocationPermission] = useState(false);

  // Payment state
  const [paymentData, setPaymentData] = useState({
    paymentMethodId: '',
    cardLast4: '',
    cardBrand: 'visa',
  });

  // UI state
  const [currentStep, setCurrentStep] = useState<'location' | 'payment'>('location');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        setLocationPermission(false);
        Alert.alert(
          'Permisos de ubicación',
          'Se necesitan permisos de ubicación para seleccionar el lugar del challenge.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation(prev => ({
      ...prev,
      latitude,
      longitude,
    }));
  };

  const handleLocationNameChange = (locationName: string) => {
    setSelectedLocation(prev => ({
      ...prev,
      locationName,
    }));
  };



  const validateLocationStep = () => {
    if (!selectedLocation.locationName.trim()) {
      setError('Por favor ingresa un nombre para la ubicación');
      return false;
    }
    return true;
  };

  const validatePaymentStep = () => {
    if (!paymentData.paymentMethodId.trim()) {
      setError('ID del método de pago es requerido');
      return false;
    }
    if (!paymentData.cardLast4.trim() || paymentData.cardLast4.length !== 4) {
      setError('Ingresa los últimos 4 dígitos de tu tarjeta');
      return false;
    }
    if (!paymentData.cardBrand.trim()) {
      setError('Selecciona el tipo de tarjeta');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError('');
    
    if (currentStep === 'location') {
      if (validateLocationStep()) {
        setCurrentStep('payment');
      }
    } else {
      handleJoinChallenge();
    }
  };

  const handleJoinChallenge = async () => {
    if (!validatePaymentStep()) return;

    setLoading(true);
    setError('');

    try {
      const joinData: ChallengeJoin = {
        payment: {
          challengeId: challenge.id,
          amount: challenge.entryFee,
          currency: 'USD',
          paymentMethodId: paymentData.paymentMethodId.trim(),
          cardLast4: paymentData.cardLast4.trim(),
          cardBrand: paymentData.cardBrand.trim(),
        },
        location: {
          challengeId: challenge.id,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          locationName: selectedLocation.locationName.trim(),
          toleranceRadius: selectedLocation.toleranceRadius,
        },
      };

      await challengeService.joinChallenge(challenge.id.toString(), joinData);

      Alert.alert(
        '¡Éxito!',
        'Te has unido al challenge exitosamente.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ChallengeDetails', { id: challenge.id }),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || 'Error al unirse al challenge');
    } finally {
      setLoading(false);
    }
  };

  const renderLocationStep = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>Selecciona la ubicación del challenge</Text>
      <Text style={styles.stepDescription}>
        Toca en el mapa para seleccionar el lugar donde participarás en este challenge.
      </Text>

      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={currentLocation || {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
          showsUserLocation={locationPermission}
          showsMyLocationButton={true}
        >
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title={selectedLocation.locationName}
            description="Ubicación del challenge"
          />
        </MapView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre del lugar</Text>
        <TextInput
          style={styles.input}
          value={selectedLocation.locationName}
          onChangeText={handleLocationNameChange}
          placeholder="Ej: Mi gimnasio, Parque central, etc."
        />
      </View>


    </ScrollView>
  );

  const renderPaymentStep = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={styles.stepTitle}>Información de pago</Text>
      <Text style={styles.stepDescription}>
        Ingresa los datos de tu método de pago para completar la inscripción.
      </Text>

      <View style={styles.challengeInfo}>
        <Text style={styles.challengeInfoTitle}>{challenge.name}</Text>
        <Text style={styles.challengeInfoText}>Costo de entrada: ${challenge.entryFee.toFixed(2)}</Text>
        <Text style={styles.challengeInfoText}>Duración: {challenge.durationDays} días</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>ID del método de pago</Text>
        <TextInput
          style={styles.input}
          value={paymentData.paymentMethodId}
          onChangeText={(value) => setPaymentData(prev => ({ ...prev, paymentMethodId: value }))}
          placeholder="pm_test_67890"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Últimos 4 dígitos de la tarjeta</Text>
        <TextInput
          style={styles.input}
          value={paymentData.cardLast4}
          onChangeText={(value) => setPaymentData(prev => ({ 
            ...prev, 
            cardLast4: value.replace(/\D/g, '').slice(0, 4) 
          }))}
          placeholder="1234"
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipo de tarjeta</Text>
        <View style={styles.cardBrandContainer}>
          {['visa', 'mastercard', 'amex', 'discover'].map((brand) => (
            <TouchableOpacity
              key={brand}
              style={[
                styles.cardBrandButton,
                paymentData.cardBrand === brand && styles.cardBrandButtonSelected,
              ]}
              onPress={() => setPaymentData(prev => ({ ...prev, cardBrand: brand }))}
            >
              <Text style={[
                styles.cardBrandText,
                paymentData.cardBrand === brand && styles.cardBrandTextSelected,
              ]}>
                {brand.charAt(0).toUpperCase() + brand.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeScreen style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Unirse al Challenge</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              currentStep === 'location' && styles.progressDotActive,
              currentStep === 'payment' && styles.progressDotCompleted,
            ]}>
              <Ionicons 
                name={currentStep === 'payment' ? 'checkmark' : 'location'} 
                size={16} 
                color="#fff" 
              />
            </View>
            <Text style={styles.progressLabel}>Ubicación</Text>
          </View>
          
          <View style={[
            styles.progressLine,
            currentStep === 'payment' && styles.progressLineActive,
          ]} />
          
          <View style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              currentStep === 'payment' && styles.progressDotActive,
            ]}>
              <Ionicons name="card" size={16} color="#fff" />
            </View>
            <Text style={styles.progressLabel}>Pago</Text>
          </View>
        </View>

        {/* Content */}
        {currentStep === 'location' ? renderLocationStep() : renderPaymentStep()}

        {/* Error */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Footer */}
        <View style={styles.footer}>
          {currentStep === 'payment' && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setCurrentStep('location')}
            >
              <Text style={styles.secondaryButtonText}>Anterior</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={handleNextStep}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {currentStep === 'location' ? 'Siguiente' : 'Unirse al Challenge'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  wrapper: {
    flex: 1,
  },
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
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#bdc3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: '#3498db',
  },
  progressDotCompleted: {
    backgroundColor: '#27ae60',
  },
  progressLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#bdc3c7',
    marginHorizontal: 12,
  },
  progressLineActive: {
    backgroundColor: '#27ae60',
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 24,
    marginBottom: 20,
  },
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  helper: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
  challengeInfo: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  challengeInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 8,
  },
  challengeInfoText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 4,
  },
  cardBrandContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cardBrandButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  cardBrandButtonSelected: {
    borderColor: '#3498db',
    backgroundColor: '#e3f2fd',
  },
  cardBrandText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  cardBrandTextSelected: {
    color: '#3498db',
    fontWeight: '600',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#95a5a6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#95a5a6',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#2c3e50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default JoinChallengePage; 