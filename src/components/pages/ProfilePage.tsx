import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions
} from 'react-native';
import SafeScreen from '../common/SafeScreen';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import challengeService from '../../services/challenges';
import { Challenge } from '../../types';
import achievementService, { UserAchievement } from '../../services/achievements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const { width } = Dimensions.get('window');

type Tab = 'ongoing' | 'completed';

const ProfilePage: React.FC = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [emailFromJWT, setEmailFromJWT] = useState<string>('');

  // Función para obtener email del JWT como respaldo
  const getEmailFromJWT = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode(token) as any;
        console.log('EMAIL FROM JWT:', decoded.email);
        setEmailFromJWT(decoded.email || '');
      }
    } catch (error) {
      console.error('Error getting email from JWT:', error);
    }
  };

  useEffect(() => {
    getEmailFromJWT();
  }, []);

  const [tab, setTab] = useState<Tab>('ongoing');
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [myAchievements, setMyAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [achievementsLoading, setAchievementsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [achievementsError, setAchievementsError] = useState<string | null>(null);

  // Al montar, traigo mis retos
  useEffect(() => {
    loadMyChallenges();
  }, []);

  // Al montar, traigo mis logros
  useEffect(() => {
    loadMyAchievements();
  }, []);

  const loadMyChallenges = async () => {
    setLoading(true);
    setError(null);

    try {
      const challenges = await challengeService.getMyChallenges();
      setMyChallenges(challenges);
    } catch (err: any) {
      setError(err.message || 'Error loading your challenges');
    } finally {
      setLoading(false);
    }
  };

  const loadMyAchievements = async () => {
    setAchievementsLoading(true);
    setAchievementsError(null);

    try {
      const achievements = await achievementService.getMyAchievements();
      setMyAchievements(achievements);
    } catch (err: any) {
      setAchievementsError(err.message || 'Error loading your achievements');
    } finally {
      setAchievementsLoading(false);
    }
  };

  // Filtrar según pestaña
  const ongoing = myChallenges.filter(c => c.status !== 'COMPLETED');
  const completed = myChallenges.filter(c => c.status === 'COMPLETED');

  // Fuente de la imagen de perfil
  const profileSrc = user?.profilePhotoUrl
    ? { uri: user.profilePhotoUrl }
    : user?.avatarId === 'FEMALE'
      ? require('../../../assets/FEMALE.png')
      : require('../../../assets/MALE.png');

  // Handlers
  const handleEdit = () => navigation?.navigate('EditProfile');
  const handleLogout = async () => await logout();
  const handleName = user?.email?.split('@')[0] ?? '';

  const renderChallengeCard = (challenge: Challenge) => (
    <View key={challenge.id} style={styles.challengeCard}>
      <View style={styles.challengeContent}>
        <Text style={styles.challengeName}>{challenge.name}</Text>
        <Text style={styles.challengeDescription}>{challenge.description}</Text>
      </View>
      <Text style={styles.challengeDuration}>
        {challenge.durationDays ?? '-'} days
      </Text>
    </View>
  );

  const renderAchievementCard = (achievement: UserAchievement) => (
    <View
      key={achievement.id}
      style={[
        styles.achievementCard,
        achievement.isUnlocked ? styles.achievementUnlocked : styles.achievementLocked
      ]}
    >
      <View style={[
        styles.achievementIcon,
        achievement.isUnlocked ? styles.achievementIconUnlocked : styles.achievementIconLocked
      ]}>
        <Text style={styles.achievementIconText}>
          {achievement.isUnlocked ? '🏆' : '🔒'}
        </Text>
      </View>
      <View style={styles.achievementContent}>
        <Text style={[
          styles.achievementName,
          achievement.isUnlocked ? styles.achievementNameUnlocked : styles.achievementNameLocked
        ]}>
          {achievement.name}
        </Text>
        <Text style={[
          styles.achievementDescription,
          achievement.isUnlocked ? styles.achievementDescriptionUnlocked : styles.achievementDescriptionLocked
        ]}>
          {achievement.description}
        </Text>
        {achievement.isUnlocked && achievement.points && (
          <Text style={styles.achievementPoints}>+{achievement.points} points</Text>
        )}
        {!achievement.isUnlocked && achievement.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(achievement.progress / (achievement.maxProgress || 1)) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress}/{achievement.maxProgress || 1}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // Debug: Log del objeto user
  console.log('USER EN PROFILE PAGE:', JSON.stringify(user, null, 2));
  console.log('USER EMAIL:', user?.email);
  console.log('USER EMAIL TYPE:', typeof user?.email);
  console.log('USER EMAIL LENGTH:', user?.email?.length);
  console.log('USER FIRST NAME:', user?.firstName);
  console.log('USER LAST NAME:', user?.lastName);

  return (
    <SafeScreen style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Cabecera de perfil ─── */}
        <View style={styles.profileHeader}>
          <Image
            source={profileSrc}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.profileHandle}>
            {user?.email || emailFromJWT || 'Email no disponible'}
          </Text>

          <View style={styles.profileButtons}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>

          {/* ↓ Mostrar la bio justo debajo */}
          {user?.bio && (
            <Text style={styles.profileBio}>
              {user?.bio}
            </Text>
          )}
        </View>

        {/* ─── My Challenges ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Challenges</Text>

          {/* Pestañas */}
          <View style={styles.tabContainer}>
            {(['Ongoing', 'Completed'] as const).map(label => {
              const key = label.toLowerCase() as Tab;
              return (
                <TouchableOpacity
                  key={label}
                  onPress={() => setTab(key)}
                  style={[
                    styles.tabButton,
                    tab === key && styles.tabButtonActive
                  ]}
                >
                  <Text style={[
                    styles.tabButtonText,
                    tab === key && styles.tabButtonTextActive
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Contenido */}
          {loading ? (
            <Text style={styles.loadingText}>Loading challenges…</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              {(tab === 'ongoing' ? ongoing : completed).length === 0 ? (
                <Text style={styles.emptyText}>
                  No {tab} challenges yet.
                </Text>
              ) : (
                <View style={styles.challengesList}>
                  {(tab === 'ongoing' ? ongoing : completed).map(renderChallengeCard)}
                </View>
              )}
            </>
          )}
        </View>

        {/* ─── Achievements ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          
          {achievementsLoading ? (
            <Text style={styles.loadingText}>Loading achievements…</Text>
          ) : achievementsError ? (
            <Text style={styles.errorText}>{achievementsError}</Text>
          ) : (
            <>
              {myAchievements.length === 0 ? (
                <Text style={styles.emptyText}>
                  No achievements available yet.
                </Text>
              ) : (
                <View style={styles.achievementsGrid}>
                  {myAchievements.map(renderAchievementCard)}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 48,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileHandle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  profileButtons: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  editButton: {
    height: 48,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  logoutButton: {
    height: 48,
    backgroundColor: '#000000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  profileBio: {
    marginTop: 16,
    fontSize: 16,
    color: '#374151',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  section: {
    marginBottom: 48,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 24,
  },
  tabButton: {
    paddingBottom: 8,
    marginRight: 32,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#000000',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  challengesList: {
    gap: 24,
  },
  challengeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeContent: {
    flex: 1,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 14,
    color: '#374151',
  },
  challengeDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  achievementsGrid: {
    gap: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  achievementUnlocked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BBF7D0',
  },
  achievementLocked: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementIconUnlocked: {
    backgroundColor: '#DCFCE7',
  },
  achievementIconLocked: {
    backgroundColor: '#E5E7EB',
  },
  achievementIconText: {
    fontSize: 20,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementNameUnlocked: {
    color: '#111827',
  },
  achievementNameLocked: {
    color: '#6B7280',
  },
  achievementDescription: {
    fontSize: 12,
    marginBottom: 4,
  },
  achievementDescriptionUnlocked: {
    color: '#4B5563',
  },
  achievementDescriptionLocked: {
    color: '#9CA3AF',
  },
  achievementPoints: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ProfilePage; 