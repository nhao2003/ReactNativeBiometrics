# React Native Biometrics Demo 🔐

A comprehensive React Native application demonstrating secure biometric authentication using the `react-native-keychain` library. This demo showcases modern authentication patterns including Touch ID, Face ID, fingerprint, and face recognition across iOS and Android platforms.

[![React Native](https://img.shields.io/badge/React%20Native-0.80.2-blue.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Project Overview

This React Native biometrics demo application provides a complete authentication system that demonstrates:

- **Secure Biometric Authentication**: Integration with device biometric sensors (Touch ID, Face ID, Fingerprint, Face Recognition)
- **Credential Management**: Secure storage and retrieval of user credentials using iOS Keychain and Android Keystore
- **Multi-Platform Support**: Seamless experience across iOS and Android devices
- **Modern UI/UX**: Clean, intuitive interface with proper error handling and user feedback
- **TypeScript Implementation**: Fully typed codebase for better development experience and code reliability

### Key Features

- 🔒 **Biometric Authentication**: Support for Touch ID, Face ID, fingerprint, and face recognition
- 💾 **Secure Storage**: Credentials stored in iOS Keychain and Android Keystore with hardware-backed security
- 🔄 **Automatic Login**: Auto-attempt biometric authentication when credentials are available
- ⚙️ **Settings Management**: Enable/disable biometric authentication from settings screen
- 🎨 **Responsive Design**: Adaptive UI that works across different screen sizes
- 🛡️ **Error Handling**: Comprehensive error handling with user-friendly messages
- 📱 **Cross-Platform**: Single codebase supporting both iOS and Android

## 📋 Table of Contents

- [Installation Instructions](#-installation-instructions)
- [Usage Examples](#-usage-examples)
- [API Documentation](#-api-documentation)
- [Platform Support](#-platform-support)
- [Configuration](#-configuration)
- [Demo Features](#-demo-features)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## 🛠 Installation Instructions

### Prerequisites

Before running this project, ensure you have completed the [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment).

**Required Software:**
- Node.js >= 18.0.0
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS dependencies)

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd ReactNativeBiometrics

# Install Node.js dependencies
npm install

# For iOS: Install CocoaPods dependencies
cd ios && bundle install && bundle exec pod install && cd ..
```

### Step 2: Platform-Specific Setup

#### iOS Setup
```bash
# Install Ruby dependencies (first time only)
bundle install

# Install CocoaPods dependencies
cd ios
bundle exec pod install
cd ..
```

#### Android Setup
No additional setup required. The Android configuration is already included in the project.

### Step 3: Run the Application

#### Start Metro Bundler
```bash
npm start
```

#### Run on iOS
```bash
# Run on iOS Simulator
npm run ios

# Run on specific iOS device
npm run ios -- --device "Your Device Name"
```

#### Run on Android
```bash
# Run on Android Emulator or connected device
npm run android
```

## 💡 Usage Examples

### Basic Authentication Flow

The app demonstrates a complete authentication flow with biometric integration:

1. **Initial Login**: Users log in with username/password (demo: `admin`/`password123`)
2. **Biometric Setup**: After successful login, users are prompted to enable biometric authentication
3. **Biometric Login**: On subsequent app launches, users can authenticate using biometrics
4. **Settings Management**: Users can enable/disable biometric authentication from the settings screen

### Code Examples

#### Basic Biometric Authentication
```typescript
import { useBiometricAuth } from './src/hooks/useBiometricAuth';

const MyComponent = () => {
  const {
    isAvailable,
    biometricTypeDescription,
    authenticateWithBiometrics,
    storeCredentials
  } = useBiometricAuth();

  const handleBiometricLogin = async () => {
    if (isAvailable) {
      const result = await authenticateWithBiometrics();
      if (result.success && result.credentials) {
        console.log('Authentication successful!');
        // Handle successful authentication
      }
    }
  };

  const enableBiometric = async (username: string, password: string) => {
    const result = await storeCredentials(username, password);
    if (result.success) {
      console.log('Biometric authentication enabled!');
    }
  };
};
```

#### Using the BiometricAuthService Directly
```typescript
import BiometricAuthService from './src/services/BiometricAuthService';

// Check biometric capabilities
const capabilities = await BiometricAuthService.getBiometricCapabilities();
console.log('Biometric available:', capabilities.isAvailable);
console.log('Biometric type:', capabilities.biometryType);

// Store credentials with biometric protection
const storeResult = await BiometricAuthService.storeCredentials('username', 'password');
if (storeResult.success) {
  console.log('Credentials stored successfully');
}

// Retrieve credentials with biometric authentication
const retrieveResult = await BiometricAuthService.getStoredCredentials();
if (retrieveResult.success && retrieveResult.credentials) {
  console.log('Retrieved credentials:', retrieveResult.credentials);
}
```

### Demo Credentials

For testing purposes, use these credentials:
- **Username**: `admin`
- **Password**: `password123`

### Screenshots

*Note: Add actual screenshots of your app here showing the login screen, biometric prompt, and settings screen*

## 📚 API Documentation

### BiometricAuthService

The core service for handling biometric authentication operations.

#### Methods

##### `getBiometricCapabilities(): Promise<BiometricCapabilities>`
Checks if biometric authentication is available on the device.

**Returns:**
```typescript
interface BiometricCapabilities {
  isAvailable: boolean;
  biometryType: BIOMETRY_TYPE | null;
  error?: string;
}
```

##### `storeCredentials(username: string, password: string): Promise<BiometricAuthResult>`
Stores user credentials securely with biometric protection.

**Parameters:**
- `username`: User's username
- `password`: User's password

**Returns:**
```typescript
interface BiometricAuthResult {
  success: boolean;
  error?: string;
  cancelled?: boolean;
}
```

##### `getStoredCredentials(): Promise<BiometricAuthResult & { credentials?: StoredCredentials }>`
Retrieves stored credentials using biometric authentication.

**Returns:**
```typescript
interface StoredCredentials {
  username: string;
  password: string;
}
```

##### `hasStoredCredentials(): Promise<boolean>`
Checks if credentials are stored in the keychain.

##### `removeStoredCredentials(): Promise<BiometricAuthResult>`
Removes stored credentials from the keychain.

##### `getBiometricTypeDescription(biometryType: BIOMETRY_TYPE | null): string`
Returns a user-friendly description of the biometric type.

### useBiometricAuth Hook

A React hook that provides biometric authentication functionality.

#### Returns

```typescript
interface UseBiometricAuthReturn {
  // Capabilities
  isAvailable: boolean;
  biometryType: BIOMETRY_TYPE | null;
  biometricTypeDescription: string;
  isLoading: boolean;

  // State
  hasStoredCredentials: boolean;

  // Actions
  checkCapabilities: () => Promise<void>;
  storeCredentials: (username: string, password: string) => Promise<BiometricAuthResult>;
  authenticateWithBiometrics: () => Promise<BiometricAuthResult & { credentials?: StoredCredentials }>;
  removeStoredCredentials: () => Promise<BiometricAuthResult>;
  checkStoredCredentials: () => Promise<void>;

  // Error handling
  showError: (error: string, onRetry?: () => void) => void;
}
```

### Biometric Types

The app supports the following biometric authentication types:

- `TOUCH_ID`: iOS Touch ID
- `FACE_ID`: iOS Face ID
- `FINGERPRINT`: Android Fingerprint
- `FACE`: Android Face Recognition
- `IRIS`: Android Iris Recognition

## 🔧 Platform Support

### iOS Support

- **Minimum iOS Version**: iOS 11.0+
- **Supported Biometrics**: Touch ID, Face ID
- **Security**: iOS Keychain with Secure Enclave
- **Permissions**: Face ID usage description required

### Android Support

- **Minimum Android Version**: API Level 23 (Android 6.0)+
- **Supported Biometrics**: Fingerprint, Face Recognition, Iris Recognition
- **Security**: Android Keystore with hardware-backed security
- **Permissions**: `USE_FINGERPRINT`, `USE_BIOMETRIC`

### Device Requirements

#### iOS Devices
- iPhone 5s or later (for Touch ID)
- iPhone X or later (for Face ID)
- iPad with Touch ID or Face ID support

#### Android Devices
- Devices with fingerprint sensors
- Devices with face recognition capabilities
- Devices with iris scanners (Samsung devices)

## ⚙️ Configuration

### iOS Configuration

The iOS configuration is already set up in the project. Key configurations include:

#### Info.plist
```xml
<key>NSFaceIDUsageDescription</key>
<string>This app uses Face ID for secure and convenient authentication to access your account.</string>
```

#### Podfile
The `react-native-keychain` dependency is automatically linked through CocoaPods.

### Android Configuration

#### AndroidManifest.xml
```xml
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

#### ProGuard Configuration
If using ProGuard, add the following rules:
```
-keep class com.oblador.keychain.** { *; }
-keep class androidx.biometric.** { *; }
```

### Keychain Configuration Options

The app uses the following keychain configuration:

```typescript
const options: Keychain.SetOptions = {
  service: 'ReactNativeBiometricsApp',
  accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
  securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
  storage: Keychain.STORAGE_TYPE.AES_GCM,
  authenticationPrompt: {
    title: 'Biometric Authentication',
    subtitle: 'Use your biometric to authenticate',
    description: 'Place your finger on the sensor or look at the camera to authenticate',
    cancel: 'Cancel',
  },
};
```

## 🎯 Demo Features

This demo application showcases the following biometric authentication features:

### 1. Biometric Capability Detection
- Automatically detects available biometric authentication methods
- Displays appropriate UI based on device capabilities
- Supports multiple biometric types across platforms

### 2. Secure Credential Storage
- Stores user credentials in iOS Keychain or Android Keystore
- Uses hardware-backed security when available
- Encrypts data with AES-GCM encryption

### 3. Biometric Authentication Flow
- **Initial Setup**: Prompts users to enable biometric authentication after successful login
- **Auto-Login**: Automatically attempts biometric authentication on app launch
- **Manual Login**: Provides biometric login button for manual authentication
- **Fallback**: Falls back to username/password when biometric authentication fails

### 4. Settings Management
- Toggle biometric authentication on/off
- Clear stored biometric credentials
- View current biometric authentication status

### 5. Error Handling
- Comprehensive error handling for various failure scenarios
- User-friendly error messages
- Retry mechanisms for failed authentication attempts

### 6. User Experience Features
- Loading states during authentication
- Visual feedback for authentication status
- Responsive design for different screen sizes
- Dark mode support

## 📁 Project Structure

```
ReactNativeBiometrics/
├── src/
│   ├── components/
│   │   └── BiometricLoginButton.tsx     # Reusable biometric login button
│   ├── contexts/
│   │   └── AuthContext.tsx              # Authentication context provider
│   ├── hooks/
│   │   └── useBiometricAuth.ts          # Custom hook for biometric auth
│   ├── navigation/
│   │   ├── AppNavigator.tsx             # Main app navigation
│   │   └── BottomTabNavigator.tsx       # Bottom tab navigation
│   ├── screens/
│   │   ├── HomeScreen.tsx               # Home screen after login
│   │   ├── LoginScreen.tsx              # Login screen with biometric option
│   │   └── SettingsScreen.tsx           # Settings screen
│   ├── services/
│   │   └── BiometricAuthService.ts      # Core biometric authentication service
│   └── utils/
│       ├── BiometricErrorHandler.ts     # Error handling utilities
│       └── UserPreferences.ts           # User preferences management
├── ios/                                 # iOS-specific configuration
├── android/                             # Android-specific configuration
├── App.tsx                              # Main app component
└── package.json                         # Dependencies and scripts
```

### Key Files Description

- **`BiometricAuthService.ts`**: Core service handling all biometric authentication operations
- **`useBiometricAuth.ts`**: React hook providing biometric authentication functionality
- **`AuthContext.tsx`**: Context provider managing authentication state
- **`LoginScreen.tsx`**: Main login interface with biometric integration
- **`BiometricLoginButton.tsx`**: Reusable component for biometric authentication
- **`SettingsScreen.tsx`**: Settings interface for managing biometric preferences

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Biometric Authentication Not Available

**Problem**: App shows "Biometric authentication is not available"

**Solutions:**
- Ensure device has biometric sensors (fingerprint, Face ID, etc.)
- Check that biometric authentication is set up in device settings
- Verify app permissions are granted
- For iOS: Ensure Face ID usage description is in Info.plist
- For Android: Check that biometric permissions are in AndroidManifest.xml

#### 2. iOS Build Issues

**Problem**: Build fails on iOS with keychain-related errors

**Solutions:**
```bash
# Clean and reinstall pods
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install
cd ..

# Clean React Native cache
npx react-native start --reset-cache
```

#### 3. Android Build Issues

**Problem**: Build fails on Android with biometric-related errors

**Solutions:**
```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Reset Metro cache
npx react-native start --reset-cache
```

#### 4. Biometric Prompt Not Showing

**Problem**: Biometric authentication prompt doesn't appear

**Solutions:**
- Check device biometric settings are enabled
- Verify at least one biometric is enrolled
- Ensure app has proper permissions
- Check for conflicting biometric prompts from other apps

#### 5. Keychain Access Errors

**Problem**: "Keychain access denied" or similar errors

**Solutions:**
- Check iOS Keychain access groups in entitlements
- Verify Android Keystore permissions
- Clear app data and re-enable biometric authentication
- Check device security settings

#### 6. Metro Bundler Issues

**Problem**: Metro bundler fails to start or shows caching issues

**Solutions:**
```bash
# Clear all caches
npx react-native start --reset-cache
rm -rf node_modules
npm install

# For persistent issues
watchman watch-del-all
rm -rf /tmp/metro-*
```

### Development Tips

1. **Testing on Simulators**:
   - iOS Simulator: Use Hardware > Touch ID/Face ID to simulate biometric authentication
   - Android Emulator: Use Extended Controls > Fingerprint to simulate fingerprint

2. **Debugging Biometric Issues**:
   - Enable debug logging in BiometricAuthService
   - Check device logs for biometric-related errors
   - Test on multiple devices with different biometric capabilities

3. **Performance Optimization**:
   - Cache biometric capability checks
   - Implement proper loading states
   - Handle authentication timeouts gracefully

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Manual Testing Checklist

- [ ] Login with username/password works
- [ ] Biometric prompt appears after successful login
- [ ] Biometric authentication works correctly
- [ ] Settings screen allows enabling/disabling biometrics
- [ ] App handles biometric authentication failures gracefully
- [ ] Auto-login with biometrics works on app restart
- [ ] Logout clears biometric credentials
- [ ] App works on devices without biometric capabilities

### Device Testing

Test the app on various devices to ensure compatibility:

- **iOS**: iPhone with Touch ID, iPhone with Face ID, iPad
- **Android**: Devices with fingerprint sensors, devices with face recognition

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 nnhao2003

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help with the implementation, please:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/your-repo/issues)
3. Create a new issue with detailed information about your problem

## 🔗 Related Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [react-native-keychain Documentation](https://github.com/oblador/react-native-keychain)
- [iOS Biometric Authentication Guide](https://developer.apple.com/documentation/localauthentication)
- [Android Biometric Authentication Guide](https://developer.android.com/training/sign-in/biometric-auth)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)

---

**Keywords**: React Native, Biometric Authentication, Touch ID, Face ID, Fingerprint, Face Recognition, iOS Keychain, Android Keystore, TypeScript, Mobile Security, Authentication, react-native-keychain
