// API Configuration for Mobile
export const API_CONFIG = {
  BASE_URL: 'http://192.168.18.43:8080',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
  ENDPOINTS: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    PROFILE: '/api/auth/profile',
    USER_PROFILE: '/api/user/profile',
    GET_PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile',
    CHALLENGES: '/api/challenges',
    MY_CHALLENGES: '/api/challenges/my-challenges',
    ACHIEVEMENTS: '/api/achievements',
    MY_ACHIEVEMENTS: '/api/achievements/my-achievements',
    MY_ACHIEVEMENT_STATS: '/api/achievements/my-stats',
    MY_PAYMENTS: '/api/payments/my-payments',
    PROCESS_PAYMENT: '/api/payments/process',
    PAYMENT_STATUS: '/api/payments/challenge',
    MY_EVIDENCES: '/api/evidences/my-evidences',
    CHALLENGE_EVIDENCES: '/api/evidences/challenge',
    EVIDENCE_STATS: '/api/evidences/my-stats',
  },
};

// Build API URL helper function
export const buildApiUrl = (path: string): string => {
  return `${API_CONFIG.BASE_URL}${path}`;
}; 