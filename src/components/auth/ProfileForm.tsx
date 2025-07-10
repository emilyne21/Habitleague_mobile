import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

type Props = {
  firstName: string;
  lastName: string;
  bio: string;
  onChangeFirstName: (text: string) => void;
  onChangeLastName: (text: string) => void;
  onChangeBio: (text: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  error?: string;
};

const ProfileForm: React.FC<Props> = ({ firstName, lastName, bio, onChangeFirstName, onChangeLastName, onChangeBio, onSubmit, loading, error }) => (
  <View style={styles.container}>
    <View style={styles.avatarRow}>
      <TouchableOpacity style={styles.avatarButton}>
        <Text style={styles.avatarIcon}>🖼️</Text>
        <Text style={styles.avatarText}>Upload Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.avatarButton}>
        <Text style={styles.avatarIcon}>👤</Text>
        <Text style={styles.avatarText}>Choose Avatar</Text>
      </TouchableOpacity>
    </View>
    <TextInput
      style={styles.input}
      placeholder="First Name"
      placeholderTextColor="#888"
      value={firstName}
      onChangeText={onChangeFirstName}
    />
    <TextInput
      style={styles.input}
      placeholder="Last Name"
      placeholderTextColor="#888"
      value={lastName}
      onChangeText={onChangeLastName}
    />
    <TextInput
      style={styles.textarea}
      placeholder="Tell us about you..."
      placeholderTextColor="#888"
      multiline
      numberOfLines={4}
      value={bio}
      onChangeText={onChangeBio}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
    <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center' },
  avatarRow: { flexDirection: 'row', marginBottom: 16, alignSelf: 'flex-start' },
  avatarButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 8, padding: 8, marginRight: 12 },
  avatarIcon: { fontSize: 22, marginRight: 6 },
  avatarText: { fontSize: 15 },
  input: { width: '100%', maxWidth: 350, height: 50, backgroundColor: '#eee', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, fontSize: 16 },
  textarea: { width: '100%', maxWidth: 350, height: 80, backgroundColor: '#eee', borderRadius: 12, paddingHorizontal: 16, marginBottom: 16, fontSize: 16, textAlignVertical: 'top' },
  button: { width: '100%', maxWidth: 350, height: 50, backgroundColor: '#000', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  error: { color: 'red', marginBottom: 8 },
});

export default ProfileForm; 