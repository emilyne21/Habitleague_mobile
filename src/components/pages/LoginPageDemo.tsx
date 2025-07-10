import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import SafeScreen from '../common/SafeScreen';
import LoginPage from './LoginPage';
import LoginPageAlternative from './LoginPageAlternative';

const LoginPageDemo = ({ navigation }: any) => {
  const [showAlternative, setShowAlternative] = useState(false);

  if (showAlternative) {
    return (
      <SafeScreen style={styles.container}>
        <LoginPageAlternative navigation={navigation} />
        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => setShowAlternative(false)}
        >
          <Text style={styles.switchText}>Switch to Version 1</Text>
        </TouchableOpacity>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={styles.container}>
      <LoginPage navigation={navigation} />
      <TouchableOpacity 
        style={styles.switchButton}
        onPress={() => setShowAlternative(true)}
      >
        <Text style={styles.switchText}>Switch to Version 2</Text>
      </TouchableOpacity>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  switchButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  switchText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default LoginPageDemo; 