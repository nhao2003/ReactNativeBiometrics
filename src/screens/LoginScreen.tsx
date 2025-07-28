import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import BiometricLoginButton from '../components/BiometricLoginButton';
import UserPreferences from '../utils/UserPreferences';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [biometricAttempted, setBiometricAttempted] = useState(false);
  const [biometricFailed, setBiometricFailed] = useState(false);
  const [showBiometricRetry, setShowBiometricRetry] = useState(false);
  const autoAttemptedRef = useRef(false);
  const {
    login,
    isLoading,
    biometricLogin,
    enableBiometricLogin,
    isBiometricAvailable,
    biometricType,
    biometricTypeDescription,
    hasBiometricCredentials,
    isBiometricLoading,
  } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const success = await login(username, password);
      if (success) {
        // Save the username for future use
        await UserPreferences.saveLastUsername(username);

        // After successful login, offer to enable biometric authentication
        // Only show if biometric is available, not already set up, and user hasn't dismissed it
        if (isBiometricAvailable && !hasBiometricCredentials) {
          const hasBeenDismissed = await UserPreferences.hasBiometricPromptBeenDismissed();

          if (!hasBeenDismissed) {
            Alert.alert(
              'Enable Biometric Login',
              `Would you like to enable ${biometricTypeDescription} for faster login next time?`,
              [
                {
                  text: 'Later',
                  style: 'cancel',
                  onPress: async () => {
                    await UserPreferences.setBiometricPromptDismissed();
                  }
                },
                {
                  text: 'Enable',
                  onPress: () => handleEnableBiometric(username, password)
                },
              ]
            );
          }
        }
      } else {
        Alert.alert(
          'Login Failed',
          'Invalid username or password. Please try again.\n\nHint: Use "admin" and "password123"',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleBiometricLogin = useCallback(async () => {
    setBiometricAttempted(true);
    setBiometricFailed(false);
    setShowBiometricRetry(false);

    try {
      const success = await biometricLogin();
      if (!success) {
        // Biometric login failed
        setBiometricFailed(true);
        setShowBiometricRetry(true);
        console.log('Biometric login failed');
      } else {
        // Success - reset states
        setBiometricFailed(false);
        setShowBiometricRetry(false);
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      setBiometricFailed(true);
      setShowBiometricRetry(true);
    }
  }, [biometricLogin]);

  const handleBiometricRetry = () => {
    setShowBiometricRetry(false);
    handleBiometricLogin();
  };

  const handleEnableBiometric = async (username: string, password: string) => {
    try {
      const result = await enableBiometricLogin(username, password);
      if (result.success) {
        // Clear the dismissal flag since user has now enabled biometric
        await UserPreferences.clearBiometricPromptDismissed();
        await UserPreferences.setBiometricPromptShown();

        Alert.alert(
          'Success',
          `${biometricTypeDescription} has been enabled for your account.`,
          [{ text: 'OK' }]
        );
      } else if (!result.cancelled) {
        Alert.alert(
          'Error',
          result.error || 'Unable to enable biometric login.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred while enabling biometric login.');
    }
  };

  // Load saved username on component mount
  useEffect(() => {
    const loadSavedUsername = async () => {
      const savedUsername = await UserPreferences.getLastUsername();
      if (savedUsername) {
        setUsername(savedUsername);
      }
    };

    loadSavedUsername();
  }, []);

  // Auto-attempt biometric login when screen loads if credentials are available (only once)
  useEffect(() => {
    if (isBiometricAvailable && hasBiometricCredentials && !isLoading && !isBiometricLoading && !biometricAttempted && !autoAttemptedRef.current) {
      autoAttemptedRef.current = true;
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        handleBiometricLogin();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isBiometricAvailable, hasBiometricCredentials, isLoading, isBiometricLoading, biometricAttempted, handleBiometricLogin]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, errors.username && styles.inputError]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Biometric Login Section */}
          {isBiometricAvailable && hasBiometricCredentials && (
            <>
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {showBiometricRetry ? (
                // Show retry button when biometric authentication failed
                <TouchableOpacity
                  style={[styles.biometricRetryButton]}
                  onPress={handleBiometricRetry}
                  disabled={isLoading || isBiometricLoading}
                >
                  <Text style={styles.biometricRetryText}>
                    Try {biometricTypeDescription} Again
                  </Text>
                </TouchableOpacity>
              ) : (
                // Show normal biometric button
                <BiometricLoginButton
                  onPress={handleBiometricLogin}
                  isLoading={isBiometricLoading}
                  disabled={isLoading || isBiometricLoading || biometricAttempted}
                  biometricType={biometricType}
                  biometricTypeDescription={biometricTypeDescription}
                />
              )}

              {biometricFailed && !showBiometricRetry && (
                <Text style={styles.biometricErrorText}>
                  {biometricTypeDescription} failed. You can try again or use your password.
                </Text>
              )}
            </>
          )}

          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>Demo Credentials:</Text>
            <Text style={styles.hintText}>Username: admin</Text>
            <Text style={styles.hintText}>Password: password123</Text>

            {/* Show biometric hint if available but not set up */}
            {isBiometricAvailable && !hasBiometricCredentials && (
              <Text style={styles.biometricHintText}>
                💡 Enable {biometricTypeDescription} after login for faster access
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  hintContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  biometricRetryButton: {
    backgroundColor: '#FF9500', // Orange color for retry
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  biometricRetryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricErrorText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  biometricHintText: {
    fontSize: 13,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default LoginScreen;
