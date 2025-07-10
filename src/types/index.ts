export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  profilePhotoUrl?: string;
  avatarId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRegistration {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  bio?: string;
  profilePhotoUrl?: string;
  avatarId?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export enum ChallengeCategory {
  FITNESS = 'FITNESS',
  MINDFULNESS = 'MINDFULNESS',
  PRODUCTIVITY = 'PRODUCTIVITY',
  LIFESTYLE = 'LIFESTYLE',
  HEALTH = 'HEALTH',
  CODING = 'CODING',
  READING = 'READING',
  FINANCE = 'FINANCE',
  LEARNING = 'LEARNING',
  WRITING = 'WRITING',
  CREATIVITY = 'CREATIVITY'
}

export interface Challenge {
  id: number;
  name: string;
  description: string;
  category: ChallengeCategory;
  imageUrl?: string;
  rules: string;
  durationDays: number;
  entryFee: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  participantsCount?: number;
  isJoined?: boolean;
  status?: 'COMPLETED' | 'ONGOING' | 'PENDING';
  // Campos de ubicación para el formulario de unirse
  location?: {
    latitude: number;
    longitude: number;
    locationName: string;
    toleranceRadius: number;
  };
}

export interface SubmitEvidenceRequest {
  challengeId: number;
  imageUrl: string;
  latitude: number;
  longitude: number;
}

export interface DailySubmissionStatus {
  hasSubmittedToday: boolean;
  submissionDate?: string;
  nextSubmissionDate?: string;
}

export interface ChallengeCreation {
  name: string;
  description: string;
  category: ChallengeCategory;
  imageUrl?: string;
  rules: string;
  durationDays: number;
  entryFee: number;
  startDate: string;
  endDate: string;
  payment: PaymentData;
  location: LocationData;
}

export interface ChallengeJoin {
  payment: PaymentData;
  location: LocationData;
}

export interface ChallengeParticipant {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  joinedAt?: string;
  profilePhotoUrl?: string;
  avatarId?: string;
}

export interface Payment {
  id: number;
  challengeId?: number;
  amount: number;
  currency: string;
  paymentMethodId: string;
  cardLast4: string;
  cardBrand: string;
  status: PaymentStatus;
  stripePaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface PaymentData {
  challengeId?: number;
  amount: number;
  currency: string;
  paymentMethodId: string;
  cardLast4: string;
  cardBrand: string;
}

export interface Location {
  id: number;
  challengeId?: number;
  latitude: number;
  longitude: number;
  locationName: string;
  toleranceRadius: number;
  createdAt: string;
  updatedAt: string;
}

export interface LocationData {
  challengeId?: number;
  latitude: number;
  longitude: number;
  locationName: string;
  toleranceRadius: number;
}

export interface LocationVerification {
  challengeId: number;
  currentLatitude: number;
  currentLongitude: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserRegistration) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

export interface ChallengeState {
  challenges: Challenge[];
  featuredChallenges: Challenge[];
  popularChallenges: Challenge[];
  currentChallenge: Challenge | null;
  loading: boolean;
  error: string | null;
}

export interface ChallengeContextType extends ChallengeState {
  fetchChallenges: () => Promise<void>;
  fetchFeaturedChallenges: () => Promise<void>;
  fetchPopularChallenges: () => Promise<void>;
  fetchChallengeById: (id: number) => Promise<void>;
  createChallenge: (challengeData: ChallengeCreation) => Promise<void>;
  joinChallenge: (id: number, joinData: ChallengeJoin) => Promise<void>;
  clearError: () => void;
}

export interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  loading: boolean;
  error: string | null;
}

export interface PaymentContextType extends PaymentState {
  fetchPayments: () => Promise<void>;
  processPayment: (paymentData: PaymentData) => Promise<void>;
  getPaymentStatus: (challengeId: number) => Promise<PaymentStatus>;
  clearError: () => void;
}

// Mobile-specific types (keeping some mobile-specific interfaces)
export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  error?: string;
  required?: boolean;
  disabled?: boolean;
  style?: any;
}

export interface ModalProps {
  visible: boolean;
  onRequestClose: () => void;
  title?: string;
  children: React.ReactNode;
  animationType?: 'slide' | 'fade' | 'none';
  transparent?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'date';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | null;
  };
}

export interface FormState {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

export interface ChallengeFilters {
  category?: ChallengeCategory;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  search?: string;
  featured?: boolean;
  popular?: boolean;
}

export interface MapLocation {
  lat: number;
  lng: number;
  name: string;
  radius?: number;
}

export interface MapProps {
  center: MapLocation;
  markers?: MapLocation[];
  onLocationSelect?: (location: MapLocation) => void;
  style?: any;
} 