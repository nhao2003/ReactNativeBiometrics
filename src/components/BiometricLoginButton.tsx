import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { BIOMETRY_TYPE } from 'react-native-keychain';

interface BiometricLoginButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  biometricType: BIOMETRY_TYPE | null;
  biometricTypeDescription: string;
  style?: any;
}

const BiometricLoginButton: React.FC<BiometricLoginButtonProps> = ({
  onPress,
  isLoading = false,
  disabled = false,
  biometricType,
  biometricTypeDescription,
  style,
}) => {
  const getBiometricIcon = (): string => {
    switch (biometricType) {
      case BIOMETRY_TYPE.TOUCH_ID:
        return '👆'; // Touch ID icon
      case BIOMETRY_TYPE.FACE_ID:
        return '🔒'; // Face ID icon
      case BIOMETRY_TYPE.FINGERPRINT:
        return '👆'; // Fingerprint icon
      case BIOMETRY_TYPE.FACE:
        return '👤'; // Face recognition icon
      case BIOMETRY_TYPE.IRIS:
        return '👁️'; // Iris recognition icon
      default:
        return '🔐'; // Generic biometric icon
    }
  };

  const getButtonText = (): string => {
    if (isLoading) {
      return 'Authenticating...';
    }
    return `Sign in with ${biometricTypeDescription}`;
  };

  const isButtonDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isButtonDisabled && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        {isLoading ? (
          <ActivityIndicator 
            size="small" 
            color="#fff" 
            style={styles.loadingIndicator}
          />
        ) : (
          <Text style={styles.icon}>{getBiometricIcon()}</Text>
        )}
        <Text style={[styles.buttonText, isButtonDisabled && styles.buttonTextDisabled]}>
          {getButtonText()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#34C759', // Green color for biometric authentication
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  loadingIndicator: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextDisabled: {
    color: '#999',
  },
});

export default BiometricLoginButton;
