import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { PaymentProvider } from './src/context/PaymentContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PaymentProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </PaymentProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export const API_URL = "http://192.168.18.43:8080"; // Cambia el puerto si es necesario
