# HabitLeague Mobile App

A React Native mobile application for building better habits together through challenges and community support.

## 🚀 Features

- **User Authentication**: Secure login/register with JWT tokens
- **Challenge Management**: Create, join, and track challenges
- **Progress Tracking**: Monitor daily progress and achievements
- **Social Features**: Connect with other users and share progress
- **Location Verification**: Verify challenge completion with GPS
- **Push Notifications**: Stay updated with challenge reminders
- **Offline Support**: Basic offline functionality with local storage

## 📱 Tech Stack

- **Framework**: Expo SDK 53 + React Native 0.79.5
- **Language**: TypeScript
- **Navigation**: React Navigation v7
- **State Management**: React Context API
- **HTTP Client**: Axios with interceptors
- **Storage**: AsyncStorage for local data
- **UI Components**: Custom components with consistent theming
- **Icons**: Expo Vector Icons (Ionicons)

## 🛠️ Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd habitleague
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on device/simulator**
   - Scan the QR code with Expo Go app (Android/iOS)
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
API_URL=http://192.168.83.163:8080
EXPO_PUBLIC_API_URL=http://192.168.83.163:8080
```

### API Configuration

Update the API URL in `src/services/api.ts` to match your backend server:

```typescript
const API_BASE_URL = 'http://your-api-server:port';
```

## 📁 Project Structure

```
habitleague/
├── src/
│   ├── components/
│   │   ├── pages/          # Screen components
│   │   ├── auth/           # Authentication components
│   │   ├── common/         # Reusable components
│   │   └── ui/             # UI components
│   ├── context/            # React Context providers
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API services
│   ├── styles/             # Theme and styling
│   └── types/              # TypeScript type definitions
├── assets/                 # Images, fonts, etc.
├── App.tsx                 # Root component
├── app.json               # Expo configuration
└── package.json           # Dependencies
```

## 🎨 Design System

The app uses a consistent design system with:

- **Colors**: Black/white primary theme with gray accents
- **Typography**: System fonts with consistent sizing
- **Spacing**: 8px base unit system
- **Components**: Reusable UI components with consistent styling

## 🔐 Authentication Flow

1. **Login/Register**: User authentication with email/password
2. **Token Management**: JWT tokens stored securely in AsyncStorage
3. **Auto-login**: Automatic login on app restart if token is valid
4. **Logout**: Clear tokens and redirect to login

## 📱 Navigation Structure

- **Auth Stack**: Login, Register, Profile Setup
- **Main Tabs**: Home, Challenges, Discover, Profile
- **Modal Screens**: Challenge Details, Challenge Proof

## 🚀 Development

### Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator
npm run web        # Run in web browser
```

### Code Style

- Use TypeScript for all new code
- Follow React Native best practices
- Use the theme system for consistent styling
- Implement proper error handling
- Add loading states for async operations

### Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Building for Production

### EAS Build (Recommended)

1. **Install EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure EAS**
   ```bash
   eas build:configure
   ```

4. **Build for platforms**
   ```bash
   eas build --platform ios
   eas build --platform android
   ```

### Manual Build

```bash
# iOS
expo run:ios --configuration Release

# Android
expo run:android --variant release
```

## 🚀 Deployment

### App Store (iOS)

1. Build with EAS
2. Submit to App Store Connect
3. Configure app metadata
4. Submit for review

### Google Play Store (Android)

1. Build with EAS
2. Create app in Google Play Console
3. Upload APK/AAB
4. Configure app metadata
5. Submit for review

## 🔧 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android build issues**
   ```bash
   npx expo run:android --clear
   ```

### Debug Mode

Enable debug mode by shaking the device or pressing `Cmd+D` (iOS) / `Cmd+M` (Android) in the simulator.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

To update Expo SDK:

```bash
npx expo install --fix
```

To update dependencies:

```bash
npm update
```

---

**Happy coding! 🎉** 