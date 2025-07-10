import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  SafeAreaView,
  TextInput
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import StepProgress from '../ui/StepProgress';

const { width } = Dimensions.get('window');

/* ---------- Tipos ---------- */
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  bio: string;
  profilePhotoUrl: string;
  avatarId: string;
}

interface RegisterFormProps {
  step: 1 | 2;
  formData: RegisterFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegisterFormData>>;
  onStepChange: (step: 1 | 2) => void;
}

/* ---------- Componente ---------- */
const RegisterFormMultiStep: React.FC<RegisterFormProps> = ({
  step,
  formData,
  setFormData,
  onStepChange,
}) => {
  const { register, logout } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  /* ---------- helpers ---------- */
  const onChange = (field: keyof RegisterFormData, value: string) => {
    setError('');
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
      setFormData(prev => ({ ...prev, profilePhotoUrl: result.assets[0].uri }));
    }
  };

  const next = () => {
    if (
      !formData.email ||
      !formData.password ||
      formData.password !== formData.confirmPassword
    ) {
      setError('Please fill and match all fields');
      return;
    }
    onStepChange(2);
  };

  const submit = async () => {
    setError('');

    if (!formData.firstName || !formData.lastName) {
      setError('First & last name required');
      return;
    }
    if (!formData.avatarId) {
      setError('You must select an avatar');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        bio: formData.bio.trim(),
        avatarId: formData.avatarId,
      };
      if (formData.profilePhotoUrl.trim()) {
        payload.profilePhotoUrl = formData.profilePhotoUrl.trim();
      }

      await register(payload);
      // El logout se maneja automáticamente en el contexto después del registro exitoso
    } catch (e: any) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  const isStep1 = step === 1;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Indicator */}
        <StepProgress
          currentStep={step}
          totalSteps={2}
          stepLabels={['Account', 'Profile']}
        />

        {/* Encabezados */}
        <Text style={[styles.title, isStep1 && styles.titleCentered]}>
          {isStep1 ? 'Create your account' : 'Profile information'}
        </Text>

        {error && (
          <Text style={[styles.errorText, isStep1 && styles.errorTextCentered]}>
            {error}
          </Text>
        )}

        {/* ---------------- PASO 1 ---------------- */}
        {isStep1 ? (
          <View style={styles.step1Container}>
            {/* Email */}
            <Input
              label="Email"
              value={formData.email}
              onChangeText={(value) => onChange('email', value)}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Password */}
            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => onChange('password', value)}
              placeholder="Password"
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => onChange('confirmPassword', value)}
              placeholder="Confirm Password"
              secureTextEntry
              autoCapitalize="none"
            />

            {/* Botón negro */}
            <Button
              onPress={next}
              style={styles.nextButton}
            >
              Next
            </Button>
          </View>
        ) : (
          /* ---------------- PASO 2 ---------------- */
          <View style={styles.step2Container}>
            {/* Avatars - Moved to top */}
            <View style={styles.avatarSection}>
              <Text style={styles.avatarLabel}>Choose avatar</Text>
              <View style={styles.avatarRow}>
                {/* Male */}
                <TouchableOpacity
                  style={[
                    styles.avatarButton,
                    formData.avatarId === 'MALE' && styles.avatarButtonSelected
                  ]}
                  onPress={() => onChange('avatarId', 'MALE')}
                >
                  <Image 
                    source={require('../../../assets/MALE.png')} 
                    style={styles.avatarImage}
                  />
                </TouchableOpacity>

                {/* Female */}
                <TouchableOpacity
                  style={[
                    styles.avatarButton,
                    formData.avatarId === 'FEMALE' && styles.avatarButtonSelected
                  ]}
                  onPress={() => onChange('avatarId', 'FEMALE')}
                >
                  <Image 
                    source={require('../../../assets/FEMALE.png')} 
                    style={styles.avatarImage}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Photo Upload */}
            <View style={styles.photoSection}>
              <Text style={styles.photoLabel}>Profile Photo (optional)</Text>
              <TouchableOpacity style={styles.photoButton} onPress={handlePickImage}>
                <Text style={styles.photoButtonText}>📷 Upload Photo</Text>
              </TouchableOpacity>
              {selectedImage && (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => {
                      setSelectedImage(null);
                      setFormData(prev => ({ ...prev, profilePhotoUrl: '' }));
                    }}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Name Fields */}
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChangeText={(value) => onChange('firstName', value)}
                  placeholder="First Name"
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.nameField}>
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChangeText={(value) => onChange('lastName', value)}
                  placeholder="Last Name"
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Bio */}
            <TextArea
              label="Short Bio"
              value={formData.bio}
              onChangeText={(value) => onChange('bio', value)}
              placeholder="Tell us about yourself…"
              numberOfLines={4}
            />

            {/* Submit Button */}
            <View style={styles.submitContainer}>
              <Button
                onPress={submit}
                loading={loading}
                style={styles.submitButton}
              >
                Create Account
              </Button>
            </View>

            <Text style={styles.stepIndicator}>Step 2 of 2</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 24,
  },
  titleCentered: {
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 16,
  },
  errorTextCentered: {
    textAlign: 'center',
  },
  step1Container: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  nextButton: {
    width: '100%',
    height: 48,
    marginTop: 8,
  },
  step2Container: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nameField: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 16,
  },
  avatarButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  avatarButtonSelected: {
    borderColor: '#2563EB',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  photoButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  photoButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  imagePreviewContainer: {
    marginTop: 12,
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  submitContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButton: {
    paddingHorizontal: 32,
    height: 48,
  },
  stepIndicator: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default RegisterFormMultiStep; 