import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../auth/LoginForm';

const { width, height } = Dimensions.get('window');

const LoginPageAlternative = ({ navigation }: any) => {
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    console.log('Login successful');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Background */}
        <View style={styles.heroContainer}>
          <Image 
            source={require('../../../assets/hero.png')} 
            style={styles.heroImage}
            resizeMode="contain"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Habit League</Text>
            <Text style={styles.heroSubtitle}>Build better habits together</Text>
          </View>
        </View>

        {/* Login Form Section */}
        <View style={styles.formContainer}>
          <LoginForm onSubmit={handleLogin} />
          
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink} onPress={() => navigation?.navigate('SignUp')}>
              Sign up
            </Text>
          </Text>
        </View>
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
  },
  heroContainer: {
    height: height * 0.45,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroImage: {
    width: width * 0.8,
    height: height * 0.25,
    opacity: 0.9,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  signupText: {
    color: '#888',
    fontSize: 15,
    marginTop: 24,
    textAlign: 'center',
  },
  signupLink: {
    color: '#000',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginPageAlternative; 