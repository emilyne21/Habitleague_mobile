import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface Props {
  onSubmit: (email: string, password: string) => Promise<void>;
}

const LoginForm: React.FC<Props> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Both fields are required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await onSubmit(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Email Input */}
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        autoCapitalize="none"
      />

      {/* Submit Button */}
      <Button
        onPress={handleSubmit}
        loading={loading}
        style={styles.button}
      >
        Log In
      </Button>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#141414',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    height: 48,
    marginTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default LoginForm; 