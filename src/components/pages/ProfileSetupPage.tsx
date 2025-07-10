import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import ScrollContainer from '../common/ScrollContainer';
import SafeScreen from '../common/SafeScreen';

const AVATARS = [
  { id: 'MALE', label: 'Male', uri: 'https://i.pinimg.com/736x/e1/e7/3b/e1e73b7c4ede29974e3844d99602feb0.jpg' },
  { id: 'FEMALE', label: 'Female', uri: 'https://i.pinimg.com/736x/2f/48/f8/2f48f8cc1a811d330a0e34f06e4e88a1.jpg' },
];

const ProfileSetupPage = ({ route, navigation }: any) => {
  const { email, password } = route?.params || {};
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [avatarId, setAvatarId] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [showAvatars, setShowAvatars] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfilePhotoUrl(result.assets[0].uri);
      setShowAvatars(false);
    }
  };

  const handleChooseAvatarButton = () => {
    setShowAvatars((prev) => !prev);
  };

  const handleChooseAvatar = (index: number) => {
    setAvatarId(AVATARS[index].id);
    setSelectedAvatar(index);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        firstName,
        lastName,
        email,
        password,
        bio,
        profilePhotoUrl: profilePhotoUrl || undefined,
        avatarId: avatarId || undefined,
      };
      console.log('Payload enviado:', payload);
      await register(payload);
      // El logout se maneja automáticamente en el contexto después del registro exitoso
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen style={styles.wrapper}>
      <ScrollContainer contentContainerStyle={{ ...styles.container, paddingBottom: 48 }}>
      <Text style={styles.title}>Sign Up</Text>
      <View style={styles.progressContainer}>
        <View style={[styles.dot, styles.dotInactive]} />
        <View style={[styles.dot, styles.dotActive]} />
      </View>
      <Text style={styles.subtitle}>Create your profile</Text>
      <View style={styles.avatarRow}>
        <TouchableOpacity style={styles.avatarButton} onPress={handlePickImage}>
          <Text style={styles.avatarIcon}>🖼️</Text>
          <Text style={styles.avatarText}>Upload Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarButton} onPress={handleChooseAvatarButton}>
          <Text style={styles.avatarIcon}>👤</Text>
          <Text style={styles.avatarText}>Choose Avatar</Text>
        </TouchableOpacity>
      </View>
      {profilePhotoUrl && (
        <Image source={{ uri: profilePhotoUrl }} style={styles.previewImage} />
      )}
      {showAvatars && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {AVATARS.map((avatar, idx) => (
            <TouchableOpacity key={`avatar-${avatar.id}-${idx}`} onPress={() => handleChooseAvatar(idx)}>
              <Image
                source={{ uri: avatar.uri }}
                style={[styles.avatarOption, selectedAvatar === idx && styles.avatarSelected]}
              />
              <Text style={{ textAlign: 'center', fontSize: 12 }}>{avatar.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <View style={styles.formSection}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your first name"
          placeholderTextColor="#888"
          value={firstName}
          onChangeText={setFirstName}
        />
        <Text style={styles.label}>Last Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your last name"
          placeholderTextColor="#888"
          value={lastName}
          onChangeText={setLastName}
        />
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Tell us about you..."
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
          value={bio}
          onChangeText={setBio}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
      </TouchableOpacity>
      </ScrollContainer>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 32, marginBottom: 8 },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  dot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 3 },
  dotInactive: { backgroundColor: '#e0e0e0' },
  dotActive: { backgroundColor: '#222' },
  subtitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'left', marginBottom: 24, marginTop: 8 },
  avatarRow: { flexDirection: 'row', marginBottom: 16, alignSelf: 'flex-start' },
  avatarButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 8, padding: 8, marginRight: 12 },
  avatarIcon: { fontSize: 22, marginRight: 6 },
  avatarText: { fontSize: 15 },
  previewImage: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', marginBottom: 12 },
  avatarOption: { width: 50, height: 50, borderRadius: 25, marginHorizontal: 6, borderWidth: 2, borderColor: 'transparent' },
  avatarSelected: { borderColor: '#000' },
  formSection: { width: '100%', maxWidth: 350, alignSelf: 'center' },
  label: { fontSize: 15, color: '#222', marginBottom: 4, marginLeft: 2 },
  input: { width: '100%', height: 50, backgroundColor: '#eee', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, fontSize: 16 },
  textarea: { width: '100%', height: 80, backgroundColor: '#eee', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, fontSize: 16, textAlignVertical: 'top' },
  button: { width: '100%', maxWidth: 350, height: 50, backgroundColor: '#000', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8, alignSelf: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  error: { color: 'red', marginBottom: 8, alignSelf: 'center' },
});

export default ProfileSetupPage; 