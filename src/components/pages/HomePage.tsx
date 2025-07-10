import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const HomePage = ({ navigation }: any) => {
  const { user, logout } = useAuth();

  const renderTaskCard = (title: string, subtitle: string, imageUrl: string, isPending: boolean = false) => (
    <TouchableOpacity style={styles.taskCard}>
      <View style={styles.taskContent}>
        <View style={styles.taskInfo}>
          {isPending && <Text style={styles.pendingLabel}>Proof Check-in</Text>}
          <Text style={styles.taskTitle}>{title}</Text>
          <Text style={styles.taskSubtitle}>{subtitle}</Text>
        </View>
        <Image source={{ uri: imageUrl }} style={styles.taskImage} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Habit League</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>
          Hi, {user?.firstName || 'User'} <Text style={styles.wave}>👋</Text>
        </Text>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Daily Goal</Text>
              <Text style={styles.progressValue}>3/5 completed</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasks Pending Today</Text>
          {renderTaskCard(
            'Morning Run',
            'Share your progress',
            'https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?auto=format&fit=crop&w=400&q=80',
            true
          )}
        </View>

        {/* Upcoming Challenge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Challenge</Text>
          {renderTaskCard(
            '30-Day Fitness Challenge',
            'Starts in 5 days',
            'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80'
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-circle-outline" size={24} color="#000" />
              <Text style={styles.actionText}>New Challenge</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="camera-outline" size={24} color="#000" />
              <Text style={styles.actionText}>Upload Proof</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  settingsButton: {
    padding: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  wave: {
    fontSize: 24,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    color: '#666',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 4,
  },
  taskCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskInfo: {
    flex: 1,
  },
  pendingLabel: {
    fontSize: 12,
    color: '#ff6b6b',
    fontWeight: '600',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  taskSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  taskImage: {
    width: 80,
    height: 60,
    borderRadius: 12,
    marginLeft: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default HomePage; 