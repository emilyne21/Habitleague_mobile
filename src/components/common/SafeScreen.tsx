import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SafeScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  backgroundColor?: string;
}

const SafeScreen: React.FC<SafeScreenProps> = ({ 
  children, 
  style, 
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor = '#fff' 
}) => {
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor }, style]} 
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeScreen; 