import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { API_CONFIG } from '../../config/api';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  profilePhotoUrl?: string | null;
  avatarId?: string;
}

const EditProfilePage: React.FC = ({ navigation }: any) => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await apiService.getJSON<UserProfile>(API_CONFIG.ENDPOINTS.USER_PROFILE);
      setProfile(data);
    } catch (err: any) {
      setError('No se pudo cargar tu perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UserProfile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const handleSubmit = async () => {
    if (!profile) return;
    
    // Validar campos requeridos
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      setError('First name and last name are required');
      return;
    }
    
    setSaving(true);
    setError(null);

    try {
      const requestData = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        profilePhotoUrl: profile.profilePhotoUrl,
        avatarId: profile.avatarId,
      };
      
      console.log('Enviando datos PATCH a /api/user/profile:', requestData);

      // PATCH al endpoint de perfil (correcto según el backend)
      const response = await apiService.patchJSON<UserProfile>(
        API_CONFIG.ENDPOINTS.UPDATE_PROFILE,
        requestData
      );
      
      console.log('Respuesta del servidor:', response);

      // Actualizar el contexto de autenticación con los nuevos datos
      updateUser({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        profilePhotoUrl: profile.profilePhotoUrl || undefined,
        avatarId: profile.avatarId as 'MALE' | 'FEMALE',
      });

      navigation?.goBack();
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        originalError: error.originalError
      });
      setError(`Error guardando los cambios: ${error.message || 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Text style={styles.backButton}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.form}>
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={profile?.firstName || ''}
              onChangeText={(value) => handleChange('firstName', value)}
              placeholder="Enter your first name"
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={profile?.lastName || ''}
              onChangeText={(value) => handleChange('lastName', value)}
              placeholder="Enter your last name"
            />
          </View>

          {/* Email (solo lectura) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={profile?.email || ''}
              editable={false}
              placeholder="Your email"
            />
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={profile?.bio || ''}
              onChangeText={(value) => handleChange('bio', value)}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Profile Photo URL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Photo URL</Text>
            <TextInput
              style={styles.input}
              value={profile?.profilePhotoUrl || ''}
              onChangeText={(value) => handleChange('profilePhotoUrl', value)}
              placeholder="Enter photo URL"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    fontSize: 24,
    color: '#374151',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  form: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditProfilePage; 