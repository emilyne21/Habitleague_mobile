import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import LoginPage from '../components/pages/LoginPage';
import SignUpPage from '../components/pages/SignUpPage';
import ProfileSetupPage from '../components/pages/ProfileSetupPage';

// Main Screens
import DashboardPage from '../components/pages/DashboardPage';
import ChallengesPage from '../components/pages/ChallengesPage';
import CreateChallengePage from '../components/pages/CreateChallengePage';
import ProfilePage from '../components/pages/ProfilePage';
import EditProfilePage from '../components/pages/EditProfilePage';
import ChallengeDetailsPage from '../components/pages/ChallengeDetailsPage';
import ChallengeProofPage from '../components/pages/ChallengeProofPage';
import SubmitEvidencePage from '../components/pages/SubmitEvidencePage';
import PaymentsPage from '../components/pages/PaymentsPage';
import PaymentForm from '../components/payments/PaymentForm';
import PaymentStatus from '../components/payments/PaymentStatus';

// Common Components
import LoadingScreen from '../components/common/LoadingScreen';

// Context
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginPage} />
    <Stack.Screen name="SignUp" component={SignUpPage} />
    <Stack.Screen name="ProfileSetup" component={ProfileSetupPage} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Challenges') {
          iconName = focused ? 'trophy' : 'trophy-outline';
        } else if (route.name === 'Payment') {
          iconName = focused ? 'wallet' : 'wallet-outline';
        } else if (route.name === 'Profile') {
          iconName = focused ? 'person' : 'person-outline';
        } else {
          iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#000',
      tabBarInactiveTintColor: '#888',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingBottom: 56,
        paddingTop: 5,
        height: 100,
      },
      tabBarSafeAreaInset: { bottom: 'always', top: 'never' },
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={DashboardPage} />
    <Tab.Screen name="Challenges" component={ChallengesPage} />
    <Tab.Screen name="Payment" component={PaymentsPage} />
    <Tab.Screen name="Profile" component={ProfilePage} />
  </Tab.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="CreateChallenge" component={CreateChallengePage} />
            <Stack.Screen name="EditProfile" component={EditProfilePage} />
            <Stack.Screen name="ChallengeDetails" component={ChallengeDetailsPage} />
            <Stack.Screen name="SubmitEvidence" component={SubmitEvidencePage} />
            <Stack.Screen name="ChallengeProof" component={ChallengeProofPage} />
            <Stack.Screen name="PaymentStatus" component={PaymentStatus} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 