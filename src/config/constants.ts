// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://192.168.83.163:8080',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'user',
};

// Navigation Routes
export const ROUTES = {
  // Auth Routes
  LOGIN: 'Login',
  SIGNUP: 'SignUp',
  PROFILE_SETUP: 'ProfileSetup',
  
  // Main Routes
  DASHBOARD: 'Home',
  CHALLENGES: 'Challenges',
  DISCOVER: 'Discover',
  PROFILE: 'Profile',
  CHALLENGE_DETAILS: 'ChallengeDetails',
  CHALLENGE_PROOF: 'ChallengeProof',
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Habit League',
  VERSION: '1.0.0',
  DESCRIPTION: 'Build better habits together',
};

// Colors (for quick reference)
export const COLORS = {
  PRIMARY: '#000000',
  SECONDARY: '#6B7280',
  BACKGROUND: '#FFFFFF',
  BACKGROUND_SECONDARY: '#F9FAFB',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#6B7280',
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
}; 