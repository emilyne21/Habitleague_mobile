import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import SafeScreen from '../common/SafeScreen';

const ChallengeProofPage = ({ navigation }: any) => {
  return (
    <SafeScreen style={styles.container}>
      <Text style={styles.header}>Proof Submitted!</Text>
      <Text style={styles.sub}>You've successfully submitted proof for today's challenge. Keep up the great work!</Text>
      <Image source={{ uri: 'https://i.imgur.com/6b6psnA.png' }} style={styles.badge} />
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Challenge</Text>
      </TouchableOpacity>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  sub: { color: '#444', fontSize: 15, marginBottom: 16, textAlign: 'center' },
  badge: { width: 160, height: 160, borderRadius: 80, marginBottom: 24 },
  backButton: { backgroundColor: '#000', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32 },
  backButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ChallengeProofPage; 