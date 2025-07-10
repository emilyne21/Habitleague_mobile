import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, SafeAreaView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../auth/LoginForm';

const LoginPage = ({ navigation }: any) => {
  const { login } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    // Navigation will happen automatically through the context
    console.log('Login successful');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroSection}>
          <Image 
            source={require('../../../assets/hero.png')} 
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.title}>Build better habits together</Text>
          
          <LoginForm onSubmit={handleLogin} />
          
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink} onPress={() => navigation?.navigate('SignUp')}>Sign up</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroImage: {
    width: 280,
    height: 200,
    marginBottom: 16,
  },
  contentSection: {
    width: '100%',
    alignItems: 'center',
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 32,
    color: '#000',
    textAlign: 'center',
  },
  signupText: { 
    color: '#888', 
    fontSize: 15, 
    marginTop: 24,
    textAlign: 'center',
  },
  signupLink: { 
    color: '#444', 
    fontWeight: 'bold', 
    textDecorationLine: 'underline' 
  },
});

export default LoginPage; 