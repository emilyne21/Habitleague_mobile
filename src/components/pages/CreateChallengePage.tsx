import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import challengeService from '../../services/challenges';
import { ChallengeCategory } from '../../types';

interface CreateChallengePageProps {
  navigation: any;
}

const CreateChallengePage: React.FC<CreateChallengePageProps> = ({ navigation }) => {

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ChallengeCategory | undefined>(undefined);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rules, setRules] = useState('');
  const [entryFee, setEntryFee] = useState<string>('');
  const [duration, setDuration] = useState<number>(21);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Location state
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    locationName: string;
  } | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: -12.1353, 
    longitude: -77.0223,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  // Payment state
  const [currency, setCurrency] = useState<string>('USD');
  const [paymentMethodId, setPaymentMethodId] = useState<string>('');
  const [cardLast4, setCardLast4] = useState<string>('');
  const [cardBrand, setCardBrand] = useState<string>('');
  
  // UI state
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Calculate duration automatically when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 0) {
        setDuration(daysDiff);
      }
    }
  }, [startDate, endDate]);

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      locationName: `Ubicación seleccionada (${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)})`
    });
  };

  const handleManualLocationInput = () => {
    Alert.alert(
      'Seleccionar Ubicación',
      'Toca directamente en el mapa para seleccionar la ubicación donde se realizará el challenge.',
      [
        { text: 'Entendido', style: 'default' }
      ]
    );
  };

  const handleImageSelection = () => {
    Alert.alert(
      'Seleccionar Imagen',
      'Elige una opción para agregar una imagen al challenge',
      [
        {
          text: 'Galería',
          onPress: pickImageFromGallery
        },
        {
          text: 'Cámara',
          onPress: takePhotoWithCamera
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  const pickImageFromGallery = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a la galería de fotos.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setImageUrl(result.assets[0].uri); // For now, use local URI
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al seleccionar la imagen.');
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permiso requerido', 'Se necesita permiso para acceder a la cámara.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setImageUrl(result.assets[0].uri); // For now, use local URI
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al tomar la foto.');
    }
  };

  const handleCreate = async () => {
    setFormError(null);

    // Basic validations
    if (!name.trim()) {
      setFormError('El nombre del challenge es requerido');
      return;
    }
    if (!description.trim()) {
      setFormError('La descripción es requerida');
      return;
    }
    if (!category) {
      setFormError('La categoría es requerida');
      return;
    }
    if (!selectedImage && !imageUrl.trim()) {
      setFormError('Se requiere seleccionar una imagen para el challenge');
      return;
    }
    if (!startDate) {
      setFormError('La fecha de inicio es requerida');
      return;
    }
    if (!endDate) {
      setFormError('La fecha de fin es requerida');
      return;
    }
    if (!selectedLocation) {
      setFormError('La ubicación es requerida');
      return;
    }
    if (!rules.trim()) {
      setFormError('Las reglas son requeridas');
      return;
    }
    if (duration < 21 || duration > 30) {
      setFormError('La duración debe estar entre 21 y 30 días');
      return;
    }
    if (!entryFee.trim()) {
      setFormError('La cuota de entrada es requerida');
      return;
    }
    if (!paymentMethodId.trim()) {
      setFormError('El ID del método de pago es requerido');
      return;
    }
    if (!cardLast4.trim() || cardLast4.length !== 4) {
      setFormError('Por favor ingresa los últimos 4 dígitos de tu tarjeta');
      return;
    }
    if (!cardBrand.trim()) {
      setFormError('Por favor selecciona una marca de tarjeta');
      return;
    }
    if (!currency.trim()) {
      setFormError('La moneda es requerida');
      return;
    }

    setFormLoading(true);
    try {
      const locationData = {
        challengeId: null,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        locationName: selectedLocation.locationName
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
        startDate: startDate!.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        endDate: endDate!.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        payment: paymentData,
        location: locationData
      };

      console.log('Enviando payload al backend:', JSON.stringify(payload, null, 2));
      await challengeService.createChallenge(payload);

      Alert.alert('Éxito', 'Challenge creado exitosamente!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          }
        }
      ]);
    } catch (err: any) {
      setFormError(err.message || 'Error creando challenge');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Challenge</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre del Challenge"
            value={name}
            onChangeText={setName}
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descripción"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          
          {/* Image Selection */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Imagen del Challenge</Text>
            
            {selectedImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.changeImageButton}
                  onPress={handleImageSelection}
                >
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                  <Text style={styles.changeImageButtonText}>Cambiar Imagen</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.selectImageButton}
                onPress={handleImageSelection}
              >
                <Ionicons name="camera" size={32} color="#6B7280" />
                <Text style={styles.selectImageButtonTitle}>Seleccionar Imagen</Text>
                <Text style={styles.selectImageButtonSubtitle}>
                  Toca para elegir una imagen de la galería o tomar una foto
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Reglas"
            value={rules}
            onChangeText={setRules}
            multiline
            numberOfLines={4}
          />
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue: ChallengeCategory | undefined) => setCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona una categoría..." value={undefined} />
              {Object.values(ChallengeCategory).map((cat) => (
                <Picker.Item key={cat} label={cat.charAt(0) + cat.slice(1).toLowerCase()} value={cat} />
              ))}
            </Picker>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Cuota de Entrada"
            value={entryFee}
            onChangeText={setEntryFee}
            keyboardType="numeric"
          />

          {/* Location Selection */}
          <View style={styles.locationSection}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            
            <TouchableOpacity 
              style={styles.mapButton}
              onPress={() => setShowMapModal(true)}
            >
              <Ionicons name="map" size={20} color="#FFFFFF" />
              <Text style={styles.mapButtonText}>
                {selectedLocation ? 'Cambiar Ubicación' : 'Seleccionar Ubicación'}
              </Text>
            </TouchableOpacity>

            {selectedLocation && (
              <View style={styles.selectedLocationContainer}>
                <Text style={styles.selectedLocationTitle}>Ubicación Seleccionada:</Text>
                <Text style={styles.selectedLocationText}>{selectedLocation.locationName}</Text>
                <Text style={styles.selectedLocationCoords}>
                  Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
                </Text>
              </View>
            )}
          </View>

          {/* Payment Information */}
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Información de Pago</Text>
            
            <TextInput
              style={styles.input}
              placeholder="ID del Método de Pago"
              value={paymentMethodId}
              onChangeText={setPaymentMethodId}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Últimos 4 dígitos de la tarjeta"
              value={cardLast4}
              onChangeText={(text) => setCardLast4(text.replace(/\D/g, '').slice(0, 4))}
              maxLength={4}
              keyboardType="numeric"
            />
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={cardBrand}
                onValueChange={(itemValue: string) => setCardBrand(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona una marca de tarjeta..." value="" />
                <Picker.Item label="Visa" value="Visa" />
                <Picker.Item label="Mastercard" value="Mastercard" />
                <Picker.Item label="American Express" value="American Express" />
                <Picker.Item label="Discover" value="Discover" />
                <Picker.Item label="Otra" value="Otra" />
              </Picker>
            </View>
          </View>

          {/* Date Selection */}
          <View style={styles.dateSection}>
            <Text style={styles.sectionTitle}>Fechas</Text>
            
            <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
              <TextInput
                style={styles.input}
                placeholder="Fecha de Inicio"
                value={startDate ? startDate.toLocaleDateString('es-ES') : ''}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
              <TextInput
                style={styles.input}
                placeholder="Fecha de Fin"
                value={endDate ? endDate.toLocaleDateString('es-ES') : ''}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            
            <TextInput
              style={[styles.input, { backgroundColor: '#E5E7EB' }]}
              placeholder="Duración (días)"
              value={duration ? duration.toString() : ''}
              editable={false}
            />
          </View>

          {formError && <Text style={styles.errorText}>{formError}</Text>}
          
          <TouchableOpacity
            style={[styles.submitButton, formLoading && styles.submitButtonDisabled]}
            onPress={handleCreate}
            disabled={formLoading}
          >
            {formLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Crear Challenge</Text>
            )}
          </TouchableOpacity>
          
          <View style={{ height: 32 }} />
        </ScrollView>

        {/* Map Modal */}
        <Modal
          visible={showMapModal}
          animationType="slide"
          onRequestClose={() => setShowMapModal(false)}
        >
          <SafeAreaView style={styles.mapModalContainer}>
            <View style={styles.mapModalHeader}>
              <TouchableOpacity onPress={() => setShowMapModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.mapModalTitle}>Seleccionar Ubicación</Text>
              <TouchableOpacity 
                onPress={() => setShowMapModal(false)}
                disabled={!selectedLocation}
                style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]}
              >
                <Text style={[styles.confirmButtonText, !selectedLocation && styles.confirmButtonTextDisabled]}>
                  Confirmar
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TouchableOpacity style={styles.manualSearchContainer} onPress={handleManualLocationInput}>
                <Text style={styles.manualSearchText}>
                  📍 Seleccionar Ubicación en el Mapa
                </Text>
                <Text style={styles.manualSearchSubtext}>
                  Toca el mapa abajo para elegir la ubicación del challenge
                </Text>
              </TouchableOpacity>
            </View>

            <MapView
              style={styles.map}
              region={mapRegion}
              onPress={handleMapPress}
              onRegionChangeComplete={setMapRegion}
            >
              {selectedLocation && (
                <Marker
                  coordinate={{
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                  }}
                  title="Ubicación del Challenge"
                  description={selectedLocation.locationName}
                />
              )}
            </MapView>

            {selectedLocation && (
              <View style={styles.mapSelectedLocationInfo}>
                <Text style={styles.mapSelectedLocationTitle}>Ubicación Seleccionada:</Text>
                <Text style={styles.mapSelectedLocationText}>{selectedLocation.locationName}</Text>
              </View>
            )}
          </SafeAreaView>
        </Modal>

        {/* Native Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
            minimumDate={new Date()}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate || startDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
            minimumDate={startDate || new Date()}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  locationSection: {
    marginBottom: 24,
  },
  paymentSection: {
    marginBottom: 24,
  },
  dateSection: {
    marginBottom: 24,
  },
  imageSection: {
    marginBottom: 24,
  },
  imagePreviewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  changeImageButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeImageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  selectImageButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectImageButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  selectImageButtonSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  mapButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  selectedLocationContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedLocationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  selectedLocationText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  selectedLocationCoords: {
    fontSize: 12,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 16,
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
    fontWeight: '600',
  },
  // Map Modal Styles
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000000',
    borderRadius: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButtonTextDisabled: {
    color: '#D1D5DB',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  map: {
    flex: 1,
  },
  mapSelectedLocationInfo: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  mapSelectedLocationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  mapSelectedLocationText: {
    fontSize: 14,
    color: '#374151',
  },

  // No API key styles
  noApiKeyContainer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginBottom: 10,
  },
  noApiKeyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 4,
  },
  noApiKeySubtext: {
    fontSize: 12,
    color: '#A16207',
    textAlign: 'center',
  },
  // Manual search styles
  manualSearchContainer: {
    backgroundColor: '#E0F2FE',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0EA5E9',
    marginBottom: 10,
  },
  manualSearchText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
    textAlign: 'center',
    marginBottom: 4,
  },
  manualSearchSubtext: {
    fontSize: 12,
    color: '#075985',
    textAlign: 'center',
  },
});

export default CreateChallengePage; 