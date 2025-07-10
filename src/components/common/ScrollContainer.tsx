import React from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ViewStyle } from 'react-native';

interface ScrollContainerProps {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
}

const ScrollContainer: React.FC<ScrollContainerProps> = ({ children, contentContainerStyle, style }) => {
  return (
    <KeyboardAvoidingView
      style={[{ flex: 1 }, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
});

export default ScrollContainer; 