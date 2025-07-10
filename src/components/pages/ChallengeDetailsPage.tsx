import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import challengeService from '../../services/challenges';

const ChallengeDetailsPage = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [challenge, setChallenge] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await challengeService.getChallengeById(id);
        setChallenge(data);
        const part = await challengeService.getChallengeParticipants(id);
        setParticipants(part as any[]);
      } catch (err) {
        setError('Error loading challenge');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  if (error) return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: challenge?.imageUrl }} style={styles.headerImage} />
      <Text style={styles.title}>{challenge?.title}</Text>
      <Text style={styles.desc}>{challenge?.description}</Text>
      <Text style={styles.label}>Category</Text>
      <Text style={styles.value}>{challenge?.category}</Text>
      <Text style={styles.label}>Duration</Text>
      <Text style={styles.value}>{challenge?.duration} Days</Text>
      <Text style={styles.label}>Participantes</Text>
      <FlatList
        data={participants}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.leaderRow}>
            <Image source={{ uri: item.avatarUrl }} style={styles.leaderAvatar} />
            <Text style={styles.leaderName}>{item.name}</Text>
            <Text style={styles.leaderStat}>Completed: {item.completed}</Text>
            <Text style={styles.leaderStat}>Failed: {item.failed}</Text>
          </View>
        )}
        style={{ marginBottom: 12 }}
      />
      <Text style={styles.label}>Prize Pool</Text>
      <Text style={styles.value}>${challenge?.prizePool}</Text>
      <TouchableOpacity style={styles.proofButton} onPress={() => navigation.navigate('ChallengeProof', { id })}>
        <Text style={styles.proofButtonText}>Upload Daily Proof</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fff', alignItems: 'center', padding: 16, paddingBottom: 80 },
  headerImage: { width: '100%', height: 160, borderRadius: 16, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  desc: { color: '#444', fontSize: 15, marginBottom: 12, textAlign: 'center' },
  label: { fontSize: 15, fontWeight: 'bold', marginTop: 8 },
  value: { fontSize: 15, color: '#888', marginBottom: 4 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  leaderAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  leaderName: { fontWeight: 'bold', marginRight: 8 },
  leaderStat: { color: '#888', marginRight: 8 },
  proofButton: { backgroundColor: '#000', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32, marginTop: 16 },
  proofButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  backButton: { marginTop: 16, backgroundColor: '#eee', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 24 },
  backButtonText: { color: '#222', fontSize: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: 'red', fontSize: 16 },
});

export default ChallengeDetailsPage; 