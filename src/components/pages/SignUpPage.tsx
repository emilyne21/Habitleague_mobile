import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import RegisterFormMultiStep from '../auth/RegisterFormMultiStep';
import { RegisterFormData } from '../auth/RegisterFormMultiStep';

const SignUpPage = ({ navigation }: any) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    bio: '',
    profilePhotoUrl: '',
    avatarId: '',
  });

  const handleStepChange = (newStep: 1 | 2) => {
    setStep(newStep);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (step === 2) {
              setStep(1);
            } else {
              navigation?.goBack();
            }
          }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Sign Up</Text>
        
        {step === 2 && (
          <TouchableOpacity 
            style={styles.backToStep1}
            onPress={() => setStep(1)}
          >
            <Text style={styles.backToStep1Text}>Back to Step 1</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Form */}
      <RegisterFormMultiStep
        step={step}
        formData={formData}
        setFormData={setFormData}
        onStepChange={handleStepChange}
      />
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  backToStep1: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  backToStep1Text: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});

export default SignUpPage; 