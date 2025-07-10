import { StyleSheet } from 'react-native';

// Color palette
export const colors = {
  // Primary colors
  primary: '#000000',
  primaryLight: '#333333',
  primaryDark: '#000000',
  
  // Secondary colors
  secondary: '#6B7280',
  secondaryLight: '#9CA3AF',
  secondaryDark: '#374151',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',
  
  // Text colors
  textPrimary: '#000000',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
};

// Typography
export const typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  
  // Font weights
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  
  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
};

// Common styles
export const commonStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  // Cards
  card: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.base,
  },
  cardSecondary: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  
  // Buttons
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.textInverse,
    fontSize: typography.base,
    fontWeight: '600' as const,
  },
  buttonTextSecondary: {
    color: colors.textPrimary,
    fontSize: typography.base,
    fontWeight: '600' as const,
  },
  
  // Inputs
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.base,
    color: colors.textPrimary,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  
  // Text styles
  heading1: {
    fontSize: typography['3xl'],
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  heading2: {
    fontSize: typography['2xl'],
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  heading3: {
    fontSize: typography.xl,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: typography.base,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.normal * typography.base,
  },
  caption: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
  small: {
    fontSize: typography.xs,
    color: colors.textTertiary,
  },
});

// Theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  commonStyles,
};

export default theme; 