// API Configuration for Mobile
export const API_CONFIG = {
  BASE_URL: 'http://10.129.105.163:8080',
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
    MY_CHALLENGES: '/my-challenges',
    ACHIEVEMENTS: '/api/achievements',
    MY_ACHIEVEMENTS: '/api/achievements/my-achievements',
    MY_PAYMENTS: '/api/payments/my-payments',
    PROCESS_PAYMENT: '/api/payments/process',
    PAYMENT_STATUS: '/api/payments/challenge',
  },
};

// Build API URL helper function
export const buildApiUrl = (path: string): string => {
  return `${API_CONFIG.BASE_URL}${path}`;
}; 