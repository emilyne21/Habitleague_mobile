import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { PaymentProvider } from './src/context/PaymentContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <PaymentProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </PaymentProvider>
    </AuthProvider>
  );
}

export const API_URL = "http://192.168.83.163:8080"; // Cambia el puerto si es necesario
