import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface TextAreaProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  numberOfLines?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  numberOfLines = 4,
  style,
  inputStyle,
  error,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.textAreaContainer, error && styles.textAreaError]}>
        <TextInput
          style={[styles.textArea, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={numberOfLines}
          textAlignVertical="top"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  textAreaContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textAreaError: {
    borderColor: '#EF4444',
  },
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#374151',
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
});

export default TextArea; 